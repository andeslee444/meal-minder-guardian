/**
 * Application constants
 */

/**
 * Fallback images by category
 */
export const FALLBACK_IMAGES = {
  // General food categories
  DEFAULT: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  SOUP: 'https://images.unsplash.com/photo-1547592180-85f173990554',
  SALAD: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  DESSERT: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e',
  BREAKFAST: 'https://images.unsplash.com/photo-1533089860892-a7c6f10a5103',
  DINNER: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
  LUNCH: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7',

  // Specific dish types
  PASTA: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
  PIZZA: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
  BURGER: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  SANDWICH: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304',
  STEAK: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976',
  SEAFOOD: 'https://images.unsplash.com/photo-1559847844-5315695dadae',
  CHICKEN: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b',
  RICE: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',

  // Cuisines
  ITALIAN: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85',
  MEXICAN: 'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f',
  ASIAN: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853',
  INDIAN: 'https://images.unsplash.com/photo-1585937421612-70a008356c36',
  MEDITERRANEAN: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7',
};

/**
 * Recipe types and categories
 */
export const RECIPE_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'snack',
  'appetizer',
  'drink',
  'side dish',
];

/**
 * Common cuisines
 */
export const CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Indian',
  'Thai',
  'Japanese',
  'French',
  'Mediterranean',
  'Greek',
];

/**
 * Common dietary restrictions
 */
export const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo',
];

/**
 * Recipe generation defaults
 */
export const RECIPE_GENERATION = {
  DEFAULT_COUNT: 6,
  MAX_COUNT: 12,
  PROMPT_MAX_LENGTH: 300,
};

/**
 * API request timeouts (milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  RECIPE_GENERATION: 60000, // 60 seconds
  IMAGE_GENERATION: 15000, // 15 seconds
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  RECIPES: 'meal-minder:recipes',
  INVENTORY: 'meal-minder:inventory',
  FAVORITES: 'meal-minder:favorites',
  SETTINGS: 'meal-minder:settings',
  THEME: 'meal-minder:theme',
};

/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  RECIPES: '/recipes',
  RECIPE_DETAIL: '/recipes/:id',
  INVENTORY: '/inventory',
  FAVORITES: '/favorites',
  SETTINGS: '/settings',
};
