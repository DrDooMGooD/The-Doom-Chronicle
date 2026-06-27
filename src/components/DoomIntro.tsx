import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Skull, Eye, HelpCircle, Sparkles, AlertCircle, Brain, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

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

export default function DoomIntro({ onComplete }: DoomIntroProps) {
  // Shuffle all questions on mount with randomized options
  const [shuffledQuestions, setShuffledQuestions] = useState<TriviaQuestion[]>(() => {
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
  const [isZooming, setIsZooming] = useState(false);

  // Hidden/Secret image clicks handler
  const [imageClicks, setImageClicks] = useState(0);
  const [clickMessage, setClickMessage] = useState<string | null>(null);

  // Image Source state with robust fallbacks
  const [imgUrl, setImgUrl] = useState('https://scontent.fsac1-2.fna.fbcdn.net/v/t1.6435-9/91911962_10156590858810834_6532539154343919616_n.jpg?stp=dst-jpg_tt6&cstp=mx916x916&ctp=s916x916&_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=EX83k_UbQFsQ7kNvwE23SBR&_nc_oc=AdrOQ-L3PYRerarsOctq4WfFfhq7dMW47NEZeeB-1q3v_lYp78JfTWcsXBrxsOKMKH3pFZyYdu9c5nio4bR5qmi_&_nc_zt=23&_nc_ht=scontent.fsac1-2.fna&_nc_gid=4ReUjnNPAdhH14KO3uedug&_nc_ss=7b2a8&oh=00_Af_9nAYKpxHYYIk09eURTYnRO6ClRfR4gWOXSbE_vG7wXw&oe=6A668F47');
  const [isImgError, setIsImgError] = useState(false);

  const handleImageError = () => {
    if (!isImgError) {
      setIsImgError(true);
      // Fallback to a high-quality stylized metallic helmet/mask illustration
      setImgUrl('https://images.unsplash.com/photo-1608889174637-3c44f6326f2a?w=800&q=80');
    }
  };

  const handleApproach = () => {
    setIsZooming(true);
    setTimeout(() => {
      onComplete();
    }, 1800);
  };

  // Triggered when user selects a trivia answer
  const handleSelectOption = (option: string) => {
    if (triviaStatus === 'correct' || isZooming) return;
    
    setSelectedOption(option);
    if (option === currentQuestion.correct) {
      setTriviaStatus('correct');
      setClickMessage(null); // Clear click warnings
      // Delay slightly for dramatic flair before entering
      setTimeout(() => {
        handleApproach();
      }, 1500);
    } else {
      setTriviaStatus('incorrect');
      // Decrement clicks just in case or keep separate
    }
  };

  // Secret interactive click pattern on the image
  const handleImageClick = () => {
    if (isZooming || triviaStatus === 'correct') return;

    const nextClicks = imageClicks + 1;
    setImageClicks(nextClicks);

    if (nextClicks === 1) {
      setClickMessage("WHO DARES TOUCH THE SOVEREIGN PORTRAIT OF DOOM?!");
    } else if (nextClicks === 2) {
      setClickMessage("CEASE THY IMPERTINENT TAPPING, INSECT!");
    } else if (nextClicks >= 3) {
      setClickMessage("YOU HAVE AWOKEN THE WRATH OF LATVERIA! PORTAL OVERRIDE ACTIVE!");
      handleApproach();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setTriviaStatus('unanswered');
    setShowHint(false);
    // Cycle to the next shuffled question
    setQuestionIndex((prev) => (prev + 1) % shuffledQuestions.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 overflow-y-auto font-mono select-none">
      
      {/* Background Halftone Dust & Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-repeat halftone-bg" />
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 to-stone-950 pointer-events-none" />
      
      {/* Ambient Red/Green Alert Border Indicator based on state */}
      <div className={`absolute inset-0 border-4 sm:border-8 pointer-events-none transition-colors duration-500 ${
        triviaStatus === 'correct' 
          ? 'border-emerald-950/30 animate-pulse' 
          : triviaStatus === 'incorrect' 
          ? 'border-rose-950/40' 
          : 'border-stone-900/40'
      }`} />

      {/* Main scrolling wrapper */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 py-8 sm:py-12 max-w-5xl mx-auto relative z-10">

        {/* Latverian Top Banner */}
        <AnimatePresence>
          {!isZooming && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full flex flex-col items-center text-center px-4 mb-6"
            >
              <div className="bg-red-600 text-white font-comic text-xs uppercase px-3 py-1.5 border-2 border-black rotate-[-1deg] shadow-comic flex items-center space-x-2">
                <Skull className="w-4 h-4 fill-current" />
                <span>LATVERIA SECURITY GATEWAY</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-stone-500 font-bold uppercase mt-3 tracking-widest px-2">
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
              animate={isZooming ? {
                scale: 45,
                transition: { duration: 1.8, ease: [0.85, 0, 0.15, 1] }
              } : {
                scale: 1,
                transition: { duration: 0.5 }
              }}
              style={{
                originX: 0.5,
                originY: 0.4
              }}
              className={`${
                isZooming 
                  ? 'fixed inset-0 z-50 border-0 m-0 rounded-none' 
                  : 'relative w-full h-full border-4 border-black bg-stone-900 rounded-lg shadow-comic-green overflow-hidden flex flex-col justify-between'
              }`}
            >
              {/* The Image Container */}
              <div 
                onClick={handleImageClick}
                className="w-full h-full relative cursor-pointer overflow-hidden flex-grow"
              >
                <img
                  src={imgUrl}
                  alt="Sovereign Lord Doom"
                  onError={handleImageError}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-stone-950 select-none pointer-events-none"
                />

                {/* Grid / Scanning Laser Line Overlay */}
                {!isZooming && (
                  <>
                    <div className="absolute inset-0 pointer-events-none border border-emerald-500/20" />
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500/30 shadow-[0_0_8px_#10b981] top-1/3 animate-bounce pointer-events-none" />
                    
                    {/* Retro comic corner framings */}
                    <div className="absolute top-3 left-3 border-t-2 border-l-2 border-emerald-500 w-4 h-4 pointer-events-none" />
                    <div className="absolute top-3 right-3 border-t-2 border-r-2 border-emerald-500 w-4 h-4 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 border-b-2 border-l-2 border-emerald-500 w-4 h-4 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 border-b-2 border-r-2 border-emerald-500 w-4 h-4 pointer-events-none" />

                    {/* Target Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <div className="w-10 h-10 rounded-full border border-dashed border-red-500 animate-spin" />
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Caption Overlay */}
              {!isZooming && (
                <div className="bg-black/90 border-t-2 border-black p-2 text-center">
                  <span className="text-[9px] sm:text-[10px] text-stone-400 font-sans tracking-wide block">
                    PORTRAIT SECURE • CLICK MASK FOR SECRET CHRONICLE CODES
                  </span>
                </div>
              )}

              {/* Portal Flash Overlay that triggers inside the zoom */}
              {isZooming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 1] }}
                  transition={{ duration: 1.4, times: [0, 0.6, 1] }}
                  className="absolute inset-0 bg-emerald-500 rounded-none filter blur-md mix-blend-screen pointer-events-none"
                />
              )}
            </motion.div>
          </div>

          {/* Right Side: The Latverian Gatekeeper Trivia Board */}
          <div className="md:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              {!isZooming && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow flex flex-col justify-between bg-stone-900 border-4 border-black p-4 sm:p-6 shadow-comic relative rounded-lg"
                >
                  {/* Supreme Stamp */}
                  <div className="absolute -top-3 right-4 bg-emerald-600 border-2 border-black text-white font-comic text-[9px] sm:text-[10px] uppercase px-2.5 py-1 rotate-[2deg] shadow-comic flex items-center space-x-1.5 z-10">
                    <Brain className="w-3.5 h-3.5" />
                    <span>INTELLECT CONFIRMATION</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-comic text-base sm:text-lg uppercase text-emerald-400 tracking-wide mt-2 sm:mt-0">
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
                          <span className="font-bold uppercase text-[10px] sm:text-xs">CORRECT! ACCESS GRANTED TO THE DOMAIN. PORTAL OPENING...</span>
                        </div>
                      ) : triviaStatus === 'incorrect' ? (
                        <div className="w-full bg-rose-950/50 border border-rose-600 text-rose-400 text-xs px-3 py-2 flex items-center space-x-2 rounded">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span className="font-bold uppercase text-[10px] sm:text-xs">INCORRECT! DOOM REJECTS THIS FOOLISH ANSWER. TRY AGAIN!</span>
                        </div>
                      ) : (
                        <p className="text-[11px] sm:text-xs text-stone-400 font-sans leading-relaxed">
                          To breach the gateway, you must demonstrate a standard level of respect and historical knowledge regarding the Sovereign.
                        </p>
                      )}
                    </div>

                    {/* Trivia Question Box */}
                    <div className="bg-stone-950 border-2 border-black p-3.5 sm:p-4 rounded relative">
                      <p className="font-comic text-stone-100 text-xs sm:text-sm md:text-base leading-snug">
                        "{currentQuestion.question}"
                      </p>
                    </div>

                    {/* Trivia Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {currentQuestion.options.map((option) => {
                        const isSelected = selectedOption === option;
                        let btnClass = "bg-stone-950 border-2 border-stone-800 hover:border-emerald-600 text-stone-300 hover:text-white";
                        
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
                            disabled={triviaStatus === 'correct' || isZooming}
                            onClick={() => handleSelectOption(option)}
                            className={`p-2.5 rounded text-left text-[11px] sm:text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-between min-h-[40px] ${btnClass}`}
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
                      className="text-[9px] sm:text-[10px] text-stone-400 hover:text-emerald-400 flex items-center space-x-1.5 transition-colors cursor-pointer uppercase"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? "Hide Sovereign Hint" : "Request Sovereign Hint"}</span>
                    </button>

                    {triviaStatus === 'incorrect' && (
                      <button
                        onClick={handleNextQuestion}
                        className="text-[9px] sm:text-[10px] bg-stone-950 hover:bg-stone-850 text-emerald-400 hover:text-emerald-300 border border-emerald-950 hover:border-emerald-700 px-2.5 py-1.5 flex items-center space-x-1 transition-colors cursor-pointer uppercase"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Next Question</span>
                      </button>
                    )}
                  </div>

                  {/* Hint Text Display */}
                  {showHint && !isZooming && (
                    <div className="mt-2.5 bg-stone-950/90 border border-emerald-900 p-2 text-[10px] sm:text-[11px] text-stone-300 font-sans leading-relaxed">
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
          {!isZooming && (
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
                <p className="font-sans font-medium text-stone-300 text-[10px] sm:text-xs leading-relaxed">
                  "Welcome to my sovereign archive of sequential arts. Here, the opinion of uninformed peasants is abolished. My judgment is flawless, absolute, and ironclad."
                </p>
                <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold font-mono mt-2 uppercase tracking-widest text-center">
                  — VICTOR VON DOOM, SOVEREIGN LORD
                </p>
              </div>

              {/* Direct Entry Button (Made highly apparent and styled) */}
              <div className="flex flex-col items-center space-y-2 pt-1">
                <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                  Tired of Gatekeeper Trials?
                </span>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded blur opacity-25 group-hover:opacity-45 transition duration-300" />
                  <button
                    onClick={onComplete}
                    className="relative bg-stone-900 hover:bg-stone-850 text-emerald-400 hover:text-emerald-300 font-comic text-xs uppercase px-5 py-2 border-2 border-emerald-950 hover:border-emerald-600 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer tracking-wider"
                  >
                    ⚡ DIRECT ENTRY (Skip Security Gate)
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic Ambient Status Labels */}
        {!isZooming && (
          <div className="hidden sm:flex absolute bottom-4 left-4 text-[9px] font-mono text-stone-600 uppercase items-center space-x-1.5 select-none">
            <Shield className="w-3.5 h-3.5 animate-spin text-stone-600" />
            <span>[SYSTEM: TRIVIA PROTOCOLS ACTIVE • DIRECT ENTRY POWERED]</span>
          </div>
        )}
      </div>
    </div>
  );
}
