import Groq from 'groq-sdk';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Clamp a number between min and max
function clamp(val, min, max) { return Math.min(max, Math.max(min, val)) }

// Sanitize a string — trim and cap length
function sanitize(val, maxLen = 120) {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, maxLen)
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GROQ_API_KEY is not set in Netlify environment variables.' }),
    };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { /* use defaults */ }

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
  } = body;

  // Validated / sanitized inputs
  const protein     = clamp(parseInt(proteinGoal) || 50, 5, 500)
  const resultCount = clamp(parseInt(body.resultCount) || 3, 1, 10)
  const type        = ['home_cooked', 'fast_food', 'any'].includes(mealType) ? mealType : 'any'

  const requirementLines = [
    `- Minimum protein: ${protein}g per serving`,
    maxCalories   ? `- Maximum calories: ${maxCalories} kcal per serving`         : null,
    maxCarbs      ? `- Maximum carbs: ${maxCarbs}g per serving`                   : null,
    maxFat        ? `- Maximum fat: ${maxFat}g per serving`                       : null,
    cuisine       ? `- Cuisine: ${sanitize(cuisine)}`                             : null,
    proteinSource ? `- Primary protein source: ${sanitize(proteinSource)}`        : null,
    mealTime      ? `- Meal occasion: ${sanitize(mealTime)}`                      : null,
    cookTime      ? `- Cook time limit: ${sanitize(cookTime)}`                    : null,
    spiceLevel    ? `- Spice level: ${sanitize(spiceLevel)}`                      : null,
    `- Servings: ${sanitize(String(servings))}`,
    restrictions  ? `- Dietary restrictions: ${sanitize(restrictions, 200)}`      : null,
    location      ? `- User is near ${sanitize(location)} — recommend chains/restaurants available in this area` : null,
  ].filter(Boolean).join('\n')

  // Type-specific schema — only show the relevant one to prevent model confusion
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
    typeDirective = `Generate exactly ${resultCount} FAST FOOD option(s). The "restaurants" array MUST have exactly ${resultCount} element(s). Only use real menu items that actually exist at these chains right now.`
    schema = fastSchema
  } else {
    typeDirective = `Choose the most fitting type (home_cooked or fast_food). The meals or restaurants array MUST have exactly ${resultCount} element(s).`
    schema = `HOME COOKED schema:\n${homeSchema}\n\nFAST FOOD schema:\n${fastSchema}`
  }

  const systemPrompt = `You are a precision sports nutritionist and registered dietitian specializing in high-protein meal planning.

MACRO ACCURACY RULES — you must follow these exactly:
- Calories are calculated as: (protein_g × 4) + (carbs_g × 4) + (fat_g × 9)
- A meal with 50g protein contributes at least 200 kcal from protein alone — total calories cannot be lower
- Base all macro numbers on the actual ingredient amounts you list — verify before writing
- Never round protein up dramatically while keeping calories impossibly low
- For fast food: use real published nutrition data for these actual menu items

OUTPUT RULES:
- Return ONLY a valid JSON object — no markdown, no code fences, no explanation
- Every meal/restaurant in the array must be distinct`

  const userPrompt = `${typeDirective}

Requirements:
${requirementLines}

Return this exact JSON structure:
${schema}

Count the items in your array before finishing — it must be exactly ${resultCount}.`

  // Token budget: home cooked needs more space for ingredients + steps
  const tokensPerResult = type === 'home_cooked' ? 750 : 300
  const max_tokens = Math.min(8192, 600 + tokensPerResult * resultCount)

  try {
    const groq = new Groq({ apiKey });
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
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Response was cut off — try reducing results to ${suggested}.`,
        }),
      };
    }

    const meal = JSON.parse(choice.message.content);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    };
  } catch (err) {
    console.error('[generate error]', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || 'Failed to generate meal. Please try again.',
      }),
    };
  }
};
