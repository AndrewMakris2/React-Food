import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Groq from 'groq-sdk';
import { GROQ_API_KEY, GROQ_MODEL } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');

const groq = new Groq({ apiKey: GROQ_API_KEY });
const app = express();
app.use(cors());
app.use(express.json());

// ── DB helpers ──────────────────────────────────────────────
function readDB() {
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')); }
  catch { return { recipes: [] }; }
}
function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Input helpers ────────────────────────────────────────────
function clamp(val, min, max) { return Math.min(max, Math.max(min, val)) }
function sanitize(val, maxLen = 120) {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, maxLen)
}

// ── Routes ───────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const {
    proteinGoal   = 50,
    maxCalories   = null,
    maxCarbs      = null,
    maxFat        = null,
    mealType      = 'any',
    cuisine       = null,
    proteinSource = null,
    mealTime      = null,
    cookTime      = null,
    spiceLevel    = null,
    servings      = '2',
    restrictions  = '',
    location      = null,
  } = req.body;

  const protein     = clamp(parseInt(proteinGoal) || 50, 5, 500)
  const resultCount = clamp(parseInt(req.body.resultCount) || 3, 1, 10)
  const type        = ['home_cooked', 'fast_food', 'any'].includes(mealType) ? mealType : 'any'

  const requirementLines = [
    `- Minimum protein: ${protein}g per serving`,
    maxCalories   ? `- Maximum calories: ${maxCalories} kcal per serving`                    : null,
    maxCarbs      ? `- Maximum carbs: ${maxCarbs}g per serving`                              : null,
    maxFat        ? `- Maximum fat: ${maxFat}g per serving`                                  : null,
    cuisine       ? `- Cuisine: ${sanitize(cuisine)}`                                        : null,
    proteinSource ? `- Primary protein source: ${sanitize(proteinSource)}`                   : null,
    mealTime      ? `- Meal occasion: ${sanitize(mealTime)}`                                 : null,
    cookTime      ? `- Cook time limit: ${sanitize(cookTime)}`                               : null,
    spiceLevel    ? `- Spice level: ${sanitize(spiceLevel)}`                                 : null,
    `- Servings: ${sanitize(String(servings))}`,
    restrictions  ? `- Dietary restrictions: ${sanitize(restrictions, 200)}`                 : null,
    location      ? `- User is near ${sanitize(location)} — recommend chains available there` : null,
  ].filter(Boolean).join('\n')

  const homeSchema = `{
  "type": "home_cooked",
  "meals": [
    {
      "name": "string",
      "protein": "Xg",
      "calories": "X",
      "carbs": "Xg",
      "fat": "Xg",
      "description": "1-2 sentence overview",
      "ingredients": ["quantity unit ingredient"],
      "steps": ["Step with specific amounts and timing"]
    }
  ]
}
The meals array must contain exactly ${resultCount} item(s).`

  const fastSchema = `{
  "type": "fast_food",
  "name": "descriptive collection title",
  "protein": "Xg-Xg range",
  "calories": "X-X range",
  "carbs": "Xg-Xg range",
  "fat": "Xg-Xg range",
  "description": "1-2 sentence overview",
  "restaurants": [
    {
      "name": "real chain name",
      "item": "exact menu item name",
      "protein": "~Xg",
      "calories": "~X",
      "carbs": "~Xg",
      "fat": "~Xg",
      "modifications": "how to order for maximum protein"
    }
  ]
}
The restaurants array must contain exactly ${resultCount} item(s).`

  let typeDirective, schema
  if (type === 'home_cooked') {
    typeDirective = `Generate exactly ${resultCount} HOME-COOKED meal(s). The "meals" array MUST have exactly ${resultCount} element(s).`
    schema = homeSchema
  } else if (type === 'fast_food') {
    typeDirective = `Generate exactly ${resultCount} FAST FOOD option(s). The "restaurants" array MUST have exactly ${resultCount} element(s). Only use real chains with real menu items. Use the ~ prefix on all macro values to indicate they are estimates.`
    schema = fastSchema
  } else {
    typeDirective = `Choose the most fitting type. The meals or restaurants array MUST have exactly ${resultCount} element(s).`
    schema = `HOME COOKED:\n${homeSchema}\n\nFAST FOOD:\n${fastSchema}`
  }

  const systemPrompt = `You are a precision sports nutritionist and registered dietitian.

MACRO ACCURACY — home cooked meals:
- Calories = (protein_g × 4) + (carbs_g × 4) + (fat_g × 9) — must add up correctly
- Base all numbers on the actual ingredient amounts you list
- A 50g protein meal has at minimum 200 kcal from protein — total can never be lower

FAST FOOD ACCURACY:
- Only recommend real chains with real existing menu items
- Macro values are estimates — prefix all fast food macros with ~ (e.g. "~48g", "~740")
- Use realistic ballpark figures based on typical items of that type; do not fabricate exact lab values
- Sour cream does NOT meaningfully add protein — be accurate about what actually adds protein

OUTPUT: Return ONLY a valid JSON object. No markdown. No code fences. No extra text.`

  const userPrompt = `${typeDirective}

Requirements:
${requirementLines}

JSON structure:
${schema}

Verify the item count in your array equals ${resultCount} before responding.`

  const tokensPerResult = type === 'home_cooked' ? 750 : 300
  const max_tokens = Math.min(8192, 600 + tokensPerResult * resultCount)

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens,
      response_format: { type: 'json_object' },
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === 'length') {
      const suggested = Math.max(1, Math.floor(resultCount * 0.6))
      return res.status(500).json({
        error: `Response was cut off — try reducing results to ${suggested}.`,
      });
    }

    const meal = JSON.parse(choice.message.content);
    res.json(meal);
  } catch (err) {
    console.error('[generate error]', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate meal. Please try again.' });
  }
});

// Get all saved recipes
app.get('/api/recipes', (req, res) => {
  const db = readDB();
  res.json(db.recipes);
});

// Save a recipe
app.post('/api/recipes', (req, res) => {
  const db = readDB();
  const recipe = { ...req.body, id: crypto.randomUUID(), savedAt: new Date().toISOString() };
  db.recipes.unshift(recipe);
  writeDB(db);
  res.status(201).json(recipe);
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
  const db = readDB();
  const before = db.recipes.length;
  db.recipes = db.recipes.filter(r => r.id !== req.params.id);
  if (db.recipes.length === before) return res.status(404).json({ error: 'Recipe not found' });
  writeDB(db);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('✅  ProteinFuel server running at http://localhost:3001');
  if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    console.warn('⚠️   Add your Groq API key to server/config.js');
  }
});
