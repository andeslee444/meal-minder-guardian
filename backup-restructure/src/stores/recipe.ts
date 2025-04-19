import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types/recipe';

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchRecipes() {
    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      recipes.value = data || [];
    } catch (err) {
      console.error('Error fetching recipes:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch recipes';
    } finally {
      isLoading.value = false;
    }
  }

  async function addRecipe(recipe: Recipe) {
    try {
      const { data, error: insertError } = await supabase
        .from('recipes')
        .insert([
          {
            ...recipe,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        recipes.value = [data, ...recipes.value];
      }

      return data;
    } catch (err) {
      console.error('Error adding recipe:', err);
      throw err;
    }
  }

  async function updateRecipe(recipe: Recipe) {
    try {
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          ...recipe,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipe.id);

      if (updateError) throw updateError;

      // Update local state
      const index = recipes.value.findIndex(r => r.id === recipe.id);
      if (index !== -1) {
        recipes.value[index] = { ...recipes.value[index], ...recipe };
      }
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  }

  async function deleteRecipe(id: string) {
    try {
      const { error: deleteError } = await supabase.from('recipes').delete().eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      recipes.value = recipes.value.filter(r => r.id !== id);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      throw err;
    }
  }

  return {
    recipes,
    isLoading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  };
});
