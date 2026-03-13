'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service if available
        console.error('Next.js Global Error Boundary Caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center">
                <div className="mb-12">
                    <Logo />
                </div>

                <div className="relative mb-8">
                    {/* Massive 500 Text */}
                    <div className="text-[150px] sm:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-rose-600 to-orange-400 drop-shadow-sm select-none">
                        500
                    </div>
                    {/* Absolute positioned icon overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/50">
                        <AlertCircle className="w-12 h-12 text-rose-600" />
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 font-sans tracking-tight">
                    System Malfunction
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                    Our servers encountered a critical error while rendering this page. Our engineers have been alerted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        className="w-full sm:w-auto h-14 px-10 text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20 gap-3 font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <RefreshCcw className="w-6 h-6" />
                        Try Again
                    </Button>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto h-14 px-10 text-lg text-slate-700 border-slate-200 hover:bg-slate-50 gap-3 font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Home className="w-6 h-6" />
                            Return Home
                        </Button>
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-left bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <p className="text-xs font-mono text-rose-400 mb-2 font-bold uppercase tracking-wider">Developer Stack Trace:</p>
                        <pre className="text-xs font-mono text-slate-300">
                            {error.message}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
