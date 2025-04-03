
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CrisisButton from '../shared/CrisisButton';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check user's preferred color scheme on initial render
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header 
        toggleSidebar={toggleSidebar} 
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main 
          className={`flex-1 transition-all duration-300 p-4 ${
            sidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <Outlet />
        </main>
      </div>
      <CrisisButton />
    </div>
  );
};

export default Layout;
