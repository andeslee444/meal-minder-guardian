import React from 'react';
import { Recipe } from '@/types/recipe';

// Define props interface
type SimpleRecipeCardProps = {
  id: string;
  title: string;
  tags?: string[];
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  image?: string;
  isFavorite?: boolean;
  count?: number | null;
  modelInfo?: {
    provider: string;
    model: string;
    message: string;
  } | null;
  onClick: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  onAddToCart?: (recipe: Recipe) => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
  showAddToCart?: boolean;
  isFull?: boolean;
  setOpen?: (isOpen: boolean) => void;
  source?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// Create SimpleRecipeCard component
const SimpleRecipeCard: React.FC<SimpleRecipeCardProps> = ({
  id,
  title,
  tags = [],
  prepTime = 0,
  cookTime = 0,
  totalTime = 0,
  servings = 0,
  image,
  isFavorite = false,
  count = null,
  modelInfo = null,
  onClick,
  onFavoriteToggle,
  onAddToCart,
  onAddToMealPlan,
  showAddToCart = true,
  isFull = false,
  setOpen,
  source,
  notes,
  createdAt,
  updatedAt,
}) => {
  // Simplified component with minimal logic
  const handleClick = () => onClick && onClick(id);
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle && onFavoriteToggle(id);
  };

  const recipe: Recipe = {
    id,
    title,
    tags: tags || [],
    prepTime,
    cookTime,
    servings,
    image,
    ingredients: [],
    instructions: [],
  };

  return (
    <div className="border rounded-lg shadow overflow-hidden">
      <div className="relative">
        {image ? (
          <img src={image} alt={title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{title}</h3>

        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <div>
            <span>⏱️ {totalTime} min</span>
          </div>
          <div>
            <span>👤 {servings}</span>
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-4">
          {onFavoriteToggle && (
            <button onClick={handleFavorite} className="text-gray-500 hover:text-red-500">
              {isFavorite ? '❤️' : '♡'}
            </button>
          )}

          <button
            onClick={handleClick}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
          >
            View Recipe
          </button>

          {onAddToCart && showAddToCart && (
            <button
              onClick={e => {
                e.stopPropagation();
                onAddToCart(recipe);
              }}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded"
            >
              + Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleRecipeCard;
