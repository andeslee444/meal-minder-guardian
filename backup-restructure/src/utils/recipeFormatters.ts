import { Recipe } from '@/types/recipe';

/**
 * Generates a fallback image URL for recipes
 */
export const generateFallbackImageUrl = (recipe: any): string => {
  // Extract info from recipe for better image relevance
  const title = recipe.title.toLowerCase();

  // Special handling for problematic recipe types
  if (
    title.includes('chocolate') ||
    title.includes('cocoa') ||
    title.includes('brownie') ||
    title.includes('cupcake')
  ) {
    return `https://source.unsplash.com/featured/?chocolate,dessert,baking`;
  }

  if (title.includes('peanut') && title.includes('butter')) {
    return `https://source.unsplash.com/featured/?peanut,butter,dessert`;
  }

  // Extract keywords from recipe for better image relevance
  const keywords = [
    ...(recipe.dishTypes || []),
    ...(recipe.diets || []).slice(0, 2),
    recipe.title.split(' ').slice(0, 3).join(' '),
  ].filter(Boolean);

  const encodedKeywords = encodeURIComponent(keywords.slice(0, 3).join(',') || 'food');
  return `https://source.unsplash.com/featured/?${encodedKeywords},food`;
};

/**
 * Validates an image URL and returns a fallback if it's invalid
 */
export const validateImageUrl = (url: string | undefined, recipe: any): string => {
  if (!url) return generateFallbackImageUrl(recipe);

  // Check for problematic recipe titles that often have image issues
  const title = recipe.title.toLowerCase();
  const isProblematicRecipe =
    title.includes('chocolate') ||
    title.includes('cocoa') ||
    title.includes('brownie') ||
    title.includes('cupcake') ||
    (title.includes('peanut') && title.includes('butter'));

  // For problematic recipes, force Unsplash fallback
  if (isProblematicRecipe) {
    console.warn(`Using fallback for problematic recipe type: "${recipe.title}"`);
    return generateFallbackImageUrl(recipe);
  }

  // Basic URL validation
  try {
    new URL(url);
    return url;
  } catch (e) {
    console.warn(`Invalid image URL for recipe "${recipe.title}":`, url);
    return generateFallbackImageUrl(recipe);
  }
};

/**
 * Deduplicates recipe ingredients by combining quantities for the same ingredient
 */
export const deduplicateIngredients = (ingredients: any[]): any[] => {
  const ingredientMap = new Map();

  // Group ingredients by normalized name
  ingredients.forEach(ing => {
    const normalizedName = ing.name.toLowerCase().trim();
    if (!ingredientMap.has(normalizedName)) {
      ingredientMap.set(normalizedName, { ...ing });
    } else {
      // If same ingredient exists, try to combine quantities if possible
      const existingIng = ingredientMap.get(normalizedName);
      if (
        existingIng.unit === ing.unit &&
        !isNaN(Number(existingIng.quantity)) &&
        !isNaN(Number(ing.quantity))
      ) {
        existingIng.quantity = (Number(existingIng.quantity) + Number(ing.quantity)).toString();
      }
    }
  });

  return Array.from(ingredientMap.values());
};

/**
 * Formats a Spoonacular recipe response to match our application's Recipe format
 */
export const formatSpoonacularRecipe = (recipeDetails: any): Recipe => {
  // Ensure we always have a valid image URL
  const validatedImage = validateImageUrl(recipeDetails.image, recipeDetails);

  // Log image processing details for debugging
  console.log(`Processing recipe image for "${recipeDetails.title}":`, {
    originalImage: recipeDetails.image,
    validatedImage,
    hasFallback: recipeDetails.image !== validatedImage,
  });

  // Extract ingredients and deduplicate them
  const ingredients = recipeDetails.extendedIngredients.map(ing => ({
    name: ing.name,
    quantity: ing.amount.toString(),
    unit: ing.unit,
  }));

  const dedupedIngredients = deduplicateIngredients(ingredients);

  // Process instructions - ensure they're properly formatted as an array
  let instructions: string[] = [];
  if (recipeDetails.analyzedInstructions && recipeDetails.analyzedInstructions[0]?.steps) {
    instructions = recipeDetails.analyzedInstructions[0].steps.map((step: any) => step.step.trim());
  } else if (typeof recipeDetails.instructions === 'string') {
    // If instructions is a string, split by periods and newlines to create steps
    instructions = recipeDetails.instructions
      .split(/\.\s+|\n+/)
      .map((step: string) => step.trim())
      .filter((step: string) => step.length > 0)
      .map((step: string) => (step.endsWith('.') ? step : `${step}.`));
  }

  return {
    id: crypto.randomUUID(),
    title: recipeDetails.title,
    ingredients: dedupedIngredients,
    instructions: instructions,
    prepTime: recipeDetails.preparationMinutes > 0 ? recipeDetails.preparationMinutes : 15,
    cookTime: recipeDetails.cookingMinutes > 0 ? recipeDetails.cookingMinutes : 20,
    servings: recipeDetails.servings,
    image: validatedImage,
    tags: [
      ...(recipeDetails.dishTypes || []),
      ...(recipeDetails.diets || []),
      recipeDetails.vegetarian ? 'vegetarian' : null,
      recipeDetails.vegan ? 'vegan' : null,
      recipeDetails.glutenFree ? 'gluten-free' : null,
      recipeDetails.dairyFree ? 'dairy-free' : null,
    ].filter(Boolean),
  };
};
