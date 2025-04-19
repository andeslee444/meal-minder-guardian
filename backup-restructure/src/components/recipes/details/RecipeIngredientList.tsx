import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RecipeIngredient } from '@/types/recipe';

interface RecipeIngredientListProps {
  ingredients: RecipeIngredient[];
  getIngredientStatus: (name: string) => 'available' | 'missing' | 'expired' | 'expiring-soon';
}

const RecipeIngredientList: React.FC<RecipeIngredientListProps> = ({
  ingredients,
  getIngredientStatus,
}) => {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Ingredients</h3>
      <ul className="space-y-2">
        {ingredients.map((ing, index) => {
          const status = getIngredientStatus(ing.name);
          return (
            <li key={index} className="flex items-center justify-between text-sm">
              <span className="flex-grow">
                {ing.quantity} {ing.unit} {ing.name}
              </span>
              {status === 'available' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  In Stock
                </Badge>
              )}
              {status === 'expiring-soon' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Use Soon
                </Badge>
              )}
              {status === 'expired' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Expired
                </Badge>
              )}
              {status === 'missing' && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Missing
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecipeIngredientList;
