import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Unlock, FileText, CheckCircle, Trash2, 
  Edit3, Plus, Trash, BookOpen, Terminal, Settings, 
  AlertTriangle, Globe, Key, X, Check, Save, Eye, EyeOff, Mail, RefreshCw, Star
} from 'lucide-react';
import { Article, GuestbookEntry, CorpusItem } from '../types';
import { 
  fetchAdminArticles, updateArticle, deleteArticle, createArticle,
  fetchRegistryEntries, respondToRegistryEntry, deleteRegistryEntry 
} from '../services/api';
import { 
  fetchCorpusEntries, triggerLucyBrainstorm, triggerArthurPublish,
  deleteCorpusItem, clearCorpusBacklog, updateCorpusItem, rewriteArticleWithArthur
} from '../services/agentService';

interface CMSDashboardProps {
  onClose: () => void;
}

export default function CMSDashboard({ onClose }: CMSDashboardProps) {
  const [passcode, setPasscode] = useState(() => localStorage.getItem('castle_passcode') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'draft' | 'registry' | 'corpus'>('pending');

  // Arthur Rewrite state
  const [rewriteTarget, setRewriteTarget] = useState<Article | null>(null);
  const [rewriteInstructions, setRewriteInstructions] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);

  // Registry ledger states
  const [registryEntries, setRegistryEntries] = useState<GuestbookEntry[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  // Corpus planning backlog states
  const [corpusEntries, setCorpusEntries] = useState<CorpusItem[]>([]);
  const [isLucyRunning, setIsLucyRunning] = useState(false);

  // Inline notes editor state
  const [expandedCorpusId, setExpandedCorpusId] = useState<string | null>(null);
  const [corpusEditNotes, setCorpusEditNotes] = useState<Record<string, string>>({});
  const [corpusSavingId, setCorpusSavingId] = useState<string | null>(null);
  const [arthurPublishingId, setArthurPublishingId] = useState<string | null>(null);
  const [lucySearchQuery, setLucySearchQuery] = useState('');

  // Manual Upload & Edit states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'game' | 'comic' | 'movie'>('game');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDoomRating, setFormDoomRating] = useState(5);
  const [formDoomVerdict, setFormDoomVerdict] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'pending_review' | 'published'>('pending_review');
  const [formAuthorName, setFormAuthorName] = useState('Dr. Doom');
  const [formGeoRegion, setFormGeoRegion] = useState('Latveria');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formFaqs, setFormFaqs] = useState<{ question: string; answer: string }[]>([]);

  // FAQ building states
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Agent API guide drawer state
  const [showAgentGuide, setShowAgentGuide] = useState(false);

  // Sovereign keys settings state
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');

  useEffect(() => {
    if (passcode) {
      handleAuth();
    }
  }, []);

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await fetchAdminArticles(passcode);
      setArticles(data);
      const registryData = await fetchRegistryEntries();
      setRegistryEntries(registryData);
      
      const corpusData = await fetchCorpusEntries();
      setCorpusEntries(corpusData);
      
      const initialReplies: Record<string, string> = {};
      registryData.forEach(e => {
        if (e.response) initialReplies[e.id] = e.response;
      });
      setReplyTexts(initialReplies);

      setIsAuthorized(true);
      localStorage.setItem('castle_passcode', passcode);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'ACCESS DENIED: Authentication verification failed');
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadCorpus = async () => {
    try {
      const corpusData = await fetchCorpusEntries();
      setCorpusEntries(corpusData);
    } catch (err) {
      console.error('Failed to reload content corpus:', err);
    }
  };

  const reloadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminArticles(passcode);
      setArticles(data);
      const registryData = await fetchRegistryEntries();
      setRegistryEntries(registryData);
      await reloadCorpus();
      setError(null);
    } catch (err: any) {
      setError('Connection interrupted. Resync required.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (articleId: string) => {
    try {
      await updateArticle(articleId, { status: 'published' }, passcode);
      await reloadArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to approve scroll');
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to incinerate this chronicle? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteArticle(articleId, passcode);
      await reloadArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to incinerate scroll');
    }
  };

  const handleSendReply = async (id: string) => {
    const replyText = replyTexts[id] || '';
    if (!replyText.trim()) return;
    try {
      setIsLoading(true);
      const updated = await respondToRegistryEntry(id, replyText, passcode);
      setRegistryEntries(prev => prev.map(e => e.id === id ? updated : e));
      alert('Sovereign response successfully dicted!');
    } catch (err: any) {
      alert(`Failed to reply: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRegistry = async (id: string) => {
    if (!window.confirm('Are you sure you want to incinerate this subject\'s signature from the state records?')) {
      return;
    }
    try {
      setIsLoading(true);
      await deleteRegistryEntry(id, passcode);
      setRegistryEntries(prev => prev.filter(e => e.id !== id));
      alert('Signature incinerated.');
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCorpusNotes = async (item: CorpusItem) => {
    const newNotes = corpusEditNotes[item.id] ?? item.notes;
    setCorpusSavingId(item.id);
    try {
      await updateCorpusItem(item.id, { notes: newNotes });
      setCorpusEntries(prev =>
        prev.map(c => c.id === item.id ? { ...c, notes: newNotes } : c)
      );
      setExpandedCorpusId(null);
    } catch (err: any) {
      alert(`Failed to save notes: ${err.message}`);
    } finally {
      setCorpusSavingId(null);
    }
  };

  const handleDeleteCorpusItem = async (id: string) => {
    if (!window.confirm('Incinerate this corpus topic? This cannot be undone.')) return;
    try {
      await deleteCorpusItem(id);
      setCorpusEntries(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(`Failed to purge topic: ${err.message}`);
    }
  };

  const handleClearCorpus = async (mode: 'backlog' | 'published' | 'all') => {
    const labels = {
      backlog: 'all BACKLOG items',
      published: 'all BACKLOG + PUBLISHED items',
      all: 'ALL topics (except in-progress jobs)'
    };
    if (!window.confirm(`This will permanently incinerate ${labels[mode]} from the strategy corpus. Proceed?`)) return;
    try {
      const count = await clearCorpusBacklog(mode);
      await reloadCorpus();
      alert(`🔥 ${count} corpus topic${count !== 1 ? 's' : ''} incinerated.`);
    } catch (err: any) {
      alert(`Purge failed: ${err.message}`);
    }
  };

  const handleLucyBrainstorm = async (queryOverride?: string) => {
    const key = geminiApiKey || localStorage.getItem('gemini-api-key') || '';
    if (!key) {
      alert('GEMINI API KEY IS REQUIRED. Click "Sovereign Keys" in the top bar to configure it.');
      return;
    }
    const query = queryOverride || lucySearchQuery;
    setIsLucyRunning(true);
    try {
      await triggerLucyBrainstorm(key, query.trim() || undefined);
      await reloadCorpus();
      if (query.trim()) {
        alert(`🔮 LUCY: Finished researching "${query.trim()}". Clean concept card successfully added to your backlog ledger!`);
        setLucySearchQuery('');
      } else {
        alert('🔮 LUCY: Content strategy backlog populated with 10 trending review topics!');
      }
    } catch (err: any) {
      alert(`Lucy Strategy Compilation Failed: ${err.message}`);
    } finally {
      setIsLucyRunning(false);
    }
  };

  const handleArthurRewrite = async () => {
    if (!rewriteTarget || !rewriteInstructions.trim()) return;
    const key = geminiApiKey || localStorage.getItem('gemini-api-key') || '';
    if (!key) {
      alert('GEMINI API KEY IS REQUIRED. Click "Sovereign Keys" in the top bar to configure it.');
      return;
    }
    setIsRewriting(true);
    try {
      await rewriteArticleWithArthur(
        {
          id: rewriteTarget.id,
          title: rewriteTarget.title,
          category: rewriteTarget.category,
          content: rewriteTarget.content,
          excerpt: rewriteTarget.excerpt,
          subtitle: rewriteTarget.subtitle,
          doomVerdict: rewriteTarget.doomVerdict,
          doomRating: rewriteTarget.doomRating,
        },
        rewriteInstructions,
        key
      );
      await reloadArticles();
      setRewriteTarget(null);
      setRewriteInstructions('');
      setPreviewArticle(null);
      alert(`✍️ ARTHUR: Rewrite complete! "${rewriteTarget.title}" has been updated and is back in Pending Review.`);
    } catch (err: any) {
      alert(`Rewrite failed: ${err.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleArthurRepublish = async (item: CorpusItem) => {
    if (!window.confirm(`Re-publish "${item.title}"? Arthur will generate a brand-new review and add it as a fresh article.`)) return;
    setArthurPublishingId(item.id);
    // Reset corpus item to backlog so triggerArthurPublish can pick it up
    try {
      await updateCorpusItem(item.id, { status: 'backlog', published_url: null });
      setCorpusEntries(prev =>
        prev.map(c => c.id === item.id ? { ...c, status: 'backlog', published_url: undefined } : c)
      );
      // Now run Arthur on the reset item
      const resetItem: CorpusItem = { ...item, status: 'backlog', published_url: undefined };
      await handleArthurPublish(resetItem);
    } catch (err: any) {
      setError(`Re-publish failed: ${err.message}`);
      setArthurPublishingId(null);
      await reloadCorpus();
    }
  };

  const handleArthurPublish = async (item: CorpusItem) => {
    const key = geminiApiKey || localStorage.getItem('gemini-api-key') || '';
    if (!key) {
      alert('GEMINI API KEY IS REQUIRED. Click "Sovereign Keys" in the top bar to configure it.');
      return;
    }
    setArthurPublishingId(item.id);
    setCorpusEntries(prev => prev.map(c => c.id === item.id ? { ...c, status: 'in_progress' } : c));
    try {
      const liveUrl = await triggerArthurPublish(item, key);
      await reloadArticles();
      await reloadCorpus();
      alert(`🤖 ARTHUR: Generated review draft, pushed it live to your site, and recorded URL!\n\nReview: "${item.title}"`);
    } catch (err: any) {
      alert(`Arthur Auto-Publish Failed: ${err.message}`);
      await reloadCorpus();
    } finally {
      setArthurPublishingId(null);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormCategory('game');
    setFormSubtitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormImageUrl('');
    setFormDoomRating(5);
    setFormDoomVerdict('Doom approves.');
    setFormStatus('pending_review');
    setFormAuthorName('Dr. Doom');
    setFormGeoRegion('Latveria');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormFaqs([]);
    setNewQuestion('');
    setNewAnswer('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (article: Article) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormCategory(article.category);
    setFormSubtitle(article.subtitle);
    setFormExcerpt(article.excerpt);
    setFormContent(article.content);
    setFormImageUrl(article.imageUrl);
    setFormDoomRating(article.doomRating);
    setFormDoomVerdict(article.doomVerdict);
    setFormStatus(article.status || 'pending_review');
    setFormAuthorName(article.authorName || 'Dr. Doom');
    setFormGeoRegion(article.geoRegion || 'Latveria');
    setFormSeoTitle(article.seoTitle || '');
    setFormSeoDescription(article.seoDescription || '');
    setFormFaqs(article.faqs || []);
    setNewQuestion('');
    setNewAnswer('');
    setIsFormOpen(true);
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFormFaqs([...formFaqs, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFaq = (index: number) => {
    setFormFaqs(formFaqs.filter((_, idx) => idx !== index));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Title and Content are state mandates!');
      return;
    }

    const payload: Partial<Article> = {
      title: formTitle,
      category: formCategory,
      subtitle: formSubtitle,
      excerpt: formExcerpt,
      content: formContent,
      imageUrl: formImageUrl,
      doomRating: Number(formDoomRating),
      doomVerdict: formDoomVerdict,
      status: formStatus,
      authorName: formAuthorName,
      geoRegion: formGeoRegion,
      seoTitle: formSeoTitle || formTitle,
      seoDescription: formSeoDescription || formExcerpt,
      faqs: formFaqs,
    };

    setIsLoading(true);
    try {
      if (editingArticle) {
        // Edit flow
        await updateArticle(editingArticle.id, payload, passcode);
      } else {
        // Create flow
        await createArticle(payload, passcode);
      }
      setIsFormOpen(false);
      await reloadArticles();
    } catch (err: any) {
      alert(err.message || 'Failure writing to State ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('castle_passcode');
    setPasscode('');
    setIsAuthorized(false);
  };

  // Filter lists based on tab
  const pendingArticles = articles.filter(a => a.status === 'pending_review');
  const publishedArticles = articles.filter(a => a.status === 'published');
  const draftArticles = articles.filter(a => a.status === 'draft');

  // Lock screen if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-stone-950 font-mono px-4 relative">
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] halftone-bg z-0" />
        <div className="absolute inset-0 bg-radial from-stone-900/50 to-stone-950 z-0" />
        
        <div className="bg-stone-900 border-4 border-black p-8 max-w-md w-full shadow-comic-red relative z-10 text-center uppercase">
          <div className="w-16 h-16 bg-red-950 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-comic animate-pulse">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="font-comic text-3xl text-white tracking-wider mb-2">
            CASTLE OVERRIDE GATE
          </h2>
          <p className="text-[10px] text-stone-400 mb-6 leading-relaxed">
            Unauthorized intrusion will trigger Doombot defense grid. Submit royal cryptographic passphrase to gain access to CMS control structures.
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-left text-xs font-bold text-stone-500 mb-1.5">CRYPTOGRAPHIC KEY</label>
              <div className="relative flex items-center">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="ENTER ACCESS KEY..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-stone-950 text-yellow-400 border-2 border-black pl-4 pr-12 py-3 text-sm focus:outline-hidden focus:border-red-500 placeholder:text-stone-700 tracking-widest text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 text-stone-600 hover:text-stone-300 transition-colors cursor-pointer animate-pulse"
                  title={showPasscode ? "Hide Access Key" : "Show Access Key"}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="border border-red-900 bg-red-950/40 text-red-400 p-3 text-xs leading-normal">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-comic text-xl py-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:bg-stone-800 disabled:cursor-not-allowed"
            >
              {isLoading ? 'DECRYPTING...' : 'INITIALIZE OVERRIDE →'}
            </button>
          </form>

          <button
            onClick={onClose}
            className="mt-6 text-stone-500 hover:text-stone-300 text-xs font-bold underline transition-colors cursor-pointer"
          >
            ← Return to Chronicle Frontpage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-stone-950 text-stone-100 font-mono relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] halftone-bg z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="bg-black border-4 border-black p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-comic-green gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500">
              <Unlock className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <h1 className="font-comic text-3xl sm:text-4xl text-white tracking-widest uppercase">
                Castle Control Panel
              </h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center space-x-1 mt-0.5">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>STATE OF LATVERIA SOVEREIGN DATA MANAGER</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-stone-900 border border-emerald-600 hover:bg-emerald-600 hover:text-white font-bold text-xs uppercase px-4 py-2 flex items-center space-x-1.5 transition-colors cursor-pointer text-emerald-400"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Sovereign Keys</span>
            </button>
            <button
              onClick={() => setShowAgentGuide(true)}
              className="bg-stone-900 border border-yellow-600 hover:bg-yellow-600 hover:text-black font-bold text-xs uppercase px-4 py-2 flex items-center space-x-1.5 transition-colors cursor-pointer text-yellow-400"
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>AI Agent API guide</span>
            </button>
            <button
              onClick={handleOpenCreateForm}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>New Article</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-stone-900 border border-stone-700 hover:bg-red-700 hover:text-white hover:border-black font-bold text-xs uppercase px-4 py-2 flex items-center space-x-1.5 transition-colors cursor-pointer text-stone-400"
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Lock Terminal</span>
            </button>
          </div>
        </div>

        {/* Info banners */}
        {error && (
          <div className="bg-red-950/60 border-2 border-red-700 text-red-400 p-4 mb-6 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <span className="text-xs font-bold uppercase">{error}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b-4 border-black mb-6 overflow-x-auto whitespace-nowrap">
          {[
            { id: 'pending', label: 'Pending Review', count: pendingArticles.length, color: 'border-yellow-500 text-yellow-400' },
            { id: 'published', label: 'Published ledger', count: publishedArticles.length, color: 'border-emerald-500 text-emerald-400' },
            { id: 'draft', label: 'Drafts', count: draftArticles.length, color: 'border-stone-500 text-stone-400' },
            { id: 'registry', label: 'Registry Ledger', count: registryEntries.length, color: 'border-indigo-500 text-indigo-400' },
            { id: 'corpus', label: '🎯 Strategy Corpus', count: corpusEntries.length, color: 'border-rose-500 text-rose-450' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold text-xs sm:text-sm uppercase tracking-wide border-t-4 border-x-4 border-black -mb-1 mr-1.5 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-stone-900 border-b-stone-900 text-white font-bold'
                  : 'bg-stone-950 border-b-black text-stone-500 hover:text-stone-300'
              }`}
            >
              {tab.label} <span className="bg-black/50 border border-stone-850 px-1.5 py-0.5 rounded-sm ml-1 text-stone-400 font-mono text-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Articles Table Grid */}
        <div className="bg-stone-900 border-4 border-black p-5 shadow-comic">
          {isLoading && articles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-stone-400 animate-pulse text-xs font-bold uppercase">Establishing secure broadcast feed...</span>
            </div>
          ) : (
            <>
              {/* No items fallback */}
              {activeTab === 'pending' && pendingArticles.length === 0 && (
                <div className="text-center py-16 border border-stone-800 bg-stone-950">
                  <BookOpen className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-xs text-stone-500 font-bold uppercase">No scrolls currently awaiting evaluation.</p>
                </div>
              )}
              {activeTab === 'published' && publishedArticles.length === 0 && (
                <div className="text-center py-16 border border-stone-800 bg-stone-950">
                  <BookOpen className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-xs text-stone-500 font-bold uppercase">No published scrolls in the active archive.</p>
                </div>
              )}
              {activeTab === 'draft' && draftArticles.length === 0 && (
                <div className="text-center py-16 border border-stone-800 bg-stone-950">
                  <BookOpen className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-xs text-stone-500 font-bold uppercase">No drafts saved.</p>
                </div>
              )}

              {activeTab === 'registry' && registryEntries.length === 0 && (
                <div className="text-center py-16 border border-stone-800 bg-stone-950">
                  <BookOpen className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-xs text-stone-500 font-bold uppercase">No signatures on the Latverian Registry ledger.</p>
                </div>
              )}

              {activeTab === 'registry' && registryEntries.length > 0 && (
                <div className="space-y-4">
                  {registryEntries.map((entry) => {
                    const replyVal = replyTexts[entry.id] || '';
                    return (
                      <div key={entry.id} className="bg-stone-950 border border-stone-800 p-5 relative shadow-comic uppercase font-mono text-xs">
                        {/* Allegiance Tag */}
                        <span className={`absolute -top-3 right-4 border border-black text-[9px] font-bold px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase ${
                          entry.allegiance === 'loyalist'
                            ? 'bg-emerald-700 text-white'
                            : entry.allegiance === 'doombot'
                            ? 'bg-stone-800 text-stone-400'
                            : 'bg-red-650 text-white'
                        }`}>
                          {entry.allegiance}
                        </span>

                        <div className="flex flex-wrap items-center justify-between border-b border-stone-850 pb-2 mb-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-comic text-base text-emerald-400 tracking-wide">{entry.name}</span>
                            <span className="text-[10px] text-stone-500 font-sans normal-case">OF {entry.country}</span>
                          </div>
                          <span className="text-[9px] text-stone-600">DATE: {new Date(entry.timestamp).toLocaleDateString()}</span>
                        </div>

                        {/* Tribute Content */}
                        <div className="bg-stone-900/40 border-l-2 border-red-500 pl-3 py-2 text-stone-300 italic mb-4 normal-case font-sans text-sm font-medium leading-relaxed">
                          "{entry.tribute}"
                        </div>

                        {/* Newsletter & Email Info */}
                        <div className="flex flex-wrap items-center gap-3 mb-4 text-[10px]">
                          {entry.email ? (
                            <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-850 px-2.5 py-1 rounded-sm text-stone-400">
                              <Mail className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="lowercase font-bold select-all">{entry.email}</span>
                            </div>
                          ) : (
                            <div className="bg-stone-900/30 text-stone-600 border border-stone-900 px-2.5 py-1 rounded-sm italic">
                              NO EMAIL REGISTERED
                            </div>
                          )}

                          {entry.newsletter ? (
                            <span className="bg-emerald-950 border border-emerald-900 text-emerald-500 px-2 py-1 rounded-sm font-bold">
                              ✓ NEWSLETTER SIGN-UP ACTIVE
                            </span>
                          ) : (
                            <span className="bg-stone-900/30 text-stone-600 border border-stone-900 px-2 py-1 rounded-sm">
                              NO NEWSLETTER INTEREST
                            </span>
                          )}
                        </div>

                        {/* Doom reply block */}
                        <div className="border-t border-stone-850 pt-3 flex flex-col md:flex-row md:items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-[9px] text-stone-500 font-bold mb-1">👑 DICTATE SOVEREIGN REPLY</label>
                            <input
                              type="text"
                              placeholder="e.g. Your loyalty is noted, subject. Return to your fields."
                              value={replyVal}
                              onChange={(e) => setReplyTexts(prev => ({ ...prev, [entry.id]: e.target.value }))}
                              className="w-full bg-stone-900 text-white border border-stone-850 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-600 placeholder:text-stone-700"
                            />
                          </div>

                          <div className="flex items-end space-x-2 mt-4 md:mt-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleSendReply(entry.id);
                              }}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase px-4 py-2 border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5 shrink-0" />
                              <span>{entry.response ? 'Update' : 'Reply'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteRegistry(entry.id)}
                              className="bg-stone-900 border border-stone-700 hover:bg-red-700 hover:text-white hover:border-black font-bold text-xs uppercase px-4 py-2 flex items-center space-x-1 transition-colors cursor-pointer text-stone-400"
                            >
                              <Trash className="w-3.5 h-3.5 shrink-0" />
                              <span>Incinerate</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Articles table list */}
              {((activeTab === 'pending' && pendingArticles.length > 0) ||
                (activeTab === 'published' && publishedArticles.length > 0) ||
                (activeTab === 'draft' && draftArticles.length > 0)) && activeTab !== 'registry' && activeTab !== 'corpus' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs uppercase font-mono border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black text-stone-500 font-bold">
                        <th className="pb-3 w-1/3">Chronicle Title</th>
                        <th className="pb-3 px-4 hidden sm:table-cell">Category</th>
                        <th className="pb-3 px-4 hidden md:table-cell">Scribe</th>
                        <th className="pb-3 px-4 hidden lg:table-cell">Region</th>
                        <th className="pb-3 text-right">Sovereign Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850">
                      {(activeTab === 'pending' ? pendingArticles : activeTab === 'published' ? publishedArticles : draftArticles).map((art) => (
                        <tr key={art.id} className="hover:bg-stone-850/50 transition-colors group">
                          <td className="py-4 font-bold text-white max-w-[120px] sm:max-w-sm truncate">
                            <span className="block truncate">{art.title}</span>
                            <span className="block text-[9px] text-stone-500 mt-0.5 normal-case font-normal truncate italic">
                              {art.subtitle || 'No subtitle'}
                            </span>
                          </td>
                          <td className="py-4 px-4 hidden sm:table-cell">
                            <span className="bg-stone-950 border border-stone-800 px-2 py-0.5 rounded-sm font-bold text-[10px]">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-stone-400 font-bold hidden md:table-cell">{art.authorName || 'Dr. Doom'}</td>
                          <td className="py-4 px-4 text-stone-400 hidden lg:table-cell">{art.geoRegion || 'Latveria'}</td>
                          <td className="py-4 text-right flex justify-end space-x-1 sm:space-x-2">
                            {art.status === 'pending_review' && (
                              <button
                                onClick={() => handleApprove(art.id)}
                                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3 py-1 border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center space-x-1 cursor-pointer"
                                title="Approve and Publish"
                              >
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                            )}
                            <button
                              onClick={() => setPreviewArticle(art)}
                              className="bg-yellow-900 hover:bg-yellow-800 text-yellow-300 hover:text-yellow-100 border border-yellow-800 hover:border-yellow-600 px-3 py-1 flex items-center space-x-1 transition-all cursor-pointer"
                              title="Preview as Published"
                            >
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span className="hidden sm:inline">Preview</span>
                            </button>
                            {(art.status === 'pending_review' || art.status === 'draft') && (
                              <button
                                onClick={() => { setRewriteTarget(art); setRewriteInstructions(''); }}
                                className="bg-rose-950 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-900 hover:border-rose-700 px-3 py-1 flex items-center space-x-1 transition-all cursor-pointer"
                                title="Instruct Arthur to rewrite this article"
                              >
                                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">Rewrite</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditForm(art)}
                              className="bg-stone-950 text-stone-300 hover:text-white border border-stone-800 hover:border-white px-3 py-1 flex items-center space-x-1 transition-all cursor-pointer"
                              title="Edit Scroll"
                            >
                              <Edit3 className="w-3.5 h-3.5 shrink-0" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(art.id)}
                              className="bg-red-950 text-red-400 hover:bg-red-600 hover:text-white border border-red-900 hover:border-black px-3 py-1 flex items-center space-x-1 transition-all cursor-pointer"
                              title="Incinerate Scroll"
                            >
                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="hidden sm:inline">Incinerate</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 🎯 Content Strategy Corpus Backlog Ledger */}
              {activeTab === 'corpus' && (
                <div className="space-y-6">
                  {/* Strategic Lucy trigger controller */}
                  <div className="bg-stone-900 border-3 border-black p-5 space-y-4 shadow-comic">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-5 h-5 text-rose-500 animate-pulse" />
                          <span className="font-comic text-lg uppercase tracking-wide text-white">Sovereign Planning Bureau</span>
                        </div>
                        <p className="text-stone-400 text-xs leading-relaxed max-w-2xl font-sans normal-case">
                          Coordinate with **Lucy** to search the web using 2026 Google Grounding. Ask her to compile general trends or investigate specific upcoming releases and events!
                        </p>
                      </div>

                      {/* Bulk-clear controls */}
                      {corpusEntries.length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wide hidden sm:block">Purge:</span>
                          <button
                            type="button"
                            title="Incinerate all backlog-status topics"
                            onClick={() => handleClearCorpus('backlog')}
                            className="bg-stone-900 hover:bg-red-900 border border-stone-700 hover:border-red-700 text-stone-400 hover:text-red-300 font-bold text-[10px] uppercase px-2.5 py-1.5 flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Backlog</span>
                          </button>
                          <button
                            type="button"
                            title="Incinerate all backlog + published topics"
                            onClick={() => handleClearCorpus('all')}
                            className="bg-stone-900 hover:bg-red-900 border border-stone-700 hover:border-red-700 text-stone-400 hover:text-red-300 font-bold text-[10px] uppercase px-2.5 py-1.5 flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>All</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end gap-3 border-t border-stone-850 pt-4">
                      {/* Investigation Input query */}
                      <div className="flex-1 w-full text-left">
                        <label className="block text-[9px] text-stone-500 font-bold mb-1">🔍 TARGET SPECIFIC EVENT OR TITLE TO RESEARCH</label>
                        <input
                          type="text"
                          placeholder="e.g. EVO Las Vegas 2026, Marvel Absolute Power, Joker 2 reviews..."
                          value={lucySearchQuery}
                          onChange={(e) => setLucySearchQuery(e.target.value)}
                          className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2.5 text-xs focus:outline-hidden focus:border-rose-600 placeholder:text-stone-700"
                        />
                      </div>

                      <div className="flex flex-col xs:flex-row items-stretch gap-2.5 w-full sm:w-auto pt-4 sm:pt-0">
                        {/* Investigate Query Button */}
                        <button
                          type="button"
                          disabled={isLucyRunning || !lucySearchQuery.trim()}
                          onClick={() => handleLucyBrainstorm(lucySearchQuery)}
                          className="bg-rose-700 hover:bg-rose-650 disabled:bg-stone-900 disabled:text-stone-600 text-white font-bold text-xs uppercase px-4 py-3.5 border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
                        >
                          {isLucyRunning && lucySearchQuery.trim() ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Researching...</span>
                            </>
                          ) : (
                            <>
                              <span>🔍 Investigate</span>
                            </>
                          )}
                        </button>

                        {/* Compile 10 General Trends Button */}
                        <button
                          type="button"
                          disabled={isLucyRunning}
                          onClick={() => handleLucyBrainstorm('')}
                          className="bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-black text-stone-300 hover:text-white font-bold text-xs uppercase px-4 py-3.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 shrink-0"
                        >
                          {isLucyRunning && !lucySearchQuery.trim() ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Brainstorming 10...</span>
                            </>
                          ) : (
                            <>
                              <span>🔮 Compile 10 Trends</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {corpusEntries.length === 0 ? (
                    <div className="text-center py-16 border border-stone-800 bg-stone-950">
                      <BookOpen className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                      <p className="text-xs text-stone-500 font-bold uppercase">No planning items found. Click the button above to trigger Lucy!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {corpusEntries.map((item) => {
                        const isPublishing = arthurPublishingId === item.id;
                        const isExpanded = expandedCorpusId === item.id;
                        const isSaving = corpusSavingId === item.id;
                        const editNotes = corpusEditNotes[item.id] ?? item.notes;
                        return (
                          <div key={item.id} className="bg-stone-950 border border-stone-800 relative shadow-comic flex flex-col justify-between uppercase font-mono text-xs">
                            
                            {/* Category Tag */}
                            <span className="absolute -top-3 right-4 border border-black text-[9px] font-bold px-2 py-0.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase bg-stone-900 text-stone-300">
                              {item.category === 'game' ? '🎮 GAME' : item.category === 'comic' ? '📚 COMIC' : '🎬 MOVIE'}
                            </span>

                            <div className="p-5 space-y-3">
                              <h4 className="font-comic text-base text-emerald-400 tracking-wide leading-tight mt-1">{item.title}</h4>
                              
                              {item.notes && !isExpanded && (
                                <p className="text-stone-300 text-xs font-sans normal-case bg-stone-900/50 border-l border-emerald-700 pl-2.5 py-1 leading-relaxed line-clamp-3">
                                  {item.notes}
                                </p>
                              )}

                              <div className="flex items-center space-x-2 text-[10px] text-stone-500">
                                <span>STATUS:</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded-xs border ${
                                  item.status === 'published'
                                    ? 'bg-emerald-950/40 border-emerald-900 text-emerald-500'
                                    : item.status === 'in_progress'
                                    ? 'bg-yellow-950/40 border-yellow-900 text-yellow-500 animate-pulse'
                                    : 'bg-stone-900 border-stone-800 text-stone-400'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Inline notes editor — expands below the card body */}
                            {isExpanded && (
                              <div className="border-t border-stone-700 bg-stone-900/60 p-4 space-y-2">
                                <label className="block text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1">✍️ Your Takes &amp; Talking Points</label>
                                <textarea
                                  rows={6}
                                  value={editNotes}
                                  onChange={(e) =>
                                    setCorpusEditNotes(prev => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  placeholder="Add your specific angles, things you want mentioned, personal takes, references to include..."
                                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 focus:border-rose-500 focus:outline-none px-3 py-2.5 text-xs font-sans normal-case leading-relaxed resize-y placeholder:text-stone-600"
                                />
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleSaveCorpusNotes(item)}
                                    className="bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-[10px] uppercase px-3 py-1.5 border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center space-x-1"
                                  >
                                    {isSaving ? (
                                      <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Saving...</span></>
                                    ) : (
                                      <><Save className="w-3.5 h-3.5" /><span>Save Notes</span></>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedCorpusId(null)}
                                    className="bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold text-[10px] uppercase px-3 py-1.5 border border-stone-700 transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actions block */}
                            <div className="border-t border-stone-900 px-5 py-3 flex items-center justify-between gap-2 mt-auto">
                              <span className="text-[9px] text-stone-600">DATE PLANNED: {new Date(item.created_at || Date.now()).toLocaleDateString()}</span>

                              <div className="flex items-center gap-1.5">
                                {/* Expand notes editor button — shown on all cards except while Arthur is actively drafting */}
                                {item.status !== 'in_progress' && (
                                  <button
                                    type="button"
                                    title={isExpanded ? 'Close notes editor' : 'Add your takes & talking points'}
                                    onClick={() => {
                                      if (isExpanded) {
                                        setExpandedCorpusId(null);
                                      } else {
                                        setCorpusEditNotes(prev => ({ ...prev, [item.id]: item.notes }));
                                        setExpandedCorpusId(item.id);
                                      }
                                    }}
                                    className={`font-bold text-[10px] uppercase px-2.5 py-1.5 border transition-colors cursor-pointer flex items-center space-x-1 ${
                                      isExpanded
                                        ? 'bg-rose-900 border-rose-700 text-rose-300'
                                        : 'bg-stone-900 hover:bg-stone-800 border-stone-700 hover:border-rose-600 text-stone-400 hover:text-rose-400'
                                    }`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{isExpanded ? 'Close' : 'Edit Notes'}</span>
                                  </button>
                                )}

                                {item.status === 'backlog' && (
                                  <button
                                    type="button"
                                    disabled={arthurPublishingId !== null}
                                    onClick={() => handleArthurPublish(item)}
                                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase px-3 py-1.5 border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center space-x-1 disabled:opacity-50"
                                  >
                                    {isPublishing ? (
                                      <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                        <span>ARTHUR DRAFTING...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Globe className="w-3.5 h-3.5 shrink-0" />
                                        <span>🤖 Auto-Publish</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {item.status === 'in_progress' && (
                                  <span className="text-yellow-500 font-bold flex items-center space-x-1 text-[10px]">
                                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping shrink-0" />
                                    <span>Automator Engaged</span>
                                  </span>
                                )}

                                {item.status === 'published' && (
                                  <>
                                    <a
                                      href={item.published_url || '#reviews'}
                                      onClick={(e) => {
                                        if (!item.published_url) e.preventDefault();
                                        onClose();
                                      }}
                                      className="bg-stone-900 border border-stone-850 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 font-bold text-[10px] uppercase px-3 py-1.5 flex items-center space-x-1 transition-colors cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                      <span>View Live Review</span>
                                    </a>
                                    <button
                                      type="button"
                                      disabled={arthurPublishingId !== null}
                                      onClick={() => handleArthurRepublish(item)}
                                      title="Re-generate and publish a fresh review for this topic"
                                      className="bg-stone-800 hover:bg-emerald-900 border border-stone-700 hover:border-emerald-600 text-stone-400 hover:text-emerald-300 font-bold text-[10px] uppercase px-2.5 py-1.5 flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                      <span>Re-publish</span>
                                    </button>
                                  </>
                                )}

                                {/* Per-item purge — hidden while the automator has this card locked */}
                                {item.status !== 'in_progress' && (
                                  <button
                                    type="button"
                                    title="Incinerate this topic"
                                    onClick={() => handleDeleteCorpusItem(item.id)}
                                    className="bg-stone-900 hover:bg-red-900 border border-stone-800 hover:border-red-700 text-stone-500 hover:text-red-400 font-bold text-[10px] uppercase px-2 py-1.5 flex items-center space-x-1 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Manual Upload & Edit Drawer/Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border-4 border-black w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto shadow-comic-lg relative text-stone-100 uppercase"
          >
            {/* Form Banner */}
            <div className="bg-emerald-950 border-b-4 border-black p-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <span className="font-comic text-xl text-white tracking-widest">
                  {editingArticle ? 'REWRITE SCROLL ARCHIVE' : 'DRAFT NEW SOVEREIGN SCROLL'}
                </span>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs border-2 border-black px-3 py-1 cursor-pointer transition-colors uppercase flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>CLOSE</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">CHRONICLE TITLE (Headline)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elden Ring: Shadow of the Erdtree - A Study in Royal Conquest"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">COURIER CATEGORY</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="game">🎮 Video Games</option>
                    <option value="comic">📚 Comic Books</option>
                    <option value="movie">🎬 Cinematic Film</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">SUBTITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. A Grim Masterpiece of Desolate Landscapes and Iron Will"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">IMAGE URL OR LOCAL FILE</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or base64 data"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="flex-1 bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                    <label className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 text-[10px] cursor-pointer font-bold select-none uppercase shrink-0 transition-all">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setFormImageUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formImageUrl && formImageUrl.startsWith('data:') && (
                    <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Local image uploaded successfully</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">DOOM SOVEREIGN RATING (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formDoomRating}
                    onChange={(e) => setFormDoomRating(Number(e.target.value))}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">SCRIBE STATUS</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="pending_review">PENDING REVIEW</option>
                    <option value="published">PUBLISHED</option>
                    <option value="draft">DRAFT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">STATE SCRIBE (Author Name)</label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] font-bold mb-1">EXCERPT (Teaser sentence)</label>
                <input
                  type="text"
                  placeholder="Does FromSoftware’s massive expansion match the brutal elegance of a Latverian siege?..."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] font-bold mb-1">SOVEREIGN EDICT (Lord Doom's Executive Verdict Quote)</label>
                <textarea
                  rows={2}
                  placeholder="An impressive trial of combat! The architecture of the Shadow Keep is passably grand..."
                  value={formDoomVerdict}
                  onChange={(e) => setFormDoomVerdict(e.target.value)}
                  className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 text-[10px] font-bold mb-1">SCROLL PROSE BODY (Content - separate paragraphs with double enters)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Insert the full review manuscript text here..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* SEO & GEO SUITE (Collapsible/Accordion Block) */}
              <div className="border border-stone-850 p-4 bg-stone-950/40 space-y-4 rounded-sm">
                <div className="flex items-center space-x-2 text-yellow-400 font-bold border-b border-stone-850 pb-2">
                  <Settings className="w-4 h-4" />
                  <h3 className="text-xs uppercase tracking-wider">SEO & GEOGRAPHIC OPTIMIZATION PANEL</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 text-[10px] font-bold mb-1">TARGET GEOGRAPHIC REGION</label>
                    <input
                      type="text"
                      placeholder="e.g. Latveria, US, Global"
                      value={formGeoRegion}
                      onChange={(e) => setFormGeoRegion(e.target.value)}
                      className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[10px] font-bold mb-1">SEO SEARCH ENGINE TITLE (Overrides Main Title)</label>
                    <input
                      type="text"
                      placeholder="Custom SEO Title Tag..."
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] font-bold mb-1">SEO META DESCRIPTION</label>
                  <textarea
                    rows={2}
                    placeholder="Provide description optimized for Google search snippets (150-160 characters)..."
                    value={formSeoDescription}
                    onChange={(e) => setFormSeoDescription(e.target.value)}
                    className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                {/* FAQ Structured Data Builder */}
                <div className="border border-stone-850 p-3 bg-stone-950/60 rounded-xs space-y-3">
                  <span className="block text-[10px] font-bold text-stone-400 border-b border-stone-900 pb-1">
                    FAQ STRUCTURED MARKUP BUILDER
                  </span>
                  
                  {/* Current FAQs List */}
                  {formFaqs.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formFaqs.map((faq, index) => (
                        <div key={index} className="flex justify-between items-start border border-stone-850 p-2 bg-stone-900/60">
                          <div className="max-w-[85%]">
                            <p className="text-[10px] text-rose-400 font-bold leading-normal">Q: {faq.question}</p>
                            <p className="text-[9px] text-stone-300 mt-0.5 normal-case font-sans">A: {faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(index)}
                            className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add FAQ form inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <input
                        type="text"
                        placeholder="ENTER FAQ QUESTION..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-[10px] placeholder:text-stone-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER FAQ ANSWER..."
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        className="w-full bg-stone-950 text-white border border-stone-800 px-3 py-2 text-[10px] placeholder:text-stone-700 font-sans normal-case"
                      />
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="bg-stone-900 hover:bg-stone-850 text-yellow-400 px-3 py-1 border border-stone-800 flex items-center space-x-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold">ADD</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                <span className="text-[9px] font-bold text-stone-500">SCHEDULING SIGNATURE GATEWAY</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="bg-stone-950 hover:bg-stone-900 border border-stone-800 px-5 py-2.5 text-xs text-stone-400 hover:text-white cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-comic text-lg uppercase px-6 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center space-x-2 cursor-pointer disabled:bg-stone-800 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span>{editingArticle ? 'UPDATE ARCHIVE →' : 'PUBLISH CHRONICLE →'}</span>
                  </button>
                </div>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Sovereign Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="bg-stone-900 border-4 border-black w-full max-w-xl shadow-comic relative text-stone-100 uppercase p-6 font-mono">
            
            <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center space-x-2 text-emerald-500 font-bold">
                <Settings className="w-5 h-5 shrink-0" />
                <h3 className="font-comic text-xl tracking-wider">SOVEREIGN CONFIGURATION</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-red-650 hover:bg-red-500 text-white text-xs border border-black px-2.5 py-1 cursor-pointer"
              >
                X CLOSE
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('gemini-api-key', geminiApiKey);
              alert('Sovereign settings successfully written to browser storage!');
              setShowSettings(false);
            }} className="space-y-4 text-xs">
              
              <p className="text-stone-300 normal-case leading-normal font-sans">
                Configure your Gemini API Key to activate dynamic AI chat with Doctor Doom under the **Ask Doom\'s Counsel** section. 
                If no key is configured, the system will gracefully fall back to the static quote list.
              </p>

              <div>
                <label className="block text-stone-400 text-[10px] font-bold mb-1">GEMINI API KEY</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-stone-950 text-yellow-400 border-2 border-black px-3 py-2.5 text-xs focus:outline-hidden focus:border-emerald-500 placeholder:text-stone-850"
                />
              </div>

              {geminiApiKey ? (
                <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 p-2.5 rounded-xs text-[10px] uppercase font-bold text-center">
                  ✓ DYNAMIC AI CHAT SERVICE ACTIVE
                </div>
              ) : (
                <div className="bg-stone-950 border border-stone-850 text-stone-500 p-2.5 rounded-xs text-[10px] uppercase font-bold text-center">
                  ⚠️ STATIC QUOTE FALLBACK SERVICE ACTIVE (NO KEY SET)
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-comic text-lg py-2.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                SAVE CONFIGURATION →
              </button>

            </form>
          </div>
        </div>
      )}

      {/* AI Agent API Integration Guide Drawer */}
      {showAgentGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="bg-stone-900 border-4 border-black w-full max-w-2xl shadow-comic relative text-stone-100 uppercase p-6 font-mono max-h-[85vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center space-x-2 text-yellow-400">
                <Terminal className="w-5 h-5 shrink-0" />
                <h3 className="font-comic text-xl tracking-wider">AI AGENT PUBLISHING PROTOCOLS</h3>
              </div>
              <button
                onClick={() => setShowAgentGuide(false)}
                className="bg-red-650 hover:bg-red-500 text-white text-xs border border-black px-2.5 py-1 cursor-pointer"
              >
                X CLOSE
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-stone-300 normal-case leading-normal font-sans">
                You can easily connect your autonomous AI agent to publish cinematic reviews, game logs, or comic critiques automatically. 
                Configure your agent to trigger HTTP requests to your endpoint.
              </p>

              <div className="border border-stone-850 p-3 bg-stone-950 text-stone-400">
                <div className="flex justify-between border-b border-stone-900 pb-1.5 mb-2 font-bold">
                  <span className="text-[10px]">API ENDPOINT</span>
                  <span className="text-emerald-500">POST /api/articles</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>MANDATORY HEADER (API KEY):</span>
                    <span className="text-yellow-400 font-bold select-all">x-api-key</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KEY VALUE (IN .ENV):</span>
                    <span className="text-stone-500 font-bold italic lowercase">API_AGENT_KEY value</span>
                  </div>
                </div>
              </div>

              {/* Code snippet */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-stone-400">EXAMPLE PAYLOAD SCHEMA (JSON)</span>
                <pre className="bg-stone-950 border border-stone-850 p-3 overflow-x-auto text-[9px] text-emerald-400 font-bold lowercase leading-relaxed">
{`{
  "title": "Cosmic Odyssey Review",
  "category": "comic",
  "subtitle": "Doom's Interstellar Conquest",
  "excerpt": "A deep analysis of cosmic space warfare...",
  "content": "Full article body content split in paragraphs...",
  "imageUrl": "https://url.to/image.jpg",
  "doomRating": 4.8,
  "doomVerdict": "highly acceptable writing.",
  "authorName": "AI-Agent-Scribe",
  "geoRegion": "Battleworld",
  "publishImmediately": true, // goes straight to published ledger
  "faqs": [
    {
      "question": "is battleworld safe?",
      "answer": "under doom's reign, security is 100% absolute."
    }
  ]
}`}
                </pre>
              </div>

              {/* cURL command */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-stone-400">cURL COMMAND EXAMPLE</span>
                <pre className="bg-stone-950 border border-stone-850 p-3 overflow-x-auto text-[9px] text-stone-400 font-bold leading-normal select-all">
{`curl -X POST ${window.location.origin}/api/articles \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_AGENT_KEY" \\
  -d '{
    "title": "Automated AI Critique",
    "category": "movie",
    "content": "Content written by AI...",
    "doomRating": 4.0
  }'`}
                </pre>
              </div>

              <div className="border-l-4 border-yellow-500 bg-stone-950 p-3 text-stone-400 text-[10px] leading-relaxed normal-case font-sans">
                <span className="font-bold text-yellow-500 block uppercase font-mono mb-1">💡 SEO SCHEMA GENERATOR</span>
                Your Express backend automatically generates optimized **JSON-LD BlogPosting** and **FAQPage** schema structured markup from this payload. The geographic region is mapped to Google's geo-search structured data parameters.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Article Preview Modal — full reader view for pending/draft articles */}
      <AnimatePresence>
        {previewArticle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-950 border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-comic-lg relative text-stone-100"
            >
              {/* Preview Banner */}
              <div className="bg-yellow-900 border-b-4 border-black p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-yellow-300" />
                  <span className="font-comic text-lg text-yellow-200 tracking-widest uppercase">Draft Preview — Not Yet Published</span>
                </div>
                <div className="flex items-center gap-2">
                  {(previewArticle.status === 'pending_review' || previewArticle.status === 'draft') && (
                    <button
                      onClick={() => { handleApprove(previewArticle.id); setPreviewArticle(null); }}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase px-3 py-1.5 border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}
                  {(previewArticle.status === 'pending_review' || previewArticle.status === 'draft') && (
                    <button
                      onClick={() => { setRewriteTarget(previewArticle); setRewriteInstructions(''); setPreviewArticle(null); }}
                      className="bg-rose-900 hover:bg-rose-800 text-rose-300 hover:text-rose-100 font-bold text-xs uppercase px-3 py-1.5 border border-rose-800 flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Instruct Arthur to rewrite this article"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rewrite</span>
                    </button>
                  )}
                  <button
                    onClick={() => setPreviewArticle(null)}
                    className="bg-red-800 hover:bg-red-600 text-white font-mono font-bold text-xs border-2 border-black px-3 py-1.5 cursor-pointer transition-colors uppercase"
                  >
                    X Close
                  </button>
                </div>
              </div>

              {/* Cover image */}
              <div className="relative h-64 sm:h-80 border-b-4 border-black">
                <img
                  src={previewArticle.imageUrl}
                  alt={previewArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2.5 py-1 border border-black uppercase rounded-xs">
                    {previewArticle.category}
                  </span>
                  <h3 className="font-comic text-4xl sm:text-5xl text-white uppercase mt-2 tracking-wide leading-tight drop-shadow-md">
                    {previewArticle.title}
                  </h3>
                  <p className="font-sans font-bold text-sm sm:text-base text-yellow-400 uppercase mt-1">
                    {previewArticle.subtitle}
                  </p>
                </div>
              </div>

              {/* Content area */}
              <div className="p-6 sm:p-8 space-y-6">

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-between border-b border-stone-800 pb-4 text-xs font-mono text-stone-400">
                  <span>CHRONICLED ON: {previewArticle.publishDate}</span>
                  {previewArticle.authorName && <span>SCRIBE: {previewArticle.authorName}</span>}
                  {previewArticle.geoRegion && <span>REGION: {previewArticle.geoRegion}</span>}
                  <span>READ TIME: {previewArticle.readTime}</span>
                </div>

                {/* Prose body */}
                <div className="prose prose-invert max-w-none text-stone-200 text-sm sm:text-base leading-relaxed space-y-6 font-sans font-medium text-justify">
                  {(() => {
                    const normalized = previewArticle.content.replace(/\r\n/g, '\n').trim();
                    let paragraphs: string[] = [];
                    if (normalized.includes('\n')) {
                      paragraphs = normalized.split(/\n+/).filter(p => p.trim());
                    } else {
                      const rawSentences = normalized.split(/\.\s+/);
                      const sentences = rawSentences.map((s, idx) => {
                        if (!s.trim()) return '';
                        if (idx === rawSentences.length - 1) return s.trim();
                        const lastChar = s.trim().slice(-1);
                        if (['.', '!', '?'].includes(lastChar)) return s.trim();
                        return s.trim() + '.';
                      }).filter(s => s.length > 0);
                      let curr: string[] = [];
                      for (let i = 0; i < sentences.length; i++) {
                        curr.push(sentences[i]);
                        if (curr.length === 3 || i === sentences.length - 1) {
                          paragraphs.push(curr.join(' '));
                          curr = [];
                        }
                      }
                    }
                    return paragraphs.map((para, idx) => (
                      <p key={idx} className="first-of-type:first-letter:text-4xl first-of-type:first-letter:font-comic first-of-type:first-letter:mr-2 first-of-type:first-letter:float-left first-of-type:first-letter:text-yellow-400 first-of-type:first-letter:leading-none">
                        {para.trim()}
                      </p>
                    ));
                  })()}
                </div>

                {/* FAQs */}
                {previewArticle.faqs && previewArticle.faqs.length > 0 && (
                  <div className="border-4 border-black p-5 bg-stone-900 shadow-comic mt-6 font-mono">
                    <h4 className="font-comic text-xl text-yellow-400 uppercase tracking-wider mb-4 border-b-2 border-black pb-2">⚔️ STATE RECORD: FREQUENTLY ASKED QUESTIONS</h4>
                    <div className="space-y-4">
                      {previewArticle.faqs.map((faq, i) => (
                        <div key={i} className="border border-stone-850 p-3 bg-stone-950 rounded-xs shadow-sm">
                          <p className="text-xs font-bold text-rose-500 uppercase font-mono">Q: {faq.question}</p>
                          <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-sans">A: {faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sovereign Edict */}
                <div className="bg-stone-900 border-4 border-emerald-800 p-5 sm:p-6 shadow-comic relative mt-12 overflow-hidden">
                  <div className="absolute inset-0 halftone-green opacity-20 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-emerald-400 font-comic text-xl uppercase mb-3 tracking-wide">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span>THE SOVEREIGN EDICT</span>
                    </div>
                    <p className="font-sans font-bold text-stone-100 italic text-base sm:text-lg leading-relaxed border-l-4 border-emerald-500 pl-4 mb-4">
                      "{previewArticle.doomVerdict}"
                    </p>
                    <div className="flex items-center justify-between border-t border-stone-800 pt-3">
                      <span className="font-mono text-xs text-stone-400 font-bold">SOVEREIGN RATING:</span>
                      <div className="flex items-center space-x-1.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const ratingVal = i + 1;
                          const isFull = ratingVal <= Math.floor(previewArticle.doomRating);
                          const isHalf = !isFull && ratingVal === Math.ceil(previewArticle.doomRating);
                          return (
                            <Shield key={i} className={`w-5 h-5 ${
                              isFull ? 'text-red-500 fill-red-500' : isHalf ? 'text-red-500/70 fill-red-500/40' : 'text-stone-700'
                            } stroke-black stroke-2`} />
                          );
                        })}
                        <span className="font-comic text-lg text-white ml-2 tracking-wide">({previewArticle.doomRating} / 5)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Arthur Rewrite Instructions Modal */}
      <AnimatePresence>
        {rewriteTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-stone-950 border-4 border-rose-800 w-full max-w-2xl shadow-comic-lg text-stone-100"
            >
              {/* Modal Header */}
              <div className="bg-rose-950 border-b-4 border-rose-800 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-rose-400" />
                  <span className="font-comic text-lg text-rose-200 tracking-widest uppercase">Instruct Arthur to Rewrite</span>
                </div>
                <button
                  onClick={() => setRewriteTarget(null)}
                  disabled={isRewriting}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-400 font-mono font-bold text-xs border border-stone-700 px-3 py-1.5 cursor-pointer transition-colors uppercase disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Article context */}
                <div className="bg-stone-900 border border-stone-700 px-4 py-3 space-y-0.5">
                  <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Rewriting Article</p>
                  <p className="font-comic text-base text-white tracking-wide">{rewriteTarget.title}</p>
                  <p className="text-[10px] text-stone-400 font-mono uppercase">{rewriteTarget.category} &mdash; {rewriteTarget.status?.replace('_', ' ')}</p>
                </div>

                {/* Instructions textarea */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                    ✍️ Your Editorial Directives for Arthur
                  </label>
                  <textarea
                    rows={8}
                    value={rewriteInstructions}
                    onChange={(e) => setRewriteInstructions(e.target.value)}
                    disabled={isRewriting}
                    placeholder={`e.g.\n- Mention the multiplayer mode more prominently in the second paragraph\n- Increase the doom rating to 4.5 — the game deserves higher praise\n- Add a section discussing the soundtrack\n- Make the tone harsher regarding the microtransactions\n- Include a reference to Dark Souls comparisons`}
                    className="w-full bg-stone-900 text-stone-100 border border-stone-700 focus:border-rose-500 focus:outline-none px-4 py-3 text-xs font-sans leading-relaxed resize-y placeholder:text-stone-600 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-stone-500 font-sans">Arthur will receive the existing article and rewrite it from scratch honoring your directives above. The result replaces the current draft and stays in Pending Review.</p>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 border-t border-stone-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setRewriteTarget(null)}
                    disabled={isRewriting}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-400 font-bold text-xs uppercase px-4 py-2.5 border border-stone-700 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isRewriting || !rewriteInstructions.trim()}
                    onClick={handleArthurRewrite}
                    className="bg-rose-700 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase px-5 py-2.5 border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center space-x-2"
                  >
                    {isRewriting ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Arthur Rewriting...</span></>
                    ) : (
                      <><RefreshCw className="w-3.5 h-3.5" /><span>Send Directives to Arthur</span></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
