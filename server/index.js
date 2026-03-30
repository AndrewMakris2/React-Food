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
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { recipes: [] };
  }
}

function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ── JSON extraction (handles LLM wrapping JSON in markdown) ─
function extractJSON(str) {
  const trimmed = str.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                  trimmed.match(/(\{[\s\S]*\})/);
    if (match) return JSON.parse(match[1] || match[0]);
    throw new Error('Could not parse JSON from AI response');
  }
}

// ── Routes ───────────────────────────────────────────────────

// Generate a meal
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
    resultCount   = 5,
    restrictions  = '',
  } = req.body;

  const typeInstruction =
    mealType === 'home_cooked' ? 'This MUST be a home-cooked meal (type = "home_cooked").' :
    mealType === 'fast_food'   ? 'This MUST be a fast food meal (type = "fast_food").' :
    'Choose the most fitting type — either "home_cooked" or "fast_food".';

  const macroLines = [
    `- Protein: at least ${proteinGoal}g`,
    maxCalories   ? `- Calories: maximum ${maxCalories} kcal`          : null,
    maxCarbs      ? `- Carbs: maximum ${maxCarbs}g`                    : null,
    maxFat        ? `- Fat: maximum ${maxFat}g`                        : null,
    cuisine       ? `- Cuisine style: ${cuisine}`                      : null,
    proteinSource ? `- Main protein source MUST be: ${proteinSource}`  : null,
    mealTime      ? `- Meal occasion: ${mealTime}`                     : null,
    cookTime      ? `- Max cooking time: ${cookTime}`                  : null,
    spiceLevel    ? `- Spice level: ${spiceLevel}`                     : null,
    `- Servings: ${servings} person(s)`,
    restrictions  ? `- Dietary restrictions: ${restrictions}`          : null,
  ].filter(Boolean).join('\n');

  const prompt = `You are a precision nutrition expert specializing in high-protein meal planning.
Generate a meal that strictly meets these requirements:
${macroLines}
- ${typeInstruction}

Respond with ONLY a valid raw JSON object — no markdown, no code fences, no extra text.

Schema for HOME COOKED — return exactly ${resultCount} distinct meal(s):
{
  "type": "home_cooked",
  "meals": [
    {
      "name": "<meal name>",
      "protein": "<Xg>",
      "calories": "<X>",
      "carbs": "<Xg>",
      "fat": "<Xg>",
      "description": "<1-2 sentence description>",
      "ingredients": ["<amount> <ingredient>", ...],
      "steps": ["<detailed step 1>", "<detailed step 2>", ...]
    }
  ]
}

Schema for FAST FOOD — return exactly ${resultCount} restaurant option(s):
{
  "type": "fast_food",
  "name": "<descriptive theme, e.g. 'High-Protein Burger Run'>",
  "protein": "<Xg range>",
  "calories": "<X range>",
  "carbs": "<Xg range>",
  "fat": "<Xg range>",
  "description": "<1-2 sentence description>",
  "restaurants": [
    {
      "name": "<restaurant chain>",
      "item": "<specific menu item>",
      "protein": "<Xg>",
      "calories": "<X>",
      "carbs": "<Xg>",
      "fat": "<Xg>",
      "modifications": "<how to order it for max protein>"
    }
  ]
}

Each home cooked meal must have detailed steps. Each meal/restaurant must be distinct.`;

  // Home cooked meals need ~600 tokens each (ingredients + steps), fast food ~250 each
  const tokensPerResult = mealType === 'home_cooked' ? 650 : 280;
  const max_tokens = Math.min(8192, 512 + tokensPerResult * resultCount);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens,
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === 'length') {
      return res.status(500).json({
        error: `Response was cut off — try reducing the number of results to ${Math.max(1, Math.floor(resultCount * 0.6))}.`,
      });
    }

    const raw = choice.message.content;
    const meal = extractJSON(raw);
    res.json(meal);
  } catch (err) {
    console.error('[generate error]', err.message);
    const isJSON = err.message.includes('JSON') || err.message.includes('json');
    res.status(500).json({
      error: isJSON
        ? 'AI response was incomplete — try fewer results or a simpler request.'
        : (err.message || 'Failed to generate meal'),
    });
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
  const recipe = {
    ...req.body,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  db.recipes.unshift(recipe);
  writeDB(db);
  res.status(201).json(recipe);
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
  const db = readDB();
  const before = db.recipes.length;
  db.recipes = db.recipes.filter(r => r.id !== req.params.id);
  if (db.recipes.length === before) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  writeDB(db);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('✅  ProteinFuel server running at http://localhost:3001');
  if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    console.warn('⚠️   Add your Groq API key to server/config.js');
  }
});
