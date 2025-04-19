import React from 'react';
import { RecipeGenerator } from './components/RecipeGenerator';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Meal Minder Guardian</h1>
        <p className="text-center text-muted-foreground mb-12">
          Generate delicious recipes from your available ingredients
        </p>
        <RecipeGenerator />
      </div>
      <Toaster />
    </main>
  );
}
