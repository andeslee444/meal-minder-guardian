import { useState, useMemo } from 'react';
import { InventoryItem } from '@/context/InventoryContext';

export const useInventoryFiltering = (inventory: InventoryItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('expirationDate');

  // Unique categories for filter dropdown
  const categories = useMemo(
    () => Array.from(new Set(inventory.map(item => item.category))).sort(),
    [inventory]
  );

  // Filter and sort inventory items
  const filteredItems = useMemo(
    () =>
      inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
      }),
    [inventory, searchQuery, categoryFilter]
  );

  const sortedItems = useMemo(
    () =>
      [...filteredItems].sort((a, b) => {
        switch (sortOption) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'expirationDate':
            return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
          case 'purchaseDate':
            return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
          case 'price':
            return b.price - a.price;
          default:
            return 0;
        }
      }),
    [filteredItems, sortOption]
  );

  // Group items by category
  const groupedItems = useMemo(() => {
    const grouped: Record<string, typeof sortedItems> = {};
    sortedItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [sortedItems]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sortOption,
    setSortOption,
    categories,
    filteredItems,
    sortedItems,
    groupedItems,
    hasFilters: !!(searchQuery || categoryFilter),
  };
};
