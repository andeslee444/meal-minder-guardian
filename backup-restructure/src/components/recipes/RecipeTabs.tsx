import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecipeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const RecipeTabs: React.FC<RecipeTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
      <TabsList>
        <TabsTrigger value="all">All Recipes</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default RecipeTabs;
