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
  status?: 'draft' | 'pending_review' | 'published';
  authorName?: string;
  faqs?: { question: string; answer: string }[];
  geoRegion?: string;
  seoTitle?: string;
  seoDescription?: string;
  schemaMarkup?: any;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  allegiance: 'loyalist' | 'rebel' | 'doombot' | 'foreigner';
  country: string;
  tribute: string;
  timestamp: string;
  acceptedByDoom: boolean;
}

export interface DoomQuote {
  emotion: 'stern' | 'wrathful' | 'triumphant' | 'benevolent';
  quote: string;
  context: string;
}
