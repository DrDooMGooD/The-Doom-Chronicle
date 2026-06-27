import { Article } from '../types';

const API_BASE = (import.meta as any).env.VITE_API_BASE || '/api';

export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE}/articles`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles from Latverian State Archive');
  }
  return response.json();
}

export async function fetchAdminArticles(passcode: string): Promise<Article[]> {
  const response = await fetch(`${API_BASE}/admin/articles`, {
    headers: {
      'x-admin-passcode': passcode,
    },
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'ACCESS DENIED: Unauthorized Signature' : 'Failed to fetch admin articles');
  }
  return response.json();
}

export async function createArticle(article: Partial<Article>, passcode: string): Promise<Article> {
  const response = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-passcode': passcode,
    },
    body: JSON.stringify(article),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(err.error || 'Failed to create article in State Archive');
  }
  return response.json();
}

export async function updateArticle(id: string, updates: Partial<Article>, passcode: string): Promise<Article> {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-passcode': passcode,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(err.error || 'Failed to update article');
  }
  return response.json();
}

export async function deleteArticle(id: string, passcode: string): Promise<void> {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-passcode': passcode,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown server error' }));
    throw new Error(err.error || 'Failed to delete article');
  }
}

export async function submitProposal(proposal: {
  name: string;
  email: string;
  title: string;
  category: 'game' | 'comic' | 'movie';
  manuscript: string;
  doom_verdict: string;
}): Promise<Article> {
  // Propose an article. It creates an article in 'pending_review' status.
  // We send a guest passcode or call a public route to submit proposals.
  const articlePayload: Partial<Article> = {
    title: proposal.title,
    category: proposal.category,
    subtitle: `Proposed by Courier: ${proposal.name}`,
    excerpt: proposal.manuscript.length > 150 ? `${proposal.manuscript.slice(0, 150)}...` : proposal.manuscript,
    content: proposal.manuscript,
    imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop', // default placeholder
    doomRating: 1.0, // default rating for pending review
    doomVerdict: proposal.doom_verdict,
    authorName: proposal.name,
    status: 'pending_review',
    geoRegion: 'Unknown',
    faqs: [],
  };

  const response = await fetch(`${API_BASE}/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(articlePayload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit proposal to Sovereign Desk');
  }
  return response.json();
}
