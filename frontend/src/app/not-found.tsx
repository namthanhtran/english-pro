import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center">

                <div className="relative mb-8 mt-12">
                    {/* Massive 404 Text */}
                    <div className="text-[150px] sm:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-sky-400 drop-shadow-sm select-none">
                        404
                    </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 font-sans tracking-tight">
                    Page Not Found
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                    The page you are looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                <Link href="/dashboard">
                    <Button
                        size="lg"
                        className="h-14 px-10 text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 gap-3 font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Compass className="w-6 h-6" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Decorative Grid overlays */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        </div>
    );
}
