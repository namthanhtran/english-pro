import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, Clock, CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface ResultSummaryProps {
  score: number;
  timeTaken: number;
  correctAnswers: number;
  incorrectAnswers: number;
  onClose: () => void;
}

export function ResultSummary({ score, timeTaken, correctAnswers, incorrectAnswers, onClose }: ResultSummaryProps) {
  const isPerfect = score === 100;
  const isGood = score >= 80;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-8">
        <Trophy className="w-12 h-12 text-white" />
      </div>

      <h2 className="text-4xl font-black text-slate-800 mb-2">Practice Complete!</h2>
      <p className="text-lg text-slate-500 mb-10">
        {isPerfect ? "Flawless victory! You've mastered these words." : isGood ? "Great job! Almost perfect." : "Good effort. Keep practicing!"}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <Target className="w-6 h-6 text-indigo-500 mb-2" />
          <div className="text-3xl font-bold text-slate-800">{score}%</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Score</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <Clock className="w-6 h-6 text-amber-500 mb-2" />
          <div className="text-3xl font-bold text-slate-800">{timeTaken}s</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Time</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
          <div className="text-3xl font-bold text-slate-800">{correctAnswers}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Correct</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <XCircle className="w-6 h-6 text-rose-500 mb-2" />
          <div className="text-3xl font-bold text-slate-800">{incorrectAnswers}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Incorrect</div>
        </div>
      </div>

      <Button size="lg" className="w-full md:w-auto px-12 h-14 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20" onClick={onClose}>
        Return to Lesson
      </Button>
    </div>
  );
}
