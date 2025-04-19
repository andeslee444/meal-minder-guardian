import { Recipe, RecipeGenerationParams, RecipeGenerationResult } from '@/types/recipe';
import { RecipeTag } from '@/types/recipe-tags';
import { BaseGenerationService } from './BaseGenerationService';

/**
 * Service for generating recipes using a Supabase Edge Function
 */
export class EdgeFunctionGenerationService extends BaseGenerationService {
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private createMockRecipe(title: string, ingredients: string[], index: number): Recipe {
    // Generate a unique ID based on title and index
    const id = `mock-${index}-${Date.now()}`;
    const prepTime = this.getRandomInt(10, 60);
    const cookTime = this.getRandomInt(15, 90);

    // Format ingredients with random quantities
    const formattedIngredients = ingredients.map(name => {
      const quantity = this.getRandomInt(1, 5);
      const unit = this.getRandomUnit(name);
      return {
        id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        quantity,
        unit,
      };
    });

    // Add some mock extra ingredients that weren't in the inventory
    const extraIngredients = ['salt', 'pepper', 'olive oil', 'garlic', 'onion', 'butter'].map(
      name => {
        const quantity = this.getRandomInt(1, 3);
        const unit = this.getRandomUnit(name);
        return {
          id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name,
          quantity,
          unit,
        };
      }
    );

    // Combine inventory ingredients with extra common ingredients
    const allIngredients = [...formattedIngredients, ...extraIngredients];

    // Generate some realistic tags based on ingredients
    const tags = this.generateTags(ingredients, title);

    return {
      id,
      title,
      description: this.generateDescription(title, ingredients),
      ingredients: allIngredients,
      instructions: this.generateInstructions(title, allIngredients),
      prepTime,
      cookTime,
      servings: this.getRandomInt(2, 6),
      imageUrl: null, // Will be generated later by DALL-E
      source: 'Edge Function',
      tags,
    };
  }

  private generateDescription(title: string, ingredients: string[]): string {
    const descriptions = [
      `A delicious ${title} made with ${ingredients.slice(0, 3).join(', ')} and other flavorful ingredients.`,
      `This ${title} recipe is perfect for using up ${ingredients.slice(0, 3).join(', ')} from your kitchen.`,
      `Enjoy this homemade ${title} featuring ${ingredients.slice(0, 2).join(' and ')}.`,
      `A simple yet tasty ${title} that highlights the flavors of ${ingredients.slice(0, 3).join(', ')}.`,
      `Make the most of your ${ingredients.slice(0, 3).join(', ')} with this delightful ${title}.`,
    ];

    return this.getRandomElement(descriptions);
  }

  private generateInstructions(title: string, ingredients: any[]): string[] {
    const ingredientNames = ingredients.map(i => i.name);

    // Generate 4-8 steps based on the recipe
    const steps: string[] = [];

    // Prep step
    steps.push(
      `Prepare all ingredients. ${this.getRandomElement([
        'Wash and chop any vegetables.',
        'Measure out all ingredients before starting.',
        'Ensure all ingredients are at room temperature for best results.',
        'Prep your workspace and gather all cooking tools.',
      ])}`
    );

    // Cooking steps (make these somewhat realistic)
    if (ingredientNames.some(i => i.includes('onion') || i.includes('garlic'))) {
      steps.push(
        `Heat ${this.getRandomElement(['olive oil', 'butter', 'oil'])} in a ${this.getRandomElement(['large pan', 'skillet', 'pot'])} over medium heat. Add ${this.getRandomElement(['diced onions', 'minced garlic', 'onions and garlic'])} and sauté until ${this.getRandomElement(['translucent', 'fragrant', 'golden'])}, about ${this.getRandomInt(2, 5)} minutes.`
      );
    }

    // Main cooking step
    const proteins = ingredientNames.filter(i =>
      ['chicken', 'beef', 'pork', 'tofu', 'shrimp', 'fish', 'salmon', 'tuna', 'eggs'].some(p =>
        i.includes(p)
      )
    );

    if (proteins.length > 0) {
      const protein = proteins[0];
      steps.push(
        `Add ${protein} to the ${this.getRandomElement(['pan', 'skillet', 'pot'])} and cook until ${this.getRandomElement(['browned', 'cooked through', 'golden'])}, about ${this.getRandomInt(5, 15)} minutes.`
      );
    }

    const vegetables = ingredientNames.filter(i =>
      ['carrot', 'broccoli', 'pepper', 'zucchini', 'spinach', 'kale', 'tomato', 'potato'].some(v =>
        i.includes(v)
      )
    );

    if (vegetables.length > 0) {
      steps.push(
        `Add ${vegetables.slice(0, 3).join(', ')} and cook for another ${this.getRandomInt(3, 8)} minutes until vegetables are ${this.getRandomElement(['tender', 'softened', 'cooked through'])}.`
      );
    }

    // Additional steps
    steps.push(
      `${this.getRandomElement([
        'Stir in seasonings and mix well.',
        'Add salt and pepper to taste.',
        'Pour in any liquids and bring to a simmer.',
        'Cover and cook for another few minutes.',
      ])}`
    );

    // Final step
    steps.push(
      `${this.getRandomElement([
        `Serve ${title} hot and enjoy!`,
        `Let the ${title} cool slightly before serving.`,
        `Garnish with fresh herbs and serve immediately.`,
        `Plate the ${title} and serve with your favorite sides.`,
      ])}`
    );

    return steps;
  }

