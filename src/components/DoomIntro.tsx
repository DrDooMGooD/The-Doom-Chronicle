import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import drDoomImage from '../assets/dr_doom.jpg';
import { Shield, Skull, Eye, HelpCircle, Sparkles, AlertCircle, Brain, CheckCircle, XCircle, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface DoomIntroProps {
  onComplete: () => void;
}

interface TriviaQuestion {
  question: string;
  options: string[];
  correct: string;
  hint: string;
}

const DOOM_TRIVIA: TriviaQuestion[] = [
  {
    question: "What is the name of Doctor Doom's sovereign home country?",
    options: ["Latveria", "Sokovia", "Symkaria", "Transia"],
    correct: "Latveria",
    hint: "It is a prosperous European nation ruled with an absolute iron fist!"
  },
  {
    question: "What is Doctor Doom's actual birth name?",
    options: ["Victor von Doom", "Reed Richards", "Victor von Vlad", "Kristoff Vernard"],
    correct: "Victor von Doom",
    hint: "A name that commands supreme respect across all galaxies!"
  },
  {
    question: "In which year did Doctor Doom first grace the panels of Marvel Comics?",
    options: ["1962", "1961", "1963", "1965"],
    correct: "1962",
    hint: "He made his debut in Fantastic Four #5 by Stan Lee and Jack Kirby!"
  },
  {
    question: "Which academic rival does Doctor Doom blame for his scarred face?",
    options: ["Reed Richards", "Tony Stark", "Bruce Banner", "Charles Xavier"],
    correct: "Reed Richards",
    hint: "The detestable, self-righteous leader of the Fantastic Four!"
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type TransitionState = 'idle' | 'glitch' | 'video' | 'zoom';

export default function DoomIntro({ onComplete }: DoomIntroProps) {
  // Shuffle all questions on mount with randomized options
  const [shuffledQuestions] = useState<TriviaQuestion[]>(() => {
    const shuffledQ = shuffleArray(DOOM_TRIVIA);
    return shuffledQ.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const currentQuestion = shuffledQuestions[questionIndex] || shuffledQuestions[0];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [triviaStatus, setTriviaStatus] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [showHint, setShowHint] = useState(false);
  
  // Transition State Machine
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [isMuted, setIsMuted] = useState(true);

  // Hidden/Secret image clicks handler
  const [imageClicks, setImageClicks] = useState(0);
  const [clickMessage, setClickMessage] = useState<string | null>(null);

  // Video Ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // Image Source state — using local asset
  const [imgUrl, setImgUrl] = useState<string>(drDoomImage);
  const [isImgError, setIsImgError] = useState(false);

  const handleImageError = () => {
    if (!isImgError) {
      setIsImgError(true);
      setImgUrl('https://images.unsplash.com/photo-1608889174637-3c44f6326f2a?w=800&q=80');
    }
  };

  // Trigger full transition sequence: Glitch -> Video Playthrough -> Zoom in -> Complete
  const startTransitionSequence = () => {
    if (transitionState !== 'idle') return;

    // Step 1: Glitch Animation
    setTransitionState('glitch');

    // Step 2: Video Playthrough after 800ms glitch burst
    setTimeout(() => {
      setTransitionState('video');
      
      // Step 3: Zoom in after video has played for 4.5 seconds
      setTimeout(() => {
        setTransitionState('zoom');
        
        // Step 4: Complete transition and enter app after 1.5s deep zoom
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 4500);
    }, 800);
  };

  // Triggered when user selects a trivia answer
  const handleSelectOption = (option: string) => {
    if (triviaStatus === 'correct' || transitionState !== 'idle') return;
    
    setSelectedOption(option);
    if (option === currentQuestion.correct) {
      setTriviaStatus('correct');
      setClickMessage(null);
      // Small dramatic beat before sequence starts
      setTimeout(() => {
        startTransitionSequence();
      }, 800);
    } else {
      setTriviaStatus('incorrect');
    }
  };

  // Secret interactive click pattern on the portrait
  const handleImageClick = () => {
    if (transitionState !== 'idle' || triviaStatus === 'correct') return;

    const nextClicks = imageClicks + 1;
    setImageClicks(nextClicks);

    if (nextClicks === 1) {
      setClickMessage("WHO DARES TOUCH THE SOVEREIGN PORTRAIT OF DOOM?!");
    } else if (nextClicks === 2) {
      setClickMessage("CEASE THY IMPERTINENT TAPPING, INSECT!");
    } else if (nextClicks >= 3) {
      setClickMessage("YOU HAVE AWOKEN THE WRATH OF LATVERIA! PORTAL OVERRIDE ACTIVE!");
      startTransitionSequence();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setTriviaStatus('unanswered');
    setShowHint(false);
    setQuestionIndex((prev) => (prev + 1) % shuffledQuestions.length);
  };

  const isTransitioning = transitionState !== 'idle';

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 overflow-y-auto font-mono select-none">
      
      {/* Background Halftone Dust & Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-repeat halftone-bg" />
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 to-stone-950 pointer-events-none" />
      
      {/* Dynamic CRT Scanline wipe overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-scanline" />
      </div>

      {/* Ambient Red/Green Alert Border Indicator based on state */}
      <div className={`absolute inset-0 border-4 sm:border-8 pointer-events-none transition-colors duration-500 ${
        triviaStatus === 'correct' || isTransitioning
          ? 'border-emerald-950/40 animate-pulse' 
          : triviaStatus === 'incorrect' 
          ? 'border-rose-950/40' 
          : 'border-stone-900/40'
      }`} />

      {/* ─── PHASE 1: FULLSCREEN CYBER GLITCH BURST OVERLAY WITH GLITCH.MP4 ───────── */}
      <AnimatePresence>
        {transitionState === 'glitch' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 overflow-hidden animate-glitch-flash"
          >
            {/* The Glitch Video Element */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover filter brightness-125 contrast-150 mix-blend-screen opacity-90"
            >
              <source src="/glitch.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-emerald-500/20 mix-blend-color-dodge animate-glitch pointer-events-none" />
            <div className="absolute inset-0 halftone-red opacity-40 animate-pulse pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-4">
              <Skull className="w-16 h-16 text-emerald-400 mx-auto animate-bounce filter drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              <h2 className="font-comic text-4xl sm:text-6xl text-rose-500 uppercase tracking-widest animate-rgb-shift">
                LATVERIAN SYSTEM BREACH
              </h2>
              <p className="font-mono text-emerald-400 text-sm sm:text-base font-bold uppercase tracking-widest bg-black/80 px-4 py-2 border border-emerald-500 shadow-comic">
                ⚡ OVERRIDE CONFIRMED • INITIATING PORTAL CINEMATIC . . .
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PHASE 2 & 3: FULLSCREEN VIDEO PLAYTHROUGH (SUPER DOOM.MP4) & DEEP ZOOM CONTAINER ─────── */}
      <AnimatePresence>
        {(transitionState === 'video' || transitionState === 'zoom') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={transitionState === 'zoom' ? {
              opacity: 1,
              scale: 55,
              transition: { duration: 1.5, ease: [0.85, 0, 0.15, 1] }
            } : {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.4 }
            }}
            style={{ originX: 0.5, originY: 0.45 }}
            className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center"
          >
            {/* The Video Element */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover filter brightness-105 contrast-110"
            >
              <source src="/super_doom.mp4" type="video/mp4" />
              <source src="/doom_sitting_on_his_throne.mp4" type="video/mp4" />
            </video>

            {/* Video HUD State Overlay (Fades out when zooming) */}
            {transitionState === 'video' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-6 inset-x-0 mx-auto max-w-xl px-4 pointer-events-none flex flex-col items-center"
              >
                <div className="bg-black/80 border-2 border-emerald-500 px-6 py-3 shadow-comic flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="font-comic text-lg sm:text-xl text-white tracking-widest uppercase">
                    SOVEREIGN THRONE GATEWAY LIVE
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 mt-2 bg-stone-950/90 px-3 py-1 border border-emerald-900 font-bold uppercase tracking-wider">
                  NEURAL SYNCHRONIZATION ACTIVE • ZOOMING INTO DOMAIN
                </span>
              </motion.div>
            )}

            {/* Audio Toggle Button during video playback */}
            {transitionState === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-6 right-6 z-50 bg-stone-900/90 hover:bg-stone-800 text-emerald-400 border-2 border-black p-3 shadow-comic transition-all cursor-pointer flex items-center space-x-2 font-mono text-xs font-bold uppercase"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTED'}</span>
              </button>
            )}

            {/* Emerald Energy Flash Overlay during deep zoom */}
            {transitionState === 'zoom' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 1] }}
                transition={{ duration: 1.4, times: [0, 0.5, 1] }}
                className="absolute inset-0 bg-emerald-500 filter blur-md mix-blend-screen pointer-events-none"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN GATEWAY INTERFACE (DISPLAYED DURING IDLE) ────────────────────────── */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 py-8 sm:py-12 max-w-5xl mx-auto relative z-10">

        {/* Latverian Top Banner */}
        <AnimatePresence>
          {!isTransitioning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full flex flex-col items-center text-center px-4 mb-6"
            >
              <div className="bg-red-600 text-white font-comic text-base sm:text-lg font-bold uppercase px-5 py-2.5 border-3 border-black shadow-comic flex items-center space-x-2.5 tracking-wider">
                <Skull className="w-5 h-5 fill-current" />
                <span>LATVERIA SECURITY GATEWAY</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 font-bold uppercase mt-3 tracking-widest px-2">
                TRIVIA OVERRIDE ONLINE • PROVE YOUR INTELLECT TO LORD DOOM
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Core Section: Dual Column Comic layout */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-stretch my-2">
          
          {/* Left Side: The Sovereign Portrait (Zooming/Interactive Image) */}
          <div className="md:col-span-5 flex flex-col justify-center h-64 sm:h-80 md:h-auto md:min-h-[400px]">
            <motion.div
              animate={{ scale: 1 }}
              className="relative w-full h-full border-4 border-black bg-stone-900 rounded-lg shadow-comic-green overflow-hidden flex flex-col justify-between"
            >
              {/* The Image Container */}
              <div 
                onClick={handleImageClick}
                className="w-full h-full relative cursor-pointer overflow-hidden flex-grow group"
              >
                <img
                  src={imgUrl}
                  alt="Sovereign Lord Doom"
                  onError={handleImageError}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-stone-950 select-none pointer-events-none group-hover:scale-105 transition-transform duration-300"
                />

                {/* Grid / Scanning Laser Line Overlay */}
                <div className="absolute inset-0 pointer-events-none border border-emerald-500/20" />
                <div className="absolute inset-x-0 h-0.5 bg-emerald-500/40 shadow-[0_0_8px_#10b981] top-1/3 animate-bounce pointer-events-none" />
                
                {/* Retro comic corner framings */}
                <div className="absolute top-3 left-3 border-t-2 border-l-2 border-emerald-500 w-4 h-4 pointer-events-none" />
                <div className="absolute top-3 right-3 border-t-2 border-r-2 border-emerald-500 w-4 h-4 pointer-events-none" />
                <div className="absolute bottom-3 left-3 border-b-2 border-l-2 border-emerald-500 w-4 h-4 pointer-events-none" />
                <div className="absolute bottom-3 right-3 border-b-2 border-r-2 border-emerald-500 w-4 h-4 pointer-events-none" />

                {/* Target Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <div className="w-10 h-10 rounded-full border border-dashed border-red-500 animate-spin" />
                </div>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="bg-black/90 border-t-2 border-black p-2.5 text-center">
                <span className="text-xs sm:text-sm text-stone-300 font-sans tracking-wide font-medium block">
                  PORTRAIT SECURE • CLICK 3X FOR OVERRIDE GLITCH BREACH
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Side: The Latverian Gatekeeper Trivia Board */}
          <div className="md:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow flex flex-col justify-between bg-stone-900 border-4 border-black p-4 sm:p-6 shadow-comic relative rounded-lg"
                >
                  {/* Supreme Stamp */}
                  <div className="absolute -top-4 right-4 bg-emerald-600 border-3 border-black text-white font-comic text-sm sm:text-base font-bold uppercase px-4 py-1.5 shadow-comic flex items-center space-x-2 z-10 tracking-wider">
                    <Brain className="w-4.5 h-4.5" />
                    <span>INTELLECT CONFIRMATION</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-comic text-lg sm:text-xl uppercase text-emerald-400 tracking-wider mt-2 sm:mt-0">
                      SOVEREIGN TRIVIA CHALLENGE
                    </h3>
                    
                    {/* Status Banner / Feedback */}
                    <div className="min-h-[44px] flex items-center">
                      {clickMessage ? (
                        <div className="w-full bg-amber-950/50 border border-amber-600 text-amber-400 text-xs px-3 py-2 flex items-center space-x-2 rounded">
                          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
                          <span className="font-bold">{clickMessage}</span>
                        </div>
                      ) : triviaStatus === 'correct' ? (
                        <div className="w-full bg-emerald-950/50 border border-emerald-500 text-emerald-400 text-xs px-3 py-2 flex items-center space-x-2 rounded animate-pulse">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span className="font-bold uppercase text-xs sm:text-sm">CORRECT! ACCESS GRANTED. INITIATING CINEMATIC BREACH...</span>
                        </div>
                      ) : triviaStatus === 'incorrect' ? (
                        <div className="w-full bg-rose-950/50 border border-rose-600 text-rose-400 text-xs px-3 py-2 flex items-center space-x-2 rounded">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span className="font-bold uppercase text-xs sm:text-sm">INCORRECT! DOOM REJECTS THIS FOOLISH ANSWER. TRY AGAIN!</span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                          To breach the gateway, demonstrate respect and historical knowledge regarding the Sovereign.
                        </p>
                      )}
                    </div>

                    {/* Trivia Question Box */}
                    <div className="bg-stone-950 border-2 border-black p-3.5 sm:p-4 rounded relative">
                      <p className="font-comic text-stone-100 text-sm sm:text-base md:text-lg leading-snug tracking-wide">
                        "{currentQuestion.question}"
                      </p>
                    </div>

                    {/* Trivia Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {currentQuestion.options.map((option) => {
                        const isSelected = selectedOption === option;
                        let btnClass = "bg-stone-950 border-2 border-stone-800 hover:border-emerald-600 text-stone-200 hover:text-white";
                        
                        if (isSelected) {
                          if (triviaStatus === 'correct') {
                            btnClass = "bg-emerald-800 border-2 border-black text-white shadow-comic-green";
                          } else if (triviaStatus === 'incorrect') {
                            btnClass = "bg-rose-950 border-2 border-rose-600 text-rose-300";
                          }
                        }

                        return (
                          <button
                            key={option}
                            disabled={triviaStatus === 'correct' || isTransitioning}
                            onClick={() => handleSelectOption(option)}
                            className={`p-3 rounded text-left text-xs sm:text-sm uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-between min-h-[44px] ${btnClass}`}
                          >
                            <span>{option}</span>
                            {isSelected && triviaStatus === 'correct' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                            {isSelected && triviaStatus === 'incorrect' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question actions (Hint, next) */}
                  <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between gap-4">
                    <button
                      disabled={triviaStatus === 'correct'}
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs sm:text-sm text-stone-400 hover:text-emerald-400 flex items-center space-x-1.5 transition-colors cursor-pointer uppercase font-bold"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? "Hide Sovereign Hint" : "Request Sovereign Hint"}</span>
                    </button>

                    {triviaStatus === 'incorrect' && (
                      <button
                        onClick={handleNextQuestion}
                        className="text-xs sm:text-sm bg-stone-950 hover:bg-stone-850 text-emerald-400 hover:text-emerald-300 border border-emerald-950 hover:border-emerald-700 px-3.5 py-2 flex items-center space-x-1 transition-colors cursor-pointer uppercase font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Next Question</span>
                      </button>
                    )}
                  </div>

                  {/* Hint Text Display */}
                  {showHint && !isTransitioning && (
                    <div className="mt-2.5 bg-stone-950/90 border border-emerald-900 p-2 text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                      <strong className="text-emerald-400 uppercase font-mono mr-1">Hint:</strong> 
                      {currentQuestion.hint}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Main Bottom Title and Actions */}
        <AnimatePresence>
          {!isTransitioning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg flex flex-col items-center text-center px-4 mt-4 space-y-4 sm:space-y-5"
            >
              {/* Supreme Proclamation Quote card */}
              <div className="bg-stone-900 border-4 border-black p-4 shadow-comic relative w-full rounded-lg">
                <h1 className="font-comic text-lg sm:text-xl md:text-2xl text-white uppercase tracking-wider mb-1 leading-tight">
                  THE DOOM CHRONICLE
                </h1>
                <p className="font-sans font-medium text-stone-200 text-xs sm:text-sm leading-relaxed">
                  "Welcome to my sovereign archive of sequential arts. Here, the opinion of uninformed peasants is abolished. My judgment is flawless, absolute, and ironclad."
                </p>
                <p className="text-xs sm:text-sm text-emerald-400 font-bold font-mono mt-2 uppercase tracking-widest text-center">
                  — VICTOR VON DOOM, SOVEREIGN LORD
                </p>
              </div>

              {/* Direct Entry Button (Triggers sequence or fast entry) */}
              <div className="flex flex-col items-center space-y-2 pt-1">
                <span className="text-xs sm:text-sm text-stone-300 uppercase tracking-widest font-bold">
                  Tired of Gatekeeper Trials?
                </span>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded blur opacity-25 group-hover:opacity-45 transition duration-300" />
                  <button
                    onClick={startTransitionSequence}
                    className="relative bg-stone-900 hover:bg-stone-850 text-emerald-400 hover:text-emerald-300 font-comic text-xs sm:text-sm uppercase px-6 py-2.5 border-2 border-emerald-950 hover:border-emerald-600 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer tracking-wider font-bold"
                  >
                    ⚡ DIRECT ENTRY (Trigger Portal Glitch)
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic Ambient Status Labels */}
        {!isTransitioning && (
          <div className="hidden sm:flex absolute bottom-4 left-4 text-xs font-mono text-stone-400 uppercase items-center space-x-2 select-none font-bold">
            <Shield className="w-4 h-4 animate-spin text-emerald-500" />
            <span>[SYSTEM: TRIVIA PROTOCOLS ACTIVE • PORTAL OVERRIDE ONLINE]</span>
          </div>
        )}
      </div>
    </div>
  );
}
