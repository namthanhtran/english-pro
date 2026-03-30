import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { QuestionRenderer } from './QuestionRenderer';
import { PracticeResultSummary } from './PracticeResultSummary';
import { apiClient } from '@/lib/api';

type SessionStatus = 'idle' | 'playing' | 'submitting' | 'finished';

export function PracticeSessionLayout({ lessonId, onClose }: { lessonId: number, onClose: () => void }) {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [sessionResult, setSessionResult] = useState<any>(null);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    async function loadQuestions() {
      const res = await apiClient.get<any[]>(`/lessons/${lessonId}/practice`);
      if (res.success && res.data) {
        setQuestions(res.data);
        setSessionStatus('playing');
        setStartTime(Date.now());
      }
    }
    loadQuestions();
  }, [lessonId]);

  const handleAnswerSubmit = async (wordId: number, answer: string) => {
    const newAnswers = { ...userAnswers, [wordId]: answer };
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 600);
    } else {
      setSessionStatus('submitting');
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      const payload = Object.entries(newAnswers).map(([wId, ans]) => ({
        wordId: Number(wId), answer: ans
      }));
      
      const res = await apiClient.post(`/lessons/${lessonId}/practice/submit`, {
        completionTime, answers: payload
      });

      if (res.success) {
        setSessionResult(res.data);
        setSessionStatus('finished');
      }
    }
  };

  if (sessionStatus === 'idle') {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  }

  if (sessionStatus === 'finished') {
    return <PracticeResultSummary result={sessionResult} onClose={onClose} />;
  }

  const progressPercent = (currentQuestionIndex / questions.length) * 100;
  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex-1 flex flex-col w-full relative h-full">
      <div className="p-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="w-64">
           <div className="text-sm font-semibold text-slate-500 mb-2 tracking-wide uppercase">Progress</div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
           </div>
        </div>
        <div className="font-bold tracking-widest text-slate-400">
          {currentQuestionIndex + 1} <span className="opacity-50">/</span> {questions.length}
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800"><X className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-slate-50">
        <QuestionRenderer question={currentQ} onAnswer={handleAnswerSubmit} />
        
        {sessionStatus === 'submitting' && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="font-bold text-slate-600">Grading your answers...</p>
          </div>
        )}
      </div>
    </div>
  );
}
