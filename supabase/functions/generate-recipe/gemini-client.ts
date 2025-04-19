/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { RecipeResponse, GeminiResponse } from './types.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const MAX_RETRIES = 3;
const TIMEOUT = 120000; // 2 minutes

export async function callGeminiWithRetry(prompt: string): Promise<RecipeResponse[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Info] Attempting Gemini API call (attempt ${attempt}/${MAX_RETRIES})`);

      const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'You are a recipe generation assistant that ONLY responds with valid JSON arrays containing recipe objects. Never include any explanatory text, markdown, or non-JSON content in your response.',
                },
              ],
            },
            {
              role: 'model',
              parts: [
                {
                  text: 'I understand. I will only respond with valid JSON arrays containing recipe objects, without any additional text or formatting.',
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = (await response.json()) as GeminiResponse;
      const content = data.candidates[0].content.parts[0].text;

      try {
        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No JSON array found in response');
        }

        const recipes = JSON.parse(jsonMatch[0]) as RecipeResponse[];
        if (!Array.isArray(recipes)) {
          throw new Error('Response is not an array of recipes');
        }
        return recipes;
      } catch (parseError) {
        console.error('[Error] Failed to parse Gemini response:', parseError);
        throw new Error('Invalid recipe format in response');
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`[Error] Gemini API call failed (attempt ${attempt}/${MAX_RETRIES}):`, error);

      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`[Info] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to generate recipes after all retries');
}
