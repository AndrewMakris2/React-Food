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
  const { proteinGoal = 50, mealType = 'any', restrictions = '' } = req.body;

  const typeInstruction =
    mealType === 'home_cooked' ? 'This MUST be a home-cooked meal (type = "home_cooked").' :
    mealType === 'fast_food'   ? 'This MUST be a fast food meal (type = "fast_food").' :
    'Choose the best type for this goal — either "home_cooked" or "fast_food".';

  const prompt = `You are a nutrition expert specializing in high-protein meal planning.
Generate a protein-packed meal recommendation with these requirements:
- Protein target: ~${proteinGoal}g
- ${typeInstruction}
${restrictions ? `- Dietary restrictions: ${restrictions}` : ''}

Respond with ONLY a valid raw JSON object — no markdown, no extra text, no code fences.

Schema for HOME COOKED:
{
  "type": "home_cooked",
  "name": "<meal name>",
  "protein": "<Xg>",
  "calories": "<X>",
  "description": "<1-2 sentence description>",
  "ingredients": ["<amount> <ingredient>", ...],
  "steps": ["<full instruction for step 1>", "<full instruction for step 2>", ...],
  "restaurants": []
}

Schema for FAST FOOD:
{
  "type": "fast_food",
  "name": "<descriptive theme name, e.g. 'High-Protein Burger Run'>",
  "protein": "<Xg range>",
  "calories": "<X range>",
  "description": "<1-2 sentence description>",
  "ingredients": [],
  "steps": [],
  "restaurants": [
    {
      "name": "<restaurant chain>",
      "item": "<specific menu item>",
      "protein": "<Xg>",
      "calories": "<X>",
      "modifications": "<how to order it for max protein>"
    }
  ]
}

Provide 3 restaurant options for fast food. Make steps detailed and clear for home cooked meals.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const raw = completion.choices[0].message.content;
    const meal = extractJSON(raw);
    res.json(meal);
  } catch (err) {
    console.error('[generate error]', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate meal' });
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
    console.warn('⚠️   Add your Groq API key to server/config.js to enable AI generation');
  }
});
