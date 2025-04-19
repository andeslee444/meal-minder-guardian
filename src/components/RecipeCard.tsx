import React, { useState } from 'react';
import { RecipeCardProps } from '@/types/RecipeCardProps';
import { generateRecipeImage } from '@/services/dalleService';
import { Recipe } from '@/types/recipe';

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onDelete }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const generateImage = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.debug(`[RecipeCard] Generating image for recipe: ${recipe.title}`);
      const url = await generateRecipeImage(recipe);
      console.debug(`[RecipeCard] Image generated successfully for: ${recipe.title}`);
      setImageUrl(url);
      setRetryCount(0);
    } catch (err) {
      console.error(`[RecipeCard] Image generation error for ${recipe.title}:`, err);
      setError('Failed to generate image. Please try again.');

      if (retryCount < MAX_RETRIES) {
        console.debug(
          `[RecipeCard] Retrying image generation (${retryCount + 1}/${MAX_RETRIES}) for: ${recipe.title}`
        );
        setRetryCount(prev => prev + 1);
        setTimeout(() => generateImage(), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recipe-card">
      <div className="recipe-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title}
            onError={() => {
              console.error(`[RecipeCard] Image load error for: ${recipe.title}`);
              setError('Failed to load image. Please try again.');
              setImageUrl(null);
            }}
          />
        ) : (
          <div className="image-placeholder">
            {isLoading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <button
                onClick={generateImage}
                disabled={isLoading}
                className="generate-image-button"
              >
                {error ? 'Retry' : 'Generate Image'}
              </button>
            )}
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
            {retryCount < MAX_RETRIES && (
              <span>
                {' '}
                (Retrying {retryCount + 1}/{MAX_RETRIES})
              </span>
            )}
          </div>
        )}
      </div>
      {/* ... rest of the existing JSX ... */}
    </div>
  );
};

export default RecipeCard;
