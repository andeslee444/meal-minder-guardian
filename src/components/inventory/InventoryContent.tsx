import React from 'react';
import AlternativeInputMethods from './AlternativeInputMethods';
import InventoryFilters from './InventoryFilters';
import InventoryList from './InventoryList';
import EmptyInventory from './EmptyInventory';

type InventoryContentProps = {
  inventory: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  categories: string[];
  sortedItems: any[];
  groupedItems: Record<string, any[]>;
  onDeleteItem: (id: string) => void;
  onEditItem: (id: string) => void;
  onAddItem: () => void;
  hasFilters: boolean;
};

const InventoryContent: React.FC<InventoryContentProps> = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  sortOption,
  setSortOption,
  categories,
  sortedItems,
  groupedItems,
  onDeleteItem,
  onEditItem,
  onAddItem,
  hasFilters,
}) => {
  return (
    <>
      {/* Alternative input methods */}
      <AlternativeInputMethods />

      {/* Search and filters */}
      <InventoryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortOption={sortOption}
        setSortOption={setSortOption}
        categories={categories}
      />

      {/* Inventory Items */}
      {sortedItems.length > 0 ? (
        <InventoryList
          items={sortedItems}
          groupedItems={groupedItems}
          groupByCategory={sortOption === 'category'}
          onDelete={onDeleteItem}
          onEdit={onEditItem}
        />
      ) : (
        <EmptyInventory hasFilters={hasFilters} onAddItem={onAddItem} />
      )}
    </>
  );
};

export default InventoryContent;
