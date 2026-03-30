import React from 'react';

interface QuestionCardProps {
  question: string;
  example?: string | null;
}

export function QuestionCard({ question, example }: QuestionCardProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      
      <div className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-4">
        What does this mean?
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center leading-snug max-w-2xl">
        {question}
      </h2>
      
      {example && (
        <div className="mt-6 text-slate-500 italic text-center text-lg max-w-xl bg-slate-50 px-6 py-3 rounded-xl">
          "{example.replace(/_/g, '___')}"
        </div>
      )}
    </div>
  );
}
