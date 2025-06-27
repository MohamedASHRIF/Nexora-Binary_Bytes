import React, { useState } from 'react';

const StudentTrackSelect = ({ onTrackSelected }: { onTrackSelected?: (track: string) => void }) => {
  const [track, setTrack] = useState(localStorage.getItem('studentTrack') || '');

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setTrack(selected);
    localStorage.setItem('studentTrack', selected);
    if (onTrackSelected) onTrackSelected(selected);
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Select Your Track</h1>
      <select
        value={track}
        onChange={handleSelect}
        className="p-2 rounded bg-gray-700 text-lg"
      >
        <option value="">-- Choose Track --</option>
        <option value="IT">💻 IT</option>
        <option value="AI">🤖 AI</option>
        <option value="Design">🎨 Design</option>
      </select>
      {track && <div className="mt-4 text-green-400">Selected: {track}</div>}
    </div>
  );
};

export default StudentTrackSelect; 