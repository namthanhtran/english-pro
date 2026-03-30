import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { QuestionCard } from './QuestionCard';
import { AnswerOption } from './AnswerOption';
import { ResultSummary } from './ResultSummary';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  wordId: number;
  question: string;
  example?: string | null;
  options: string[];
}

interface PracticeBoardProps {
  lessonId: number;
  onExit: () => void;
}

export function PracticeBoard({ lessonId, onExit }: PracticeBoardProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ wordId: number; answer: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionResult, setSessionResult] = useState<any>(null);
  
  // UX state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadQuestions();
  }, [lessonId]);

  async function loadQuestions() {
    setIsLoading(true);
    const { success, data, error } = await apiClient.get<Question[]>(`/lessons/${lessonId}/practice`);
    if (!success || !data) {
      toast.error(error || 'Failed to load practice questions');
      onExit();
      return;
    }
    setQuestions(data);
    setStartTime(Date.now());
    setIsLoading(false);
  }

  async function submitSession(finalAnswers: typeof answers) {
    setIsSubmitting(true);
    const completionTime = Math.round((Date.now() - startTime) / 1000);
    const { success, data, error } = await apiClient.post(`/lessons/${lessonId}/practice/submit`, {
      completionTime,
      answers: finalAnswers
    });

    if (!success || !data) {
      toast.error(error || 'Failed to submit practice');
      onExit();
      return;
    }

    setSessionResult(data);
    setIsSubmitting(false);
  }

  function handleSelectOption(option: string) {
    if (selectedOption || isTransitioning) return;
    
    setSelectedOption(option);
    const currentQ = questions[currentIndex];
    
    // We don't know the exact answer securely without checking backend, but for immediate UX
    // Oh wait, getPractice endpoint doesn't return the correct option to prevent cheating.
    // So we just show "Selected" state and move to next question.
    // The instructions say "Instant Feedback: When an answer is selected, provide immediate visual feedback (e.g., color changes, micro-interactions) before moving to the next question."
    // So we will just show it as selected, wait 500ms, and move on.
    
    setIsTransitioning(true);
    const newAnswers = [...answers, { wordId: currentQ.wordId, answer: option }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsTransitioning(false);
      } else {
        submitSession(newAnswers);
      }
    }, 600);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium tracking-wide">Preparing your questions...</p>
      </div>
    );
  }

  if (sessionResult) {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <ResultSummary
          score={sessionResult.score}
          timeTaken={sessionResult.completionTime}
          correctAnswers={sessionResult.correctCount}
          incorrectAnswers={sessionResult.incorrectCount}
          onClose={onExit}
        />
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative h-full">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-10 w-full">
        <div className="w-64">
          <div className="text-sm font-semibold text-slate-500 mb-2 tracking-wide uppercase">Progress</div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="font-bold tracking-widest text-slate-400">
          {currentIndex + 1} <span className="opacity-50">/</span> {questions.length}
        </div>
        <button 
          onClick={onExit}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area - ensures Zero CLS with fixed sizing classes and flex constraints */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto w-full relative">
        <div className={`w-full max-w-2xl transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'}`}>
          <QuestionCard question={currentQ.question} example={currentQ.example} />
          
          <div className="space-y-3 mt-8">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let state: any = 'idle';
              if (selectedOption) {
                state = isSelected ? 'selected-correct' : 'unselected';
                // Note: we're using 'selected-correct' style (emerald) for the selection action 
                // to give positive feedback before moving to next question, 
                // actual correct/incorrect is shown in summary.
              }

              return (
                <AnswerOption
                  key={i}
                  label={opt}
                  state={state}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(opt)}
                />
              );
            })}
          </div>
        </div>
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="font-medium tracking-wide text-slate-600">Analyzing your answers...</p>
          </div>
        )}
      </div>
    </div>
  );
}
