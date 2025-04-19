import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RecipeSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search recipes..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="pl-9 w-full"
      />
    </div>
  );
};

export default RecipeSearch;
