import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOptionsProps = {
  sortOption: string;
  setSortOption: (option: string) => void;
};

const SortOptions: React.FC<SortOptionsProps> = ({ sortOption, setSortOption }) => {
  return (
    <Select value={sortOption} onValueChange={setSortOption}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="expirationDate">Expiring Soon</SelectItem>
        <SelectItem value="name">Name (A-Z)</SelectItem>
        <SelectItem value="category">Category</SelectItem>
        <SelectItem value="purchaseDate">Recently Added</SelectItem>
        <SelectItem value="price">Price (High-Low)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortOptions;
