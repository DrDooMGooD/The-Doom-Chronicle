import { motion } from 'motion/react';
import { Shield, Sparkles, AlertCircle, Quote, Star } from 'lucide-react';
import { useState } from 'react';

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  const [activeSoundEffect, setActiveSoundEffect] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const triggerSound = (effect: string) => {
    setActiveSoundEffect(effect);
    setClickCount((prev) => prev + 1);
    setTimeout(() => {
      setActiveSoundEffect(null);
    }, 1000);
  };

  const doomQuotes = [
    "Foolish mortals look to the stars for guidance. I look into the mirror and find absolute certainty.",
    "Do you think the Lord of Latveria cannot spare time for simple games? They are nothing but mechanical equations to be mastered!",
    "Richards claimed my critique of his theories was unscientific. I bought the journal and burned it. Perfect critical review.",
    "Sequential art is the only format that can adequately capture my supreme tactical genius on battleworld."
  ];

  const currentQuote = doomQuotes[clickCount % doomQuotes.length];

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-24 pb-16 flex items-center justify-center overflow-hidden halftone-bg px-4 sm:px-6 lg:px-8 bg-stone-900 border-b-8 border-black"
    >
      {/* Absolute Skewed Decorative Panels (Red and Green) to emulate comic layouts */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-red-700/10 skew-x-12 transform origin-top pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-3/4 bg-emerald-950/20 -skew-x-12 transform origin-bottom pointer-events-none" />

      {/* Grid container mirroring classic comic panel layouts */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Side: Comic-Book Cover / Big Title Block (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-stone-950 border-4 border-black p-6 sm:p-8 shadow-comic-lg relative">
          
          {/* Cover Header Banner */}
          <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
            <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest bg-black px-2 py-0.5 border border-red-500/30">
              CHRONICLER: DOM PINEDA
            </span>
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-comic text-lg text-white">12¢ APPROVED BY THE DOOM BOARD</span>
            </div>
          </div>

          <div>
            {/* Super Comic Title */}
            <div className="relative pt-8 sm:pt-10">
              <span className="absolute -top-4 sm:-top-6 -left-2 font-comic text-2xl text-red-600 bg-black px-2 py-0.5 border border-black rotate-[-3deg] shadow-comic z-10 uppercase tracking-wider">
                BY IMPERIAL DICTATE!
              </span>
              <h1 className="font-comic text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-none text-white uppercase select-none drop-shadow-[4px_4px_0px_#10b981]">
                THE DOOM <br />
                <span className="text-emerald-500 block">CHRONICLE</span>
              </h1>
            </div>

            {/* Subcategories with Comic sound design vibes */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono font-bold uppercase">
              <span className="bg-red-600 text-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🎮 VIDEO GAMES
              </span>
              <span className="bg-emerald-600 text-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                📚 COMIC BOOKS
              </span>
              <span className="bg-stone-800 text-stone-200 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🎬 CINEMATIC ART
              </span>
            </div>

            {/* Description Editorial */}
            <p className="mt-6 text-stone-300 font-sans text-sm sm:text-base leading-relaxed border-l-4 border-emerald-500 pl-4">
              Welcome, mortal traveler, to the sovereign chronicle of games, sequential art, and cinematic projects, written by state-appointed chronicler <strong className="text-red-500">Dom Pineda</strong>. 
              While lesser review aggregates rely on the chaotic consensus of uninformed peasants, this ledger is curated 
              under the flawless judgment of <strong className="text-emerald-500">Lord Victor von Doom</strong>. Every score is absolute. Every critique is final.
            </p>
          </div>

          {/* Action Footer Button with Dynamic Sound FX Trigger */}
          <div className="mt-8 pt-6 border-t-4 border-black flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onExploreClick}
              className="bg-red-600 hover:bg-red-500 text-white font-comic text-2xl uppercase py-3 px-8 border-4 border-black shadow-comic active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
            >
              ACCESS THE LEDGER →
            </button>
            <button
              onClick={() => {
                const sounds = ['DOOM!', 'KRAK!', 'RICHARDS!', 'HALT!', 'FOOL!'];
                const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
                triggerSound(randomSound);
              }}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase py-3 px-5 border-2 border-black shadow-comic active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>STRIKE DICTUM GONG</span>
            </button>
          </div>

        </div>

        {/* Right Side: Doom Graphic Panel & Comic Dialogue (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-stone-900 border-4 border-black p-6 shadow-comic relative min-h-[400px]">
          
          {/* Comic halftone background purely for the Doom graphic panel */}
          <div className="absolute inset-0 halftone-green opacity-40 pointer-events-none" />

          {/* Floating Sound FX Trigger Display */}
          {activeSoundEffect && (
            <motion.div
              initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], rotate: [10, -10, 5], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-yellow-400 border-4 border-black text-black px-6 py-3 font-comic text-5xl tracking-widest rotate-[-12deg] shadow-comic-red"
            >
              {activeSoundEffect}
            </motion.div>
          )}

          {/* Dr. Doom Speech bubble */}
          <div className="bg-white text-black p-5 border-4 border-black shadow-comic relative rounded-sm z-10 skew-comic-r mb-8">
            <Quote className="absolute -top-3 -left-3 w-6 h-6 text-emerald-700 bg-white border-2 border-black rounded-full p-1" />
            <h4 className="font-comic text-xl text-emerald-800 uppercase tracking-wide mb-1 flex items-center space-x-1.5">
              <span>LORD DOOM SPEAKS:</span>
            </h4>
            <p className="font-sans font-bold text-stone-900 text-sm italic">
              "{currentQuote}"
            </p>
            <div className="absolute -bottom-4 left-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white" />
            <div className="absolute -bottom-[20px] left-[39px] w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[15px] border-t-black -z-10" />
          </div>

          {/* Vector representation of Dr. Doom (Royal High-Contrast Portrait) */}
          <div className="relative flex-1 flex items-end justify-center pt-4 z-0">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-4 border-black bg-stone-950 overflow-hidden shadow-comic rounded-full flex items-center justify-center">
              {/* Abstract glowing eyes / shield mask representation */}
              <div className="absolute inset-0 bg-emerald-950/80 halftone-green" />
              
              {/* Stylized Doom Hood Silhouette & Mask in high-contrast SVG */}
              <svg className="w-56 h-56 relative z-10 text-stone-200 fill-current" viewBox="0 0 100 100">
                {/* Hood outline in emerald */}
                <path d="M 15 90 C 20 40, 30 15, 50 15 C 70 15, 80 40, 85 90 C 70 90, 30 90, 15 90 Z" fill="#065f46" stroke="#000" strokeWidth="2" />
                {/* Hood shadow fold */}
                <path d="M 25 90 C 28 50, 35 30, 50 30 C 65 30, 72 50, 75 90 C 65 90, 35 90, 25 90 Z" fill="#044e37" stroke="#000" strokeWidth="1" />
                {/* Iron Mask Core Faceplate */}
                <path d="M 38 45 C 38 38, 62 38, 62 45 C 62 65, 58 75, 50 82 C 42 75, 38 65, 38 45 Z" fill="#94a3b8" stroke="#000" strokeWidth="2.5" />
                {/* Rivets and steel lines */}
                <circle cx="50" cy="40" r="1.5" fill="#475569" />
                <line x1="50" y1="41" x2="50" y2="55" stroke="#000" strokeWidth="1.5" />
                {/* Angled Eyes holes (Glinting Red glow) */}
                <path d="M 42 46 C 45 44, 48 48, 45 49 Z" fill="#b91c1c" stroke="#000" strokeWidth="1" />
                <path d="M 58 46 C 55 44, 52 48, 55 49 Z" fill="#b91c1c" stroke="#000" strokeWidth="1" />
                <circle cx="44.5" cy="47" r="1" fill="#f87171" className="animate-ping" />
                <circle cx="55.5" cy="47" r="1" fill="#f87171" className="animate-ping" />
                {/* Iron Mouth Guard Grille */}
                <rect x="44" y="62" width="12" height="6" fill="#475569" stroke="#000" strokeWidth="1.5" rx="1" />
                <line x1="47" y1="62" x2="47" y2="68" stroke="#000" strokeWidth="1" />
                <line x1="50" y1="62" x2="50" y2="68" stroke="#000" strokeWidth="1" />
                <line x1="53" y1="62" x2="53" y2="68" stroke="#000" strokeWidth="1" />
              </svg>
              
              {/* Glowing Ambient Indicator */}
              <div className="absolute top-4 right-4 bg-red-600 border border-black text-[9px] text-white px-1.5 py-0.5 rounded-xs font-mono font-bold animate-pulse">
                DOOM-CAM ONLINE
              </div>
            </div>

            <div className="absolute -bottom-3 bg-stone-950 border-2 border-black text-white py-1 px-3 font-comic text-sm tracking-wider shadow-comic uppercase">
              VICTOR VON DOOM
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
