import React from 'react';
import { cn } from '@/lib/utils';
import { RecipeIngredient } from '@/types/recipe';

interface IngredientDisplayProps {
  ingredient: RecipeIngredient;
  isAvailable?: boolean;
  className?: string;
}

export const IngredientDisplay: React.FC<IngredientDisplayProps> = ({
  ingredient,
  isAvailable = true,
  className,
}) => {
  const { name, quantity, unit } = ingredient;

  return (
    <div
      className={cn(
        'flex justify-between items-center text-sm py-1',
        isAvailable ? 'text-foreground' : 'text-muted-foreground line-through opacity-70',
        className
      )}
    >
      <span className="font-medium">{name}</span>
      {(quantity || unit) && (
        <span className="text-muted-foreground ml-2">
          {quantity && quantity !== '0' ? quantity : ''} {unit || ''}
        </span>
      )}
    </div>
  );
};
