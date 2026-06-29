import { useState } from 'react';
import { Shield, Skull, BookOpen, PenTool, MessageSquare, Eye, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      className="fixed top-0 left-0 right-0 z-50 bg-stone-950 border-b-4 border-black text-white py-3 px-3 font-mono shadow-comic"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo: Collapses text from DOOM CHRONICLE -> DOOM on narrow mobile ports */}
        <div
          id="doom-logo"
          onClick={() => {
            if (showCMS) onToggleCMS();
            onScrollToSection('hero');
            setMobileMenuOpen(false);
          }}
          className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer group bg-gradient-to-r from-emerald-850 via-emerald-750 to-emerald-950 hover:from-rose-800 hover:via-rose-750 hover:to-rose-950 border-3 border-black px-2 sm:px-4 py-1.5 sm:py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all glossy-highlight rounded-xs"
        >
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline font-comic text-xl sm:text-2xl tracking-widest text-white uppercase select-none text-shadow-doom group-hover:text-shadow-doom-hover transition-all duration-300">
            DOOM CHRONICLE
          </span>
          <span className="sm:hidden font-comic text-lg tracking-widest text-white uppercase select-none text-shadow-doom">
            DOOM
          </span>
          <span className="bg-red-600 text-white text-[8px] sm:text-[9.5px] font-bold px-1 py-0.5 sm:px-1.5 border-2 border-black rounded-xs shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] tracking-wide animate-pulse">
            LTV
          </span>
        </div>

        {/* Desktop Links: Visible on lg screen widths */}
        <div id="doom-nav-links" className="hidden lg:flex items-center space-x-1">
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 font-bold text-xs uppercase border-2 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed ${
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

          <button
            onClick={onReplayIntro}
            className="flex items-center space-x-1.5 px-3 py-1.5 font-bold text-xs uppercase border-2 border-transparent text-rose-400 hover:text-rose-300 hover:border-black hover:bg-stone-900/80 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
            title="Replay the sovereign cinematic intro"
          >
            <Eye className="w-3.5 h-3.5 text-rose-500 group-hover:animate-pulse" />
            <span>Replay Intro</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* CMS dashboard toggle button */}
          <button
            onClick={() => {
              onToggleCMS();
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 font-bold text-[10px] sm:text-xs uppercase border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
              showCMS
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-stone-900 text-yellow-400 hover:bg-yellow-500 hover:text-black'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">{showCMS ? 'Exit Control' : 'Castle Control'}</span>
            <span className="xs:hidden">{showCMS ? 'Exit' : 'Control'}</span>
          </button>

          {/* Mobile Menu Hamburger Icon Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center p-1.5 bg-stone-900 border-2 border-black text-white hover:text-rose-450 hover:bg-stone-850 cursor-pointer shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Royal flag standard (hidden on small/medium responsive sizes) */}
          <div className="hidden md:flex items-center shrink-0">
            <div className="relative flex flex-col items-center shrink-0 mr-1.5">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-250 via-yellow-400 to-yellow-600 rounded-full border border-black shadow-sm z-20 animate-pulse" />
              <div className="w-0.5 h-10 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 border border-black -mt-1 z-10 shadow-sm" />
            </div>
            <div className="relative overflow-visible">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/bf/Flag_of_Latveria.svg"
                alt="Flag of Latveria"
                className="w-14 h-8 border-2 border-black object-cover shadow-comic shrink-0 animate-flag-wave z-0"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Menu Dropdown drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-3 border-t-2 border-black bg-stone-950 px-2 py-3 space-y-1 font-mono text-[11px] uppercase"
          >
            {[
              { id: 'hero', label: 'Throne Room', icon: <Skull className="w-3.5 h-3.5" /> },
              { id: 'reviews', label: 'Sovereign Reviews', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'counsel', label: 'Doom\'s Counsel', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'tribute', label: 'Sovereign Registry', icon: <PenTool className="w-3.5 h-3.5" /> }
            ].map((item) => (
              <button
                key={item.id}
                disabled={showCMS}
                onClick={() => {
                  onScrollToSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 py-2.5 px-3 text-stone-300 hover:text-emerald-450 border-b border-stone-900 disabled:opacity-50 text-left cursor-pointer"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                onReplayIntro();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 py-2.5 px-3 text-rose-450 hover:text-rose-350 text-left cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Replay Intro</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
