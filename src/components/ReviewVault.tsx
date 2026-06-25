import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Film, Gamepad2, Book, AlertTriangle, Shield, Check, Flame, Star } from 'lucide-react';
import { articles } from '../data';
import { Article } from '../types';

export default function ReviewVault() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'game' | 'comic' | 'movie'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Community proposal form states
  const [pitchTitle, setPitchTitle] = useState('');
  const [pitchCategory, setPitchCategory] = useState<'game' | 'comic' | 'movie'>('game');
  const [pitchText, setPitchText] = useState('');
  const [pitchName, setPitchName] = useState('');
  const [pitchEmail, setPitchEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formspreeStatus, setFormspreeStatus] = useState<'success' | 'error' | null>(null);
  const [pitchResponse, setPitchResponse] = useState<{ status: 'accepted' | 'rejected' | 'incinerated' | null, message: string }>({ status: null, message: '' });

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Doom's automatic comical response system for submitted pitches
  const handlePitchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pitchTitle.trim() || !pitchText.trim() || !pitchName.trim() || !pitchEmail.trim()) return;

    setIsSubmitting(true);
    setFormspreeStatus(null);

    const lowerText = pitchText.toLowerCase();
    const lowerTitle = pitchTitle.toLowerCase();

    let status: 'accepted' | 'rejected' | 'incinerated' = 'rejected';
    let message = '';

    if (lowerText.includes('richards') || lowerTitle.includes('richards') || lowerText.includes('reed')) {
      status = 'incinerated';
      message = `FOOL! You dare bring the name of that charlatan Reed Richards into my presence? Your proposal has been vaporized by Castle Doom’s defensive laser grid. Speak of this again and suffer absolute exile!`;
    } else if (lowerText.includes('doom') || lowerTitle.includes('doom') || lowerText.includes('masterpiece') || lowerText.includes('sovereign')) {
      status = 'accepted';
      message = `Intelligent peasant! Your pitch regarding the greatness of Latveria or the genius of Doom is highly logical. I have instructed my scribe-doombots to register your article in the State Archive. You are granted 5 extra ration stamps this week.`;
    } else {
      status = 'rejected';
      message = `Doom is unimpressed by your simplistic analysis of "${pitchTitle}". Your prose lacks the iron-clad scientific rigor required for publication. Revise your thesis, or I shall have a Doombot do it for you!`;
    }

    setPitchResponse({ status, message });

    const formspreeFormId = (import.meta as any).env.VITE_FORMSPREE_FORM_ID;
    const formspreeUrl = formspreeFormId
      ? (formspreeFormId.startsWith('http') ? formspreeFormId : `https://formspree.io/f/${formspreeFormId}`)
      : '';

    if (formspreeUrl) {
      try {
        const response = await fetch(formspreeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: pitchName,
            email: pitchEmail,
            title: pitchTitle,
            category: pitchCategory,
            manuscript: pitchText,
            doom_verdict: status.toUpperCase(),
            doom_response: message,
          }),
        });

        if (response.ok) {
          setFormspreeStatus('success');
          setPitchTitle('');
          setPitchText('');
          setPitchName('');
          setPitchEmail('');
        } else {
          setFormspreeStatus('error');
        }
      } catch (err) {
        console.error('Error submitting to Formspree:', err);
        setFormspreeStatus('error');
      }
    } else {
      // Offline / Simulation mode
      setFormspreeStatus('success');
      setPitchTitle('');
      setPitchText('');
      setPitchName('');
      setPitchEmail('');
    }

    setIsSubmitting(false);
  };

  return (
    <section id="reviews" className="py-20 bg-stone-900 halftone-bg border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Panel styled like an authentic comic header block */}
        <div className="relative mb-12 bg-black border-4 border-black p-6 shadow-comic-green text-center skew-comic-r">
          <div className="absolute -top-4 -right-3 bg-red-600 border-2 border-black text-white font-comic text-xs uppercase px-2 py-1 rotate-[5deg] shadow-comic">
            DOOM'S VERDICT IS LAW!
          </div>
          <h2 className="font-comic text-5xl sm:text-6xl text-white tracking-wider uppercase">
            THE SOVEREIGN REVIEW ARCHIVE
          </h2>
          <p className="font-mono text-xs sm:text-sm text-stone-300 mt-2">
            CRITIQUING CINEMATIC ADAPTATIONS, VIRTUAL SIMULATIONS, AND SEQUENTIAL ILLUSTRATIONS
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          
          {/* Category Filters (Left) */}
          <div className="md:col-span-8 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Scrolls', icon: null },
              { id: 'game', label: 'Video Games', icon: <Gamepad2 className="w-4 h-4 text-emerald-400" /> },
              { id: 'comic', label: 'Comic Books', icon: <Book className="w-4 h-4 text-rose-500" /> },
              { id: 'movie', label: 'Movies & Cinema', icon: <Film className="w-4 h-4 text-red-500" /> }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center space-x-1.5 font-mono text-xs font-bold uppercase px-4 py-2.5 border-2 border-black cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-700 text-white shadow-none translate-x-0.5 translate-y-0.5'
                    : 'bg-stone-950 text-stone-300 hover:text-white'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box (Right) */}
          <div className="md:col-span-4 relative flex items-center">
            <input
              type="text"
              placeholder="SEARCH SECURE ARCHIVES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 text-white font-mono text-xs font-bold border-2 border-black px-4 py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-hidden focus:border-rose-600 focus:shadow-none transition-all placeholder:text-stone-500 uppercase"
            />
            <Search className="absolute right-3 w-4 h-4 text-stone-500" />
          </div>

        </div>

        {/* Reviews Bento Grid Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-stone-950 border-4 border-black p-5 shadow-comic flex flex-col justify-between hover:scale-[1.01] transition-transform relative group overflow-hidden"
                >
                  {/* Decorative corner tag */}
                  <div className={`absolute top-0 right-0 w-8 h-8 ${isEven ? 'bg-red-600' : 'bg-emerald-700'} border-b-2 border-l-2 border-black rotate-45 translate-x-4 -translate-y-4`} />
                  
                  <div>
                    {/* Header: Date and category */}
                    <div className="flex items-center justify-between mb-3 text-[10px] font-mono font-bold text-stone-400">
                      <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 uppercase flex items-center space-x-1">
                        {article.category === 'game' && <Gamepad2 className="w-3 h-3 text-emerald-400" />}
                        {article.category === 'comic' && <Book className="w-3 h-3 text-rose-500" />}
                        {article.category === 'movie' && <Film className="w-3 h-3 text-red-500" />}
                        <span>{article.category}</span>
                      </span>
                      <span>{article.publishDate}</span>
                    </div>

                    {/* Comic Panel Cover Image representation */}
                    <div className="relative border-2 border-black overflow-hidden mb-4 aspect-video shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-125"
                      />
                      <div className="absolute bottom-2 left-2 bg-black border border-white px-2 py-1 flex items-center space-x-1 font-comic text-yellow-400 text-sm">
                        <Shield className="w-3.5 h-3.5 fill-current" />
                        <span>DOOM RATIO: {article.doomRating}/5</span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="font-comic text-2xl text-white tracking-wide leading-tight group-hover:text-emerald-400 transition-colors uppercase">
                      {article.title}
                    </h3>

                    {/* Subtitle / Quote intro */}
                    <p className="font-sans font-bold text-xs text-rose-500 mt-1 uppercase tracking-wider">
                      {article.subtitle}
                    </p>

                    {/* Excerpt */}
                    <p className="text-stone-300 text-xs mt-3 leading-relaxed font-sans line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Read Button & Custom Rating graphic */}
                  <div className="mt-6 pt-4 border-t-2 border-stone-800 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-stone-500 font-bold uppercase">{article.readTime}</span>
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="bg-emerald-800 group-hover:bg-rose-600 text-white font-comic text-sm uppercase py-1.5 px-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                    >
                      READ DECREE →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Submission Panel: "Submit Your Article Pitch to Lord Doom" */}
        <div id="proposal-box" className="mt-20 bg-stone-950 border-4 border-black p-6 sm:p-8 shadow-comic-red relative overflow-hidden">
          <div className="absolute inset-0 halftone-red opacity-15 pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Call to Action Text */}
            <div className="lg:col-span-5">
              <h3 className="font-comic text-4xl text-white uppercase tracking-wider">
                PROPOSE AN ARTICLE COURIER
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                Do you possess a review or analytical scroll of high scientific merit? Submit your draft pitch directly to the Sovereign Desk of Latveria. 
                Lord Doom himself oversees all literary additions to his State Chronicle. 
              </p>
              <div className="mt-4 flex items-center space-x-2 text-xs font-mono font-bold text-red-500 uppercase bg-black px-3 py-2 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>WARNING: INCORRECT SENTIMENT REGARDING REED RICHARDS WILL RESULT IN IMMEDIATE EXTINCTION.</span>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-stone-900 border-2 border-black p-5 shadow-comic relative">
              <form onSubmit={handlePitchSubmit} className="space-y-4">
                
                {/* Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 font-mono text-[10px] font-bold uppercase mb-1">COURIER NAME / AGENT CODE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Agent Doom-77"
                      value={pitchName}
                      onChange={(e) => setPitchName(e.target.value)}
                      className="w-full bg-stone-950 text-white font-mono text-xs border border-stone-800 px-3 py-2 uppercase placeholder:text-stone-600 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-stone-400 font-mono text-[10px] font-bold uppercase mb-1">COURIER EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. agent@latveria.gov"
                      value={pitchEmail}
                      onChange={(e) => setPitchEmail(e.target.value)}
                      className="w-full bg-stone-950 text-white font-mono text-xs border border-stone-800 px-3 py-2 placeholder:text-stone-600 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 font-mono text-[10px] font-bold uppercase mb-1">PROPOSAL TITLE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. why reed richards is a failure"
                      value={pitchTitle}
                      onChange={(e) => setPitchTitle(e.target.value)}
                      className="w-full bg-stone-950 text-white font-mono text-xs border border-stone-800 px-3 py-2 uppercase placeholder:text-stone-600 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-stone-400 font-mono text-[10px] font-bold uppercase mb-1">COURIER CATEGORY</label>
                    <select
                      value={pitchCategory}
                      onChange={(e) => setPitchCategory(e.target.value as any)}
                      className="w-full bg-stone-950 text-white font-mono text-xs border border-stone-800 px-3 py-2 uppercase focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="game">🎮 Video Games</option>
                      <option value="comic">📚 Comic Books</option>
                      <option value="movie">🎬 Cinematic Film</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-mono text-[10px] font-bold uppercase mb-1">BRIEF MANUSCRIPT EXTRACT (OR HOMAGE)</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide your thesis for Lord Doom’s evaluation..."
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="w-full bg-stone-950 text-white font-mono text-xs border border-stone-800 px-3 py-2 placeholder:text-stone-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* Formspree connection badge/indicator */}
                <div className="text-[9px] font-mono border p-2 bg-stone-950 border-stone-800 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 font-bold uppercase">UPLINK REGISTRY</span>
                    {(import.meta as any).env.VITE_FORMSPREE_FORM_ID ? (
                      <span className="text-emerald-500 font-bold">● ACTIVE (LIVE FORMSPREE UPLINK)</span>
                    ) : (
                      <span className="text-yellow-500 font-bold">○ SIMULATED (OFFLINE TEST MODE)</span>
                    )}
                  </div>
                  {!(import.meta as any).env.VITE_FORMSPREE_FORM_ID && (
                    <p className="text-stone-500 leading-tight">
                      To receive pitches in your real email inbox, add <code className="text-emerald-400 font-mono">VITE_FORMSPREE_FORM_ID</code> (your Formspree form ID or endpoint URL) into the project environment settings.
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-wider">DOOMBOT REVIEW PROTOCOL 77-A</span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-stone-800 text-white font-comic text-lg uppercase px-6 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'TRANSMITTING...' : 'SUBMIT MANUSCRIPT →'}
                  </button>
                </div>

              </form>

              {/* Submission status feedback (Formspree) */}
              <AnimatePresence>
                {formspreeStatus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-4 border-2 border-black p-4 text-xs font-mono relative ${
                      formspreeStatus === 'success'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                        : 'bg-red-950 text-red-400 border-red-500'
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5 mb-1 text-[11px]">
                      {formspreeStatus === 'success' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>SECURE TRANSMISSION SUCCESSFUL</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>TRANSMISSION FAILED</span>
                        </>
                      )}
                    </div>
                    <p>
                      {formspreeStatus === 'success'
                        ? ((import.meta as any).env.VITE_FORMSPREE_FORM_ID 
                          ? "Uplink verified. Your analytical scroll has bypassed defense walls and has been securely routed to the state mailbox!"
                          : "Simulated submission successful! Once you add VITE_FORMSPREE_FORM_ID in settings, this submission will route directly to your email inbox.")
                        : "State scramblers detected interference during transmission. Verify your VITE_FORMSPREE_FORM_ID settings and try again."
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic comical pitch responses */}
              <AnimatePresence>
                {pitchResponse.status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`mt-4 border-2 border-black p-4 text-xs font-mono relative ${
                      pitchResponse.status === 'accepted'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                        : pitchResponse.status === 'incinerated'
                        ? 'bg-red-950 text-red-400 border-red-500 animate-pulse'
                        : 'bg-stone-950 text-yellow-500 border-yellow-500'
                    }`}
                  >
                    <div className="font-bold flex items-center space-x-1.5 mb-1 text-[11px]">
                      {pitchResponse.status === 'accepted' && <Check className="w-4 h-4 text-emerald-400" />}
                      {pitchResponse.status === 'incinerated' && <Flame className="w-4 h-4 text-red-500" />}
                      <span>DECISION OF DOOM: {pitchResponse.status.toUpperCase()}</span>
                    </div>
                    <p>{pitchResponse.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </div>

      </div>

      {/* Reader Modal: Overlay of Doom’s Chronicle Full Reading scrolls */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-950 border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-comic-lg relative text-stone-100"
            >
              
              {/* Modal Banner */}
              <div className="bg-emerald-950 border-b-4 border-black p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-comic text-xl text-white tracking-widest">LATVERIAN ARCHIVE DECREE</span>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs border-2 border-black px-3 py-1 cursor-pointer transition-colors uppercase"
                >
                  X CLOSE
                </button>
              </div>

              {/* Cover visual representation */}
              <div className="relative h-64 sm:h-80 border-b-4 border-black">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2.5 py-1 border border-black uppercase rounded-xs">
                    {selectedArticle.category}
                  </span>
                  <h3 className="font-comic text-4xl sm:text-5xl text-white uppercase mt-2 tracking-wide leading-tight drop-shadow-md">
                    {selectedArticle.title}
                  </h3>
                  <p className="font-sans font-bold text-sm sm:text-base text-yellow-400 uppercase mt-1">
                    {selectedArticle.subtitle}
                  </p>
                </div>
              </div>

              {/* Contents Area */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Meta details column */}
                <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4 text-xs font-mono text-stone-400">
                  <span>CHRONICLED ON: {selectedArticle.publishDate}</span>
                  <span>READ TIME: {selectedArticle.readTime}</span>
                </div>

                {/* Article Prose Body */}
                <div className="prose prose-invert max-w-none text-stone-300 text-sm sm:text-base leading-relaxed space-y-4 font-sans">
                  {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Sovereign Edict Box (The Doom Homage Verdict Section) */}
                <div className="bg-stone-900 border-4 border-emerald-800 p-5 sm:p-6 shadow-comic relative mt-12 overflow-hidden">
                  <div className="absolute inset-0 halftone-green opacity-20 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-emerald-400 font-comic text-xl uppercase mb-3">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span>THE SOVEREIGN EDICT</span>
                    </div>
                    
                    <p className="font-sans font-bold text-stone-100 italic text-base sm:text-lg leading-relaxed border-l-4 border-emerald-500 pl-4 mb-4">
                      "{selectedArticle.doomVerdict}"
                    </p>

                    <div className="flex items-center justify-between border-t border-stone-800 pt-3">
                      <span className="font-mono text-xs text-stone-400 font-bold">SOVEREIGN RATING:</span>
                      
                      {/* Comic stylized rating masks */}
                      <div className="flex items-center space-x-1.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const ratingVal = i + 1;
                          const isFull = ratingVal <= Math.floor(selectedArticle.doomRating);
                          const isHalf = !isFull && ratingVal === Math.ceil(selectedArticle.doomRating);
                          return (
                            <Shield
                              key={i}
                              className={`w-5 h-5 ${
                                isFull
                                  ? 'text-red-500 fill-red-500'
                                  : isHalf
                                  ? 'text-red-500/70 fill-red-500/40'
                                  : 'text-stone-700'
                              } stroke-black stroke-2`}
                            />
                          );
                        })}
                        <span className="font-comic text-lg text-white ml-2">({selectedArticle.doomRating} / 5)</span>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
