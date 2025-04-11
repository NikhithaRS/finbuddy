"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname(); 

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Assistant', path: '/' },
    { name: 'SIP Calculator', path: '/sip-calculator' },
    { name: 'Learning Hub', path: '/learning-hub' },
    { name: 'Market Insights', path: '/market-insights' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-gray-100 p-4 h-full fixed left-0 top-16 pt-4 shadow-lg flex flex-col">
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => {
            const isActive = (item.path === '/' && pathname === '/') || 
                             (item.path !== '/' && pathname.startsWith(item.path));
            
            return (
              <li key={item.name} className="mb-2">
                <Link 
                  href={item.path} 
                  className={`block p-2 rounded transition-colors 
                             ${isActive 
                               ? 'bg-blue-100 text-blue-700 font-semibold' 
                               : 'text-gray-700 hover:bg-gray-200'}
                            `}
                >
                  {item.name} 
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto text-gray-600">
        User Info 
      </div>
    </aside>
  );
};

export default Sidebar;
