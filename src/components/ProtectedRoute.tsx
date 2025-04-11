"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished before checking user
    if (!isLoading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  // Show loading indicator or null while checking auth state
  if (isLoading) {
    // Optional: Add a nicer full-page loading spinner here
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>; 
  }

  // If user exists, render the children (the protected page content)
  return user ? <>{children}</> : null; // Render null if redirecting (prevents flash of content)
} 