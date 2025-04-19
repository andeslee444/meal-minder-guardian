import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trash2Icon, EditIcon, AlertTriangleIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type InventoryItemProps = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
  price: number;
  store?: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

const InventoryItem: React.FC<InventoryItemProps> = ({
  id,
  name,
  category,
  quantity,
  unit,
  purchaseDate,
  expirationDate,
  price,
  store,
  onDelete,
  onEdit,
}) => {
  const { toast } = useToast();

  // Calculate days until expiration
  const today = new Date();
  const expDate = new Date(expirationDate);
  const daysUntilExpiration = Math.ceil(
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine badge color based on expiration
  const getBadgeVariant = () => {
    if (daysUntilExpiration <= 0) return 'destructive';
    if (daysUntilExpiration <= 3) return 'destructive';
    if (daysUntilExpiration <= 7) return 'warning';
    return 'secondary';
  };

  const getExpirationText = () => {
    if (daysUntilExpiration < 0) return 'Expired!';
    if (daysUntilExpiration === 0) return 'Expires today!';
    if (daysUntilExpiration === 1) return 'Expires tomorrow!';
    return `Expires in ${daysUntilExpiration} days`;
  };

  const getExpirationIcon = () => {
    if (daysUntilExpiration <= 3) return AlertTriangleIcon;
    return Clock;
  };

  const ExpirationIcon = getExpirationIcon();

  const handleDelete = () => {
    onDelete(id);
    toast({
      title: 'Item Removed',
      description: `${name} has been removed from your inventory.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
      className="w-full"
    >
      <Card className="overflow-hidden h-full scale-up-animation">
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
          <div>
            <Badge className="mb-2" variant="outline">
              {category}
            </Badge>
            <h3 className="font-medium text-base">{name}</h3>
          </div>
          <Badge
            variant={getBadgeVariant() as any}
            className={cn(
              'flex items-center gap-1 ml-auto',
              daysUntilExpiration <= 3 ? 'animate-pulse' : ''
            )}
          >
            <ExpirationIcon className="w-3 h-3" />
            <span>{getExpirationText()}</span>
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-sm text-muted-foreground">
            <p>
              Quantity: {quantity} {unit}
            </p>
            {store && <p>Purchased from: {store}</p>}
            <p>Price: ${price.toFixed(2)}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button size="sm" variant="outline" onClick={() => onEdit(id)}>
            <EditIcon className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2Icon className="w-4 h-4 mr-1" /> Remove
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InventoryItem;
