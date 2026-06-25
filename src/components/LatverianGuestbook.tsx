import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Shield, User, Globe, ThumbsUp, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { GuestbookEntry } from '../types';
import { initialGuestbook } from '../data';

export default function LatverianGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [allegiance, setAllegiance] = useState<'loyalist' | 'rebel' | 'doombot' | 'foreigner'>('loyalist');
  const [country, setCountry] = useState('Latveria');
  const [tribute, setTribute] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'warn' | null, message: string }>({ type: null, message: '' });

  // Initialize and load guestbook
  useEffect(() => {
    const saved = localStorage.getItem('latveria_registry_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        setEntries(initialGuestbook);
      }
    } else {
      setEntries(initialGuestbook);
      localStorage.setItem('latveria_registry_entries', JSON.stringify(initialGuestbook));
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tribute.trim()) return;

    let finalName = name;
    let accepted = true;
    let warnMsg = '';

    // Playful modifications based on selected allegiance
    if (allegiance === 'doombot') {
      const randomID = Math.floor(1000 + Math.random() * 9000);
      finalName = `DOOMBOT-v${randomID} [${name}]`;
    } else if (allegiance === 'rebel') {
      accepted = false;
      warnMsg = 'REBEL DETECTED! Your insolent signature has been captured. Doombots have been dispatched to your global location. Submission blocked.';
    }

    if (!accepted) {
      setNotification({ type: 'warn', message: warnMsg });
      setTimeout(() => setNotification({ type: null, message: '' }), 6000);
      return;
    }

    const newEntry: GuestbookEntry = {
      id: `g-${Date.now()}`,
      name: finalName,
      allegiance,
      country,
      tribute,
      timestamp: new Date().toISOString(),
      acceptedByDoom: true
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('latveria_registry_entries', JSON.stringify(updated));

    // Reset inputs
    setName('');
    setTribute('');
    
    setNotification({ type: 'success', message: 'Tribute received by the Castle Scribes! Your loyalty has been registered.' });
    setTimeout(() => setNotification({ type: null, message: '' }), 4000);
  };

  const clearEntries = () => {
    localStorage.setItem('latveria_registry_entries', JSON.stringify(initialGuestbook));
    setEntries(initialGuestbook);
  };

  return (
    <section id="tribute" className="py-20 bg-stone-900 halftone-bg border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Grid */}
        <div className="relative mb-12 bg-black border-4 border-black p-6 shadow-comic-red text-center skew-comic-r">
          <span className="absolute -top-4 right-6 bg-emerald-700 border-2 border-black text-white font-comic text-xs uppercase px-2 py-0.5 rotate-[3deg] shadow-comic">
            STATE CENSUS OFFICE
          </span>
          <h2 className="font-comic text-5xl text-white uppercase tracking-wider">
            THE LATVERIAN REGISTRY
          </h2>
          <p className="font-mono text-xs text-stone-300 mt-2">
            SIGN THE LEDGER OF SUBJECTS AND REPORT YOUR ALLEGIANCE
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Registry Sign Form (5 Columns) */}
          <div className="lg:col-span-5 bg-stone-950 border-4 border-black p-6 shadow-comic relative">
            <h3 className="font-comic text-2xl text-white uppercase tracking-wider mb-4 border-b-2 border-stone-800 pb-2 flex items-center space-x-2">
              <PenTool className="w-5 h-5 text-red-500" />
              <span>SIGN THE LEDGER</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-stone-200">
              
              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">YOUR IDENTIFICATION / CODENAME</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victor, Reed-Slayer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-900 text-white border-2 border-black pl-10 pr-4 py-2.5 focus:outline-hidden focus:border-red-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">PROVINCE / COUNTRY</label>
                  <div className="relative flex items-center">
                    <Globe className="absolute left-3 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Latveria, USA"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-stone-900 text-white border-2 border-black pl-10 pr-4 py-2.5 focus:outline-hidden focus:border-red-600 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-bold uppercase mb-1">ALLEGIANCE DECLARATION</label>
                  <select
                    value={allegiance}
                    onChange={(e) => setAllegiance(e.target.value as any)}
                    className="w-full bg-stone-900 text-white border-2 border-black px-3 py-2.5 focus:outline-hidden focus:border-red-600 uppercase font-bold"
                  >
                    <option value="loyalist">🛡️ Loyal Subject</option>
                    <option value="doombot">🤖 Doombot Recruit</option>
                    <option value="foreigner">🌍 Foreign Envoy</option>
                    <option value="rebel">🔥 Defiant Rebel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-bold uppercase mb-1">STATEMENT OF TRIBUTE / PRAISE</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Express your supreme loyalty or state of admiration..."
                  value={tribute}
                  onChange={(e) => setTribute(e.target.value)}
                  className="w-full bg-stone-900 text-white border-2 border-black px-4 py-2.5 focus:outline-hidden focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-comic text-xl uppercase py-3 border-4 border-black shadow-comic active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  STAMP SOVEREIGN COUPLING →
                </button>
              </div>

            </form>

            {/* In-app floating feedback alerts */}
            <AnimatePresence>
              {notification.type && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className={`mt-4 border-2 border-black p-4 flex items-start space-x-3 ${
                    notification.type === 'success'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                      : 'bg-red-950 text-red-400 border-red-500 animate-bounce'
                  }`}
                >
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  )}
                  <p className="font-mono text-xs">{notification.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Signed Registry Feed (7 Columns) */}
          <div className="lg:col-span-7 bg-stone-950 border-4 border-black p-6 shadow-comic relative min-h-[450px] flex flex-col justify-between">
            <div className="absolute inset-0 halftone-green opacity-10 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col justify-between">
              
              {/* Header */}
              <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="font-comic text-2xl text-white uppercase tracking-wider">SECURE GENERAL ROLL</span>
                </div>
                <button
                  onClick={clearEntries}
                  className="font-mono text-[10px] text-red-500 font-bold uppercase hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>RESET ROLL</span>
                </button>
              </div>

              {/* Feed items */}
              <div className="flex-1 space-y-4 max-h-[380px] overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="bg-stone-900 border-2 border-black p-4 relative shadow-comic"
                    >
                      {/* Allegiance Badge Tag */}
                      <span className={`absolute -top-3.5 right-4 border-2 border-black text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] ${
                        entry.allegiance === 'loyalist'
                          ? 'bg-emerald-700 text-white'
                          : entry.allegiance === 'doombot'
                          ? 'bg-stone-950 text-stone-400 border-stone-800'
                          : 'bg-red-600 text-white'
                      }`}>
                        {entry.allegiance}
                      </span>

                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-comic text-lg text-emerald-400 tracking-wide uppercase">
                          {entry.name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 font-semibold uppercase">
                          OF {entry.country}
                        </span>
                      </div>

                      <p className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed italic border-l-2 border-red-500 pl-3 bg-stone-950/40 py-1.5">
                        "{entry.tribute}"
                      </p>

                      <div className="mt-2 text-[9px] font-mono text-stone-500 flex justify-between items-center">
                        <span>TIMESTAMP SECURE: {new Date(entry.timestamp).toLocaleDateString()}</span>
                        <span className="text-emerald-500 font-bold uppercase flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span>VERIFIED BY CASTLE CLERKS</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