  private generateTags(ingredients: string[], title: string): RecipeTag[] {
    const tags: RecipeTag[] = [];

    // Cuisine tags based on ingredients or title
    const cuisines: { [key: string]: string[] } = {
      italian: ['pasta', 'pizza', 'risotto', 'lasagna', 'parmesan', 'mozzarella'],
      mexican: ['taco', 'burrito', 'salsa', 'guacamole', 'tortilla', 'enchilada'],
      asian: ['rice', 'soy', 'noodle', 'tofu', 'stir fry', 'sesame'],
      indian: ['curry', 'masala', 'tikka', 'paneer', 'naan', 'biryani'],
    };

    // Check title and ingredients for cuisine matches
    for (const [cuisine, keywords] of Object.entries(cuisines)) {
      if (
        keywords.some(
          kw =>
            title.toLowerCase().includes(kw) ||
            ingredients.some(ing => ing.toLowerCase().includes(kw))
        )
      ) {
        tags.push(cuisine as RecipeTag);
        break; // Only add one cuisine
      }
    }

    // Diet tags based on ingredients
    const hasMeat = ingredients.some(ing =>
      ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp'].some(m =>
        ing.toLowerCase().includes(m)
      )
    );

    if (!hasMeat) {
      tags.push('vegetarian');

      // Check if it's potentially vegan (no obvious animal products)
      const animalProducts = ['milk', 'cheese', 'cream', 'yogurt', 'butter', 'egg'];
      const hasAnimalProducts = ingredients.some(ing =>
        animalProducts.some(ap => ing.toLowerCase().includes(ap))
      );

      if (!hasAnimalProducts) {
        tags.push('vegan');
      }
    }

    // Meal type tag based on title
    const mealTypes: { [key: string]: string[] } = {
      breakfast: ['breakfast', 'pancake', 'waffle', 'omelette', 'egg', 'muffin'],
      lunch: ['sandwich', 'wrap', 'salad', 'soup'],
      dinner: ['roast', 'steak', 'casserole', 'pasta', 'curry'],
      dessert: ['cake', 'cookie', 'pie', 'dessert', 'sweet', 'ice cream'],
    };

    for (const [mealType, keywords] of Object.entries(mealTypes)) {
      if (keywords.some(kw => title.toLowerCase().includes(kw))) {
        tags.push(mealType as RecipeTag);
        break; // Only add one meal type
      }
    }

    // Add a few random tags for variety
    const possibleTags: RecipeTag[] = ['quick', 'easy', 'healthy', 'comfort', 'baked'];
    const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
    tags.push(randomTag);

