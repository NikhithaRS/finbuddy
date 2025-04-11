"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until check is complete

  // Check for persisted user state on mount (e.g., from localStorage)
  // !! This is basic and insecure for production - use HTTP-only cookies/sessions !!
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('finbuddyUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('finbuddyUser'); // Clear corrupted data
    }
    setIsLoading(false); // Finished checking
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after login action
    try {
         localStorage.setItem('finbuddyUser', JSON.stringify(userData));
    } catch (error) {
        console.error("Failed to save user to localStorage", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoading(false); // Ensure loading is false after logout action
     try {
         localStorage.removeItem('finbuddyUser');
    } catch (error) {
        console.error("Failed to remove user from localStorage", error);
    }
    // Optionally redirect to login page
    // window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 