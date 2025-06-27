import React, { useState, useEffect } from 'react';
import StudentTrackSelect from './StudentTrackSelect';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [studentTrack, setStudentTrack] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = async (track: string | null) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz`, {
        headers: {},
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        // Filter quizzes by track (description field)
        setQuizzes(data.data.filter((q: any) => q.description === track));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const track = localStorage.getItem('studentTrack');
    setStudentTrack(track);
    if (track) fetchQuizzes(track);
  }, [studentTrack]);

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (!selected) return;
    const quiz = quizzes[current];
    const correct = quiz.questions[0]?.options[quiz.questions[0]?.correctAnswer];
    if (selected === correct) {
      setScore(score + 1);
    }
    setSelected('');
    if (current + 1 < quizzes.length) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected('');
  };

  if (!studentTrack) {
    return <StudentTrackSelect onTrackSelected={setStudentTrack} />;
  }

  if (loading) {
    return <div className="p-4 text-white bg-gray-900 min-h-screen">Loading quizzes...</div>;
  }

  if (quizzes.length === 0) {
    return <div className="p-4 text-white bg-gray-900 min-h-screen">No quizzes available for your track.</div>;
  }

  if (showResult) {
    return (
      <div className="p-4 text-white bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Quiz Result</h1>
        <p className="mb-2">Your score: {score} / {quizzes.length}</p>
        <button className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2 mt-2" onClick={handleRestart}>Restart Quiz</button>
      </div>
    );
  }

  const quiz = quizzes[current];
  const options = quiz.questions[0]?.options || [];

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Quiz</h1>
      <div className="mb-4">
        <div className="mb-2 font-semibold">Q{current + 1}: {quiz.questions[0]?.question || quiz.title} <span className="text-xs text-gray-400 ml-2">[{quiz.description}]</span></div>
        <div className="flex flex-col gap-2">
          {options.map((opt: string, idx: number) => (
            <label key={idx} className={`p-2 rounded cursor-pointer ${selected === opt ? 'bg-blue-700' : 'bg-gray-700'}`}>
              <input
                type="radio"
                name="option"
                value={opt}
                checked={selected === opt}
                onChange={() => handleSelect(opt)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={handleNext}
        className="bg-green-600 hover:bg-green-700 rounded px-3 py-2 mt-2"
        disabled={!selected}
      >
        {current + 1 === quizzes.length ? 'Finish' : 'Next'}
      </button>
    </div>
  );
};

export default QuizPage; 