    return tags;
  }

  private getRandomUnit(ingredient: string): string {
    const ingredient_lc = ingredient.toLowerCase();

    // Map ingredients to appropriate units
    if (
      ['water', 'milk', 'oil', 'broth', 'stock', 'juice', 'wine'].some(i =>
        ingredient_lc.includes(i)
      )
    ) {
      return this.getRandomElement(['cup', 'ml', 'tbsp']);
    }

    if (['flour', 'sugar', 'salt', 'rice', 'oats'].some(i => ingredient_lc.includes(i))) {
      return this.getRandomElement(['cup', 'g', 'tbsp']);
    }

    if (
      ['onion', 'tomato', 'potato', 'apple', 'orange', 'lemon', 'egg'].some(i =>
        ingredient_lc.includes(i)
      )
    ) {
      return ''; // Use count for whole items
    }

    if (['butter', 'cheese', 'meat', 'chicken', 'beef'].some(i => ingredient_lc.includes(i))) {
      return this.getRandomElement(['g', 'oz', 'lb']);
    }

    if (['spice', 'herb', 'seasoning', 'powder'].some(i => ingredient_lc.includes(i))) {
      return this.getRandomElement(['tsp', 'tbsp', 'pinch']);
    }

    // Default units for other ingredients
    return this.getRandomElement(['cup', 'g', 'tbsp', 'tsp', '']);
  }

  /**
   * Generate recipes using inventory ingredients via Edge Function
   */
  public async generateRecipe(
    params: RecipeGenerationParams,
    onProgressUpdate?: (progress: number) => void
  ): Promise<RecipeGenerationResult> {
    try {
      // For demonstration, simulate a network request
      if (onProgressUpdate) {
        onProgressUpdate(10);
      }

      // Get ingredients from params
      const ingredients = params.ingredients || [];

      console.log('[EdgeFunction] Generating recipes with ingredients:', ingredients);

      if (ingredients.length === 0) {
        console.warn('[EdgeFunction] No ingredients provided, using mock data');
      }

      if (onProgressUpdate) {
        onProgressUpdate(30);
      }

      // Generate recipe titles based on available ingredients
      const NUMBER_OF_RECIPES = 6;
      const titles =
        ingredients.length > 0
          ? this.generateRecipeTitles(ingredients, NUMBER_OF_RECIPES)
          : this.getDefaultRecipeTitles(NUMBER_OF_RECIPES);

      if (onProgressUpdate) {
        onProgressUpdate(50);
      }

      // Create mock recipes with the generated titles and ingredients
      const recipes: Recipe[] = titles.map((title, idx) =>
        this.createMockRecipe(title, ingredients, idx)
      );

      if (onProgressUpdate) {
        onProgressUpdate(80);
      }

      // Log the generated recipes for debugging
      console.log(
        '[EdgeFunction] Generated recipes:',
        recipes.map(r => ({
          title: r.title,
          ingredients: r.ingredients.map(i => i.name),
        }))
      );

      // Simulate network delay (2.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (onProgressUpdate) {
        onProgressUpdate(100);
      }

      return {
        recipes,
        source: 'edge-function',
      };
    } catch (error) {
      console.error('[EdgeFunction] Error generating recipes:', error);
      throw error;
    }
  }

  private generateRecipeTitles(ingredients: string[], count: number): string[] {
    // Arrange ingredients by importance (proteins first, then vegetables, etc.)
    const proteins = ingredients.filter(i =>
      ['chicken', 'beef', 'pork', 'fish', 'tofu', 'shrimp', 'lamb', 'turkey'].some(p =>
        i.toLowerCase().includes(p)
      )
    );

    const vegetables = ingredients.filter(i =>
      ['carrot', 'broccoli', 'potato', 'tomato', 'onion', 'pepper', 'zucchini', 'spinach'].some(v =>
        i.toLowerCase().includes(v)
      )
    );

    const starches = ingredients.filter(i =>
      ['rice', 'pasta', 'noodle', 'bread', 'potato', 'quinoa'].some(s =>
        i.toLowerCase().includes(s)
      )
    );

    // Templates for recipe titles
    const templates = [
      // Protein-focused recipes
      '${protein} with ${vegetable}',
      'Roasted ${protein} and ${vegetable}',
      '${protein} Stir-Fry',
      'Grilled ${protein} with ${starch}',
      '${protein} ${starch} Casserole',

      // Vegetable-focused recipes
      '${vegetable} Soup',
      'Roasted ${vegetable} Salad',
      '${vegetable} and ${starch} Bake',
      '${vegetable} Stir-Fry',
      'Sautéed ${vegetable} with ${protein}',

      // Starch-focused recipes
      '${starch} with ${protein} and ${vegetable}',
      '${protein} ${starch} Bowl',
      '${starch} Salad with ${protein}',
      'One-Pot ${starch} and ${vegetable}',
      '${starch} with ${vegetable} Sauce',
    ];

    // Generate titles
    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const template = this.getRandomElement(templates);

      // Replace placeholders with actual ingredients
      let title = template
        .replace('${protein}', proteins.length > 0 ? this.getRandomElement(proteins) : 'Tofu')
        .replace(
          '${vegetable}',
          vegetables.length > 0 ? this.getRandomElement(vegetables) : 'Mixed Vegetables'
        )
        .replace('${starch}', starches.length > 0 ? this.getRandomElement(starches) : 'Rice');

      // Capitalize first letter of each word
      title = title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      titles.push(title);
    }

    return titles;
  }

  private getDefaultRecipeTitles(count: number): string[] {
    const defaultTitles = [
      'Chicken Alfredo Pasta',
      'Beef Stir-Fry with Vegetables',
      'Vegetable Curry with Rice',
      'Spaghetti Bolognese',
      'Roasted Salmon with Potatoes',
      'Mushroom Risotto',
      'Spinach and Feta Stuffed Chicken',
      'Vegetable Lasagna',
      'Teriyaki Tofu Bowl',
      'Shrimp Scampi with Linguine',
      'Beef Tacos with Fresh Salsa',
      'Vegetable Soup with Barley',
    ];

    // Shuffle and take the first 'count' elements
    return [...defaultTitles].sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
