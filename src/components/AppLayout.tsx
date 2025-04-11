import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-16"> 
        <Sidebar />
        <main className="flex-1 p-6 ml-64 bg-gray-50"> {/* Added bg-gray-50 for contrast */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
