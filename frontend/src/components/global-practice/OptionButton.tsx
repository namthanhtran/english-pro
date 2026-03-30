import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

export function OptionButton({ text, isSelected, isCorrect, isDisabled, onClick }: { 
  text: string, 
  isSelected: boolean,
  isCorrect: boolean,
  isDisabled: boolean,
  onClick: () => void 
}) {
  const isWrong = isSelected && !isCorrect;
  const isRight = isSelected && isCorrect;

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "w-full text-left px-8 py-6 rounded-2xl border-2 font-bold text-xl transition-all duration-300 flex items-center justify-between outline-none",
        !isDisabled 
          ? "border-slate-200 bg-white hover:border-indigo-400 hover:-translate-y-1 shadow-sm text-slate-700 hover:text-indigo-900" 
          : "opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400",
        isRight && "border-emerald-500 bg-emerald-50 text-emerald-900 ring-4 ring-emerald-500/20 scale-[1.02] opacity-100 shadow-md",
        isWrong && "border-rose-500 bg-rose-50 text-rose-900 ring-4 ring-rose-500/20 scale-[1.02] opacity-100 shadow-md",
      )}
    >
      <span>{text}</span>
      {isRight && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in shrink-0" />}
      {isWrong && <XCircle className="w-6 h-6 text-rose-500 animate-in zoom-in shrink-0" />}
    </button>
  );
}
