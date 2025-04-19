-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}';

-- Update RLS policies for the recipes table
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can update own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can delete own recipes" ON public.recipes;

-- Create more secure policies for recipes
CREATE POLICY "Authenticated users can create recipes"
    ON public.recipes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update/delete recipes they have favorited (adjust logic as needed)
CREATE POLICY "Authenticated users can update own recipes"
    ON public.recipes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.recipe_favorites 
        WHERE recipe_id = public.recipes.id AND user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.recipe_favorites 
        WHERE recipe_id = public.recipes.id AND user_id = auth.uid()
    ));

CREATE POLICY "Authenticated users can delete own recipes"
    ON public.recipes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.recipe_favorites 
        WHERE recipe_id = public.recipes.id AND user_id = auth.uid()
    ));

-- Add update and delete policies for cached_recipes
DROP POLICY IF EXISTS "Authenticated users can update cached recipes" ON public.cached_recipes;
DROP POLICY IF EXISTS "Authenticated users can delete cached recipes" ON public.cached_recipes;

CREATE POLICY "Authenticated users can update cached recipes"
    ON public.cached_recipes FOR UPDATE
    USING (auth.role() = 'authenticated') -- Consider if this needs user_id check
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cached recipes"
    ON public.cached_recipes FOR DELETE
    USING (auth.role() = 'authenticated'); -- Consider if this needs user_id check 