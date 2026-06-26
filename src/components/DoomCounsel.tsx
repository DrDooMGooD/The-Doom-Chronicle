import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Flame, Shield, HelpCircle, RefreshCw, Send } from 'lucide-react';
import { doomQuotes } from '../data';

export default function DoomCounsel() {
  const [selectedMood, setSelectedMood] = useState<'stern' | 'wrathful' | 'triumphant' | 'benevolent'>('stern');
  const [customQuestion, setCustomQuestion] = useState('');
  const [responseLog, setResponseLog] = useState<{ query: string, mood: string, answer: string }[]>([
    {
      query: 'Does Doom support open-source software?',
      mood: 'benevolent',
      answer: 'Under my guidance, all technology is open to the state and closed to my enemies. If it serves the collective order of Latveria, it is permitted!'
    }
  ]);
  const [isAnswering, setIsAnswering] = useState(false);

  // Simple comic response generator based on questions and mood
  const handleAskDoom = (e: FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isAnswering) return;

    setIsAnswering(true);
    const question = customQuestion;
    setCustomQuestion('');

    setTimeout(() => {
      const moodQuotes = doomQuotes.filter((q) => q.emotion === selectedMood);
      const baseQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)]?.quote || 
                        'Your question is meaningless. I command you to search for better answers!';
      
      // Personalize response slightly based on common topics
      let modifiedAnswer = baseQuote;
      const lowerQ = question.toLowerCase();

      if (lowerQ.includes('game') || lowerQ.includes('play') || lowerQ.includes('xbox') || lowerQ.includes('playstation') || lowerQ.includes('nintendo')) {
        modifiedAnswer = `Ah, virtual simulations! ${baseQuote} Remember that no digital arena can compare to the physical trials of Latveria!`;
      } else if (lowerQ.includes('movie') || lowerQ.includes('film') || lowerQ.includes('cinema') || lowerQ.includes('actor')) {
        modifiedAnswer = `A simple projection of lights! ${baseQuote} Real cinema is the triumph of the state, not the vanity of Hollywood performers.`;
      } else if (lowerQ.includes('comic') || lowerQ.includes('marvel') || lowerQ.includes('book')) {
        modifiedAnswer = `Historical ink and scrolls! ${baseQuote} Let the scribes capture my triumph with bold lines and accurate detail!`;
      }

      setResponseLog((prev) => [
        { query: question, mood: selectedMood, answer: modifiedAnswer },
        ...prev
      ]);
      setIsAnswering(false);
    }, 800);
  };

  return (
    <section id="counsel" className="py-20 bg-stone-950 halftone-bg border-b-8 border-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="relative mb-12 bg-black border-4 border-black p-6 shadow-comic text-center skew-comic-l">
          <span className="absolute -top-4 left-6 bg-red-600 border-2 border-black text-white font-comic text-xs uppercase px-2 py-0.5 rotate-[-3deg] shadow-comic tracking-wide">
            STATE ADVISORY DECK
          </span>
          <h2 className="font-comic text-5xl text-white uppercase tracking-wider">
            ASK DOOM'S COUNSEL
          </h2>
          <p className="font-mono text-xs text-stone-300 mt-2">
            SUBMIT YOUR INQUIRIES DIRECTLY TO THE THRONE OF LATVERIA
          </p>
        </div>

        {/* Console layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls Panel (5 columns) */}
          <div className="lg:col-span-5 bg-stone-900 border-4 border-black p-6 shadow-comic flex flex-col justify-between">
            <div>
              <h3 className="font-comic text-2xl text-white uppercase tracking-wider mb-4 border-b-2 border-black pb-2 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-500 fill-current" />
                <span>SELECT DOOM'S MOOD:</span>
              </h3>

              {/* Mood list */}
              <div className="space-y-2 mb-6">
                {[
                  { id: 'stern', label: 'Stern Ruler', desc: 'Sovereign dictates of absolute law.', color: 'bg-emerald-800' },
                  { id: 'wrathful', label: 'Wrathful Sovereign', desc: 'Fury of Castle Doom directed at fools.', color: 'bg-red-700' },
                  { id: 'triumphant', label: 'Triumphant God', desc: 'Exulting in victory over the cosmos.', color: 'bg-yellow-600' },
                  { id: 'benevolent', label: 'Benevolent Father', desc: 'Merciful guidance for compliant subjects.', color: 'bg-stone-700' }
                ].map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id as any)}
                      className={`w-full text-left p-3 border-2 border-black flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? `${mood.color} text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-x-0.5 translate-y-0.5`
                          : 'bg-stone-950 text-stone-400 hover:text-white hover:bg-stone-900'
                      }`}
                    >
                      <div>
                        <span className="block font-comic text-sm uppercase tracking-wider">{mood.label}</span>
                        <span className="block text-[10px] font-sans text-stone-400 font-medium leading-none mt-1">{mood.desc}</span>
                      </div>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom input form */}
              <form onSubmit={handleAskDoom} className="space-y-3">
                <label className="block text-stone-400 font-mono text-[10px] font-bold uppercase">ENTER INQUIRY:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={isAnswering}
                    placeholder="e.g. Is Elden Ring worth the pain?"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="w-full bg-stone-950 text-white font-mono text-xs border-2 border-black px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-hidden focus:border-red-600 focus:shadow-none placeholder:text-stone-600 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isAnswering}
                    className="absolute right-2 top-2 bg-red-600 text-white p-1.5 border border-black hover:bg-red-500 cursor-pointer disabled:bg-stone-800"
                  >
                    {isAnswering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 border-t border-stone-800 pt-4 text-[10px] font-mono text-stone-500 flex items-center justify-between">
              <span>LATVERIAN DIALECT PORT 80</span>
              <span className="font-bold text-emerald-600">ONLINE</span>
            </div>
          </div>

          {/* Response Console Box (7 columns) */}
          <div className="lg:col-span-7 bg-stone-900 border-4 border-black p-5 shadow-comic flex flex-col justify-between relative min-h-[400px]">
            <div className="absolute inset-0 halftone-green opacity-15 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col justify-between">
              
              <div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
                <span className="font-comic text-lg text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>THRONE RESPONSE FEED</span>
                </span>
                <span className="bg-black text-[9px] font-mono font-bold text-stone-400 px-2 py-0.5 border border-stone-800">
                  REAL-TIME DICTATION
                </span>
              </div>

              {/* Speech feed list */}
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] pr-2">
                <AnimatePresence initial={false}>
                  {responseLog.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-stone-800 bg-stone-950 p-4 relative"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 mb-2 border-b border-stone-900 pb-1">
                        <span className="text-red-500 uppercase">SUBJECT ASKED: "{log.query}"</span>
                        <span className="bg-emerald-950 text-emerald-500 px-1 rounded-sm uppercase font-bold">{log.mood}</span>
                      </div>
                      
                      {/* Comic style speech bubble representation */}
                      <div className="bg-stone-900 text-stone-100 p-3 border-l-4 border-emerald-500 font-sans text-xs sm:text-sm font-semibold leading-relaxed relative italic">
                        "{log.answer}"
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isAnswering && (
                  <div className="flex items-center space-x-2 text-stone-500 font-mono text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    <span>DOOM IS FORMULATING AN ABSOLUTE DICTUM...</span>
                  </div>
                )}
              </div>

              {/* Base instruction */}
              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] font-sans text-stone-400 leading-relaxed italic flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>Submit questions regarding games, cinema, and comic book stories to receive sovereign instruction.</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
