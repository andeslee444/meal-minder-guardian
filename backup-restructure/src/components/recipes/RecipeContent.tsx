import React, { useEffect, useState } from 'react';
import { Recipe } from '@/types/recipe';
import { TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import RecipeCard from './RecipeCard';
import RecipeEmptyState from './empty-states/RecipeEmptyState';
import RecipeLoadingState from './loading/RecipeLoadingState';
import RecipeFilters from './RecipeFilters';
import RecipeLoadMoreButton from './RecipeLoadMoreButton';

interface RecipeContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRecipes: Recipe[];
  handleRecipeClick: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isGenerating: boolean;
  onGenerateRecipe: () => Promise<void | null>;
  inventoryLength: number;
  recipesExist: boolean;
  handleGenerateMoreRecipes?: () => Promise<void | null>;
  isBackgroundGeneration?: boolean;
  apiLimitReached?: boolean;
}

const RecipeContent: React.FC<RecipeContentProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  filteredRecipes,
  handleRecipeClick,
  toggleFavorite,
  isGenerating,
  onGenerateRecipe,
  inventoryLength,
  recipesExist,
  handleGenerateMoreRecipes,
  isBackgroundGeneration = false,
  apiLimitReached = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const renderContent = () => {
    if (isGenerating && !isBackgroundGeneration && !recipesExist) {
      return <RecipeLoadingState />;
    }

    if (!recipesExist) {
      return (
        <RecipeEmptyState
          inventoryLength={inventoryLength}
          onGenerateRecipe={onGenerateRecipe}
          isGenerating={isGenerating}
        />
      );
    }

    if (filteredRecipes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-medium mb-2">No recipes match your search or filter</h3>
          <p className="text-muted-foreground mb-4">
            Try changing your search terms or view a different category
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              image={recipe.image || ''}
              cookTime={recipe.cookTime}
              prepTime={recipe.prepTime}
              servings={recipe.servings}
              tags={recipe.tags}
              isFavorite={recipe.isFavorite || false}
              onClick={() => handleRecipeClick(recipe.id)}
              onFavoriteToggle={() => toggleFavorite(recipe.id)}
            />
          ))}
        </div>

        {/* Generate More Recipes button at bottom center */}
        {handleGenerateMoreRecipes && recipesExist && (
          <RecipeLoadMoreButton
            isGenerating={isGenerating}
            isBackgroundGeneration={isBackgroundGeneration}
            apiLimitReached={apiLimitReached || false}
            handleGenerateMoreRecipes={handleGenerateMoreRecipes}
            filteredRecipes={filteredRecipes}
          />
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Recipe filters at the top with tabs */}
      <RecipeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <TabsContent value={activeTab} className="mt-0">
        <ScrollArea className="h-full">{renderContent()}</ScrollArea>
      </TabsContent>
    </div>
  );
};

export default RecipeContent;
