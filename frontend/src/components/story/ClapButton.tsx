import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clapping01Icon } from '@hugeicons/core-free-icons';
import { api } from '../../services/api';

interface ClapButtonProps {
  blogId: string;
  initialCount: number;
}

export const ClapButton: React.FC<ClapButtonProps> = ({ blogId, initialCount }) => {
  const [count, setCount] = useState(initialCount);
  const [userClaps, setUserClaps] = useState(0);
  const [isClapping, setIsClapping] = useState(false);

  const handleClap = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (userClaps >= 50) return;

    const newTotal = count + 1;
    const newUserClaps = userClaps + 1;
    setCount(newTotal);
    setUserClaps(newUserClaps);
    setIsClapping(true);

    setTimeout(() => setIsClapping(false), 200);

    // Confetti on increments of 10 or first clap
    if (newUserClaps === 1 || newUserClaps % 10 === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: ['#22c55e', '#10b981', '#3b82f6', '#f59e0b'],
      });
    }

    try {
      await api.clapBlog(blogId, 1);
    } catch (err) {
      console.error('Failed to register clap:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClap}
      className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
        userClaps > 0
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
      } ${isClapping ? 'scale-110' : 'scale-100'}`}
      title="Clap to show appreciation (up to 50 times)"
    >
      <HugeiconsIcon
        icon={Clapping01Icon}
        size={20}
        className="transition-transform group-hover:scale-125 text-emerald-600 dark:text-emerald-400"
      />
      <span className="text-sm font-semibold">{count}</span>
      {userClaps > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold animate-in fade-in">
          +{userClaps}
        </span>
      )}
    </button>
  );
};
