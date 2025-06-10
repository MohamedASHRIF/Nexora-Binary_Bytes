"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../hooks/useLanguage';
import { useGamePoints } from '../../hooks/useGamePoints';
import { FiSettings } from 'react-icons/fi';


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
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      <Link href="/" className="text-xl font-bold text-blue-600">Nexora Campus Copilot</Link>
      {/* Points and Language Switcher */}
      {!isAuthPage && (
        <div className="flex items-center gap-4 mr-4">
        </div>
      )}
      <div className="relative" ref={dropdownRef}>
        {isLoading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user && !isAuthPage ? (
          <>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Profile"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">View Profile</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded mt-1">Admin Dashboard</Link>
                  )}
                  <button
                    onClick={() => { setSettingsOpen(true); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded mt-1"
                  >
                    <span className="inline-flex items-center gap-2"><FiSettings /> Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded mt-1"
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Up
              </Link>
            ) : pathname === '/auth/signup' ? (
              <Link 
                href="/auth/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            ) : (
              <Link 
                href="/auth/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            )}
          </>
        )}
      </div>
      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Language</label>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 px-3 py-2 ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('si')}
                  className={`flex-1 px-3 py-2 ${language === 'si' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                >
                  සිං
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`flex-1 px-3 py-2 ${language === 'ta' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                >
                  தமி
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 