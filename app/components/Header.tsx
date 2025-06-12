"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../hooks/useLanguage';
import { useGamePoints } from '../../hooks/useGamePoints';
import { useDarkMode } from '../../hooks/useDarkMode';
import { FiSettings, FiMoon, FiSun } from 'react-icons/fi';


interface User {
  name: string;
  email: string;
  role: string;
  language: string;
  createdAt: string;
  degree?: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pathname = usePathname(); 
  
  // Check if current path is an auth page
  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/signup';

  const { language, setLanguage, isInitialized } = useLanguage();
  const { points } = useGamePoints();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const checkUser = () => {
      try {
        const token = Cookies.get('token') || localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUser(null);
            localStorage.removeItem('user');
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    router.push('/auth/login');
  };

  console.log('Current state:', { user, isLoading, isAuthPage, pathname });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-slate-900 shadow dark:shadow-slate-800/50">
      {/* Main Header with Title and Profile */}
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Nexora Campus Copilot</Link>
        {/* Points and Language Switcher */}
        {!isAuthPage && (
          <div className="flex items-center gap-4 mr-4">
          </div>
        )}
        <div className="relative" ref={dropdownRef}>
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
          ) : user && !isAuthPage ? (
            <>
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Profile"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded">View Profile</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded mt-1">Admin Dashboard</Link>
                    )}
                    <button
                      onClick={() => { setSettingsOpen(true); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded mt-1"
                    >
                      <span className="inline-flex items-center gap-2"><FiSettings /> Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 rounded mt-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {pathname === '/auth/login' ? (
                <Link 
                  href="/auth/signup" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign Up
                </Link>
              ) : pathname === '/auth/signup' ? (
                <Link 
                  href="/auth/login" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </Link>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 dark:bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Settings</h2>
            
            {/* Dark Mode Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <FiMoon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FiSun className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isDarkMode ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Language Settings */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'si' | 'ta')}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div className="text-gray-600 dark:text-gray-400 text-sm">
              <p>More settings will be available here.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 