import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Filter } from 'lucide-react';
import { RecipeFilterMode } from '@/components/recipes/RecipesHeader';

interface FilterModeSelectorProps {
  mode: RecipeFilterMode;
  setMode: (mode: RecipeFilterMode) => void;
}

const FilterModeSelector: React.FC<FilterModeSelectorProps> = ({ mode, setMode }) => {
  const getModeLabel = (selectedMode: RecipeFilterMode): string => {
    switch (selectedMode) {
      case 'strict':
        return 'Strict Match';
      case 'hybrid':
        return 'Hybrid Match';
      case 'preference':
        return 'Preference Based';
      default:
        return 'Filter Mode';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>{getModeLabel(mode)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setMode('strict')}
          className="flex items-center justify-between"
        >
          <span>Strict Match</span>
          {mode === 'strict' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setMode('hybrid')}
          className="flex items-center justify-between"
        >
          <span>Hybrid Match</span>
          {mode === 'hybrid' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setMode('preference')}
          className="flex items-center justify-between"
        >
          <span>Preference Based</span>
          {mode === 'preference' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterModeSelector;
