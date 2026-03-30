'use client';

import { useState } from 'react';
import { GlobalPracticeSetup } from '@/components/global-practice/GlobalPracticeSetup';
import { QuizEngine } from '@/components/global-practice/QuizEngine';
import { PracticeResultSummary } from '@/components/global-practice/PracticeResultSummary';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PracticeState = 'setup' | 'playing' | 'results';

export default function PracticePage() {
  const [currentState, setCurrentState] = useState<PracticeState>('setup');
  const [quizDetails, setQuizDetails] = useState<{ mode: string; limit: number } | null>(null);
  const [sessionResult, setSessionResult] = useState<any>(null);

  const startPractice = (mode: string, limit: number) => {
    setQuizDetails({ mode, limit });
    setCurrentState('playing');
  };

  const finishPractice = (result: any) => {
    setSessionResult(result);
    setCurrentState('results');
  };

  const resetPractice = () => {
    setQuizDetails(null);
    setSessionResult(null);
    setCurrentState('setup');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="w-full bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <Logo />
        </div>
        <div className="text-sm font-bold text-slate-800 tracking-widest uppercase opacity-40">
          Global Practice
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative p-4 w-full h-[calc(100vh-73px)] overflow-hidden">
        {currentState === 'setup' && (
          <GlobalPracticeSetup onStart={startPractice} />
        )}
        
        {currentState === 'playing' && quizDetails && (
          <QuizEngine 
            mode={quizDetails.mode} 
            limit={quizDetails.limit} 
            onFinish={finishPractice} 
          />
        )}

        {currentState === 'results' && sessionResult && (
          <PracticeResultSummary result={sessionResult} onRetry={resetPractice} />
        )}
      </main>
    </div>
  );
}
