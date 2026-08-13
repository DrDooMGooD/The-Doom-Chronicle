import React from 'react';

interface LatverianFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPole?: boolean;
}

export default function LatverianFlag({ className = '', size = 'md', showPole = true }: LatverianFlagProps) {
  const dimensions = {
    sm: { width: 'w-16 sm:w-20', height: 'h-10 sm:h-12', poleHeight: 'h-14 sm:h-16', poleWidth: 'w-1' },
    md: { width: 'w-24 sm:w-32', height: 'h-16 sm:h-20', poleHeight: 'h-24 sm:h-28', poleWidth: 'w-1.5' },
    lg: { width: 'w-36 sm:w-48', height: 'h-24 sm:h-32', poleHeight: 'h-36 sm:h-44', poleWidth: 'w-2' },
  }[size];

  return (
    <div className={`relative inline-flex items-start select-none ${className}`}>
      {/* Flag Pole */}
      {showPole && (
        <div className="relative flex flex-col items-center z-20">
          {/* Gold Finial Top */}
          <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-yellow-400 border border-black rounded-full shadow-sm bg-gradient-to-tr from-yellow-600 via-yellow-300 to-yellow-100" />
          {/* Silver Metallic Pole */}
          <div className={`${dimensions.poleWidth} ${dimensions.poleHeight} bg-gradient-to-r from-stone-400 via-stone-200 to-stone-500 border-x border-black shadow-comic-sm`} />
        </div>
      )}

      {/* Wavy Cloth Flag Container */}
      <div className={`relative ${dimensions.width} ${dimensions.height} flag-wave-container`}>
        {/* Latverian Flag Cloth */}
        <div className="w-full h-full bg-[#005A36] border-2 border-black relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flag-cloth-mesh flex items-center justify-center">
          
          {/* Background Stripe / Latverian Motif */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600 border-b border-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-red-600 border-t border-black/40" />

          {/* Center Latverian Royal Emblem (Crown & Shield) */}
          <div className="relative z-10 flex flex-col items-center justify-center p-1">
            <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-11 sm:h-11 drop-shadow-[1px_2px_0px_rgba(0,0,0,0.8)]">
              {/* Crown */}
              <path d="M 20,35 L 30,55 L 50,25 L 70,55 L 80,35 L 75,70 L 25,70 Z" fill="#FACC15" stroke="#000000" strokeWidth="3" />
              <circle cx="20" cy="33" r="4" fill="#EF4444" stroke="#000000" strokeWidth="2" />
              <circle cx="50" cy="23" r="5" fill="#EF4444" stroke="#000000" strokeWidth="2" />
              <circle cx="80" cy="33" r="4" fill="#EF4444" stroke="#000000" strokeWidth="2" />
              {/* Shield Body */}
              <path d="M 35,55 L 65,55 L 65,75 Q 50,90 35,75 Z" fill="#15803D" stroke="#FACC15" strokeWidth="3" />
              {/* Shield Cross */}
              <path d="M 50,55 L 50,83 M 36,68 L 64,68" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
            </svg>

            <span className="font-comic text-[8px] sm:text-[10px] text-yellow-300 uppercase tracking-widest leading-none mt-0.5 text-shadow-sm font-bold">
              LATVERIA
            </span>
          </div>

          {/* Dynamic Light Sheen & Ripple Shadow Overlay */}
          <div className="absolute inset-0 flag-cloth-sheen pointer-events-none" />
        </div>

        {/* Golden Fluttering Tassels on Right Edge */}
        <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-between py-1 pointer-events-none translate-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1 bg-yellow-400 border border-black shadow-xs flag-tassel-flutter" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
