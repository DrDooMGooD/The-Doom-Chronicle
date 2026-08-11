import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Heart,
  Gift,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Sparkles,
  Award,
  DollarSign,
  Coffee,
  QrCode,
  AlertCircle,
  ShoppingBag,
  Cpu,
  BookOpen,
  Cloud,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { defaultWishlistItems, defaultTributeConfig, WishlistItem, TributeConfig } from '../data/wishlistData';

export default function TributeWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('doom_wishlist_items');
      return saved ? JSON.parse(saved) : defaultWishlistItems;
    } catch {
      return defaultWishlistItems;
    }
  });

  const [tributeConfig, setTributeConfig] = useState<TributeConfig>(() => {
    try {
      const saved = localStorage.getItem('doom_tribute_config');
      return saved ? JSON.parse(saved) : defaultTributeConfig;
    } catch {
      return defaultTributeConfig;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedItemForSponsor, setSelectedItemForSponsor] = useState<WishlistItem | null>(null);
  const [presetAmount, setPresetAmount] = useState<number>(15);
  const [customNote, setCustomNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'wishlist' | 'donation'>('wishlist');

  // Sync state if changed in local storage
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedItems = localStorage.getItem('doom_wishlist_items');
        if (savedItems) setWishlistItems(JSON.parse(savedItems));
        const savedConfig = localStorage.getItem('doom_tribute_config');
        if (savedConfig) setTributeConfig(JSON.parse(savedConfig));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredItems = wishlistItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'high') return item.priority === 'high';
    return item.category === selectedCategory;
  });

  const totalFulfilled = wishlistItems.filter((i) => i.priority === 'fulfilled').length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-mono pb-20 pt-20">
      {/* Background halftone atmosphere */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] halftone-bg z-0" />

      {/* Header Banner */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="bg-stone-900 border-4 border-black p-6 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Halftone red accent corner */}
          <div className="absolute top-0 right-0 w-48 h-48 halftone-red opacity-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 text-xs font-bold uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Gift className="w-4 h-4" />
                <span>LATVERIAN TREASURY & ARMORY PROTOCOL</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl uppercase tracking-wider text-white text-shadow-doom">
                WAR CHEST & WISHLIST
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans">
                To elevate the precision of <strong className="text-yellow-400">Dom Pineda&apos;s</strong> critical reviews, high-definition captures, and the technological infrastructure of <strong className="text-emerald-400">The Doom Chronicle</strong>, citizens may tribute hardware directly or send financial support.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="bg-stone-950 border-3 border-black p-4 space-y-2 min-w-[220px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-1.5">
                <span className="text-stone-400">NEEDED GEAR:</span>
                <span className="font-bold text-yellow-400">{wishlistItems.length} ITEMS</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-1.5">
                <span className="text-stone-400">FULFILLED:</span>
                <span className="font-bold text-emerald-400">{totalFulfilled} ITEMS</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">PAYMENTS:</span>
                <span className="font-bold text-rose-400">VENMO / PAYPAL / CRYPTO</span>
              </div>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="mt-8 pt-6 border-t-2 border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center space-x-2 px-5 py-2.5 font-comic text-lg uppercase tracking-wider border-3 border-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'wishlist'
                    ? 'bg-rose-600 text-white translate-y-0'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Equipment Wishlist</span>
              </button>
              <button
                onClick={() => setActiveTab('donation')}
                className={`flex items-center space-x-2 px-5 py-2.5 font-comic text-lg uppercase tracking-wider border-3 border-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  activeTab === 'donation'
                    ? 'bg-emerald-600 text-white translate-y-0'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750 hover:text-white'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>Direct Financial Support</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 border border-stone-800">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>ALL CONTRIBUTIONS DIRECTLY FUND WEBSITE IMPROVEMENTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'wishlist' ? (
            <motion.div
              key="wishlist-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 bg-stone-900 border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xs font-bold text-stone-400 uppercase mr-2 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Filter Armory:</span>
                </span>
                {[
                  { id: 'all', label: 'All Equipment' },
                  { id: 'high', label: '🔥 High Priority' },
                  { id: 'hardware', label: '💻 Tech & Hardware' },
                  { id: 'comic', label: '📚 Comics & Lore' },
                  { id: 'software', label: '⚡ Software & Cloud' },
                  { id: 'studio', label: '🎙️ Studio Setup' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase border-2 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-yellow-500 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-600 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Wishlist Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const isHigh = item.priority === 'high';
                  const isFulfilled = item.priority === 'fulfilled';
                  return (
                    <div
                      key={item.id}
                      className="bg-stone-900 border-3 border-black flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
                    >
                      {/* Image header */}
                      <div className="relative h-48 border-b-3 border-black overflow-hidden bg-black">
                        <img
                          src={item.imageUrl || `https://loremflickr.com/600/400/${item.category},tech`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://loremflickr.com/600/400/tech,hardware';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />

                        {/* Priority Badge */}
                        <div className="absolute top-3 left-3">
                          {isFulfilled ? (
                            <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Fulfilled</span>
                            </span>
                          ) : isHigh ? (
                            <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center space-x-1 animate-pulse">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>High Priority</span>
                            </span>
                          ) : (
                            <span className="bg-yellow-500 text-black font-mono text-[10px] font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                              Wanted
                            </span>
                          )}
                        </div>

                        {/* Category & Price Pill */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="bg-black/90 text-yellow-400 font-mono text-[10px] font-bold px-2 py-1 border border-yellow-500/50 uppercase">
                            {item.category}
                          </span>
                          <span className="bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono font-bold text-xs px-2.5 py-1">
                            EST. {item.price}
                          </span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-comic text-xl text-white uppercase tracking-wide leading-snug group-hover:text-yellow-200 transition-colors">
                            {item.title}
                          </h3>

                          <div className="bg-stone-950 border border-stone-800 p-3 rounded-xs text-xs text-stone-300 font-sans leading-relaxed">
                            <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase block mb-1">
                              💡 WHY THIS MATTERS FOR THE SITE:
                            </span>
                            {item.impact}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-stone-800 space-y-2">
                          {item.buyUrl && item.buyUrl !== '#' ? (
                            <a
                              href={item.buyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-comic text-sm uppercase px-4 py-2.5 flex items-center justify-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>Direct Purchase / View Item</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </a>
                          ) : (
                            <button
                              onClick={() => setSelectedItemForSponsor(item)}
                              className="w-full bg-stone-800 hover:bg-emerald-700 text-white font-comic text-sm uppercase px-4 py-2.5 flex items-center justify-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                            >
                              <Gift className="w-4 h-4" />
                              <span>Sponsor This Item</span>
                            </button>
                          )}

                          <button
                            onClick={() => copyToClipboard(item.buyUrl || item.title, `item-${item.id}`)}
                            className="w-full bg-stone-950 hover:bg-stone-850 text-stone-400 hover:text-white font-mono text-[11px] uppercase py-1.5 px-3 flex items-center justify-center space-x-1.5 border border-stone-800 transition-colors cursor-pointer"
                          >
                            {copiedKey === `item-${item.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Link Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Copy Share Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="donation-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-10"
            >
              {/* Payment Protocols Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* VENMO */}
                <div className="bg-stone-900 border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-sky-500 transition-all space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-sky-500 text-white font-bold font-comic text-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        V
                      </div>
                      <div>
                        <h3 className="font-comic text-2xl text-white uppercase">Venmo</h3>
                        <span className="text-[10px] text-sky-400 font-mono block">Instant Peer-to-Peer</span>
                      </div>
                    </div>
                    <span className="bg-sky-950 text-sky-300 text-[10px] font-bold px-2 py-0.5 border border-sky-800">
                      SECURE
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    Send direct contributions via Venmo. Ideal for quick single-time donations or coffee tributes.
                  </p>

                  <div className="bg-stone-950 border border-stone-800 p-3 flex items-center justify-between">
                    <div className="font-mono text-sm text-yellow-400 font-bold">
                      {tributeConfig.venmoHandle}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tributeConfig.venmoHandle, 'venmo')}
                      className="bg-stone-850 hover:bg-sky-600 text-white text-xs px-2.5 py-1.5 border border-black flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'venmo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'venmo' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={`https://venmo.com/${tributeConfig.venmoHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-sky-500 hover:bg-sky-400 text-black font-comic text-sm uppercase py-2.5 px-4 flex items-center justify-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <span>Open Venmo App</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* PAYPAL */}
                <div className="bg-stone-900 border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-blue-500 transition-all space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-blue-600 text-white font-bold font-comic text-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        P
                      </div>
                      <div>
                        <h3 className="font-comic text-2xl text-white uppercase">PayPal</h3>
                        <span className="text-[10px] text-blue-400 font-mono block">Global Cards & Transfer</span>
                      </div>
                    </div>
                    <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 border border-blue-800">
                      GLOBAL
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    Supports international debit cards, credit cards, and direct PayPal balance payments seamlessly.
                  </p>

                  <div className="bg-stone-950 border border-stone-800 p-3 flex items-center justify-between overflow-hidden">
                    <div className="font-mono text-xs text-yellow-400 font-bold truncate mr-2">
                      {tributeConfig.paypalUrl}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tributeConfig.paypalUrl, 'paypal')}
                      className="bg-stone-850 hover:bg-blue-600 text-white text-xs px-2.5 py-1.5 border border-black flex items-center space-x-1 shrink-0 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'paypal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'paypal' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={tributeConfig.paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-comic text-sm uppercase py-2.5 px-4 flex items-center justify-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <span>Send via PayPal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* CASH APP */}
                <div className="bg-stone-900 border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-emerald-500 transition-all space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-emerald-500 text-black font-bold font-comic text-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        $
                      </div>
                      <div>
                        <h3 className="font-comic text-2xl text-white uppercase">Cash App</h3>
                        <span className="text-[10px] text-emerald-400 font-mono block">Fast Cash Tag Transfer</span>
                      </div>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-800">
                      INSTANT
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    Send quick support using Cash App tag. Direct and fee-free contribution protocol.
                  </p>

                  <div className="bg-stone-950 border border-stone-800 p-3 flex items-center justify-between">
                    <div className="font-mono text-sm text-yellow-400 font-bold">
                      {tributeConfig.cashAppHandle}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tributeConfig.cashAppHandle, 'cashapp')}
                      className="bg-stone-850 hover:bg-emerald-600 text-white text-xs px-2.5 py-1.5 border border-black flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'cashapp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'cashapp' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={`https://cash.app/${tributeConfig.cashAppHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-comic text-sm uppercase py-2.5 px-4 flex items-center justify-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <span>Open Cash App</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* BUY ME A COFFEE */}
                <div className="bg-stone-900 border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-yellow-500 transition-all space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-yellow-500 text-black font-bold flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-comic text-2xl text-white uppercase">Buy Me A Coffee</h3>
                        <span className="text-[10px] text-yellow-400 font-mono block">Micro-Support & Rewards</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    Buy Dom Pineda a coffee or energy boost to keep late-night review writing powered up.
                  </p>

                  <a
                    href={tributeConfig.buyMeACoffeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-comic text-sm uppercase py-2.5 px-4 flex items-center justify-center space-x-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <span>Buy Coffee ($5)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* CRYPTO VAULT */}
                <div className="bg-stone-900 border-3 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-amber-500 transition-all space-y-4 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-amber-500 text-black font-bold flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-comic text-2xl text-white uppercase">Sovereign Crypto Vault</h3>
                        <span className="text-[10px] text-amber-400 font-mono block">Bitcoin (BTC) & Ethereum (ETH)</span>
                      </div>
                    </div>
                    <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-amber-800">
                      DECENTRALIZED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* BTC */}
                    <div className="bg-stone-950 border border-stone-800 p-3 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">BITCOIN (BTC) ADDRESS:</span>
                      <div className="font-mono text-[11px] text-stone-300 bg-black p-2 rounded border border-stone-850 break-all">
                        {tributeConfig.btcAddress}
                      </div>
                      <button
                        onClick={() => copyToClipboard(tributeConfig.btcAddress, 'btc')}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-black font-mono text-xs uppercase py-1.5 flex items-center justify-center space-x-1 cursor-pointer font-bold"
                      >
                        {copiedKey === 'btc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'btc' ? 'BTC Address Copied!' : 'Copy BTC Address'}</span>
                      </button>
                    </div>

                    {/* ETH */}
                    <div className="bg-stone-950 border border-stone-800 p-3 space-y-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase block">ETHEREUM / ERC20 (ETH) ADDRESS:</span>
                      <div className="font-mono text-[11px] text-stone-300 bg-black p-2 rounded border border-stone-850 break-all">
                        {tributeConfig.ethAddress}
                      </div>
                      <button
                        onClick={() => copyToClipboard(tributeConfig.ethAddress, 'eth')}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase py-1.5 flex items-center justify-center space-x-1 cursor-pointer font-bold"
                      >
                        {copiedKey === 'eth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'eth' ? 'ETH Address Copied!' : 'Copy ETH Address'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Tribute Calculator */}
              <div className="bg-stone-900 border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <div className="flex items-center space-x-3 border-b-2 border-black pb-4">
                  <DollarSign className="w-7 h-7 text-yellow-400" />
                  <div>
                    <h3 className="font-comic text-2xl text-white uppercase">PRESET TRIBUTE CALCULATOR & RECOGNITION</h3>
                    <p className="text-xs text-stone-400">Select a tribute amount and attach a note to be acknowledged in Latverian records.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { amount: 5, label: '$5 Coffee', note: 'Single Review Fuel' },
                    { amount: 15, label: '$15 Comic Issue', note: 'Comic Research' },
                    { amount: 50, label: '$50 Latverian Ally', note: 'Hardware Support' },
                    { amount: 100, label: '$100 War Chest Patron', note: 'Sovereign Sponsor' },
                  ].map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => setPresetAmount(preset.amount)}
                      className={`p-4 border-3 border-black text-left transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        presetAmount === preset.amount
                          ? 'bg-yellow-500 text-black font-bold -translate-y-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-stone-950 text-stone-300 hover:bg-stone-850'
                      }`}
                    >
                      <span className="font-comic text-2xl block">{preset.label}</span>
                      <span className="text-[10px] uppercase font-mono block opacity-80">{preset.note}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-300 uppercase">
                    Attach Your Name & Fealty Note for the Sovereign Registry:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 'Citizens of Sector 4 — Keep up the supreme reviews! - Alex'"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full bg-stone-950 text-white border-2 border-black p-3 text-xs focus:outline-none focus:border-yellow-400 font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={tributeConfig.paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-comic text-base px-6 py-3 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center space-x-2"
                  >
                    <span>Proceed with PayPal (${presetAmount})</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://venmo.com/${tributeConfig.venmoHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-sky-500 hover:bg-sky-400 text-black font-comic text-base px-6 py-3 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center space-x-2"
                  >
                    <span>Proceed with Venmo ({tributeConfig.venmoHandle})</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sponsor Modal */}
      {selectedItemForSponsor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border-4 border-black p-6 max-w-lg w-full space-y-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-comic text-2xl text-white uppercase">Sponsor Item</h3>
              <button
                onClick={() => setSelectedItemForSponsor(null)}
                className="text-stone-400 hover:text-white font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              You are choosing to sponsor <strong className="text-yellow-400">{selectedItemForSponsor.title}</strong> (Estimated cost: {selectedItemForSponsor.price}).
            </p>

            <div className="bg-stone-950 border border-stone-800 p-4 space-y-2 text-xs">
              <span className="text-emerald-400 font-bold block uppercase">How to complete sponsorship:</span>
              <ol className="list-decimal list-inside space-y-1 text-stone-400">
                <li>Send direct tribute via Venmo ({tributeConfig.venmoHandle}) or PayPal ({tributeConfig.paypalUrl}).</li>
                <li>Include note: &quot;Sponsoring: {selectedItemForSponsor.title}&quot;.</li>
                <li>Your name will be commemorated in the Latverian Sovereign Guestbook.</li>
              </ol>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedItemForSponsor(null)}
                className="bg-stone-800 text-stone-300 px-4 py-2 text-xs uppercase font-bold border border-black"
              >
                Close
              </button>
              <a
                href={tributeConfig.paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 text-xs uppercase font-bold border-2 border-black flex items-center space-x-1"
              >
                <span>Pay via PayPal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
