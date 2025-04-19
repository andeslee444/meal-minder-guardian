import { v4 as uuidv4 } from 'uuid';
import { RecipeComment } from '@/types/recipe';

const SAMPLE_USERNAMES = [
  'FoodieExplorer',
  'CulinaryWizard',
  'KitchenNinja',
  'FlavorFanatic',
  'HomeCook123',
  'TastyTraveler',
  'RecipeRanger',
  'GourmetGuru',
  'SpiceMaster',
];

const SAMPLE_COMMENTS = [
  'This recipe turned out amazing! My family loved it.',
  'I added a bit more garlic and it was perfect. Will make again!',
  'Great weeknight dinner option. Quick and delicious!',
  'I substituted chicken for tofu and it worked well. Very versatile recipe.',
  'The flavors in this dish are incredible. Restaurant quality!',
  'Super easy to follow instructions. Perfect for beginners.',
  'Made this for meal prep and it held up well all week.',
  "The best version of this dish I've ever tried. Five stars!",
  'My kids are picky eaters but they devoured this!',
  "I've been looking for a recipe like this for years. Thank you!",
  'The cooking time was spot on. Perfectly cooked.',
  'Amazing blend of flavors. A new favorite in our house!',
];

/**
 * Generates sample comments for a recipe
 * @param recipeId The ID of the recipe to generate comments for
 * @param count Number of comments to generate (default: 3-7 random)
 * @returns Array of RecipeComment objects
 */
export const generateSampleComments = (recipeId: string, count?: number): RecipeComment[] => {
  // Generate a random number of comments if count not specified
  const commentCount = count || Math.floor(Math.random() * 5) + 3; // 3-7 comments

  const comments: RecipeComment[] = [];

  // Create array of dates for the past 30 days
  const pastDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  });

  // Generate the comments
  for (let i = 0; i < commentCount; i++) {
    const randomUsernameIndex = Math.floor(Math.random() * SAMPLE_USERNAMES.length);
    const randomCommentIndex = Math.floor(Math.random() * SAMPLE_COMMENTS.length);
    const randomDateIndex = Math.floor(Math.random() * pastDates.length);
    const randomLikes = Math.floor(Math.random() * 15); // 0-14 likes

    comments.push({
      id: uuidv4(),
      userId: uuidv4(), // Generate a random user ID
      username: SAMPLE_USERNAMES[randomUsernameIndex],
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${SAMPLE_USERNAMES[randomUsernameIndex]}`,
      content: SAMPLE_COMMENTS[randomCommentIndex],
      createdAt: pastDates[randomDateIndex].toISOString(),
      likes: randomLikes,
    });
  }

  // Sort by date, newest first
  return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Generates a random number of likes for a recipe
 * @returns Number of likes (0-50)
 */
export const generateSampleLikes = (): number => {
  return Math.floor(Math.random() * 51); // 0-50 likes
};
