import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, MessageSquare, PenTool, ArrowRight } from 'lucide-react';

const portals = [
  {
    id: 'vault',
    route: '/vault',
    icon: <BookOpen className="w-8 h-8" />,
    label: 'THE REVIEW VAULT',
    tagline: 'SUPREME RATINGS. ABSOLUTE VERDICTS.',
    description:
      'Sovereign critiques of games, cinema, and sequential art — recorded under Latverian law. No appeals permitted.',
    accent: 'bg-red-600',
    border: 'border-red-700',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(185,28,28,1)]',
    badge: '📚 REVIEWS',
    badgeBg: 'bg-red-600',
    skewClass: 'skew-comic-l',
    number: '01',
  },
  {
    id: 'counsel',
    route: '/counsel',
    icon: <MessageSquare className="w-8 h-8" />,
    label: "DOOM'S COUNSEL",
    tagline: 'SPEAK. DOOM SHALL JUDGE.',
    description:
      'Pose your questions to the Iron Lord himself. Powered by sovereign intellect and Latverian AI. Audience is not guaranteed.',
    accent: 'bg-emerald-600',
    border: 'border-emerald-700',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(4,120,87,1)]',
    badge: '💬 PETITION',
    badgeBg: 'bg-emerald-700',
    skewClass: 'skew-comic-r',
    number: '02',
  },
  {
    id: 'guestbook',
    route: '/guestbook',
    icon: <PenTool className="w-8 h-8" />,
    label: 'SOVEREIGN REGISTRY',
    tagline: 'SIGN YOUR NAME. SWEAR YOUR LOYALTY.',
    description:
      'The Latverian Guestbook of public record. Leave your tribute, your thoughts, or your declaration of fealty.',
    accent: 'bg-yellow-500',
    border: 'border-yellow-600',
    hoverShadow: 'hover:shadow-[8px_8px_0px_0px_rgba(161,98,7,1)]',
    badge: '🖊️ GUESTBOOK',
    badgeBg: 'bg-yellow-600',
    skewClass: '',
    number: '03',
  },
];

export default function HomePortals() {
  const navigate = useNavigate();

  return (
    <section className="bg-stone-950 border-t-8 border-black py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Halftone atmosphere */}
      <div className="absolute inset-0 halftone-bg opacity-[0.025] pointer-events-none" />

      {/* Section header */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <span className="inline-block font-mono text-xs font-bold text-rose-500 uppercase tracking-[0.3em] bg-black px-4 py-1 border border-rose-500/40 mb-4">
            LATVERIAN SOVEREIGN ARCHIVES — CLASSIFIED: OPEN ACCESS
          </span>
          <h2 className="font-comic text-5xl sm:text-6xl uppercase text-white text-shadow-doom tracking-wider">
            ENTER THE DOMAINS
          </h2>
          <div className="mt-4 h-1 w-32 bg-rose-600 mx-auto border border-black" />
        </div>

        {/* Three portal panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {portals.map((portal, i) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() => navigate(portal.route)}
              className={`relative bg-stone-900 border-r-4 last:border-r-0 border-black cursor-pointer group
                transition-all duration-200 ${portal.hoverShadow}
                hover:-translate-y-1 hover:z-10`}
            >
              {/* Issue number stamp */}
              <div className="absolute top-4 right-4 font-comic text-5xl text-black/10 select-none pointer-events-none leading-none">
                {portal.number}
              </div>

              {/* Accent top bar */}
              <div className={`h-2 w-full ${portal.accent} border-b-4 border-black`} />

              <div className="p-6 sm:p-8 flex flex-col h-full min-h-[320px]">
                {/* Badge + Icon */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`font-mono text-[10px] font-bold text-white uppercase tracking-widest ${portal.badgeBg} px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                  >
                    {portal.badge}
                  </span>
                  <div className="text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200">
                    {portal.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-comic text-2xl sm:text-3xl text-white uppercase tracking-wide leading-tight mb-2 group-hover:text-yellow-100 transition-colors">
                  {portal.label}
                </h3>

                {/* Tagline */}
                <p className={`font-mono text-[11px] font-bold uppercase tracking-widest mb-4 ${
                  portal.id === 'vault' ? 'text-red-400' :
                  portal.id === 'counsel' ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {portal.tagline}
                </p>

                {/* Description */}
                <p className="font-sans text-sm text-stone-400 leading-relaxed flex-1 border-l-2 border-stone-700 pl-3 group-hover:border-stone-500 transition-colors">
                  {portal.description}
                </p>

                {/* CTA */}
                <div className="mt-6 pt-4 border-t-2 border-stone-800">
                  <div
                    className={`inline-flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-widest text-white
                      px-4 py-2 border-2 border-black ${portal.accent}
                      shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                      group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                      group-hover:translate-x-0.5 group-hover:translate-y-0.5
                      transition-all duration-150`}
                  >
                    <span>ENTER</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decree line */}
        <p className="mt-8 text-center font-mono text-[11px] text-stone-600 uppercase tracking-widest">
          ALL CONTENT IS LEGALLY BINDING UNDER LATVERIAN SOVEREIGN DECREE № 1962-VII
        </p>
      </div>
    </section>
  );
}
