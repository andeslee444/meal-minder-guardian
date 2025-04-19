import { useContext } from 'react';
import { RecipeContext } from '@/context/RecipeContext';

export const useRecipeContext = () => useContext(RecipeContext);
