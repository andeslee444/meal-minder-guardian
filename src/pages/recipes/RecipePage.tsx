import React from 'react';
import RecipePageContent from './RecipePageContent';

interface RecipePageProps {
  isRefreshing: boolean;
  handleRefreshRecipes: () => Promise<void>;
}

const RecipePage: React.FC<RecipePageProps> = ({ isRefreshing, handleRefreshRecipes }) => {
  return (
    <div className="container mx-auto px-4">
      <RecipePageContent isRefreshing={isRefreshing} handleRefreshRecipes={handleRefreshRecipes} />
    </div>
  );
};

export default RecipePage;
