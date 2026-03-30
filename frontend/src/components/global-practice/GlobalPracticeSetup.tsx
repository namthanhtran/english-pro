import { useState } from 'react';
import { BrainCircuit, Zap, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalPracticeSetup({ onStart }: { onStart: (mode: string, limit: number) => void }) {
  const [mode, setMode] = useState<string>('all');
  const [limit, setLimit] = useState<number>(20);

  const modes = [
    { id: 'all', title: 'Review All Learned', icon: BrainCircuit, color: 'text-indigo-500' },
    { id: 'weak', title: 'Focus on Weak Words', icon: Zap, color: 'text-amber-500' },
    { id: 'random', title: 'Randomized Mix', icon: Shuffle, color: 'text-emerald-500' },
  ];

  return (
    <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-500">
      <h1 className="text-4xl font-black text-slate-900 text-center mb-2">Practice Session</h1>
      <p className="text-slate-500 text-center mb-10 text-lg">Configure your global test parameters to begin.</p>
      
      <div className="space-y-4 mb-10">
        <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Select Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map(m => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all",
                  isSelected 
                    ? "border-indigo-500 bg-indigo-50/50 shadow-md transform -translate-y-1" 
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-8 h-8", m.color, isSelected ? "opacity-100" : "opacity-60")} />
                <span className={cn("font-bold text-sm", isSelected ? "text-indigo-900" : "text-slate-600")}>
                  {m.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Question Limit</h3>
        <div className="flex gap-4">
          {[10, 20, 50, 100].map(val => (
            <button
              key={val}
              onClick={() => setLimit(val)}
              className={cn(
                "flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all",
                limit === val
                  ? "border-slate-800 bg-slate-800 text-white shadow-md transform -translate-y-1"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(mode, limit)}
        className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1 transition-all"
      >
        Start Practice
      </button>
    </div>
  );
}
