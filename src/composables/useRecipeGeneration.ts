import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types/recipe';
import type { InventoryItem } from '@/types/inventory';

export function useRecipeGeneration() {
  const isGenerating = ref(false);
  const generationProgress = ref({
    current: 0,
    total: 0,
    percentage: 0,
    statusMessage: '',
  });
  const generationError = ref<string | null>(null);

  const canGenerateRecipes = computed(() => {
    return !isGenerating.value;
  });

  async function generateRecipes(
    selectedIngredients: InventoryItem[],
    filterMode: string = 'hybrid'
  ) {
    if (!canGenerateRecipes.value) return;

    try {
      isGenerating.value = true;
      generationError.value = null;
      generationProgress.value = {
        current: 0,
        total: 100,
        percentage: 0,
        statusMessage: 'Starting recipe generation...',
      };

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: {
          ingredients: selectedIngredients,
          filterMode,
        },
      });

      if (error) throw error;

      generationProgress.value = {
        current: 100,
        total: 100,
        percentage: 100,
        statusMessage: 'Recipe generation complete!',
      };

      return data as Recipe[];
    } catch (error) {
      console.error('Error generating recipes:', error);
      generationError.value = error instanceof Error ? error.message : 'Failed to generate recipes';
      throw error;
    } finally {
      setTimeout(() => {
        isGenerating.value = false;
      }, 1000);
    }
  }

  return {
    isGenerating,
    generationProgress,
    generationError,
    canGenerateRecipes,
    generateRecipes,
  };
}
