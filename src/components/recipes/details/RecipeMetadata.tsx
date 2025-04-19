import React from 'react';
import { Clock, UserIcon, Heart } from 'lucide-react';
import { formatFavoriteCount } from '@/utils/formatters';

interface RecipeMetadataProps {
  prepTime: number;
  cookTime: number;
  servings: number;
  favoriteCount: number;
}

const RecipeMetadata: React.FC<RecipeMetadataProps> = ({
  prepTime,
  cookTime,
  servings,
  favoriteCount,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{prepTime + cookTime} min</span>
      </div>
      <div className="flex items-center">
        <UserIcon className="w-4 h-4 mr-1 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Serves {servings}</span>
      </div>
      <div className="flex items-center">
        <Heart className="w-4 h-4 mr-1 text-red-500 fill-red-500" />
        <span className="text-sm text-muted-foreground">{formatFavoriteCount(favoriteCount)}</span>
      </div>
    </div>
  );
};

export default RecipeMetadata;
