import { Trophy, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PracticeResultSummary({ result, onRetry }: { result: any, onRetry: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* Hero Badge */}
      <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-8 border-4 border-white transform hover:scale-110 transition-transform">
        <Trophy className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">Session Complete</h2>
      <p className="text-slate-500 text-lg mb-12 font-medium">Your global mastery has been updated.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-12">
        <StatCard icon={Target} value={`${result.score}%`} label="Score" color="text-indigo-500" />
        <StatCard icon={Clock} value={`${result.completionTime}s`} label="Time" color="text-amber-500" />
        <StatCard icon={CheckCircle2} value={result.correctCount} label="Correct" color="text-emerald-500" />
        <StatCard icon={XCircle} value={result.incorrectCount} label="Incorrect" color="text-rose-500" />
      </div>

      {/* Review List - Only show mistakes if there are any */}
      {result.results?.filter((r: any) => !r.isCorrect).length > 0 && (
        <div className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-12">
          <h3 className="font-bold text-slate-800 text-xl mb-4 border-b border-slate-100 pb-4">Words to Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.results.filter((r: any) => !r.isCorrect).map((r: any, i: number) => (
              <div key={i} className="flex flex-col bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-900">{r.correctAnswer}</span>
                <span className="text-sm text-slate-500 mt-1 line-through opacity-70">You chose: {r.userAnswer || 'skipped'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <button 
        onClick={onRetry} 
        className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xl shadow-xl flex items-center transform hover:-translate-y-1 transition-all"
      >
        <RotateCcw className="w-6 h-6 mr-3" /> Go Again
      </button>
    </div>
  );
}

function Target(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
}

function StatCard({ icon: Icon, value, label, color }: { icon: any, value: any, label: string, color: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className={cn("absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-10 bg-current transition-transform group-hover:scale-150", color)} />
      <Icon className={cn("w-8 h-8 mb-3", color)} />
      <div className="text-4xl font-black text-slate-800 tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">{label}</div>
    </div>
  );
}
