import React, { useState } from 'react';

interface SentimentsProps {
  averageSentiment: number;
  sentimentTrend: number[];
}

const winConditions: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const Sentiments: React.FC<SentimentsProps> = ({
  averageSentiment,
  sentimentTrend,
}) => {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState('X Your Turn');
  const [winnerCombo, setWinnerCombo] = useState<number[] | null>(null);

  // Scoreboard state initialized with keys X, O, Draws
  const [score, setScore] = useState<{ X: number; O: number; Draws: number }>({
    X: 0,
    O: 0,
    Draws: 0,
  });

  // Helper: map emoji symbol to player key used in scoreboard
  const symbolToPlayer = (symbol: string) => {
    if (symbol === '❌') return 'X';
    if (symbol === '🔵') return 'O';
    return '';
  };

  const checkWinner = (newBoard: string[]) => {
    for (const condition of winConditions) {
      const [a, b, c] = condition;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[b] === newBoard[c]
      ) {
        setRunning(false);
        const winner = symbolToPlayer(newBoard[a]);
        setStatus(`${winner} Won 🎉`);
        setWinnerCombo(condition);

        if (winner === "X" || winner === "O") {
          setScore(prevScore => ({
            ...prevScore,
            [winner]: (prevScore[winner] ?? 0) + 1,
          }));
        }

        return;
      }
    }

    if (!newBoard.includes('')) {
      setStatus('Game Draw 🤝');
      setRunning(false);

      // Update draws count safely
      setScore(prevScore => ({
        ...prevScore,
        Draws: (prevScore.Draws ?? 0) + 1,
      }));
    }
  };

  const handleClick = (index: number) => {
    if (board[index] || !running) return;

    const newBoard = [...board];
    newBoard[index] = '❌'; // Player X move
    setBoard(newBoard);
    setStatus('O Playing...');
    checkWinner(newBoard);

    setTimeout(() => {
      const emptyIndex = newBoard.findIndex((cell) => cell === '');
      if (emptyIndex !== -1 && running) {
        newBoard[emptyIndex] = '🔵'; // Player O move
        setBoard([...newBoard]);
        checkWinner(newBoard);
        if (running) setStatus('X Your Turn');
      }
    }, 300);
  };

  const restartGame = () => {
    setBoard(Array(9).fill(''));
    setRunning(true);
    setStatus('X Your Turn');
    setWinnerCombo(null);
  };

  const renderCell = (value: string) => {
    return <span className="text-3xl">{value}</span>;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-3 gap-2">
        {board.map((value, index) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 border-2 border-yellow-400 flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 ${
              winnerCombo?.includes(index) ? 'bg-indigo-900 animate-pulse' : ''
            }`}
          >
            {renderCell(value)}
          </div>
        ))}
      </div>

      <div className="mt-4 text-lg font-semibold text-white">{status}</div>

      <button
        onClick={restartGame}
        className="mt-3 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
      >
        Restart
      </button>

      <div className="mt-8 w-full max-w-md bg-slate-700 rounded p-4">
  <h3 className="text-lg font-bold text-white mb-3">Game Insights</h3>

  <div className="text-white">
    <h4 className="font-semibold mb-2">Scoreboard</h4>
    <div className="flex justify-between text-white font-semibold text-lg max-w-xs">
      <div>X You: {score.X}</div>
      <div>O AI: {score.O}</div>
    </div>
  </div>
</div>

    </div>
  );
};
