const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping branding from:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['branding'],
        onlyMainContent: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      const errorMsg = response.status === 402
        ? 'Insufficient Firecrawl credits. Please upgrade your plan.'
        : data.error || `Request failed with status ${response.status}`;
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract branding from response (handle nested data structure)
    const branding = data?.data?.branding || data?.branding || null;

    if (!branding) {
      return new Response(
        JSON.stringify({ success: false, error: 'No branding data could be extracted from this URL' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize into our Design DNA format
    const designInspiration = {
      primaryColor: branding.colors?.primary || null,
      secondaryColor: branding.colors?.secondary || branding.colors?.accent || null,
      backgroundColor: branding.colors?.background || null,
      textColor: branding.colors?.textPrimary || null,
      fontPrimary: branding.typography?.fontFamilies?.primary || branding.fonts?.[0]?.family || null,
      fontHeading: branding.typography?.fontFamilies?.heading || null,
      borderRadius: branding.spacing?.borderRadius || null,
      colorScheme: branding.colorScheme || null,
      logo: branding.images?.logo || branding.logo || null,
      allColors: branding.colors || {},
    };

    console.log('Branding extracted successfully');

    return new Response(
      JSON.stringify({ success: true, data: designInspiration }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping branding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape branding';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
