"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useGamePoints } from '../../hooks/useGamePoints';
import { Copy, X, XCircle } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  language: string;
  createdAt: string;
  tags?: string[];
}

interface Suggestion {
  search: string;
  category: string;
}

const suggestionsData = {
  programming: [
    { search: "JavaScript frameworks" },
    { search: "React.js tutorial" },
    { search: "Node.js frameworks" },
    { search: "Python web development frameworks" },
    { search: "Ruby on Rails tutorial" },
    { search: "PHP best practices" },
    { search: "ASP.NET web development" },
    { search: "TypeScript" },
    { search: "Java Spring Boot" },
    { search: "Go programming" },
    { search: "Rust programming" },
    { search: "Swift development" }
  ],
  web_development: [
    { search: "How to learn web development" },
    { search: "Front-end vs. Back-end development" },
    { search: "Responsive web design" },
    { search: "Web performance optimization" },
    { search: "GraphQL API design" },
    { search: "RESTful API design" },
    { search: "Web application architecture" },
    { search: "Progressive Web Apps" },
    { search: "Web accessibility guidelines" },
    { search: "Web security best practices" }
  ],
  engineering: [
    { search: "Software engineering principles" },
    { search: "System design" },
    { search: "Database design for web applications" },
    { search: "User authentication and authorization" },
    { search: "WebRTC video chat implementation" },
    { search: "Debugging web applications" },
    { search: "JavaScript design patterns" },
    { search: "Microservices architecture" },
    { search: "DevOps practices" },
    { search: "Cloud computing" }
  ],
  mathematics: [
    { search: "Discrete mathematics" },
    { search: "Linear algebra for programmers" },
    { search: "Calculus applications in CS" },
    { search: "Probability and statistics" },
    { search: "Graph theory" },
    { search: "Number theory" },
    { search: "Mathematical optimization" },
    { search: "Cryptography fundamentals" },
    { search: "Machine learning math" },
    { search: "Algorithmic complexity" }
  ],
  tools: [
    { search: "How to use Git for web development" },
    { search: "Web development tools for Mac" },
    { search: "Web scraping tools" },
    { search: "JavaScript testing frameworks" },
    { search: "CSS preprocessors" },
    { search: "Docker for developers" },
    { search: "Kubernetes basics" },
    { search: "CI/CD pipelines" }
  ],
  design: [
    { search: "UI/UX design for the web" },
    { search: "CSS grid layouts" },
    { search: "CSS flexbox layouts" },
    { search: "Web typography best practices" },
    { search: "Web animations with CSS and JavaScript" },
    { search: "Web animations using SVG" },
    { search: "Web design trends in 2023" },
    { search: "Responsive images" },
    { search: "Bootstrap responsive design" }
  ]
};

const getAllCategories = () => Object.keys(suggestionsData);

type Category = keyof typeof suggestionsData;

const searchSuggestions = (query: string, activeCategories: string[]) => {
  const results: Suggestion[] = [];
  
  for (const category in suggestionsData) {
    if (activeCategories.length === 0 || activeCategories.includes(category)) {
      (suggestionsData[category as Category] as { search: string }[]).forEach((item) => {
        results.push({
          search: item.search,
          category: category
        });
      });
    }
  }

  return results.filter(suggestion => 
    suggestion.search.toLowerCase().includes(query.toLowerCase())
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { points } = useGamePoints();
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>(getAllCategories());
  const [searchQuery, setSearchQuery] = useState('');

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeMessage, setChangeMessage] = useState('');

  // Load user profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const userResponse = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await userResponse.json();
        setUser(userData.data.user);
        setTags(userData.data.user.tags || []);

      } catch (err: any) {
        setError(err.message);
        if (err.message === 'No authentication token found') {
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const addTags = async (input: string) => {
    let newTags = input
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    const updatedTags = Array.from(new Set([...tags, ...newTags]));
    setTags(updatedTags);
    
    if (inputRef.current) {
      inputRef.current.value = "";
      setSearchQuery("");
    }
    setShowSuggestions(false);
    
    await saveTagsToBackend(updatedTags);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current) {
      addTags(inputRef.current.value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const results = searchSuggestions(query, activeCategories);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = activeCategories.includes(category)
      ? activeCategories.filter(c => c !== category)
      : [...activeCategories, category];
    
    setActiveCategories(newCategories);
    
    if (searchQuery.trim().length > 0) {
      setSuggestions(searchSuggestions(searchQuery, newCategories));
    }
  };

  const removeTag = async (tag: string) => {
    const updatedTags = tags.filter((t) => t !== tag);
    setTags(updatedTags);
    await saveTagsToBackend(updatedTags);
  };

  const removeAll = async () => {
    setTags([]);
    await saveTagsToBackend([]);
  };

  const copyTags = async () => {
    if (tags.length) {
      try {
        await navigator.clipboard.writeText(tags.join(", "));
        alert("Tags copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  const saveTagsToBackend = async (updatedTags: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const response = await fetch('http://localhost:5000/api/users/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tags: updatedTags })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update tags');
      }
    } catch (err) {
      console.error('Error saving tags:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    router.push('/auth/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMessage('');

    if (newPassword.length < 8) {
      setChangeMessage('New password must be at least 8 characters.');
      return;
    }

    if (confirmPassword.length < 8) {
      setChangeMessage('Confirm password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeMessage('New password and confirm password do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setChangeMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setChangeMessage(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white">Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and account information</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-6 py-3 flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">Points:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" suppressHydrationWarning>{points}</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{user.role}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white uppercase">{user.language}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Tags Card with Auto-complete */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg mt-6 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tags</h3>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getAllCategories().map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeCategories.includes(category)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center border rounded p-2 gap-2">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center bg-gray-200 dark:bg-slate-700 rounded-full px-3 py-1 text-sm text-gray-800 dark:text-gray-200">
                  <span>{tag}</span>
                  <XCircle
                    size={16}
                    className="ml-1 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-red-500 dark:hover:text-red-400"
                    onClick={() => removeTag(tag)}
                  />
                </div>
              ))}
              <input
                type="text"
                ref={inputRef}
                value={searchQuery}
                onChange={handleInputChange}
                onKeyUp={handleKeyUp}
                placeholder="Enter tags and press Enter"
                className="flex-1 min-w-[120px] border-none outline-none p-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={`${suggestion.search}-${index}`}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between text-gray-900 dark:text-white"
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = suggestion.search;
                          setSearchQuery(suggestion.search);
                          inputRef.current.focus();
                        }
                        setShowSuggestions(false);
                      }}
                    >
                      <span>{suggestion.search}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {suggestion.category.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg mt-6 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must match the new password.</p>
            </div>
            {changeMessage && (
              <div className={`text-sm ${changeMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {changeMessage}
              </div>
            )}
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}