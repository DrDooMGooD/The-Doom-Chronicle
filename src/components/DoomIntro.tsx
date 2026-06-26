import { useState, useEffect, useRef, DragEvent, ChangeEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Skull, Eye, Upload, Image as ImageIcon, Crosshair, Trash2, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';

interface DoomIntroProps {
  onComplete: () => void;
}

export default function DoomIntro({ onComplete }: DoomIntroProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('doom-custom-image') || null;
    } catch {
      return null;
    }
  });

  const [zoomTarget, setZoomTarget] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('doom-custom-zoom-target');
      return saved ? JSON.parse(saved) : { x: 50, y: 50 };
    } catch {
      return { x: 50, y: 50 };
    }
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApproach = () => {
    setIsZooming(true);
    // Timing matches zoom and fade-out animations
    setTimeout(() => {
      onComplete();
    }, 1800);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('LORD DOOM REJECTS THIS DATA FORMAT. YOU MUST CHOOSE A VALID PORTRAIT IMAGE.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedImage(result);
        try {
          localStorage.setItem('doom-custom-image', result);
        } catch (err) {
          console.warn('Image size exceeds localStorage quota. Retaining in active state memory only.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleTriggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isZooming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newTarget = {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y))
    };
    
    setZoomTarget(newTarget);
    try {
      localStorage.setItem('doom-custom-zoom-target', JSON.stringify(newTarget));
    } catch (err) {}
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setZoomTarget({ x: 50, y: 50 });
    try {
      localStorage.removeItem('doom-custom-image');
      localStorage.removeItem('doom-custom-zoom-target');
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      
      {/* Background Halftone Dust & Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-repeat halftone-bg" />
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 to-stone-950 pointer-events-none" />
      
      {/* Ambient Red Alert Border Indicator */}
      <div className="absolute inset-0 border-8 border-red-950/20 pointer-events-none animate-pulse" />

      {/* Latverian Top Banner */}
      <AnimatePresence>
        {!isZooming && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-10 flex flex-col items-center text-center px-4"
          >
            <div className="bg-red-600 text-white font-comic text-xs uppercase px-3 py-1.5 border-2 border-black rotate-[-2deg] shadow-comic flex items-center space-x-2">
              <Skull className="w-4 h-4 fill-current" />
              <span>LATVERIA BORDER GATEWAY CONTROL</span>
            </div>
            <p className="text-[10px] text-stone-500 font-bold uppercase mt-3 tracking-widest">
              PORTAL SYSTEM ONLINE • READY FOR CUSTOM SOVEREIGN FEED
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Main Mask Stage - Interactive Calibration Grid / Canvas */}
      <div className="relative w-full max-w-4xl aspect-[16/9] sm:aspect-[2/1] px-4 flex items-center justify-center z-10">
        
        <AnimatePresence mode="wait">
          {!uploadedImage ? (
            /* Upload State Placeholder */
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleTriggerSelect}
              className={`w-full h-full border-4 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-comic-green scale-[1.02]'
                  : 'border-stone-800 bg-stone-900/50 hover:border-emerald-700 hover:bg-stone-900 shadow-comic'
              }`}
            >
              <div className="bg-emerald-900/30 border-2 border-emerald-500/30 p-4 rounded-full mb-4 animate-pulse">
                <Upload className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="font-comic text-xl sm:text-2xl text-stone-100 uppercase tracking-wide mb-2">
                SOVEREIGN PORTRAIT UPLOAD
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans max-w-md leading-relaxed mb-4">
                Drag and drop your preferred illustration of Lord Doom, or <span className="text-emerald-400 underline font-bold font-mono">click to search archive</span>.
              </p>
              
              <div className="text-[10px] text-stone-600 uppercase border border-stone-800 bg-stone-950 px-3 py-1.5 flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
                <span>JPEG, PNG, OR WEBP ACCEPTED • DRAG-N-DROP COMPLIANT</span>
              </div>
            </motion.div>
          ) : (
            /* Interactive Image View & Zoom Frame */
            <motion.div
              key="calibrator"
              animate={isZooming ? {
                scale: 40,
                transition: { duration: 1.8, ease: [0.85, 0, 0.15, 1] }
              } : {
                scale: 1,
                transition: { duration: 0.5 }
              }}
              style={{
                originX: zoomTarget.x / 100,
                originY: zoomTarget.y / 100
              }}
              className="relative w-full h-full border-4 border-black bg-stone-950 overflow-hidden shadow-comic-green group"
            >
              {/* Uploaded Custom Image */}
              <div
                onClick={handleImageClick}
                className="w-full h-full relative cursor-crosshair overflow-hidden"
              >
                <img
                  src={uploadedImage}
                  alt="Sovereign Lord Doom Custom"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Grid Overlay / Holographic Calibration Lines */}
                {!isZooming && (
                  <div className="absolute inset-0 pointer-events-none border border-emerald-500/20">
                    {/* Vertical guideline */}
                    <div className="absolute inset-y-0 border-l border-dashed border-emerald-500/30" style={{ left: `${zoomTarget.x}%` }} />
                    {/* Horizontal guideline */}
                    <div className="absolute inset-x-0 border-t border-dashed border-emerald-500/30" style={{ top: `${zoomTarget.y}%` }} />
                    
                    {/* Retro sci-fi framing bounds */}
                    <div className="absolute top-2 left-2 border-t-2 border-l-2 border-emerald-500 w-6 h-6" />
                    <div className="absolute top-2 right-2 border-t-2 border-r-2 border-emerald-500 w-6 h-6" />
                    <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-emerald-500 w-6 h-6" />
                    <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-emerald-500 w-6 h-6" />
                  </div>
                )}

                {/* Calibration Crosshair Reticle */}
                {!isZooming && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center"
                    style={{ left: `${zoomTarget.x}%`, top: `${zoomTarget.y}%` }}
                  >
                    <div className="relative">
                      {/* Inner Ring */}
                      <div className="w-8 h-8 rounded-full border-2 border-red-500 animate-ping absolute -inset-0" />
                      {/* Outer target */}
                      <Crosshair className="w-8 h-8 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    </div>
                    <div className="bg-black/90 text-red-400 text-[8px] font-bold px-1.5 py-0.5 border border-red-500 mt-2 uppercase tracking-widest whitespace-nowrap">
                      PORTAL CORE TARGETED
                    </div>
                  </div>
                )}

                {/* Bottom Interactive Calibration Helper Banner */}
                {!isZooming && (
                  <div className="absolute bottom-3 left-3 right-3 bg-stone-950/95 border-2 border-emerald-500/50 p-2 text-stone-300 text-[10px] flex justify-between items-center pointer-events-none backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>CLICK PORTRAIT TO RE-ALIGN DEVIATION ANCHOR (WHERE THE PORTAL WILL ZOOM)</span>
                    </div>
                    <div className="font-mono text-emerald-400 font-bold shrink-0">
                      SEC-X: {Math.round(zoomTarget.x)}% | SEC-Y: {Math.round(zoomTarget.y)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Portal Flash Overlay that triggers inside the zoom */}
              {isZooming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 1] }}
                  transition={{ duration: 1.4, times: [0, 0.6, 1] }}
                  className="absolute inset-0 bg-emerald-500 rounded-sm filter blur-xl mix-blend-screen pointer-events-none"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comic Book Action Caption Planks */}
      <AnimatePresence>
        {!isZooming && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex flex-col items-center max-w-lg text-center px-6 relative z-20 space-y-6"
          >
            <div className="bg-stone-900 border-4 border-black p-5 shadow-comic relative max-w-md">
              <div className="absolute -top-3.5 -right-3 bg-emerald-600 border-2 border-black text-white font-comic text-[10px] uppercase px-2 py-0.5 rotate-[4deg] shadow-comic">
                SUPREME PROCLAMATION
              </div>
              <h1 className="font-comic text-2xl sm:text-3xl text-white uppercase tracking-wider mb-2 leading-tight">
                THE DOOM CHRONICLE
              </h1>
              <p className="font-sans font-medium text-stone-300 text-xs sm:text-sm leading-relaxed">
                "Welcome, traveler, to my sovereign chronicle of sequential arts. Here, the opinion of uninformed peasants is abolished. My judgment is flawless, absolute, and ironclad."
              </p>
              <p className="text-[10px] text-emerald-400 font-bold font-mono mt-3 uppercase tracking-widest text-center">
                — VICTOR VON DOOM, SOVEREIGN LORD
              </p>
            </div>

            {/* Interaction Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              {uploadedImage && (
                <button
                  onClick={handleRemoveImage}
                  className="bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-400 font-mono text-xs uppercase px-4 py-3 border-2 border-stone-800 hover:border-red-900 shadow-comic transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>RESET IMAGE FEED</span>
                </button>
              )}

              {/* Approach Throne / Portal Trigger Button */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-rose-600 rounded-sm blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <button
                  onClick={uploadedImage ? handleApproach : handleTriggerSelect}
                  className="relative bg-red-600 hover:bg-emerald-600 text-white font-comic text-lg uppercase px-8 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer tracking-wider flex items-center space-x-2"
                >
                  <span>{uploadedImage ? 'APPROACH THE THRONE →' : 'SELECT DOOM PORTRAIT FEED'}</span>
                </button>
              </div>
            </div>

            {/* Skip Option */}
            <button
              onClick={onComplete}
              className="text-stone-500 hover:text-stone-300 text-[10px] uppercase font-bold tracking-widest transition-colors pt-1 underline"
            >
              Direct Entry (Skip Border Patrol)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Ambient sound labels */}
      {!isZooming && (
        <div className="absolute bottom-6 left-6 text-[10px] font-mono text-stone-600 uppercase flex items-center space-x-1.5 select-none">
          <Shield className="w-3.5 h-3.5 animate-spin" />
          <span>[SYSTEM: AMBIENT WIND & LOW METALLIC HUM INTENSIFYING]</span>
        </div>
      )}
    </div>
  );
}
