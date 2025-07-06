import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const initialFormState = {
  question: '',
  track: 'IT',
  optionCount: 2,
  options: ['', ''],
  answer: '',
};

const AdminQuizEntry = () => {
  const [form, setForm] = useState(initialFormState);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editOriginal, setEditOriginal] = useState<any | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    let headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch quizzes.' });
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Form handlers
  const handleFormChange = (field: string, value: any) => {
    if (field === 'optionCount') {
      let count = parseInt(value, 10);
      if (isNaN(count) || count < 2) count = 2;
    if (count > 5) count = 5;
      let newOptions = [...form.options];
      while (newOptions.length < count) newOptions.push('');
      while (newOptions.length > count) newOptions.pop();
      setForm({ ...form, optionCount: count, options: newOptions });
    } else if (field.startsWith('option-')) {
      const idx = parseInt(field.split('-')[1], 10);
      let newOptions = [...form.options];
      newOptions[idx] = value;
      setForm({ ...form, options: newOptions });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  // Add or update quiz
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question || !form.answer || form.options.some(opt => !opt)) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (!form.options.includes(form.answer.trim())) {
      setMessage({ type: 'error', text: 'The answer must exactly match one of the options.' });
      return;
    }
    const quizPayload = {
      title: form.question,
      faculty: form.track,
      questions: [
        {
          question: form.question,
          options: form.options,
          correctAnswer: form.options.findIndex(opt => opt === form.answer.trim()),
        },
      ],
    };
    setLoading(true);
    try {
      let res;
      if (editId) {
        // Update
        res = await fetch(`${API_URL}/quiz/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
          body: JSON.stringify(quizPayload),
        });
      } else {
        // Add
        res = await fetch(`${API_URL}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          credentials: 'include',
          body: JSON.stringify(quizPayload),
        });
      }
      if (res.ok) {
        await fetchQuizzes();
        setForm(initialFormState);
        setEditId(null);
        setEditOriginal(null);
        setMessage({ type: 'success', text: editId ? 'Quiz updated!' : 'Quiz added!' });
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save quiz.' });
        // Clear error message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit quiz
  const handleEdit = (quiz: any) => {
    setEditId(quiz._id);
    setEditOriginal(quiz);
    setForm({
      question: quiz.questions[0]?.question || quiz.title,
      track: quiz.faculty,
      optionCount: quiz.questions[0]?.options.length || 2,
      options: [...quiz.questions[0]?.options],
      answer: quiz.questions[0]?.options[quiz.questions[0]?.correctAnswer] || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditId(null);
    setEditOriginal(null);
    setForm(initialFormState);
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (quizId: string, quizTitle: string) => {
    setDeleteTarget({ id: quizId, title: quizTitle });
    setShowDeleteModal(true);
  };

  // Delete quiz
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    setShowDeleteModal(false);
    try {
      const res = await fetch(`${API_URL}/quiz/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        await fetchQuizzes();
        setMessage({ type: 'success', text: 'Quiz deleted.' });
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete quiz.' });
        // Clear error message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      }
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Delete all quizzes
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all quizzes?')) return;
    setLoading(true);
    try {
      for (const quiz of quizzes) {
        await fetch(`${API_URL}/quiz/${quiz._id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
      }
      await fetchQuizzes();
      setMessage({ type: 'success', text: 'All quizzes deleted.' });
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Group quizzes by faculty
  const groupQuizzesByFaculty = () => {
    const grouped = quizzes.reduce((acc, quiz) => {
      const faculty = quiz.faculty || 'Unknown';
      if (!acc[faculty]) {
        acc[faculty] = [];
      }
      acc[faculty].push(quiz);
      return acc;
    }, {} as Record<string, any[]>);
    return grouped;
  };

  const getFacultyColor = (faculty: string) => {
    switch (faculty) {
      case 'IT': return 'bg-blue-600 text-blue-100';
      case 'AI': return 'bg-purple-600 text-purple-100';
      case 'Design': return 'bg-green-600 text-green-100';
      default: return 'bg-gray-600 text-gray-100';
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
    <div className="p-4 bg-white text-gray-900 min-h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">🛠️ Admin: Quiz Management</h1>
      <div className="w-full max-w-xl mb-8">
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg shadow-lg p-6 space-y-4 border border-gray-300">
          <h2 className="text-lg font-semibold mb-2">{editId ? 'Edit Quiz' : 'Add New Quiz'}</h2>
          {message && (
            <div className={`rounded px-3 py-2 mb-2 text-sm ${message.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{message.text}</div>
          )}
          <div>
            {/* <label className="block mb-1 font-medium">Question<span className="text-red-400">*</span></label> */}
        <input
          type="text"
              value={form.question}
              onChange={e => handleFormChange('question', e.target.value)}
          placeholder="Enter quiz question"
              className="w-full p-2 rounded bg-white border border-gray-300"
              required
        />
          </div>
          <div>
            {/* <label className="block mb-1 font-medium">Faculty<span className="text-red-400">*</span></label> */}
        <select
              value={form.track}
              onChange={e => handleFormChange('track', e.target.value)}
              className="w-full p-2 rounded bg-white border border-gray-300"
              required
        >
          <option value="IT">💻 IT</option>
          <option value="AI">🤖 AI</option>
          <option value="Design">🎨 Design</option>
        </select>
          </div>
          <div>
            {/* <label className="block mb-1 font-medium">Number of Options<span className="text-red-400">*</span></label> */}
        <input
          type="number"
              value={form.optionCount}
          min={2}
          max={5}
              onChange={e => handleFormChange('optionCount', e.target.value)}
              className="w-full p-2 rounded bg-white border border-gray-300"
              required
        />
          </div>
          <div>
            {/* <label className="block mb-1 font-medium">Options<span className="text-red-400">*</span></label> */}
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            value={opt}
                    onChange={e => handleFormChange(`option-${idx}`, e.target.value)}
            placeholder={`Option ${idx + 1}`}
                    className="w-full p-2 rounded bg-white border border-gray-300"
                    required
          />
        ))}
            </div>
          </div>
          <div>
            {/* <label className="block mb-1 font-medium">Correct Answer<span className="text-red-400">*</span></label> */}
        <input
          type="text"
              value={form.answer}
              onChange={e => handleFormChange('answer', e.target.value)}
          placeholder="Enter correct answer exactly"
              className="w-full p-2 rounded bg-white border border-gray-300"
              required
        />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 rounded px-4 py-2 font-semibold"
              disabled={loading}
            >
              {editId ? 'Update Quiz' : 'Add Quiz'}
            </button>
            {editId && (
        <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 rounded px-4 py-2 font-semibold"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel Edit
        </button>
            )}
        <button
              type="button"
              className="bg-red-600 hover:bg-red-700 rounded px-4 py-2 font-semibold ml-auto"
          onClick={handleClearAll}
              disabled={loading}
        >
          🗑️ Clear All Quizzes
        </button>
      </div>
        </form>
      </div>
      <div className="w-full max-w-4xl">
        <h2 className="text-lg font-semibold mb-4">📚 Existing Quizzes (Grouped by Faculty):</h2>
        {loading ? <p>Loading...</p> : quizzes.length === 0 ? (
          <p>No quizzes added yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupQuizzesByFaculty()).map(([faculty, facultyQuizzes]) => (
              <div key={faculty} className="border border-gray-300 rounded-lg overflow-hidden">
                <div className={`px-4 py-3 ${getFacultyColor(faculty)} border-b border-gray-300`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getFacultyIcon(faculty)}</span>
                    <h3 className="font-semibold">{faculty} Faculty</h3>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                      {(facultyQuizzes as any[]).length} quiz{(facultyQuizzes as any[]).length !== 1 ? 'zes' : ''}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {(facultyQuizzes as any[]).map((q: any, idx: number) => (
                    <div key={q._id || idx} className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{q.questions[0]?.question || q.title}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getFacultyColor(faculty)}`}>
                          {q.faculty}
                        </span>
                      </div>
                                              <div className="ml-4 text-sm space-y-1">
                          {q.questions[0]?.options?.map((opt: string, oidx: number) => (
                            <div key={oidx} className="text-gray-700">
                              {oidx + 1}. {opt}
                            </div>
                  ))}
                        <span className="text-green-400 font-medium">
                          ✅ Answer: {q.questions[0]?.options?.[q.questions[0]?.correctAnswer]}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3 justify-end">
                        <button
                          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm font-semibold"
                          onClick={() => handleEdit(q)}
                          disabled={loading}
                        >
                          Modify
                        </button>
                        <button
                          className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm font-semibold"
                          onClick={() => showDeleteConfirmation(q._id, q.questions[0]?.question || q.title)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Quiz</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the quiz "<span className="font-semibold">{deleteTarget?.title}</span>"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizEntry; 