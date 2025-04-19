import React from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative flex-grow">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search items..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default SearchBar;
