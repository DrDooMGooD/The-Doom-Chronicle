import { useState } from 'react';
import { Shield, Skull, BookOpen, PenTool, MessageSquare, Award } from 'lucide-react';

interface NavbarProps {
  onScrollToSection: (id: string) => void;
  activeSection: string;
}

export default function Navbar({ onScrollToSection, activeSection }: NavbarProps) {
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
          onClick={() => onScrollToSection('hero')}
          className="flex items-center space-x-2 cursor-pointer group bg-emerald-800 hover:bg-rose-600 border-2 border-black px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <Shield className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
          <span className="font-comic text-2xl tracking-widest text-white uppercase select-none">
            DOOM CHRONICLE
          </span>
          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 border border-black rounded-xs">
            LATVERIA
          </span>
        </div>

        {/* Desktop Links */}
        <div id="doom-nav-links" className="hidden md:flex items-center space-x-1">
          {[
            { id: 'hero', label: 'Throne Room', icon: <Skull className="w-3.5 h-3.5" /> },
            { id: 'reviews', label: 'Sovereign Reviews', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'counsel', label: 'Doom\'s Counsel', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'tribute', label: 'Sovereign Registry', icon: <PenTool className="w-3.5 h-3.5" /> }
          ].map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onScrollToSection(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 font-bold text-xs uppercase border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-transparent text-stone-300 border-transparent hover:text-rose-500 hover:border-black'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Latverian Flag Indicator */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex flex-col items-end text-[10px] text-stone-400">
            <span className="font-bold text-emerald-500">LATVERIA STATE SECURE</span>
            <span>DOOMSTADT CORE v4.1</span>
          </div>
          {/* Latverian Flag: Black, Green, Red Stripes */}
          <div className="w-10 h-6 border-2 border-black flex flex-col overflow-hidden shadow-comic shrink-0">
            <div className="bg-black flex-1"></div>
            <div className="bg-emerald-700 flex-1"></div>
            <div className="bg-red-600 flex-1"></div>
          </div>
        </div>

      </div>
    </nav>
  );
}
