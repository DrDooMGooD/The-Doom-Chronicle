export interface FAQItem {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  title: string;
  category: 'game' | 'comic' | 'movie';
  subtitle: string;
  excerpt: string;
  content: string;
  publishDate: string;
  readTime: string;
  imageUrl: string;
  doomRating: number; // Out of 5 Doom Masks
  doomVerdict: string; // Lord Doom's executive quote about it
  slug: string;
  featured?: boolean;
  status?: 'published' | 'draft' | 'pending_review';
  authorName?: string;
  geoRegion?: string;
  seoTitle?: string;
  seoDescription?: string;
  faqs?: FAQItem[];
  schemaMarkup?: any; // To allow safe access to schemaMarkup if needed by head inject
}

export interface GuestbookEntry {
  id: string;
  name: string;
  email?: string;
  newsletter?: boolean;
  allegiance: 'loyalist' | 'rebel' | 'doombot' | 'foreigner';
  country: string;
  tribute: string;
  timestamp: string;
  acceptedByDoom: boolean;
  response?: string;
}

export interface DoomQuote {
  emotion: 'stern' | 'wrathful' | 'triumphant' | 'benevolent';
  quote: string;
  context: string;
}
