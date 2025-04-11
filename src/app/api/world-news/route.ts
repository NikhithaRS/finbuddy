import { NextRequest, NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.WORLD_NEWS_API_KEY;

// Basic validation for the API key
if (!NEWS_API_KEY) {
  console.error("Missing WORLD_NEWS_API_KEY environment variable.");
  // Don't throw here as it might prevent builds, handle in the request instead.
}

export async function GET(request: NextRequest) {
  // Check if key is missing during the actual request
  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: Missing News API Key' }, { status: 500 });
  }
  
  // Get query parameters from the request URL
  const searchParams = request.nextUrl.searchParams;
  const number = searchParams.get('number') || '6'; // Default to 6 if not provided
  const country = searchParams.get('country') || 'in';
  const language = searchParams.get('language') || 'en';
  const textQuery = searchParams.get('text') || 'finance'; // Allow text query override

  // Construct the URL securely on the backend using potentially dynamic params
  const url = `https://api.worldnewsapi.com/search-news?text=${textQuery}&source-country=${country}&language=${language}&number=${number}&api-key=${NEWS_API_KEY}`;

  try {
    const apiResponse = await fetch(url, {
        method: 'GET',
        // Optional: Add caching headers if desired
        // next: { revalidate: 3600 } // Revalidate every hour, for example
      });

    if (!apiResponse.ok) {
      let errorMsg = `News API error! status: ${apiResponse.status}`;
      try {
        const errorData = await apiResponse.json();
        errorMsg = errorData.message || errorMsg;
      } catch {}
      console.error("World News API Error:", errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    
    // Return the relevant part of the response (the news articles)
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching news from backend API:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 