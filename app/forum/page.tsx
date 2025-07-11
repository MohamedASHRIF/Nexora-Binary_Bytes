'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    faculty: string;
  };
  faculty: string;
  tags: string[];
  upvotes: any[];
  downvotes: any[];
  answers: any[];
  views: number;
  isResolved: boolean;
  createdAt: string;
  voteCount: number;
  answerCount: number;
}

interface ForumResponse {
  questions: Question[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const ForumPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  });
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuth();
    fetchQuestions();
  }, [facultyFilter, sortBy, pagination.current]);

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
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        faculty: facultyFilter,
        sort: sortBy,
        page: pagination.current.toString(),
        limit: '10'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_URL}/forum?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data: ForumResponse = await response.json();
        setQuestions(data.questions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchQuestions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getFacultyColor = (faculty: string) => {
    switch (faculty) {
      case 'IT': return 'bg-blue-100 text-blue-800';
      case 'AI': return 'bg-purple-100 text-purple-800';
      case 'Design': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFacultyIcon = (faculty: string) => {
    switch (faculty) {
      case 'IT': return '💻';
      case 'AI': return '🤖';
      case 'Design': return '🎨';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💬 Campus Q&A Forum</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Ask questions, share knowledge, and help your peers</p>
          </div>
          <Link
            href="/forum/ask"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Ask Question
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Faculties</option>
              <option value="IT">💻 IT</option>
              <option value="AI">🤖 AI</option>
              <option value="Design">🎨 Design</option>
              <option value="General">📚 General</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="mostVoted">Most Voted</option>
              <option value="mostAnswered">Most Answered</option>
              <option value="mostViewed">Most Viewed</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Search
            </button>
          </form>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">Be the first to ask a question!</p>
            <Link
              href="/forum/ask"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ask Your First Question
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question._id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Vote Stats */}
                  <div className="flex flex-col items-center text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-gray-900">
                      {question.voteCount}
                    </div>
                    <div className="text-sm text-gray-500">votes</div>
                    <div className="text-lg font-semibold text-gray-900 mt-2">
                      {question.answerCount}
                    </div>
                    <div className="text-sm text-gray-500">answers</div>
                    {question.isResolved && (
                      <div className="mt-2 text-green-600 text-sm">✓ Solved</div>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/forum/question/${question._id}`}
                        className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {question.title}
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFacultyColor(question.faculty)}`}>
                        {getFacultyIcon(question.faculty)} {question.faculty}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {question.content}
                    </p>

                    {/* Tags */}
                    {question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>Asked by {question.author.name}</span>
                        <span>{formatDate(question.createdAt)}</span>
                        <span>{question.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && questions.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.current} of {pagination.total}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage; 