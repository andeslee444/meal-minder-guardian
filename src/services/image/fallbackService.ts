/**
 * Extract keywords from recipe title and tags for better image relevance
 */
const extractKeywords = (title: string, tags: string[] = []): string[] => {
  // Get relevant food tags (exclude dietary restrictions)
  const foodTags = tags
    .filter(tag => !['dairy-free', 'gluten-free', 'vegan', 'vegetarian'].includes(tag))
    .slice(0, 2);

  const normalizedTitle = title.toLowerCase();
  const containsChocolate = normalizedTitle.includes('chocolate');
  const containsCake = normalizedTitle.includes('cake');
  const containsPasta = normalizedTitle.includes('pasta');
  const containsChicken = normalizedTitle.includes('chicken');
  const containsSoup = normalizedTitle.includes('soup');
  const containsSalad = normalizedTitle.includes('salad');
  const containsDessert = normalizedTitle.includes('dessert');
  const containsBreakfast = normalizedTitle.includes('breakfast');
  const containsDinner = normalizedTitle.includes('dinner');
  const containsLunch = normalizedTitle.includes('lunch');

  let keywords = [];

  // Recipe-specific keyword optimization
  if (containsChocolate) {
    keywords = ['food', 'dessert', 'chocolate', 'gourmet'];
  } else if (containsCake) {
    keywords = ['food', 'cake', 'dessert', 'bakery'];
  } else if (containsPasta) {
    keywords = ['food', 'pasta', 'italian', 'gourmet'];
  } else if (containsChicken) {
    keywords = ['food', 'chicken', 'dinner', 'meal'];
  } else if (containsSoup) {
    keywords = ['food', 'soup', 'bowl', 'homemade'];
  } else if (containsSalad) {
    keywords = ['food', 'salad', 'fresh', 'healthy'];
  } else if (containsDessert) {
    keywords = ['food', 'dessert', 'sweet', 'gourmet'];
  } else if (containsBreakfast) {
    keywords = ['food', 'breakfast', 'morning', 'meal'];
  } else if (containsDinner) {
    keywords = ['food', 'dinner', 'evening', 'meal'];
  } else if (containsLunch) {
    keywords = ['food', 'lunch', 'daytime', 'meal'];
  } else {
    // General case - use first two words of title and food tags
    const titleWords = title.split(' ').slice(0, 2).join(' ');
    keywords = ['food', 'gourmet', ...foodTags, titleWords].filter(Boolean);
  }

  return keywords;
};

/**
 * Generate a high-quality fallback image URL from Unsplash based on recipe details
 */
export const generateUnsplashFallback = (title: string, tags: string[] = []): string => {
  const keywords = extractKeywords(title, tags);

  // Clean and encode each keyword separately
  const cleanKeywords = keywords
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0)
    .map(k => encodeURIComponent(k));

  // Join with commas and ensure we have at least some keywords
  const queryString = cleanKeywords.length > 0 ? cleanKeywords.join(',') : 'food,gourmet,recipe';

  // Use the featured collection for higher quality food images
  // Add a random parameter to prevent caching
  const randomParam = Math.random().toString(36).substring(7);
  return `https://source.unsplash.com/featured/?${queryString}&sig=${randomParam}`;
};

/**
 * Get a static fallback image URL (guaranteed to work)
 */
export const getStaticFallback = (): string => {
  // Return a guaranteed working image URL
  return '/placeholder.svg';
};

/**
 * Generate a fallback image URL for a specific cuisine type
 */
export const getCuisineFallback = (cuisine: string): string => {
  const normalizedCuisine = cuisine.toLowerCase().trim();
  const encodedCuisine = encodeURIComponent(normalizedCuisine);
  // Add a random parameter to prevent caching
  const randomParam = Math.random().toString(36).substring(7);
  return `https://source.unsplash.com/featured/?${encodedCuisine},food,cuisine&sig=${randomParam}`;
};
