import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { useUser } from '@/context/UserContext';

// Sample recipes for initial state
const sampleRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Classic Spaghetti Carbonara',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    ingredients: [
      { name: 'Spaghetti', quantity: '400', unit: 'g' },
      { name: 'Pancetta', quantity: '200', unit: 'g' },
      { name: 'Eggs', quantity: '4', unit: 'large' },
      { name: 'Pecorino Romano', quantity: '100', unit: 'g' },
      { name: 'Black Pepper', quantity: '1', unit: 'tsp' },
    ],
    instructions: [
      'Cook pasta in salted water until al dente',
      'Fry pancetta until crispy',
      'Mix eggs and cheese in a bowl',
      'Combine all ingredients and serve immediately',
    ],
    image: 'https://source.unsplash.com/featured/?spaghetti,carbonara',
    tags: ['pasta', 'italian', 'quick-meal'],
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Chicken Stir Fry',
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    ingredients: [
      { name: 'Chicken Breast', quantity: '500', unit: 'g' },
      { name: 'Mixed Vegetables', quantity: '400', unit: 'g' },
      { name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Garlic', quantity: '3', unit: 'cloves' },
      { name: 'Ginger', quantity: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Cut chicken into bite-sized pieces',
      'Prepare vegetables',
      'Stir fry chicken until golden',
      'Add vegetables and sauce',
      'Cook until vegetables are tender',
    ],
    image: 'https://source.unsplash.com/featured/?stir-fry,chicken',
    tags: ['asian', 'healthy', 'quick-meal'],
    isFavorite: false,
  },
];

export const useRecipeStorage = () => {
  // Initialize with sample recipes and ensure it's always an array
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    console.log('Initializing recipes state');
    // Try to get cached recipes first
    if (typeof window !== 'undefined') {
      const cachedRecipesKey = 'cached-recipes';
      const storedRecipes = localStorage.getItem(cachedRecipesKey);
      console.log('Cached recipes from localStorage:', storedRecipes);

      if (storedRecipes) {
        try {
          const parsed = JSON.parse(storedRecipes);
          console.log('Parsed cached recipes:', parsed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (error) {
          console.error('Error parsing cached recipes:', error);
        }
      }
    }
    console.log('Using sample recipes');
    return sampleRecipes;
  });

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Load recipes from localStorage on component mount
  useEffect(() => {
    const loadRecipes = async () => {
      console.log('Loading recipes effect started', { user });

      try {
        if (!user?.id) {
          console.log('No user ID, skipping recipe initialization');
          return;
        }

        // Try to load user-specific cached recipes first
        const userSpecificKey = `recipes_${user.id}`;
        const cachedRecipes = localStorage.getItem(userSpecificKey);
        console.log('User-specific cached recipes:', cachedRecipes);

        if (cachedRecipes) {
          try {
            const parsedRecipes = JSON.parse(cachedRecipes);
            console.log('Parsed user-specific cached recipes:', parsedRecipes);
            setRecipes(parsedRecipes);
            return;
          } catch (error) {
            console.error('Error parsing cached recipes:', error);
            localStorage.removeItem(userSpecificKey);
          }
        }

        // If no cached recipes, start with empty state
        console.log('No cached recipes found, starting with empty state');
        setRecipes([]);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [user?.id]);

  // Add a single recipe
  const addRecipe = (recipe: Recipe) => {
    // Check if recipe with the same title already exists
    const existingRecipeIndex = recipes.findIndex(
      r => r.title.toLowerCase() === recipe.title.toLowerCase()
    );

    if (existingRecipeIndex !== -1) {
      // Recipe already exists, don't add a duplicate
      console.log(`Recipe "${recipe.title}" already exists, not adding duplicate`);
      return;
    }

    console.log('Adding new recipe:', recipe.title);

    setRecipes(prevRecipes => {
      const updatedRecipes = [...prevRecipes, recipe];

      // Save to localStorage if user is logged in
      if (user) {
        localStorage.setItem(`cached-recipes-${user.id}`, JSON.stringify(updatedRecipes));
      }

      return updatedRecipes;
    });
  };

  // Add multiple recipes at once (for batch caching)
  const addMultipleRecipes = (newRecipes: Recipe[]) => {
    if (!newRecipes || newRecipes.length === 0) return;

    console.log(`Adding ${newRecipes.length} recipes to storage`);

    setRecipes(prevRecipes => {
      // Filter out duplicates based on title
      const existingTitles = new Set(prevRecipes.map(r => r.title.toLowerCase()));
      const uniqueNewRecipes = newRecipes.filter(
        recipe => !existingTitles.has(recipe.title.toLowerCase())
      );

      console.log(`${uniqueNewRecipes.length} unique recipes will be added to storage`);

      if (uniqueNewRecipes.length === 0) {
        console.log('All recipes already exist, not adding duplicates');
        return prevRecipes;
      }

      const updatedRecipes = [...prevRecipes, ...uniqueNewRecipes];

      // Save to localStorage if user is logged in
      if (user) {
        localStorage.setItem(`cached-recipes-${user.id}`, JSON.stringify(updatedRecipes));
      }

      return updatedRecipes;
    });
  };

  // Clear all recipes
  const clearRecipes = () => {
    setRecipes([]);

    // Clear from localStorage if user is logged in
    if (user) {
      localStorage.removeItem(`cached-recipes-${user.id}`);
    }
  };

  // Get favorite recipes
  const getFavoriteRecipes = () => {
    return recipes.filter(recipe => recipe.isFavorite);
  };

  return {
    recipes: recipes || sampleRecipes, // Ensure we always return an array
    setRecipes,
    addRecipe,
    addMultipleRecipes,
    clearRecipes,
    getFavoriteRecipes,
    isLoading,
  };
};
