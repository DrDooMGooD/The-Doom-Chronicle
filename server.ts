import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { articles as defaultArticles } from './src/data';
import { Article } from './src/types';

// ESM-compatible __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Enable CORS for frontend during development (Vite proxies requests, but this is a failsafe)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, x-admin-passcode');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

let supabase: any = null;
// In-Memory fallback storage
let inMemoryArticles: any[] = [];

// Helper functions for mapping app state to database format
function dbToApp(article: any): Article {
  return {
    id: article.id,
    title: article.title,
    category: article.category,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    content: article.content,
    publishDate: article.publish_date,
    readTime: article.read_time,
    imageUrl: article.image_url,
    doomRating: Number(article.doom_rating),
    doomVerdict: article.doom_verdict,
    slug: article.slug,
    featured: !!article.featured,
    status: article.status,
    authorName: article.author_name || 'Dr. Doom',
    faqs: article.faqs || [],
    geoRegion: article.geo_region || 'Latveria',
    seoTitle: article.seo_title || article.title,
    seoDescription: article.seo_description || article.excerpt,
    schemaMarkup: article.schema_markup || {},
  };
}

function generateSchemaMarkup(article: any): any {
  const canonicalUrl = `${process.env.APP_URL || 'http://localhost:3000'}/#reviews`;
  
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": article.title,
    "description": article.excerpt || article.subtitle,
    "image": article.imageUrl,
    "author": {
      "@type": "Person",
      "name": article.authorName || article.author_name || "Dr. Doom"
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Doom Chronicle",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop"
      }
    },
    "datePublished": article.publishDate || article.publish_date || new Date().toISOString(),
    "contentLocation": {
      "@type": "Place",
      "name": article.geoRegion || article.geo_region || "Latveria"
    }
  };

  if (article.faqs && article.faqs.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        blogPostingSchema,
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": article.faqs.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }
      ]
    };
  }

  return blogPostingSchema;
}

