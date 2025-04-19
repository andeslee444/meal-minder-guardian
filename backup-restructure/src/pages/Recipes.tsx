import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/InventoryContext';
import { useRecipeContext } from '@/hooks/useRecipeContext';
import RecipePage from './recipes/RecipePage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { generateSampleComments, generateSampleLikes } from '@/utils/sampleGenerators';
import { inventoryStore } from '@/stores/inventoryStore';
import { logger } from '@/utils/logger';

const Recipes = () => {
  const { toast } = useToast();
  const { clearInventory, reloadInventory } = useInventory();
  const { clearRecipes, recipes } = useRecipeContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshDatabases = async () => {
    setIsRefreshing(true);

    try {
      // Clear localStorage for recipe comments and likes
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.startsWith('recipe_comments_') || key.startsWith('recipe_likes_')) {
          localStorage.removeItem(key);
        }
      });

      // Generate new likes for existing recipes before clearing them
      if (recipes && recipes.length > 0) {
        recipes.forEach(recipe => {
          const likesKey = `recipe_likes_${recipe.id}`;
          localStorage.setItem(likesKey, generateSampleLikes().toString());

          const commentsKey = `recipe_comments_${recipe.id}`;
          localStorage.setItem(commentsKey, JSON.stringify(generateSampleComments(recipe.id)));
        });
      }

      // Clear recipes and inventory
      await clearInventory();
      await clearRecipes();

      // Wait a short moment
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate new inventory items
      logger.info('recipes', 'Generating new inventory items');
      await inventoryStore.regenerateInventory(10);

      // Reload inventory to get the new items
      await reloadInventory();

      toast({
        title: 'Database Refreshed (Dev Mode)',
        description:
          'Inventory, recipes, comments and likes have been cleared. 10 new inventory items generated.',
      });
    } catch (error) {
      console.error('Error refreshing databases:', error);
      toast({
        title: 'Error Refreshing Databases',
        description: 'An error occurred while refreshing the databases.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <AnimatedTransition className="flex-1 pt-16">
        <section className="bg-muted/30 py-12">
          <RecipePage isRefreshing={isRefreshing} handleRefreshDatabases={handleRefreshDatabases} />
        </section>
      </AnimatedTransition>

      <Footer />
    </div>
  );
};

export default Recipes;
