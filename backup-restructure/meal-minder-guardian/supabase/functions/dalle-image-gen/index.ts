import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Allow any origin during development
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-application-name, Origin, x-client-info',
};

// Sample fallback images for different recipe types
const SAMPLE_IMAGES = {
  default:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2070&auto=format&fit=crop',
  burger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2999&auto=format&fit=crop',
  pasta:
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop',
};

// Get a sample image based on prompt content
const getSampleImage = (prompt: string = ''): string => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('burger') || lowerPrompt.includes('sandwich')) {
    return SAMPLE_IMAGES.burger;
  }
  if (lowerPrompt.includes('pasta') || lowerPrompt.includes('noodle')) {
    return SAMPLE_IMAGES.pasta;
  }

  return SAMPLE_IMAGES.default;
};

serve(async req => {
  console.log('======== DALLE IMAGE GENERATION REQUEST ========');
  console.log(`Request URL: ${req.url}`);
  console.log(`Request method: ${req.method}`);
  console.log(`Origin: ${req.headers.get('origin')}`);
  console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2)}`);

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request with CORS headers');
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // Only support POST requests
  if (req.method !== 'POST') {
    console.log(`Unsupported method: ${req.method}`);
    return new Response(JSON.stringify({ error: `Method ${req.method} not allowed` }), {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log(`Request body: ${JSON.stringify(requestData, null, 2)}`);

    // Check if this is a debug request (always allow these)
    const isDebug = requestData.debug === true;
    console.log(`Debug mode: ${isDebug}`);

    // If this is a proxy request, return the URL directly in debug mode
    if (requestData.proxyUrl && isDebug) {
      console.log(`Returning proxy URL directly: ${requestData.proxyUrl}`);
      return new Response(JSON.stringify({ imageUrl: requestData.proxyUrl }), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    // Check for prompt parameter
    const prompt = requestData.prompt;
    if (!prompt || typeof prompt !== 'string') {
      console.log('No prompt provided');
      // Return a sample image instead in debug mode
      if (isDebug) {
        const sampleImage = getSampleImage();
        console.log(`Returning sample image in debug mode: ${sampleImage}`);
        return new Response(
          JSON.stringify({
            imageUrl: sampleImage,
            error: 'No prompt provided',
          }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(JSON.stringify({ error: 'Missing required parameter: prompt' }), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the API key from environment variables
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    console.log(`API key present: ${!!apiKey}`);

    // If we're in debug mode and no API key is set, return a sample image
    if (isDebug && !apiKey) {
      console.log('Debug mode enabled and no API key, returning sample image');
      return new Response(
        JSON.stringify({
          imageUrl: getSampleImage(prompt),
          error: 'No API key configured, using sample image',
        }),
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Require API key for non-debug requests
    if (!apiKey) {
      console.error('No OpenAI API key provided in environment');
      return new Response(JSON.stringify({ error: 'Server not configured with OpenAI API key' }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    // Generate image using OpenAI API
    console.log('Generating image with DALL-E');
    const openAiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-2', // Using DALL-E 2 for cost efficiency
        prompt: prompt,
        n: 1,
        size: '512x512', // Smaller size for cost efficiency
      }),
    });

    // Handle DALL-E API errors
    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.text();
      console.error(`OpenAI API error: ${openAiResponse.status} - ${errorData}`);

      // Use a fallback image in debug mode
      if (isDebug) {
        const fallbackImage = getSampleImage(prompt);
        console.log(`Returning fallback image in debug mode: ${fallbackImage}`);
        return new Response(
          JSON.stringify({
            imageUrl: fallbackImage,
            error: `OpenAI API error: ${openAiResponse.status}`,
          }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: `Error generating image: ${openAiResponse.status}` }),
        {
          status: 502,
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse the DALL-E API response
    const data = await openAiResponse.json();
    console.log(`OpenAI response: ${JSON.stringify(data, null, 2)}`);

    // Check for image URL in the response
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('No image URL in OpenAI response');

      // Use a fallback image in debug mode
      if (isDebug) {
        const fallbackImage = getSampleImage(prompt);
        console.log(`No image URL in response, returning fallback: ${fallbackImage}`);
        return new Response(
          JSON.stringify({
            imageUrl: fallbackImage,
            error: 'No image URL in OpenAI response',
          }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(JSON.stringify({ error: 'No image URL in response' }), {
        status: 502,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }

    // Extract and return the image URL
    const imageUrl = data.data[0].url;
    console.log(`Generated image URL: ${imageUrl}`);

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  }
});
