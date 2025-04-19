import React from 'react';
import { UserProvider, useUserContext } from './UserContext';
import { InventoryProvider, useInventoryContext } from './InventoryContext';
import { RecipeProvider, RecipeContext } from './RecipeContext';
import { ExpenseProvider, useExpenseContext } from './ExpenseContext';

// Re-export the context hooks for easier imports
export { useUserContext } from './UserContext';
export { useInventoryContext } from './InventoryContext';
export type { InventoryItem } from '@/types/inventory';
export { useExpenseContext, type Expense } from './ExpenseContext';

// For backward compatibility, we'll create a combined hook
export const useAppContext = () => {
  const userContext = useUserContext();
  const inventoryContext = useInventoryContext();
  const recipeContext = React.useContext(RecipeContext);
  const expenseContext = useExpenseContext();

  if (!recipeContext) {
    throw new Error('useAppContext must be used within a RecipeProvider');
  }

  // Combine loading states
  const isLoading = userContext.isLoading || recipeContext.isLoading;

  // Create a fallback userProfile object with empty values to prevent undefined errors
  const userProfile = userContext.profile || {
    id: '',
    email: userContext.user?.email || '',
    username: '',
    avatar_url: '',
    created_at: '',
    updated_at: '',
    name: '',
    household: 1,
    diet: [],
    allergies: [],
  };

  return {
    ...userContext,
    ...inventoryContext,
    ...recipeContext,
    ...expenseContext,
    isLoading,
    userProfile, // Add userProfile alias for backward compatibility
  };
};

// Combined provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <InventoryProvider>
        <RecipeProvider>
          <ExpenseProvider>{children}</ExpenseProvider>
        </RecipeProvider>
      </InventoryProvider>
    </UserProvider>
  );
};
