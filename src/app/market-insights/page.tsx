"use client";

import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import ProtectedRoute from '@/components/ProtectedRoute';

// Re-use the same interface
interface WorldNewsArticle {
  id: number;
  title: string;
  text: string;
  summary: string;
  url: string;
  image: string;
  video: string;
  publish_date: string;
  authors: string[];
  language: string;
  source_country: string;
  sentiment: number;
}

const LOCAL_NEWS_ENDPOINT = '/api/world-news'; 

export default function MarketInsightsPage() {
  const [articles, setArticles] = useState<WorldNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch from the local API route
        // Potentially fetch more articles here if the backend supports it, e.g., adding ?number=20
        const response = await fetch(`${LOCAL_NEWS_ENDPOINT}?number=18`); // Fetch more articles (e.g., 18)
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        setArticles(data.news || []); 
      } catch (err) {
        console.error("Error fetching market news:", err);
        if (err instanceof Error) {
           setError(err.message);
        } else {
           setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Market Insights</h1>
        <p className="text-muted-foreground">Latest financial and business news headlines.</p>

        {isLoading && <p className="text-center text-gray-500 italic">Loading market news...</p>}
        
        {error && (
          <Card className="bg-red-50 border border-red-200">
            <CardHeader><CardTitle className="text-red-700">Error Loading News</CardTitle></CardHeader>
            <CardContent><p className="text-red-600">{error}</p></CardContent>
          </Card>
        )}

        {!isLoading && !error && articles.length === 0 && (
          <p className="text-center text-gray-500">No market news found.</p>
        )}

        {!isLoading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
               <Card key={article.id} className="flex flex-col justify-between">
                 <CardHeader className="p-0">
                     {article.image && (
                         <img src={article.image} alt={article.title} className="w-full h-40 object-cover rounded-t-lg" />
                     )}
                 </CardHeader>
                 <CardContent className="p-4 flex-grow">
                   <CardTitle className="text-base font-semibold mb-1 line-clamp-3 leading-snug">
                     <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                         {article.title}
                     </a>
                   </CardTitle>
                   <CardDescription className="text-xs text-gray-600 line-clamp-3">
                      {article.summary || article.text.substring(0, 100) + '...'} 
                   </CardDescription>
                 </CardContent>
                 <CardFooter className="p-4 text-xs text-gray-500 flex justify-between items-center border-t">
                     <span className="truncate pr-2">{article.authors?.join(', ') || 'Unknown'}</span>
                     <span className="whitespace-nowrap">{new Date(article.publish_date).toLocaleDateString()}</span>
                 </CardFooter>
               </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 