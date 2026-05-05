'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="fixed inset-0 z-[9999] flex h-screen w-full flex-col items-center justify-center bg-gray-950 px-6 text-center antialiased overflow-hidden">
      
      {/* 1. FORCE THE SCROLLBAR TO HIDE GLOBALLY */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100% !important;
        }
      `}</style>

      {/* 2. SUBTLE TECHNICAL GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        
        {/* 3. CENTER GRAPHIC: 404 Inside the Gear */}
        <div className="relative mb-12 flex items-center justify-center">
          
          {/* The Mechanical Gear (Settings Icon) */}
          <Settings 
            size={240} 
            className="text-gray-900 opacity-40 animate-[spin_20s_linear_infinite]" 
            strokeWidth={1} 
          />
          
          {/* Inner Steel Ring */}
          <div className="absolute w-32 h-32 rounded-full border border-gray-800 bg-gray-950/50 shadow-inner" />

          {/* The 404 - Centered inside the gear */}
          <div className="absolute flex gap-1 font-mono text-7xl font-black tracking-tighter text-gray-400">
            <span className="opacity-40">4</span>
            <span className="text-gray-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">0</span>
            <span className="opacity-40">4</span>
          </div>
        </div>
        
        {/* 4. TYPOGRAPHY: Exact words from your source */}
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl uppercase italic">
          Page Not Found
        </h1>
        
        <p className="mt-8 text-base leading-7 text-gray-500 max-w-md mx-auto font-light tracking-wide">
          The link you followed may be broken, or the page may have been moved. 
          Let&apos;s get you back on safe ground.
        </p>

        {/* 5. ACTION BUTTONS: Simplified and Identical Size */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-400 border border-gray-800 rounded-sm hover:bg-gray-900 transition-all active:scale-95"
          >
            &larr; Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-gray-950 bg-white border border-white rounded-sm hover:bg-gray-950 hover:text-white transition-all active:scale-95 text-center"
          >
            Return to Home
          </Link>
        </div>

      </div>
    </main>
  );
}