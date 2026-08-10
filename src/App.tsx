import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HomePortals from './components/HomePortals';
import DoomIntro from './components/DoomIntro';
import ScrollToTop from './components/ScrollToTop';
import VaultPage from './pages/VaultPage';
import CounselPage from './pages/CounselPage';
import GuestbookPage from './pages/GuestbookPage';
import CMSPage from './pages/CMSPage';
import { Shield, ArrowUp, Skull, Eye } from 'lucide-react';

// ─── Shared Footer ────────────────────────────────────────────────────────────
function SiteFooter({ onReplayIntro }: { onReplayIntro: () => void }) {
  const navigate = useNavigate();
  return (
    <footer className="bg-stone-950 border-t-8 border-black text-white pt-16 pb-10 relative overflow-hidden font-mono">
      <div className="absolute inset-0 halftone-red opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b-4 border-black">

          {/* Latverian state details */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Skull className="w-8 h-8 text-emerald-500 fill-emerald-950" />
              <span className="font-comic text-3xl tracking-widest text-white uppercase">
                DOOM CHRONICLE
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              This is the official personal publication ledger and sovereign archive of{' '}
              <strong className="text-stone-200">Dom Pineda</strong>, curated under the supreme
              guidance of Victor von Doom, ruler of Latveria. All reviews of cinema, comic books,
              and digital simulations are legally binding under Latverian Sovereign law.
            </p>
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center space-x-1.5 bg-black/50 border border-emerald-950 p-2 max-w-sm">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>RULING SINCE 1962. ZERO UNEMPLOYMENT. ZERO DEFIANCE.</span>
            </div>
          </div>

          {/* Quick section links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-comic text-lg uppercase text-rose-500 tracking-wider">
              CHRONICLE DECISIONS
            </h4>
            <ul className="space-y-2 uppercase font-bold text-stone-300">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  ↑ Castle Ramparts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/vault')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  📚 Review Vault
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/counsel')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  💬 Ask Doom's Counsel
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/guestbook')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  🖊️ Sovereign Registry
                </button>
              </li>
              <li className="border-t border-stone-800 pt-2 mt-2">
                <button
                  onClick={onReplayIntro}
                  className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center space-x-1 text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>🎬 REPLAY STATE CINEMATIC</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Latveria state banner */}
          <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end bg-stone-900 border-2 border-black p-4 shadow-comic">
            <div className="text-right w-full">
              <span className="block text-[11px] font-bold text-emerald-500">LATVERIA BORDER DEFENSE</span>
              <span className="block text-[9px] text-stone-400 mt-0.5">DOOMBOT DIVISION-79 SECURE</span>
            </div>
            <div className="mt-4 flex space-x-1.5 w-full justify-between items-center text-[10px] text-stone-500 border-t border-stone-800 pt-2">
              <span>POPULATION: 100% LOYAL</span>
              <span className="bg-red-600 text-white font-bold px-1 rounded-sm">LIVE</span>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <span>© 2026 Dom Pineda & The Doom Chronicle. Built with absolute iron determination.</span>
          </div>
          <div className="flex space-x-6 uppercase font-bold">
            <a href="#" className="hover:text-emerald-400 transition-colors">Sovereign Privacy decree</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Tribute protocols</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ onReplayIntro }: { onReplayIntro: () => void }) {
  const navigate = useNavigate();
  return (
    <main className="relative">
      <Hero onExploreClick={() => navigate('/vault')} />
      <HomePortals />
    </main>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('doom-intro-seen');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('doom-intro-seen', 'true');
    } catch {}
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    try {
      sessionStorage.removeItem('doom-intro-seen');
    } catch {}
    setShowIntro(true);
  };

  if (showIntro) {
    return <DoomIntro onComplete={handleIntroComplete} />;
  }

  const isCMSRoute = location.pathname === '/cms';

  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100 overflow-x-hidden selection:bg-rose-600 selection:text-white">
      {/* Atmospheric scanline overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-repeat z-40 halftone-bg" />

      {/* Scroll-to-top resets on route change */}
      <ScrollToTop />

      {/* Navbar — visible on all routes */}
      <Navbar
        onReplayIntro={handleReplayIntro}
        onToggleCMS={() => {
          if (isCMSRoute) {
            localStorage.removeItem('castle_passcode');
            navigate('/');
          } else {
            navigate('/cms');
          }
        }}
        showCMS={isCMSRoute}
      />

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<HomePage onReplayIntro={handleReplayIntro} />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/counsel" element={<CounselPage />} />
        <Route path="/guestbook" element={<GuestbookPage />} />
        <Route path="/cms" element={<CMSPage />} />
        {/* Fallback: redirect unknown routes home */}
        <Route path="*" element={<HomePage onReplayIntro={handleReplayIntro} />} />
      </Routes>

      {/* Footer on all pages */}
      <SiteFooter onReplayIntro={handleReplayIntro} />

      {/* Scroll-to-top button — all pages */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-emerald-850 hover:bg-rose-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer z-40"
          title="Return to Throne"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
