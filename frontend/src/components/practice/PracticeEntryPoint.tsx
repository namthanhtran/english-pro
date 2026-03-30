import { useState } from 'react';
import { Play } from 'lucide-react';
import { PracticeSessionLayout } from './PracticeSessionLayout';

export function PracticeEntryPoint({ lessonId, wordsCount }: { lessonId: number, wordsCount: number }) {
  const [isPracticeActive, setIsPracticeActive] = useState(false);

  if (wordsCount === 0) return null;

  return (
    <div className="mt-8 pt-4 border-t border-slate-200 flex justify-center">
      <button
        onClick={() => setIsPracticeActive(true)}
        className="flex items-center justify-center w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold tracking-wide transition-all transform hover:-translate-y-0.5"
      >
        <Play className="w-5 h-5 mr-2" />
        Practice Vocabulary
      </button>

      {isPracticeActive && (
        <div className="fixed inset-0 z-50 flex bg-slate-50 overflow-hidden">
          <PracticeSessionLayout 
            lessonId={lessonId} 
            onClose={() => setIsPracticeActive(false)} 
          />
        </div>
      )}
    </div>
  );
}
