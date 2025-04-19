import React, { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeCard } from './RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export function RecipeGenerator() {
  const { recipes, isLoading, generateRecipes, saveRecipe } = useRecipes();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [filterMode, setFilterMode] = useState<'hybrid' | 'strict' | 'flexible'>('hybrid');

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) return;

    try {
      await generateRecipes({
        ingredients,
        filterMode,
        numRecipes: 6,
        partialRecipes: false,
        cacheKey: Date.now().toString(),
        existingRecipes: [],
      });
    } catch (error) {
      console.error('Failed to generate recipes:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ingredient">Add Ingredients</Label>
            <div className="flex gap-2">
              <Input
                id="ingredient"
                value={currentIngredient}
                onChange={e => setCurrentIngredient(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddIngredient()}
                placeholder="Enter an ingredient"
              />
              <Button onClick={handleAddIngredient}>Add</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filterMode">Filter Mode</Label>
            <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select filter mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{ingredient}</span>
                <button
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-primary/60 hover:text-primary"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleGenerateRecipes}
          disabled={isLoading || ingredients.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Recipes...
            </>
          ) : (
            'Generate Recipes'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onSave={saveRecipe} />
        ))}
      </div>
    </div>
  );
}
