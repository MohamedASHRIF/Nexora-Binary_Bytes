'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AskQuestionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    faculty: 'General',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Set default faculty to user's faculty
        setFormData(prev => ({ ...prev, faculty: userData.faculty || 'General' }));
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const response = await fetch(`${API_URL}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          faculty: formData.faculty,
          tags
        })
      });

      if (response.ok) {
        const question = await response.json();
        setMessage({ type: 'success', text: 'Question posted successfully!' });
        setTimeout(() => {
          router.push(`/forum/question/${question._id}`);
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to post question' });
      }
    } catch (error) {
      console.error('Failed to post question:', error);
      setMessage({ type: 'error', text: 'Failed to post question. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/forum"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-flex items-center"
          >
            ← Back to Forum
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ask a Question</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Share your question with the campus community</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Question Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What's your question? Be specific."
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={200}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Question Details *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Provide more context about your question. Include any relevant details, code snippets, or specific scenarios."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
                required
              />
            </div>

            {/* Faculty */}
            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Faculty
              </label>
              <select
                id="faculty"
                value={formData.faculty}
                onChange={(e) => handleInputChange('faculty', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="General">📚 General</option>
                <option value="IT">💻 IT</option>
                <option value="AI">🤖 AI</option>
                <option value="Design">🎨 Design</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas (e.g., javascript, react, homework)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.tags.length}/100 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  'Post Question'
                )}
              </button>
              <Link
                href="/forum"
                className="px-8 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for a great question:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Be specific and clear about what you're asking</li>
            <li>• Include relevant context and background information</li>
            <li>• If it's a coding question, include code snippets</li>
            <li>• Use appropriate tags to help others find your question</li>
            <li>• Check if your question has already been asked</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage; 