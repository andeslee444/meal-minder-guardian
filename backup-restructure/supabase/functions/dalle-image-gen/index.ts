import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Updated CORS headers to allow requests from multiple localhost ports
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin during development
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, X-Client-Info, apikey, Content-Type, x-application-name, Origin',
  'Access-Control-Max-Age': '86400',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
console.log('DALL-E Image Generator loaded in development mode');
console.log(`API Key present: ${!!OPENAI_API_KEY}`);

// Function to download an image and convert to base64
async function downloadAndConvertToBase64(imageUrl: string): Promise<string> {
  console.log(`Downloading and converting image: ${imageUrl.substring(0, 50)}...`);

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    // Read the response as an ArrayBuffer
    const imageBuffer = await response.arrayBuffer();

    // Convert to base64
    const base64 = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Determine MIME type based on URL or response headers
    const contentType = response.headers.get('content-type') || 'image/png';

    return base64;
  } catch (error) {
    console.error(`Error converting image: ${error.message}`);
    throw error;
  }
}

serve(async req => {
  // Log all headers for debugging
  console.log(`Request from origin: ${req.headers.get('origin')}`);
  console.log(`Request headers: ${JSON.stringify(Object.fromEntries([...req.headers]))}`);

  // CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();

    // Check if this is a proxy request for an image
    if (body.proxy_url) {
      try {
        console.log(`Proxy request for image: ${body.proxy_url.substring(0, 50)}...`);
        const base64Data = await downloadAndConvertToBase64(body.proxy_url);

        // If raw_response is requested, return just the base64 data
        if (body.raw_response === true) {
          return new Response(base64Data, {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/plain',
            },
          });
        }

        // Otherwise return JSON with the base64 data
        return new Response(
          JSON.stringify({ imageBase64: `data:image/jpeg;base64,${base64Data}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to proxy image', message: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const prompt = body.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Debug mode - return a sample image URL
    if (body.debug === true) {
      console.log('Debug mode, returning sample image');
      return new Response(
        JSON.stringify({ imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image for: ${prompt.substring(0, 30)}...`);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', data);
      return new Response(JSON.stringify({ error: 'No image URL in response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully generated image: ${imageUrl.substring(0, 50)}...`);

    // Option: fetch and convert the image directly to base64 to avoid CORS issues
    // This would be more efficient than having the client request it separately
    try {
      const base64Data = await downloadAndConvertToBase64(imageUrl);

      // If raw_response is requested, return just the base64 data
      if (body.raw_response === true) {
        return new Response(base64Data, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/plain',
          },
        });
      }

      return new Response(
        JSON.stringify({ imageUrl, imageBase64: `data:image/jpeg;base64,${base64Data}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // Fall back to just returning the URL if conversion fails
      console.error('Failed to convert image to base64, returning URL only:', error);
      return new Response(JSON.stringify({ imageUrl }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