function appToDb(article: any): any {
  const slug = article.slug || article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
    
  const bodyText = article.content || '';
  const calculatedReadTime = article.readTime || `${Math.max(1, Math.ceil(bodyText.split(/\s+/).length / 200))} min read`;

  const dbObj = {
    id: article.id || `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: article.title,
    category: article.category,
    subtitle: article.subtitle || '',
    excerpt: article.excerpt || '',
    content: bodyText,
    publish_date: article.publishDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    read_time: calculatedReadTime,
    image_url: article.imageUrl || 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop',
    doom_rating: Number(article.doomRating) || 5,
    doom_verdict: article.doomVerdict || 'Approved by Lord Doom.',
    slug: slug,
    featured: !!article.featured,
    status: article.status || 'pending_review',
    author_name: article.authorName || 'Dr. Doom',
    faqs: article.faqs || [],
    geo_region: article.geoRegion || 'Latveria',
    seo_title: article.seoTitle || article.title,
    seo_description: article.seoDescription || article.excerpt || '',
    schema_markup: {},
  };

  dbObj.schema_markup = generateSchemaMarkup(dbObj);
  return dbObj;
}

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    console.log('Castle Latveria Database Uplink initialized successfully.');
    seedDatabase();
  } catch (err) {
    console.error('Failed to configure Supabase. Falling back to simulation mode:', err);
    initializeSimulationMode();
  }
} else {
  initializeSimulationMode();
}

function initializeSimulationMode() {
  console.warn('⚠️ WARNING: Supabase keys not set. Running in SIMULATED OFFLINE MODE.');
  inMemoryArticles = defaultArticles.map(a => appToDb({ ...a, status: 'published', authorName: 'Dr. Doom', geoRegion: 'Latveria' }));
}

async function seedDatabase() {
  try {
    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    if (count === 0) {
      console.log('Database empty. Preparing to seed initial Latverian scrolls...');
      const dbArticles = defaultArticles.map(a => appToDb({ ...a, status: 'published', authorName: 'Dr. Doom', geoRegion: 'Latveria' }));
      const { error: insertError } = await supabase.from('articles').insert(dbArticles);
      if (insertError) {
        console.error('Database seeding failed:', insertError);
      } else {
        console.log('Seeded database with default reviews.');
      }
    } else {
      console.log(`Database verification complete. Found ${count} articles in State Archive.`);
    }
  } catch (err) {
    console.error('Error during database check/seeding:', err);
  }
}

// Authentication Middlewares
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const passcode = req.headers['x-admin-passcode'];
  const expectedPasscode = process.env.ADMIN_PASSPHRASE || 'latveria'; // fallback default
  
  if (passcode !== expectedPasscode) {
    return res.status(401).json({ error: 'ACCESS DENIED: Invalid Royal Cryptographic Signature' });
  }
  next();
};

const agentOrAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const passcode = req.headers['x-admin-passcode'];
  const expectedApiKey = process.env.API_AGENT_KEY || 'doom-agent-secret';
  const expectedPasscode = process.env.ADMIN_PASSPHRASE || 'latveria';

  if (apiKey === expectedApiKey || passcode === expectedPasscode) {
    return next();
  }
  return res.status(401).json({ error: 'ACCESS DENIED: Credentials mismatch' });
};

// Endpoints

app.get('/api/health', (req, res) => {
  res.json({
    supabaseUrlConfigured: !!process.env.SUPABASE_URL,
    supabaseServiceKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseClientInitialized: !!supabase,
    supabaseUrlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
    supabaseUrlFirstChar: process.env.SUPABASE_URL ? process.env.SUPABASE_URL[0] : '',
    supabaseUrlLastChar: process.env.SUPABASE_URL ? process.env.SUPABASE_URL[process.env.SUPABASE_URL.length - 1] : '',
    isSimulationMode: !supabase
  });
});

// 1. GET /api/articles (Public: reads only published articles)
app.get('/api/articles', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  if (supabase) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch articles from database' });
    }
    return res.json(data.map(dbToApp));
  } else {
    // In-memory simulation
    const published = inMemoryArticles
      .filter(a => a.status === 'published')
      .sort((a, b) => b.id.localeCompare(a.id));
    return res.json(published.map(dbToApp));
  }
});

// 2. GET /api/admin/articles (Admin: reads all articles)
app.get('/api/admin/articles', adminAuth, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  if (supabase) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch archive' });
    }
    return res.json(data.map(dbToApp));
  } else {
    return res.json(inMemoryArticles.map(dbToApp));
  }
});

// 3. POST /api/articles (AI Agent / Admin publishing)
app.post('/api/articles', agentOrAdminAuth, async (req, res) => {
  try {
    const isAgent = req.headers['x-api-key'] === (process.env.API_AGENT_KEY || 'doom-agent-secret');
    const articleData = req.body;

    // Validation
    if (!articleData.title || !articleData.category || !articleData.content) {
      return res.status(400).json({ error: 'Missing required fields (title, category, content)' });
    }

    // Determine status
    let status = 'pending_review';
    if (!isAgent) {
      // Admin is posting
      status = articleData.status || 'published';
    } else {
      // AI Agent is posting
      if (articleData.publishImmediately === true || articleData.status === 'published') {
        status = 'published';
      }
    }

    const newArticle = appToDb({
      ...articleData,
      status,
    });

    if (supabase) {
      const { data, error } = await supabase
        .from('articles')
        .insert([newArticle])
        .select();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'An article with this title/slug already exists.' });
        }
        throw error;
      }
      return res.status(201).json(dbToApp(data[0]));
    } else {
      inMemoryArticles.unshift(newArticle);
      return res.status(201).json(dbToApp(newArticle));
    }
  } catch (err: any) {
    console.error('Error inserting article:', err);
    return res.status(500).json({ error: err.message || 'Server error inserting article' });
  }
});

// 4. POST /api/proposals (Public pitch creation: feeds CMS queue)
app.post('/api/proposals', async (req, res) => {
  try {
    const rawProposal = req.body;
    if (!rawProposal.title || !rawProposal.content) {
      return res.status(400).json({ error: 'Title and content required for proposal' });
    }

    // Force pending_review status for safety
    const proposalArticle = appToDb({
      ...rawProposal,
      status: 'pending_review',
    });

    if (supabase) {
      const { data, error } = await supabase
        .from('articles')
        .insert([proposalArticle])
        .select();

      if (error) throw error;
      return res.status(201).json(dbToApp(data[0]));
    } else {
      inMemoryArticles.unshift(proposalArticle);
      return res.status(201).json(dbToApp(proposalArticle));
    }
  } catch (err: any) {
    console.error('Proposal routing failed:', err);
    return res.status(500).json({ error: 'Failed to route proposal' });
  }
});

// 5. PUT /api/articles/:id (Admin edit / approve)
app.put('/api/articles/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert updates keys to DB columns if needed, but easier is mapping the fields
    const existing = supabase
      ? null
      : inMemoryArticles.find(a => a.id === id);

    if (!supabase && !existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

    let updatedDbObj: any = {};
    
    // Read existing database structure to merge
    if (supabase) {
      const { data: currentRecord, error: fetchErr } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchErr || !currentRecord) {
        return res.status(404).json({ error: 'Article not found in database' });
      }

      // Convert database record to app format, merge with updates, convert back to db format
      const appRecord = dbToApp(currentRecord);
      const mergedApp = { ...appRecord, ...updates };
      updatedDbObj = appToDb(mergedApp);
      // Retain original ID and created_at
      updatedDbObj.id = id;
      delete updatedDbObj.created_at;

      const { data, error } = await supabase
        .from('articles')
        .update(updatedDbObj)
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.json(dbToApp(data[0]));
    } else {
      // In memory merge
      const appRecord = dbToApp(existing);
      const mergedApp = { ...appRecord, ...updates };
      updatedDbObj = appToDb(mergedApp);
      updatedDbObj.id = id;
      
      const idx = inMemoryArticles.findIndex(a => a.id === id);
      inMemoryArticles[idx] = updatedDbObj;
      return res.json(dbToApp(updatedDbObj));
    }
  } catch (err: any) {
    console.error('Error updating article:', err);
    return res.status(500).json({ error: err.message || 'Server error during update' });
  }
});

// 6. DELETE /api/articles/:id (Admin delete / incinerate)
app.delete('/api/articles/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      const idx = inMemoryArticles.findIndex(a => a.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Article not found' });
      }
      inMemoryArticles.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Article incinerated successfully' });
  } catch (err: any) {
    console.error('Incineration failed:', err);
    return res.status(500).json({ error: err.message || 'Database error during incineration' });
  }
});

// Serve client static files in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Castle Latveria Sovereign Broadcast System online on port ${PORT}`);
});
