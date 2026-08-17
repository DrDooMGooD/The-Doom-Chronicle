import React from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Dynamic Glitch Wipe Curtain Overlay during transition */}
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ originY: 0 }}
        className="fixed inset-0 z-50 bg-stone-950 border-b-4 border-emerald-500 pointer-events-none flex flex-col items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 halftone-green opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-emerald-950/30 animate-pulse pointer-events-none" />
        <div className="flex items-center space-x-3 px-6 py-3 bg-black border-2 border-emerald-500 shadow-comic text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest animate-rgb-shift">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span>LATVERIAN GRID ROUTING: {location.pathname.toUpperCase() || 'HOME'}</span>
        </div>
      </motion.div>

      {/* Main Page Motion Container */}
      <motion.div
        initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}

