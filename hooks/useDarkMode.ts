import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedMode = localStorage.getItem('darkMode');
      const darkMode = savedMode === 'true';
      setIsDarkMode(darkMode);
      setIsInitialized(true);
      
      // Apply dark mode to document
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isInitialized]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {
    isDarkMode,
    toggleDarkMode,
    isInitialized
  };
}; 