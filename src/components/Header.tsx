"use client"; // Needs to be client to use context

import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import router for logout redirect

const Header = () => {
  const { user, logout, isLoading } = useAuth(); // Get user and logout from context
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login after logout
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/login"} className="text-xl font-bold hover:text-gray-300">
           FinBuddy
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
             <div className="text-sm text-gray-400">Loading...</div>
          ) : user ? (
            <> 
              <span className="text-sm">Hi, {user.email}</span>
              <Button 
                 variant="secondary" 
                 size="sm"
                 onClick={handleLogout}
              >
                 Logout
              </Button>
             </>
          ) : (
            <> 
              <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
              <Link href="/signup" className="text-sm font-medium bg-white text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-200">
                Sign Up
              </Link>
            </>
          )}
           {/* <LanguageSwitcher /> // Can add back later if i18n is fixed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
