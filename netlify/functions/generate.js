import Groq from 'groq-sdk';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

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
    location      = null,
  } = JSON.parse(event.body || '{}');

  const macroLines = [
    `- Protein: at least ${proteinGoal}g`,
    maxCalories   ? `- Calories: maximum ${maxCalories} kcal`         : null,
    maxCarbs      ? `- Carbs: maximum ${maxCarbs}g`                   : null,
    maxFat        ? `- Fat: maximum ${maxFat}g`                       : null,
    cuisine       ? `- Cuisine style: ${cuisine}`                     : null,
    proteinSource ? `- Main protein source MUST be: ${proteinSource}` : null,
    mealTime      ? `- Meal occasion: ${mealTime}`                    : null,
    cookTime      ? `- Max cooking time: ${cookTime}`                 : null,
    spiceLevel    ? `- Spice level: ${spiceLevel}`                    : null,
    `- Servings: ${servings} person(s)`,
    restrictions  ? `- Dietary restrictions: ${restrictions}`         : null,
    location      ? `- User location: ${location} — prioritize chains and options available in this area` : null,
  ].filter(Boolean).join('\n');

  // Build type-specific schema to avoid model confusion
  const homeSchema = `{
  "type": "home_cooked",
  "meals": [
    {
      "name": "<meal name>",
      "protein": "<Xg>",
      "calories": "<X>",
      "carbs": "<Xg>",
      "fat": "<Xg>",
      "description": "<1-2 sentence description>",
      "ingredients": ["<amount> <ingredient>"],
      "steps": ["<detailed step 1>", "<detailed step 2>"]
    }
  ]
}`;

  const fastSchema = `{
  "type": "fast_food",
  "name": "<descriptive theme>",
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
      "modifications": "<how to order for max protein>"
    }
  ]
}`;

  let schemaInstruction;
  if (mealType === 'home_cooked') {
    schemaInstruction = `You MUST return a home_cooked JSON object. The "meals" array MUST contain EXACTLY ${resultCount} distinct meal objects — no fewer, no more.

${homeSchema}`;
  } else if (mealType === 'fast_food') {
    schemaInstruction = `You MUST return a fast_food JSON object. The "restaurants" array MUST contain EXACTLY ${resultCount} distinct restaurant objects — no fewer, no more.

${fastSchema}`;
  } else {
    schemaInstruction = `Choose the most fitting type. Whichever you pick, the array (meals or restaurants) MUST contain EXACTLY ${resultCount} distinct items.

HOME COOKED schema:
${homeSchema}

FAST FOOD schema:
${fastSchema}`;
  }

  const prompt = `You are a precision nutrition expert specializing in high-protein meal planning.
CRITICAL: You MUST generate EXACTLY ${resultCount} result(s). Count them before responding.

Requirements:
${macroLines}

Respond with ONLY a valid raw JSON object — no markdown, no code fences, no extra text.

${schemaInstruction}

Every item in the array must be distinct. For home cooked meals, steps must be detailed.`;

  const tokensPerResult = mealType === 'home_cooked' ? 650 : 280;
  const max_tokens = Math.min(8192, 512 + tokensPerResult * resultCount);

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens,
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === 'length') {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Response was cut off — try reducing results to ${Math.max(1, Math.floor(resultCount * 0.6))}.`,
        }),
      };
    }

    const meal = extractJSON(choice.message.content);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meal),
    };
  } catch (err) {
    console.error('[generate error]', err.message);
    const isJSON = err.message.includes('JSON') || err.message.includes('json');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: isJSON
          ? 'AI response was incomplete — try fewer results.'
          : (err.message || 'Failed to generate meal'),
      }),
    };
  }
};
