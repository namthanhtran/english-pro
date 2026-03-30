import { Trophy, Target, Clock, CheckCircle2, XCircle } from 'lucide-react';

export function PracticeResultSummary({ result, onClose }: { result: any, onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500 bg-slate-50 relative z-50">
      <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl mb-6">
        <Trophy className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-4xl font-black text-slate-800 mb-8">Practice Complete!</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <Target className="w-6 h-6 text-indigo-500 mb-2" />
          <div className="text-3xl font-bold">{result.score}%</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Score</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <Clock className="w-6 h-6 text-amber-500 mb-2" />
          <div className="text-3xl font-bold">{result.completionTime}s</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Time</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
          <div className="text-3xl font-bold">{result.correctCount}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Correct</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <XCircle className="w-6 h-6 text-rose-500 mb-2" />
          <div className="text-3xl font-bold">{result.incorrectCount}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Incorrect</div>
        </div>
      </div>

      <button onClick={onClose} className="px-12 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5">
        Return to Lesson
      </button>
    </div>
  );
}
