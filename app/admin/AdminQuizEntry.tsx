import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AdminQuizEntry = () => {
  const [question, setQuestion] = useState('');
  const [track, setTrack] = useState('IT');
  const [optionCount, setOptionCount] = useState(2);
  const [options, setOptions] = useState(['', '']);
  const [answer, setAnswer] = useState('');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleOptionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || isNaN(Number(val))) {
      setOptionCount(2);
      const updatedOptions = [...options];
      while (updatedOptions.length < 2) updatedOptions.push('');
      while (updatedOptions.length > 2) updatedOptions.pop();
      setOptions(updatedOptions);
      return;
    }
    let count = parseInt(val, 10);
    if (isNaN(count)) count = 2;
    if (count > 5) count = 5;
    if (count < 2) count = 2;
    setOptionCount(count);
    const updatedOptions = [...options];
    while (updatedOptions.length < count) updatedOptions.push('');
    while (updatedOptions.length > count) updatedOptions.pop();
    setOptions(updatedOptions);
  };

  const handleOptionChange = (idx: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[idx] = value;
    setOptions(updatedOptions);
  };

  const handleAddQuiz = async () => {
    if (!question || !answer || options.some(opt => !opt)) {
      alert('Please fill in all fields.');
      return;
    }
    if (!options.includes(answer.trim())) {
      alert('The answer must exactly match one of the options.');
      return;
    }
    const newQuiz = {
      title: question,
      description: track,
      questions: [
        {
          question,
          options,
          correctAnswer: options.findIndex(opt => opt === answer.trim()),
        },
      ],
    };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(newQuiz),
      });
      if (res.ok) {
        await fetchQuizzes();
        setQuestion('');
        setOptions(Array(optionCount).fill(''));
        setAnswer('');
        alert(`Quiz for ${track} added successfully!`);
      } else {
        alert('Failed to add quiz.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all quizzes?')) {
      setLoading(true);
      try {
        for (const quiz of quizzes) {
          await fetch(`${API_URL}/quiz/${quiz._id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include',
          });
        }
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">🛠️ Admin: Add Flexible Quiz</h1>
      <div className="flex flex-col gap-2 max-w-md w-full">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Enter quiz question"
          className="p-2 rounded bg-gray-700"
        />
        <select
          value={track}
          onChange={e => setTrack(e.target.value)}
          className="p-2 rounded bg-gray-700"
        >
          <option value="IT">💻 IT</option>
          <option value="AI">🤖 AI</option>
          <option value="Design">🎨 Design</option>
        </select>
        <input
          type="number"
          value={optionCount}
          min={2}
          max={5}
          onChange={handleOptionCountChange}
          placeholder="Number of options (2-5)"
          className="p-2 rounded bg-gray-700"
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            className="p-2 rounded bg-gray-700"
          />
        ))}
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Enter correct answer exactly"
          className="p-2 rounded bg-gray-700"
        />
        <button
          onClick={handleAddQuiz}
          className="bg-green-600 hover:bg-green-700 rounded px-3 py-2 mt-2"
          disabled={loading}
        >
          ➕ Add Quiz
        </button>
        <button
          onClick={handleClearAll}
          className="bg-red-600 hover:bg-red-700 rounded px-3 py-2 mt-2"
          disabled={loading}
        >
          🗑️ Clear All Quizzes
        </button>
      </div>
      <div className="mt-6 w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">📚 Existing Quizzes:</h2>
        {loading ? <p>Loading...</p> : quizzes.length === 0 ? (
          <p>No quizzes added yet.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {quizzes.map((q, idx) => (
              <li key={q._id || idx} className="mb-2">
                <span className="font-semibold">{q.questions[0]?.question || q.title}</span> <span className="text-xs text-gray-400">[{q.description || q.track}]</span>
                <div className="ml-4 text-sm">
                  {q.questions[0]?.options?.map((opt: string, oidx: number) => (
                    <div key={oidx}>{oidx + 1}. {opt}</div>
                  ))}
                  <span className="text-green-400">✅ Answer: {q.questions[0]?.options?.[q.questions[0]?.correctAnswer]}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminQuizEntry; 