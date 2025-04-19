// CORS headers configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-application-name, origin, accept',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Apply CORS headers to a response
export function setCORSHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);

  // Add all the CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}

// Handle OPTIONS requests for CORS preflight
export function handleCORSPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
