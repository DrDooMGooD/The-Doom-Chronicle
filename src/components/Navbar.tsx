import { useState } from 'react';
import { Shield, Skull, BookOpen, PenTool, MessageSquare, Eye } from 'lucide-react';

interface NavbarProps {
  onScrollToSection: (id: string) => void;
  activeSection: string;
  onReplayIntro: () => void;
  onToggleCMS: () => void;
  showCMS: boolean;
}

export default function Navbar({ onScrollToSection, activeSection, onReplayIntro, onToggleCMS, showCMS }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      id="doom-nav"
      className="fixed top-0 left-0 right-0 z-50 bg-stone-950 border-b-4 border-black text-white py-3 px-4 font-mono shadow-comic"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo: Styled like a retro Marvel header */}
        <div
          id="doom-logo"
          onClick={() => {
            if (showCMS) onToggleCMS();
            onScrollToSection('hero');
          }}
          className="flex items-center space-x-2.5 cursor-pointer group bg-gradient-to-r from-emerald-850 via-emerald-750 to-emerald-950 hover:from-rose-800 hover:via-rose-750 hover:to-rose-950 border-3 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all glossy-highlight rounded-xs"
        >
          <Shield className="w-6 h-6 text-yellow-400 fill-yellow-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-comic text-2xl tracking-widest text-white uppercase select-none text-shadow-doom group-hover:text-shadow-doom-hover transition-all duration-300">
            DOOM CHRONICLE
          </span>
          <span className="bg-red-600 text-white text-[9.5px] font-bold px-1.5 py-0.5 border-2 border-black rounded-xs shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] tracking-wide animate-pulse">
            LATVERIA
          </span>
        </div>

        {/* Desktop Links */}
        <div id="doom-nav-links" className="hidden md:flex items-center space-x-1">
          {[
            { id: 'hero', label: 'Throne Room', icon: <Skull className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> },
            { id: 'reviews', label: 'Sovereign Reviews', icon: <BookOpen className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> },
            { id: 'counsel', label: 'Doom\'s Counsel', icon: <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> },
            { id: 'tribute', label: 'Sovereign Registry', icon: <PenTool className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> }
          ].map((item) => {
            const isActive = activeSection === item.id && !showCMS;
            return (
              <button
                key={item.id}
                disabled={showCMS}
                onClick={() => onScrollToSection(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 font-bold text-xs uppercase border-2 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? 'bg-emerald-700 text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-transparent text-stone-300 border-transparent hover:text-rose-400 hover:border-black hover:bg-stone-900/60 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Replay Intro Trigger */}
          <button
            onClick={onReplayIntro}
            className="flex items-center space-x-1.5 px-4 py-2 font-bold text-xs uppercase border-2 border-transparent text-rose-400 hover:text-rose-300 hover:border-black hover:bg-stone-900/80 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
            title="Replay the sovereign cinematic intro"
          >
            <Eye className="w-3.5 h-3.5 text-rose-500 group-hover:animate-pulse" />
            <span>Replay Intro</span>
          </button>
        </div>

        {/* Latverian Flag Indicator & Admin button */}
        <div className="flex items-center space-x-4">
          {/* CMS dashboard toggle button */}
          <button
            onClick={onToggleCMS}
            className={`flex items-center space-x-1.5 px-4 py-2 font-bold text-xs uppercase border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
              showCMS
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-stone-900 text-yellow-400 hover:bg-yellow-500 hover:text-black'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>{showCMS ? 'Exit Control' : 'Castle Control'}</span>
          </button>

          <div className="hidden sm:flex flex-col items-end text-[10px] text-stone-400 select-none">
            <span className="font-bold text-emerald-500">LATVERIA STATE SECURE</span>
            <span>DOOMSTADT CORE v4.1</span>
          </div>

          {/* Majestic Royal Latverian Flag & Pole Standard */}
          <div className="flex items-center shrink-0">
            <div className="relative flex flex-col items-center shrink-0 mr-1.5">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 rounded-full border border-black shadow-sm z-20 animate-pulse" />
              <div className="w-1 h-12 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 border border-black -mt-1 z-10 shadow-sm" />
            </div>
            <div className="relative overflow-visible">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/bf/Flag_of_Latveria.svg"
                alt="Flag of Latveria"
                className="w-18 h-11 border-2 border-black object-cover shadow-comic shrink-0 animate-flag-wave z-0"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}
