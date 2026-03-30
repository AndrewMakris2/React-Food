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
  } = JSON.parse(event.body || '{}');

  const typeInstruction =
    mealType === 'home_cooked' ? 'This MUST be a home-cooked meal (type = "home_cooked").' :
    mealType === 'fast_food'   ? 'This MUST be a fast food meal (type = "fast_food").' :
    'Choose the most fitting type — either "home_cooked" or "fast_food".';

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
      "modifications": "<how to order it for max protein>"
    }
  ]
}

Each meal/restaurant must be distinct. Steps must be detailed for home cooked meals.`;

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
