/**
 * Utility functions for detecting problematic recipe types that often have image loading issues
 */

type ProblematicRecipeOptions = {
  /**
   * If true, the detection will be more aggressive,
   * classifying more recipes as problematic
   */
  strict?: boolean;

  /**
   * Additional keywords to identify as problematic
   */
  additionalProblematicKeywords?: string[];
};

/**
 * Standard problematic recipe keywords that often cause image loading issues
 */
const PROBLEMATIC_KEYWORDS = [
  'chocolate',
  'cocoa',
  'brownie',
  'cupcake',
  'peanut butter',
  'dessert cream',
  'molten',
  'fudge',
  'ganache',
];

/**
 * Detects if a recipe title contains problematic keywords
 * that are known to have issues with image generation
 */
export const isProblematicRecipeType = (
  title: string,
  options: ProblematicRecipeOptions = {}
): boolean => {
  if (!title) return false;

  const { strict = false, additionalProblematicKeywords = [] } = options;

  // Normalize title for comparison
  const normalizedTitle = title.toLowerCase().trim();

  // Combine standard and additional keywords
  const allProblematicKeywords = [...PROBLEMATIC_KEYWORDS, ...additionalProblematicKeywords];

  // Direct keyword match - check if any problematic keyword is in the title
  const hasProblematicKeyword = allProblematicKeywords.some(keyword =>
    normalizedTitle.includes(keyword.toLowerCase())
  );

  // Basic problematic detection - this catches the most common cases
  if (hasProblematicKeyword) {
    return true;
  }

  // More specific detection for "peanut" and "butter" together
  if (normalizedTitle.includes('peanut') && normalizedTitle.includes('butter')) {
    return true;
  }

  // Enhanced strict mode detection - more aggressive classification
  if (strict) {
    // Additional checks for dessert items that tend to have image issues
    if (
      normalizedTitle.includes('cake') ||
      normalizedTitle.includes('pie') ||
      normalizedTitle.includes('cookie') ||
      (normalizedTitle.includes('dark') && normalizedTitle.includes('chocolate'))
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Get a list of all problematic keywords being checked
 */
export const getProblematicKeywords = (additionalKeywords: string[] = []): string[] => {
  return [...PROBLEMATIC_KEYWORDS, ...additionalKeywords];
};

/**
 * Determine if a recipe should use Unsplash instead of DALL-E
 * based on its title and tags
 */
export const shouldUseUnsplashForRecipe = (title: string, tags: string[] = []): boolean => {
  // If the title is problematic, always use Unsplash
  if (isProblematicRecipeType(title)) {
    return true;
  }

  // Check tags for dessert-related keywords that might indicate problems
  const problematicTags = ['dessert', 'chocolate', 'sweet', 'cake', 'baking'];
  const hasProblematiTag = tags.some(tag => problematicTags.includes(tag.toLowerCase()));

  // If we have both dessert tag and contains "chocolate" in title
  if (hasProblematiTag && title.toLowerCase().includes('chocolate')) {
    return true;
  }

  return false;
};
