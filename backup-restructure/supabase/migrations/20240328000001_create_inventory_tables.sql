-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    category TEXT,
    price NUMERIC,
    store TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    ingredients JSONB NOT NULL,
    instructions TEXT[] NOT NULL,
    prep_time INTEGER NOT NULL,
    cook_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    image TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cached_recipes table
CREATE TABLE IF NOT EXISTS public.cached_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    ingredients JSONB NOT NULL,
    instructions TEXT[] NOT NULL,
    prep_time INTEGER NOT NULL,
    cook_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    image TEXT,
    tags TEXT[],
    ai_model TEXT,
    filter_mode TEXT NOT NULL,
    inventory_ingredients TEXT[] NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_comments table
CREATE TABLE IF NOT EXISTS public.recipe_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_favorites table
CREATE TABLE IF NOT EXISTS public.recipe_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON public.inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe_id ON public.recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_recipe_id ON public.recipe_favorites(recipe_id);
CREATE INDEX IF NOT EXISTS idx_cached_recipes_filter_mode ON public.cached_recipes(filter_mode);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON public.inventory_items;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON public.recipes;

DROP POLICY IF EXISTS "Anyone can view cached recipes" ON public.cached_recipes;

DROP POLICY IF EXISTS "Anyone can view recipe comments" ON public.recipe_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.recipe_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.recipe_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.recipe_comments;

DROP POLICY IF EXISTS "Anyone can view recipe favorites" ON public.recipe_favorites;
DROP POLICY IF EXISTS "Authenticated users can create favorites" ON public.recipe_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.recipe_favorites;

-- Create new policies
CREATE POLICY "Users can view their own inventory items"
    ON public.inventory_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
    ON public.inventory_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
    ON public.inventory_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
    ON public.inventory_items FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view recipes"
    ON public.recipes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create recipes"
    ON public.recipes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view cached recipes"
    ON public.cached_recipes FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view recipe comments"
    ON public.recipe_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON public.recipe_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments"
    ON public.recipe_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.recipe_comments FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view recipe favorites"
    ON public.recipe_favorites FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create favorites"
    ON public.recipe_favorites FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own favorites"
    ON public.recipe_favorites FOR DELETE
    USING (auth.uid() = user_id); 