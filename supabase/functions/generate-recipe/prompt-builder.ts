import { RecipeResponse } from './types.ts';

interface PromptOptions {
  filterMode: string;
  existingRecipes: RecipeResponse[];
  partialRecipes: boolean;
}

/**
 * Builds a prompt for recipe generation
 */
export function createPrompt(
  ingredients: string[],
  numRecipes: number,
  options: PromptOptions
): string {
  const { filterMode, existingRecipes, partialRecipes } = options;

  const systemMessage = `You are a recipe generation assistant that ONLY responds with valid JSON arrays containing recipe objects. Never include any explanatory text, markdown, or non-JSON content in your response.`;

  const existingRecipesText =
    existingRecipes.length > 0
      ? `\nPlease avoid generating recipes similar to these existing ones:\n${existingRecipes.map(r => r.title).join(', ')}`
      : '';

  const filterModeText =
    filterMode === 'strict'
      ? 'Only use the provided ingredients. Do not suggest substitutions or additional ingredients.'
      : 'You can suggest substitutions for missing ingredients if needed.';

  const partialRecipesText = partialRecipes
    ? 'If you cannot create a complete recipe with the given ingredients, provide a partial recipe with available ingredients.'
    : 'Only provide complete recipes that can be made with the given ingredients.';

  return `${systemMessage}

Generate ${numRecipes} unique and creative recipes using these ingredients: ${ingredients.join(', ')}.

${filterModeText}
${partialRecipesText}
${existingRecipesText}

Your response MUST be a valid JSON array containing recipe objects. Each recipe object MUST follow this exact structure:

{
  "title": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string"
    }
  ],
  "instructions": ["string"],
  "prepTime": number,
  "cookTime": number,
  "servings": number,
  "tags": ["string"]
}

Here are examples of valid recipe objects:

[
  {
    "title": "Simple Pasta with Olive Oil",
    "ingredients": [
      {
        "name": "pasta",
        "quantity": "8",
        "unit": "oz"
      },
      {
        "name": "olive oil",
        "quantity": "2",
        "unit": "tbsp"
      }
    ],
    "instructions": [
      "Bring a large pot of salted water to a boil",
      "Cook pasta according to package instructions",
      "Drain pasta and toss with olive oil"
    ],
    "prepTime": 5,
    "cookTime": 15,
    "servings": 4,
    "tags": ["Italian", "Vegetarian", "Quick"]
  }
]

Critical Requirements:
1. Response MUST be a valid JSON array starting with [ and ending with ]
2. Each recipe object MUST have ALL required fields with exact names
3. ingredients MUST be an array of objects with name, quantity, and unit
4. instructions MUST be an array of strings
5. prepTime, cookTime, and servings MUST be numbers (not strings)
6. tags MUST be an array of strings
7. NO explanatory text, markdown, or non-JSON content
8. NO comments or additional fields

Return ONLY a JSON array containing recipe objects in the exact format shown above.`;
}
