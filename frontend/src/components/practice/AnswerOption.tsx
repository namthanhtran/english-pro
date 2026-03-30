import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnswerOptionProps {
  label: string;
  state: 'idle' | 'selected-correct' | 'selected-incorrect' | 'unselected-correct' | 'unselected';
  onClick: () => void;
  disabled: boolean;
}

export function AnswerOption({ label, state, onClick, disabled }: AnswerOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left px-6 py-4 rounded-xl border-2 font-medium transition-all duration-300 transform outline-none flex items-center justify-between',
        state === 'idle' && !disabled && 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md hover:-translate-y-1',
        state === 'idle' && disabled && 'border-slate-200 bg-white opacity-50 cursor-not-allowed',
        state === 'selected-correct' && 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 scale-[1.02]',
        state === 'selected-incorrect' && 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 scale-[0.98]',
        state === 'unselected-correct' && 'border-emerald-500 bg-white text-emerald-900 opacity-70',
        state === 'unselected' && 'border-slate-200 bg-slate-50 opacity-40'
      )}
    >
      <span className="text-lg">{label}</span>
      {state === 'selected-correct' && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in duration-300" />}
      {state === 'selected-incorrect' && <XCircle className="w-6 h-6 text-rose-500 animate-in zoom-in duration-300" />}
      {state === 'unselected-correct' && <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />}
    </button>
  );
}
