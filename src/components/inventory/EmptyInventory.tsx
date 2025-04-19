import React from 'react';
import { motion } from 'framer-motion';
import { PackageIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyInventoryProps = {
  hasFilters: boolean;
  onAddItem: () => void;
};

const EmptyInventory: React.FC<EmptyInventoryProps> = ({ hasFilters, onAddItem }) => {
  return (
    <div className="text-center py-12 bg-muted/50 rounded-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PackageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No items found</h3>
        <p className="text-muted-foreground mb-4">
          {hasFilters
            ? 'Try adjusting your search or filters'
            : 'Start by adding items to your inventory'}
        </p>
        {!hasFilters && (
          <Button onClick={onAddItem}>
            <PlusIcon className="w-4 h-4 mr-2" /> Add Your First Item
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default EmptyInventory;
