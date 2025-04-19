import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryItem from './InventoryItem';

type InventoryListProps = {
  items: any[];
  groupedItems?: Record<string, any[]>;
  groupByCategory: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

const InventoryList: React.FC<InventoryListProps> = ({
  items,
  groupedItems = {},
  groupByCategory,
  onDelete,
  onEdit,
}) => {
  const categories = Object.keys(groupedItems).sort();

  if (groupByCategory) {
    return (
      <div className="space-y-8">
        <AnimatePresence>
          {categories.map(category => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-medium mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedItems[category].map(item => (
                  <InventoryItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    quantity={item.quantity}
                    unit={item.unit}
                    purchaseDate={item.purchaseDate}
                    expirationDate={item.expirationDate}
                    price={item.price}
                    store={item.store}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {items.map(item => (
          <InventoryItem
            key={item.id}
            id={item.id}
            name={item.name}
            category={item.category}
            quantity={item.quantity}
            unit={item.unit}
            purchaseDate={item.purchaseDate}
            expirationDate={item.expirationDate}
            price={item.price}
            store={item.store}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InventoryList;
