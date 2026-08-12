-- ============================================================
-- THE DOOM CHRONICLE — Row-Level Security Policies
-- Run this entire script in the Supabase SQL Editor once.
-- ============================================================
-- Tables covered:
--   1. articles       — public blog posts
--   2. registry       — Latverian guestbook / subject roll
--   3. content_corpus — CMS planning queue (admin-only)
-- ============================================================


-- ════════════════════════════════════════════════
-- TABLE: articles
-- ════════════════════════════════════════════════

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) may READ
-- only rows where status = 'published'.
CREATE POLICY "Public: read published articles"
  ON articles
  FOR SELECT
  USING (status = 'published');

-- The anon key can INSERT new rows ONLY if they arrive
-- as 'pending_review' (reader proposal submissions).
-- Admins bypass RLS entirely via the service-role key.
CREATE POLICY "Public: submit pending proposals"
  ON articles
  FOR INSERT
  WITH CHECK (status = 'pending_review');

-- No UPDATE or DELETE is allowed via the anon key.
-- All CMS write operations (publish, edit, delete) must
-- be done server-side using the SERVICE ROLE key, which
-- bypasses RLS automatically — no extra policy needed.


-- ════════════════════════════════════════════════
-- TABLE: registry  (Latverian Guestbook)
-- ════════════════════════════════════════════════

ALTER TABLE registry ENABLE ROW LEVEL SECURITY;

-- Anyone may read all accepted guestbook entries.
CREATE POLICY "Public: read registry entries"
  ON registry
  FOR SELECT
  USING (true);

-- Anyone may submit a new guestbook entry.
CREATE POLICY "Public: insert registry entry"
  ON registry
  FOR INSERT
  WITH CHECK (true);

-- No UPDATE or DELETE via the anon key.
-- Admin responses (Sovereign Reply) and deletions must
-- go through the SERVICE ROLE key on the server side.


-- ════════════════════════════════════════════════
-- TABLE: content_corpus  (CMS Strategy Backlog)
-- ════════════════════════════════════════════════

ALTER TABLE content_corpus ENABLE ROW LEVEL SECURITY;

-- Deny ALL access via the anon key (public internet).
-- This table is exclusively managed by Arthur (the AI
-- agent) and the CMS dashboard, both of which must use
-- the SERVICE ROLE key via a secure backend/edge function.

-- No policies = anon role gets nothing.
-- The service role bypasses RLS automatically.


-- ============================================================
-- IMPORTANT — SERVICE ROLE KEY SETUP
-- ============================================================
-- After applying this migration you MUST ensure that all
-- admin/write operations (create article, delete article,
-- respond to guestbook, corpus management) use the
-- SERVICE ROLE key, NOT the anon key.
--
-- The service role key must NEVER be exposed in client-side
-- code or .env files committed to GitHub.
--
-- Recommended approach:
--   • Create a Supabase Edge Function (or a lightweight
--     server-side API route) that holds the service role key
--     in a secret environment variable.
--   • The CMS dashboard authenticates with the ADMIN_PASSPHRASE
--     and calls that edge function for all write operations.
--   • The public-facing site uses only the anon key for reads.
-- ============================================================
