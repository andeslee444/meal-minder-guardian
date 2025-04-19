import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CategoryFilterProps = {
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  categories: string[];
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categoryFilter,
  setCategoryFilter,
  categories,
}) => {
  return (
    <Select
      value={categoryFilter || 'all'}
      onValueChange={value => setCategoryFilter(value === 'all' ? null : value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map(category => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
