import { motion } from 'motion/react';
import { Shield, Sparkles, AlertCircle, Quote, Star } from 'lucide-react';
import { useState } from 'react';
// @ts-ignore
import domPinedaImage from '../assets/dom_pineda-1.jpg';

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  const [activeSoundEffect, setActiveSoundEffect] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isPortraitHovered, setIsPortraitHovered] = useState(false);

  // Default Dr. Doom portrait
  const defaultDoomImage = "https://scontent.fsac1-2.fna.fbcdn.net/v/t1.6435-9/91911962_10156590858810834_6532539154343919616_n.jpg?stp=dst-jpg_tt6&cstp=mx916x916&ctp=s916x916&_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=EX83k_UbQFsQ7kNvwE23SBR&_nc_oc=AdrOQ-L3PYRerarsOctq4WfFfhq7dMW47NEZeeB-1q3v_lYp78JfTWcsXBrxsOKMKH3pFZyYdu9c5nio4bR5qmi_&_nc_zt=23&_nc_ht=scontent.fsac1-2.fna&_nc_gid=4ReUjnNPAdhH14KO3uedug&_nc_ss=7b2a8&oh=00_Af_9nAYKpxHYYIk09eURTYnRO6ClRfR4gWOXSbE_vG7wXw&oe=6A668F47";

  // Use the imported high-res user photo as the hover/alternate image (State-Appointed Chronicler Dom Pineda)
  const hoverDoomImage = domPinedaImage;

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
  const chroniclerQuote = "Aha! The state-appointed chronicler Dom Pineda himself! Doom approves of your magnificent layout styling efforts!";
  const displayedQuote = isPortraitHovered ? chroniclerQuote : currentQuote;

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
        <div className="lg:col-span-7 flex flex-col justify-between bg-stone-950 border-4 border-black p-6 sm:p-8 shadow-comic-lg relative transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          
          {/* Cover Header Banner */}
          <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
            <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest bg-black px-2 py-0.5 border border-red-500/30">
              CHRONICLER: DOM PINEDA
            </span>
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-spin-slow" />
              <span className="font-comic text-lg text-white">12¢ APPROVED BY THE DOOM BOARD</span>
            </div>
          </div>

          <div>
            {/* Super Comic Title */}
            <div className="relative pt-16 sm:pt-20 group cursor-default">
              <span className="absolute -top-1 sm:-top-2 -left-2 font-comic text-2xl text-red-600 bg-black px-2.5 py-1 border-2 border-black rotate-[-3deg] shadow-comic z-10 uppercase tracking-wider select-none transition-transform group-hover:rotate-[-6deg] group-hover:scale-105 duration-300">
                BY IMPERIAL DICTATE!
              </span>
              <h1 className="font-comic text-6xl sm:text-7xl lg:text-8xl tracking-wide leading-none uppercase select-none transition-all duration-300 group-hover:scale-[1.01]">
                <span className="text-3d-title-white block tracking-wider group-hover:text-yellow-100 transition-colors">THE DOOM</span>
                <span className="text-3d-title-emerald block tracking-wider mt-2 group-hover:text-emerald-350 transition-colors">CHRONICLE</span>
              </h1>
            </div>

            {/* Subcategories with Comic sound design vibes */}
            <div className="mt-8 flex flex-wrap gap-2.5 text-xs font-mono font-bold uppercase">
              <span className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all tracking-wide cursor-help">
                🎮 VIDEO GAMES
              </span>
              <span className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all tracking-wide cursor-help">
                📚 COMIC BOOKS
              </span>
              <span className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all tracking-wide cursor-help">
                🎬 CINEMATIC ART
              </span>
            </div>

            {/* Description Editorial */}
            <p className="mt-6 text-stone-200 font-sans text-sm sm:text-base leading-relaxed border-l-4 border-emerald-500 pl-4 font-medium">
              Welcome, mortal traveler, to the sovereign chronicle of games, sequential art, and cinematic projects, written by state-appointed chronicler <strong className="text-red-500 font-bold">Dom Pineda</strong>. 
              While lesser review aggregates rely on the chaotic consensus of uninformed peasants, this ledger is curated 
              under the flawless judgment of <strong className="text-emerald-400 font-bold">Lord Victor von Doom</strong>. Every score is absolute. Every critique is final.
            </p>
          </div>

          {/* Action Footer Button with Dynamic Sound FX Trigger */}
          <div className="mt-8 pt-6 border-t-4 border-black flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onExploreClick}
              className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 hover:from-rose-600 hover:via-red-500 hover:to-rose-700 text-white font-comic text-2xl uppercase py-4 px-8 border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center glossy-highlight rounded-xs"
            >
              ACCESS THE LEDGER →
            </button>
            <button
              onClick={() => {
                const sounds = ['DOOM!', 'KRAK!', 'RICHARDS!', 'HALT!', 'FOOL!'];
                const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
                triggerSound(randomSound);
              }}
              className="bg-gradient-to-r from-emerald-850 to-emerald-950 hover:from-emerald-700 hover:to-emerald-800 text-white font-mono text-xs font-bold uppercase py-4 px-6 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-1.5 glossy-highlight"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span>STRIKE DICTUM GONG</span>
            </button>
          </div>

        </div>

        {/* Right Side: Doom Graphic Panel & Comic Dialogue (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center bg-stone-900 border-4 border-black p-6 shadow-comic relative min-h-[400px] gap-6">
          
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
          <div className="bg-white text-black p-5 border-4 border-black shadow-comic relative rounded-sm z-10 skew-comic-r w-full">
            <Quote className="absolute -top-3 -left-3 w-6 h-6 text-emerald-700 bg-white border-2 border-black rounded-full p-1" />
            <h4 className="font-comic text-xl text-emerald-800 uppercase tracking-wide mb-1 flex items-center space-x-1.5">
              <span>LORD DOOM SPEAKS:</span>
            </h4>
            <p className="font-sans font-bold text-stone-900 text-sm italic">
              "{displayedQuote}"
            </p>
            <div className="absolute -bottom-4 left-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white" />
            <div className="absolute -bottom-[20px] left-[39px] w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[15px] border-t-black -z-10" />
          </div>

          {/* Classic Sovereign Portrait representation of Dr. Doom */}
          <div className="relative flex justify-center py-2 z-0">
            <motion.div 
              onMouseEnter={() => setIsPortraitHovered(true)}
              onMouseLeave={() => setIsPortraitHovered(false)}
              whileHover={{ scale: 1.05, rotate: 1.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 border-4 border-black bg-stone-950 overflow-hidden rounded-full flex items-center justify-center cursor-crosshair group/portrait transition-all duration-300 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(239,68,68,1)]"
            >
              {/* Default Image */}
              <motion.img
                src={defaultDoomImage}
                alt="Sovereign Lord Doom"
                className="absolute inset-0 w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
                animate={{ opacity: isPortraitHovered ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Hover Alternate Image */}
              <motion.img
                src={hoverDoomImage}
                alt="State-Appointed Chronicler Dom Pineda"
                className="absolute inset-0 w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: isPortraitHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Ambient overlay when hovered */}
              <div className="absolute inset-0 bg-emerald-600/10 mix-blend-color-burn opacity-0 group-hover/portrait:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Glowing Ambient Indicator */}
              <div className="absolute top-4 right-4 bg-red-600 border border-black text-[9px] text-white px-2 py-0.5 rounded-xs font-mono font-bold animate-pulse z-10 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                {isPortraitHovered ? "CHRONICLER ONLINE" : "DOOM-CAM ONLINE"}
              </div>
            </motion.div>

            <div className="absolute -bottom-3 bg-stone-950 border-2 border-black text-white py-1 px-4 font-comic text-sm tracking-wider shadow-comic uppercase z-20">
              {isPortraitHovered ? "CHRONICLER: DOM PINEDA" : "VICTOR VON DOOM"}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
