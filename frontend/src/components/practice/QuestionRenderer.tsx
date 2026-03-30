import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

export function QuestionRenderer({ question, onAnswer }: { question: any, onAnswer: (id: number, ans: string) => void }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOption(null);
  }, [question]);

  const handleSelect = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    onAnswer(question.wordId, option);
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 text-center flex flex-col items-center">
        <div className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-4">What does this mean?</div>
        <h2 className="text-3xl font-bold text-slate-800 leading-snug">{question.question}</h2>

      </div>

      <div className="space-y-3">
        {question.options.map((opt: string, i: number) => {
          const isSelected = selectedOption === opt;
          const isRight = isSelected && opt === question.correctAnswer;
          const isWrong = isSelected && opt !== question.correctAnswer;
          return (
            <button
              key={i}
              disabled={selectedOption !== null}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full text-left px-6 py-4 rounded-xl border-2 font-medium transition-all duration-300 flex items-center justify-between outline-none",
                !selectedOption ? "border-slate-200 bg-white hover:border-indigo-400 hover:-translate-y-1 shadow-sm" : "opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed",
                isRight && "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 scale-[1.02] opacity-100 shadow-md",
                isWrong && "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 scale-[1.02] opacity-100 shadow-md",
              )}
            >
              <span className="text-lg">{opt}</span>
              {isRight && <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in shrink-0" />}
              {isWrong && <XCircle className="w-6 h-6 text-rose-500 animate-in zoom-in shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
