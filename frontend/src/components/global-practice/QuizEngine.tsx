import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { OptionButton } from './OptionButton';

interface Question {
  wordId: number;
  question: string;
  example: string | null;
  correctAnswer: string;
  options: string[];
}

export function QuizEngine({ mode, limit, onFinish }: { mode: string, limit: number, onFinish: (res: any) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ wordId: number, answer: string }[]>([]);
  const [status, setStatus] = useState<'loading' | 'playing' | 'submitting' | 'error'>('loading');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await apiClient.get<Question[]>(`/practice/generate?mode=${mode}&limit=${limit}`);
      if (res.success && res.data) {
        setQuestions(res.data);
        setStatus('playing');
        setStartTime(Date.now());
      } else {
        setStatus('error');
      }
    }
    load();
  }, [mode, limit]);

  const handleSelect = (opt: string) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    
    const currentQ = questions[currentIndex];
    const newAnswers = [...answers, { wordId: currentQ.wordId, answer: opt }];
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedOpt(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        submitQuiz(newAnswers);
      }
    }, 600);
  };

  const submitQuiz = async (finalAnswers: any[]) => {
    setStatus('submitting');
    const compTime = Math.round((Date.now() - startTime) / 1000);
    const res = await apiClient.post('/practice/evaluate', {
      completionTime: compTime,
      answers: finalAnswers
    });
    if (res.success) {
      onFinish(res.data);
    } else {
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <div className="flex flex-col items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" /><p className="font-bold text-slate-500 animate-pulse">Generating your custom test...</p></div>;
  }
  if (status === 'error') {
    return <div className="text-red-500 font-bold">Failed to load quiz. Do you have enough vocabulary added?</div>;
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="w-full max-w-3xl flex flex-col items-center h-full relative p-4">
      {/* Absolute Loading overlay to avoid CLS when submitting */}
      {status === 'submitting' && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
          <Loader2 className="w-14 h-14 animate-spin text-indigo-600 mb-4" />
          <p className="font-black text-xl text-slate-800 tracking-wide">Evaluating results...</p>
        </div>
      )}

      {/* Progress Header */}
      <div className="w-full flex items-center justify-between mb-8 z-10">
        <div className="flex-1 mr-6">
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="font-black text-slate-400 tracking-widest text-lg">
          {currentIndex + 1} <span className="text-slate-300">/</span> {questions.length}
        </div>
      </div>

      {/* Fixed height container for question to prevent CLS */}
      <div className="flex-1 w-full max-w-2xl flex flex-col max-h-[600px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="p-8 md:p-12 text-center flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">What is the meaning of...</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">{currentQ.question}</h2>

        </div>
      </div>

      {/* Options Grid */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {currentQ.options.map((opt, i) => (
          <OptionButton 
            key={i} 
            text={opt} 
            isSelected={selectedOpt === opt}
            isCorrect={opt === currentQ.correctAnswer}
            isDisabled={selectedOpt !== null}
            onClick={() => handleSelect(opt)} 
          />
        ))}
      </div>
    </div>
  );
}
