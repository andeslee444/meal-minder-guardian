import React from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeToolbar } from './RecipeToolbar';

interface RecipeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="space-y-4">
      <RecipeToolbar />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64 md:w-80">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList>
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default RecipeFilters;
