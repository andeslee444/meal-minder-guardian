import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const cuisineOptions = [
  { id: 'italian', label: 'Italian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'asian', label: 'Asian' },
  { id: 'american', label: 'American' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'indian', label: 'Indian' },
  { id: 'french', label: 'French' },
];

export const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'nut-free', label: 'Nut-Free' },
];

export const mealTypeOptions = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'soup', label: 'Soup' },
  { id: 'drink', label: 'Drink' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'snack', label: 'Snack' },
  { id: 'appetizer', label: 'Appetizer' },
];

interface RecipePreferencesProps {
  dietaryRestrictions: string[];
  toggleDietaryRestriction: (id: string) => void;
  mealType: string;
  setMealType: (type: string) => void;
}

const RecipePreferences: React.FC<RecipePreferencesProps> = ({
  dietaryRestrictions,
  toggleDietaryRestriction,
  mealType,
  setMealType,
}) => {
  return (
    <div className="space-y-4 pt-2 border-t">
      <div>
        <Label className="mb-2 block">Dietary restrictions:</Label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map(option => (
            <Badge
              key={option.id}
              variant={dietaryRestrictions.includes(option.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleDietaryRestriction(option.id)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="meal-type" className="mb-2 block">
          Meal type:
        </Label>
        <Select value={mealType} onValueChange={setMealType}>
          <SelectTrigger id="meal-type">
            <SelectValue placeholder="Select meal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any meal type</SelectItem>
            {mealTypeOptions.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RecipePreferences;
