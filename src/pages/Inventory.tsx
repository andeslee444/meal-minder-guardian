import React from 'react';
import { useInventoryContext } from '@/context/InventoryContext';
import { useUserContext } from '@/context/UserContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import StatusIndicator from '@/components/ui/status-indicator';

// Custom hooks
import { useInventoryFiltering } from '@/hooks/useInventoryFiltering';
import { useInventoryDialog } from '@/hooks/inventory/useInventoryDialog';
import { useInventoryExpenseIntegration } from '@/hooks/useInventoryExpenseIntegration';

// Custom components
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryItemDialog from '@/components/inventory/InventoryItemDialog';

const Inventory = () => {
  const { user, isLoading: isUserLoading } = useUserContext();
  const {
    items: inventory,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    removeItem: removeInventoryItem,
    isLoading,
    error,
    connectionError,
  } = useInventoryContext();

  // Connect inventory to expenses
  useInventoryExpenseIntegration();

  // Filtering and sorting hook
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sortOption,
    setSortOption,
    categories,
    sortedItems,
    groupedItems,
    hasFilters,
  } = useInventoryFiltering(inventory || []);

  // Form and dialog handling hook
  const {
    isDialogOpen,
    setIsDialogOpen,
    isEditing,
    formData,
    setFormData,
    handleEditItem,
    openAddItemDialog,
    handleSubmit,
    resetFormAndClose,
  } = useInventoryDialog(inventory || [], addInventoryItem, updateInventoryItem);

  // Show loading state while user is being authenticated
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p>You need to be logged in to view your inventory.</p>
        </div>
      </div>
    );
  }

  // Show loading state while inventory is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Inventory</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Show connection error state
  if (connectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-yellow-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p>
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedTransition>
      <div className="min-h-screen flex flex-col">
        <Header />
        <AnimatedTransition className="flex-1 pt-16">
          <section className="bg-muted/30 py-12">
            <div className="container mx-auto px-4">
              <StatusIndicator />
              <InventoryHeader onOpenAddItemDialog={openAddItemDialog} />
              <InventoryContent
                inventory={sortedItems}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                sortOption={sortOption}
                setSortOption={setSortOption}
                categories={categories}
                sortedItems={sortedItems}
                groupedItems={groupedItems}
                onDeleteItem={removeInventoryItem}
                onEditItem={handleEditItem}
                onAddItem={openAddItemDialog}
                hasFilters={hasFilters}
              />
            </div>
          </section>
        </AnimatedTransition>
        <Footer />
      </div>
      <InventoryItemDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={resetFormAndClose}
      />
    </AnimatedTransition>
  );
};

export default Inventory;
