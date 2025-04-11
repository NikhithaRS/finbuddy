"use client"; // Need client component for useState and useEffect

import React, { useState } from 'react';
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card"; // Import Shadcn Card components
import ProtectedRoute from '@/components/ProtectedRoute'; // Import wrapper

export default function DashboardPage() {
  // Removed news-related state and fetch logic
  // const [articles, setArticles] = useState<WorldNewsArticle[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  
  // Keep placeholder state for indices - but removed unused setters
  const [marketIndices] = useState({
      nifty: { value: "23,456.78", change: "+123.45 (+0.53%)", positive: true },
      sensex: { value: "78,910.11", change: "-50.20 (-0.06%)", positive: false },
      dow: { value: "40,123.45", change: "+250.10 (+0.63%)", positive: true },
      nasdaq: { value: "18,567.89", change: "-80.55 (-0.43%)", positive: false },
  });
   // Placeholder state for stocks
   const [stocks] = useState({
      reliance: { value: "2,950.50", change: "+15.20 (+0.52%)", positive: true },
      hdfc: { value: "1,680.75", change: "-5.10 (-0.30%)", positive: false },
      apple: { value: "$195.80", change: "+$1.50 (+0.77%)", positive: true },
      google: { value: "$180.25", change: "-$0.95 (-0.52%)", positive: false },
   });

  // Removed news fetch useEffect

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>

        {/* Market Indices Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Market Indices</h2>
          {/* TODO: Replace placeholders with data from a real Financial Data API */} 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nifty 50 Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">NIFTY 50</CardTitle>
                <CardDescription>NSE India</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketIndices.nifty.value}</div>
              </CardContent>
              <CardFooter>
                <p className={`text-xs ${marketIndices.nifty.positive ? 'text-green-600' : 'text-red-600'}`}>{marketIndices.nifty.change}</p>
              </CardFooter>
            </Card>
            {/* Sensex Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">SENSEX</CardTitle>
                <CardDescription>BSE India</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketIndices.sensex.value}</div>
              </CardContent>
              <CardFooter>
                <p className={`text-xs ${marketIndices.sensex.positive ? 'text-green-600' : 'text-red-600'}`}>{marketIndices.sensex.change}</p>
              </CardFooter>
            </Card>
            {/* Dow Jones Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Dow Jones</CardTitle>
                <CardDescription>DJIA Index</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketIndices.dow.value}</div>
              </CardContent>
              <CardFooter>
                <p className={`text-xs ${marketIndices.dow.positive ? 'text-green-600' : 'text-red-600'}`}>{marketIndices.dow.change}</p>
              </CardFooter>
            </Card>
            {/* NASDAQ Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">NASDAQ</CardTitle>
                <CardDescription>NASDAQ Composite</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketIndices.nasdaq.value}</div>
              </CardContent>
              <CardFooter>
                <p className={`text-xs ${marketIndices.nasdaq.positive ? 'text-green-600' : 'text-red-600'}`}>{marketIndices.nasdaq.change}</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Major Stocks Section */} 
        <div>
          <h2 className="text-xl font-semibold mb-4">Major Stocks</h2>
          {/* TODO: Replace placeholders with data from a real Financial Data API */} 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reliance */}
             <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Reliance</CardTitle><CardDescription>NSE: RELIANCE</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stocks.reliance.value}</div></CardContent>
              <CardFooter><p className={`text-xs ${stocks.reliance.positive ? 'text-green-600' : 'text-red-600'}`}>{stocks.reliance.change}</p></CardFooter>
            </Card>
             {/* HDFC Bank */}
             <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">HDFC Bank</CardTitle><CardDescription>NSE: HDFCBANK</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stocks.hdfc.value}</div></CardContent>
              <CardFooter><p className={`text-xs ${stocks.hdfc.positive ? 'text-green-600' : 'text-red-600'}`}>{stocks.hdfc.change}</p></CardFooter>
            </Card>
             {/* Apple */}
             <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Apple</CardTitle><CardDescription>NASDAQ: AAPL</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stocks.apple.value}</div></CardContent>
              <CardFooter><p className={`text-xs ${stocks.apple.positive ? 'text-green-600' : 'text-red-600'}`}>{stocks.apple.change}</p></CardFooter>
            </Card>
             {/* Google */}
             <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Alphabet (Google)</CardTitle><CardDescription>NASDAQ: GOOGL</CardDescription></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stocks.google.value}</div></CardContent>
              <CardFooter><p className={`text-xs ${stocks.google.positive ? 'text-green-600' : 'text-red-600'}`}>{stocks.google.change}</p></CardFooter>
            </Card>
          </div>
        </div>

        {/* Removed Financial News Section */}

      </div>
    </ProtectedRoute>
  );
} 