<template>
  <div class="recipe-generator">
    <div class="controls">
      <div class="filter-mode">
        <label>Generation Mode:</label>
        <select v-model="filterMode">
          <option value="hybrid">Hybrid</option>
          <option value="strict">Strict</option>
          <option value="preference">Preference</option>
        </select>
      </div>

      <div class="selected-ingredients">
        <h3>Selected Ingredients:</h3>
        <ul>
          <li v-for="item in selectedIngredients" :key="item.id">
            {{ item.name }} ({{ item.quantity }})
          </li>
        </ul>
      </div>

      <div class="dietary-restrictions">
        <label>Dietary Restrictions:</label>
        <select v-model="dietaryRestrictions" multiple>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
          <option value="dairy-free">Dairy-free</option>
        </select>
      </div>

      <div class="meal-type">
        <label>Meal Type:</label>
        <select v-model="mealType">
          <option value="any">Any</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      <button
        @click="handleGenerateRecipes"
        :disabled="!canGenerateRecipes || selectedIngredients.length === 0"
        class="generate-button"
      >
        {{ isGenerating ? 'Generating...' : 'Generate Recipes' }}
      </button>
    </div>

    <div v-if="isGenerating" class="progress">
      <div class="progress-bar" :style="{ width: generationProgress.percentage + '%' }">
        {{ generationProgress.statusMessage }}
      </div>
    </div>

    <div v-if="generationError" class="error">
      {{ generationError }}
    </div>

    <div v-if="generatedRecipes.length > 0" class="generated-recipes">
      <h3>Generated Recipes:</h3>
      <div class="recipe-grid">
        <div v-for="recipe in generatedRecipes" :key="recipe.id" class="recipe-card">
          <h4>{{ recipe.title }}</h4>
          <p>{{ recipe.description }}</p>
          <button @click="saveRecipe(recipe)" class="save-button">Save Recipe</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRecipeGeneration } from '@/composables/useRecipeGeneration';
import { useInventoryStore } from '@/stores/inventory';
import { useRecipeStore } from '@/stores/recipe';
import type { Recipe } from '@/types/recipe';

const inventoryStore = useInventoryStore();
const recipeStore = useRecipeStore();

const { isGenerating, generationProgress, generationError, canGenerateRecipes, generateRecipes } =
  useRecipeGeneration();

const filterMode = ref('hybrid');
const dietaryRestrictions = ref<string[]>([]);
const mealType = ref('any');
const generatedRecipes = ref<Recipe[]>([]);

const selectedIngredients = computed(() => {
  return inventoryStore.items.filter(item => item.quantity > 0);
});

async function handleGenerateRecipes() {
  try {
    const recipes = await generateRecipes(selectedIngredients.value, filterMode.value);
    if (recipes) {
      generatedRecipes.value = recipes;
    }
  } catch (error) {
    console.error('Failed to generate recipes:', error);
  }
}

async function saveRecipe(recipe: Recipe) {
  try {
    await recipeStore.addRecipe(recipe);
  } catch (error) {
    console.error('Failed to save recipe:', error);
  }
}
</script>

<style scoped>
.recipe-generator {
  padding: 1rem;
}

.controls {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-mode,
.dietary-restrictions,
.meal-type {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-ingredients {
  margin: 1rem 0;
}

.selected-ingredients ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.progress {
  margin: 1rem 0;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  background: #4caf50;
  color: white;
  padding: 0.5rem;
  text-align: center;
  transition: width 0.3s ease;
}

.error {
  color: #f44336;
  margin: 1rem 0;
  padding: 1rem;
  background: #ffebee;
  border-radius: 4px;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.recipe-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.generate-button,
.save-button {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.generate-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.save-button {
  margin-top: 1rem;
  width: 100%;
}
</style>
