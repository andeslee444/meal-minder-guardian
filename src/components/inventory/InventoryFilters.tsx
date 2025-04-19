import React from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import SortOptions from './SortOptions';

type InventoryFiltersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  categories: string[];
};

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  sortOption,
  setSortOption,
  categories,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <CategoryFilter
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />

      <SortOptions sortOption={sortOption} setSortOption={setSortOption} />
    </div>
  );
};

export default InventoryFilters;
