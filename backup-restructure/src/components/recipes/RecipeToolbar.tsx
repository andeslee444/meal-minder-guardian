import { useRecipe } from '@/context/RecipeContext';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Trash } from 'lucide-react';

export function RecipeToolbar() {
  const { recipes, clearRecipes } = useRecipe();

  const clearAllCaches = () => {
    // Clear all localStorage entries related to images and DALL-E
    Object.keys(localStorage).forEach(key => {
      if (key.includes('image-cache') || key.includes('dalle-cache')) {
        localStorage.removeItem(key);
      }
    });
    alert('All image caches cleared');
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold">Recipes ({recipes.length})</h1>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={clearAllCaches}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reset Images
        </Button>
        <Button variant="destructive" onClick={clearRecipes}>
          <Trash className="h-4 w-4 mr-2" />
          Clear All Recipes
        </Button>
      </div>
    </div>
  );
}
