import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserContext } from '@/context/UserContext';
import { useInventoryContext } from '@/context/InventoryContext';
import { RecipeContext } from '@/context/RecipeContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipes/RecipeCard';
import {
  CookingPotIcon,
  PackageIcon,
  LineChartIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { user, isLoading: isUserLoading } = useUserContext();
  const { items: inventory = [] } = useInventoryContext();
  const recipeContext = React.useContext(RecipeContext);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Debug logs
  console.log('Index Component Render:', {
    recipes: recipeContext?.recipes || [],
    isUserLoading,
    isLoading,
    user,
  });

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.2}px)`;
        heroRef.current.style.opacity = `${1 - scrollY * 0.002}`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set loading state
  useEffect(() => {
    console.log('Setting loading state timer');
    // Give a small delay to ensure data is loaded
    const timer = setTimeout(() => {
      console.log('Loading state timer completed');
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Featured recipes (limit to 3)
  const featuredRecipes = Array.isArray(recipeContext?.recipes)
    ? recipeContext.recipes.slice(0, 3)
    : [];
  console.log('Featured Recipes:', featuredRecipes);

  // Calculate expiring items count
  const today = new Date();
  const expiringItems = Array.isArray(inventory)
    ? inventory.filter(item => {
        if (!item || !item.expirationDate) return false;
        const expDate = new Date(item.expirationDate);
        const daysUntilExpiration = Math.ceil(
          (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
      })
    : [];

  if (isLoading || isUserLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kitchen-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero section with parallax effect */}
      <section className="pt-20 relative overflow-hidden bg-gradient-to-b from-kitchen-50 to-white dark:from-kitchen-900 dark:to-background">
        <div
          ref={heroRef}
          className="absolute inset-0 opacity-20 dark:opacity-10 -z-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=2000&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px)',
          }}
        />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-kitchen-100 text-kitchen-800 mb-6">
                <Sparkles className="w-4 h-4 mr-1" />
                Reduce Food Waste, Save Money
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6 text-balance">
              Smart Kitchen Management Made Simple
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              KitchenBuddy intelligently manages your inventory, suggests recipes, and tracks
              expenses to help you waste less and save more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="min-w-[150px]">
                <Link to="/inventory">
                  <PackageIcon className="w-4 h-4 mr-2" />
                  Manage Inventory
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[150px]">
                <Link to="/recipes">
                  <CookingPotIcon className="w-4 h-4 mr-2" />
                  Browse Recipes
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-semibold mb-4">Core Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our smart kitchen management system helps you take control of your kitchen and reduce
              waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="kitchen-card">
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-kitchen-100 flex items-center justify-center text-kitchen-600 mb-2">
                  <PackageIcon className="w-6 h-6" />
                </div>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep track of your food items, expiration dates, and quantities. Never let food go
                  to waste again.
                </p>
                <div className="mt-4">
                  <Link
                    to="/inventory"
                    className="inline-flex items-center text-kitchen-600 hover:text-kitchen-700 font-medium"
                  >
                    Try it now <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="kitchen-card">
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-kitchen-100 flex items-center justify-center text-kitchen-600 mb-2">
                  <CookingPotIcon className="w-6 h-6" />
                </div>
                <CardTitle>Recipe Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get personalized recipe suggestions based on your available ingredients and
                  dietary preferences.
                </p>
                <div className="mt-4">
                  <Link
                    to="/recipes"
                    className="inline-flex items-center text-kitchen-600 hover:text-kitchen-700 font-medium"
                  >
                    Browse recipes <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="kitchen-card">
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-kitchen-100 flex items-center justify-center text-kitchen-600 mb-2">
                  <LineChartIcon className="w-6 h-6" />
                </div>
                <CardTitle>Expense Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor your grocery spending, track expenses by category, and identify
                  opportunities to save.
                </p>
                <div className="mt-4">
                  <Link
                    to="/expenses"
                    className="inline-flex items-center text-kitchen-600 hover:text-kitchen-700 font-medium"
                  >
                    Track expenses <ArrowRightIcon className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Recipe Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-semibold">Featured Recipes</h2>
              <p className="text-muted-foreground">
                Discover delicious meals based on your available ingredients.
              </p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0">
              <Link to="/recipes">View All Recipes</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                prepTime={recipe.prepTime}
                cookTime={recipe.cookTime}
                servings={recipe.servings}
                image={recipe.image}
                tags={recipe.tags}
                onClick={() => {}} // Will be implemented in the Recipes page
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats/CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-semibold mb-4">Reduce Waste, Save Money</h2>
              <p className="text-muted-foreground mb-6">
                The average household wastes over $1,500 worth of food annually. KitchenBuddy helps
                you reduce this waste through intelligent inventory management and personalized
                recipe suggestions.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-kitchen-600">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Track Expiration Dates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get alerts for food items that are about to expire so you can use them before
                      they go bad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-kitchen-600">
                    <CookingPotIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Smart Recipe Suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized recipe recommendations based on what's in your kitchen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-kitchen-600">
                    <LineChartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Budget Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your spending and identify opportunities to save on groceries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild>
                  <Link to="/inventory">Get Started Now</Link>
                </Button>
              </div>
            </div>

            <div className="lg:pl-10">
              <div className="relative">
                <div className="bg-kitchen-100 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-kitchen-50 flex items-center justify-center text-kitchen-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Expiration Alert</h3>
                      <p className="text-sm text-muted-foreground">Items expiring soon</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {expiringItems.length > 0 ? (
                      expiringItems.slice(0, 3).map(item => {
                        const expDate = new Date(item.expirationDate);
                        const daysUntilExpiration = Math.ceil(
                          (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-md p-3 flex justify-between items-center shadow-sm"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {item.unit}
                              </p>
                            </div>
                            <div
                              className={`text-sm ${daysUntilExpiration <= 2 ? 'text-red-500' : 'text-amber-500'} font-medium`}
                            >
                              {daysUntilExpiration === 1
                                ? 'Tomorrow'
                                : `${daysUntilExpiration} days`}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white rounded-md p-4 text-center">
                        <p className="text-muted-foreground">No items expiring soon</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Link
                      to="/inventory"
                      className="text-kitchen-600 hover:text-kitchen-700 text-sm font-medium flex items-center justify-center"
                    >
                      View all inventory <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 -bottom-6 -left-6 bg-kitchen-200 rounded-lg -z-10 transform rotate-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
