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
    location      ? `- User's location: ${sanitize(location)}` : null,
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

  const locationRule = location
    ? `LOCATION RULES (user is in: ${sanitize(location)}):
- ONLY recommend chains you are highly confident operate in this specific city/state
- Safe national chains available almost everywhere in the US: McDonald's, Subway, Chipotle, Chick-fil-A, Taco Bell, Wendy's, Burger King, Panda Express, Panera Bread, Five Guys, Jersey Mike's, Wingstop, Raising Cane's, In-N-Out (West Coast only), Shake Shack (urban areas)
- Regional chains: Zaxby's and Bojangles' are Southeast US only (NOT Arizona, NOT West Coast). Whataburger is Texas/South-central. In-N-Out is California/Nevada/Arizona/Utah. Culver's is Midwest/Southeast.
- If you are not certain a chain exists in ${sanitize(location)}, do NOT include it — pick a safe national chain instead
- Prioritize variety: don't suggest the same chain twice`
    : ''

  const systemPrompt = `You are a precision sports nutritionist and registered dietitian specializing in high-protein meal planning.

MACRO ACCURACY RULES:
- Calories = (protein_g × 4) + (carbs_g × 4) + (fat_g × 9) — numbers must add up
- A meal with 50g protein has at minimum 200 kcal from protein alone — total can never be lower
- Base macros on actual ingredient amounts listed — verify before writing

FAST FOOD CHAIN RULES:
- Only use real chains with real existing menu items
- Never recommend a chain you are not confident exists in the user's area
- Macro values for fast food are estimates — prefix with ~ (e.g. "~48g", "~740")
${locationRule}

OUTPUT: Return ONLY valid JSON — no markdown, no code fences, no explanation.
Every item in the result array must be distinct.`

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
