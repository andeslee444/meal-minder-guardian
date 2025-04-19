import React from 'react';
import RecipePageWrapper from '@/components/recipes/RecipePageWrapper';

interface RecipePageContentProps {
  isRefreshing: boolean;
  handleRefreshDatabases: () => Promise<void>;
}

const RecipePageContent: React.FC<RecipePageContentProps> = ({
  isRefreshing,
  handleRefreshDatabases,
}) => {
  return (
    <RecipePageWrapper
      isRefreshing={isRefreshing}
      handleRefreshDatabases={handleRefreshDatabases}
    />
  );
};

export default RecipePageContent;
