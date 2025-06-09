"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface User {
  name: string;
  email: string;
  role: string;
  language: string;
  createdAt: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First try to get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
      return;
    }

    // If not in localStorage, fetch from API
    const fetchUser = async () => {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        setUser(data.data.user);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

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

  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      <Link href="/" className="text-xl font-bold text-blue-600">Nexora Campus Copilot</Link>
      <div className="relative" ref={dropdownRef}>
        {isLoading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user ? (
          <>
            {user.role !== 'admin' && (
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-label="Profile"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            )}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="font-semibold text-lg">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-400 mt-1">Role: <span className="capitalize">{user.role}</span></div>
                  <div className="text-xs text-gray-400">Language: <span className="uppercase">{user.language}</span></div>
                  <div className="text-xs text-gray-400">Member since: {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="p-2">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">View Profile</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded mt-1">Admin Dashboard</Link>
                  )}
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
          <Link href="/auth/login" className="flex items-center space-x-2 px-4 py-2 text-blue-600 font-semibold hover:underline">
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.755 6.879 2.047M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Login
          </Link>
        )}
      </div>
    </header>
  );
} 