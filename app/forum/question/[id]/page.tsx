'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Answer {
  _id: string;
  content: string;
  author: {
    name: string;
    faculty: string;
  };
  upvotes: any[];
  downvotes: any[];
  isBestAnswer: boolean;
  createdAt: string;
}

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
  answers: Answer[];
  views: number;
  isResolved: boolean;
  createdAt: string;
  voteCount: number;
  answerCount: number;
}

const QuestionPage = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const params = useParams();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    checkAuth();
    fetchQuestion();
  }, [params.id]);

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

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/forum/${params.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setQuestion(data);
      } else {
        setMessage({ type: 'error', text: 'Question not found' });
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
      setMessage({ type: 'error', text: 'Failed to load question' });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'upvote' | 'downvote', target: 'question' | 'answer', answerId?: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = target === 'question' 
        ? `${API_URL}/forum/${params.id}/vote`
        : `${API_URL}/forum/${params.id}/answers/${answerId}/vote`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ voteType: type })
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestion(updatedQuestion);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answerContent.trim()) {
      setMessage({ type: 'error', text: 'Answer content is required' });
      return;
    }

    setSubmittingAnswer(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/forum/${params.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ content: answerContent.trim() })
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestion(updatedQuestion);
        setAnswerContent('');
        setMessage({ type: 'success', text: 'Answer posted successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to post answer' });
      }
    } catch (error) {
      console.error('Failed to post answer:', error);
      setMessage({ type: 'error', text: 'Failed to post answer. Please try again.' });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleMarkBestAnswer = async (answerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/forum/${params.id}/answers/${answerId}/best`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestion(updatedQuestion);
        setMessage({ type: 'success', text: 'Best answer marked!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to mark best answer:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Question not found</h3>
          <Link
            href="/forum"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/forum"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to Forum
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            {/* Vote Controls */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleVote('upvote', 'question')}
                className="text-gray-400 hover:text-green-600 transition-colors"
              >
                ▲
              </button>
              <span className="text-xl font-bold text-gray-900 my-1">
                {question.voteCount}
              </span>
              <button
                onClick={() => handleVote('downvote', 'question')}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                ▼
              </button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFacultyColor(question.faculty)}`}>
                  {getFacultyIcon(question.faculty)} {question.faculty}
                </span>
              </div>

              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center gap-4">
                  <span>Asked by {question.author.name}</span>
                  <span>{formatDate(question.createdAt)}</span>
                  <span>{question.views} views</span>
                </div>
                {question.isResolved && (
                  <span className="text-green-600 font-medium">✓ Solved</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {question.answerCount} Answer{question.answerCount !== 1 ? 's' : ''}
          </h2>

          {question.answers.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-2">🤔</div>
              <p className="text-gray-600">No answers yet. Be the first to help!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {question.answers.map((answer) => (
                <div
                  key={answer._id}
                  className={`bg-white rounded-lg border p-6 ${
                    answer.isBestAnswer ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Vote Controls */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleVote('upvote', 'answer', answer._id)}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                      >
                        ▲
                      </button>
                      <span className="text-lg font-bold text-gray-900 my-1">
                        {answer.upvotes.length - answer.downvotes.length}
                      </span>
                      <button
                        onClick={() => handleVote('downvote', 'answer', answer._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      {answer.isBestAnswer && (
                        <div className="mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            ✓ Best Answer
                          </span>
                        </div>
                      )}
                      
                      <div className="prose max-w-none mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
                      </div>

                      {/* Answer Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Answered by {answer.author.name}</span>
                          <span>{formatDate(answer.createdAt)}</span>
                        </div>
                        
                        {/* Mark as Best Answer Button */}
                        {!answer.isBestAnswer && 
                         (question.author.name === user?.name || user?.role === 'admin') && (
                          <button
                            onClick={() => handleMarkBestAnswer(answer._id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark as Best Answer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answer Form */}
        {!question.isResolved && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your answer here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical mb-4"
                required
              />
              <button
                type="submit"
                disabled={submittingAnswer}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {submittingAnswer ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPage; 