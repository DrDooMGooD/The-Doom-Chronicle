-- ============================================================
-- THE DOOM CHRONICLE — Row-Level Security Policies
-- Run this entire script in the Supabase SQL Editor once.
-- ============================================================

-- TABLE: articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public: read published articles" ON articles;
DROP POLICY IF EXISTS "Public: submit pending proposals" ON articles;
DROP POLICY IF EXISTS "Public: update articles" ON articles;
DROP POLICY IF EXISTS "Public: delete articles" ON articles;

CREATE POLICY "Public: read published articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public: submit pending proposals" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public: update articles" ON articles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public: delete articles" ON articles FOR DELETE USING (true);


-- TABLE: registry (Latverian Guestbook)
ALTER TABLE registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public: read registry entries" ON registry;
DROP POLICY IF EXISTS "Public: insert registry entry" ON registry;
DROP POLICY IF EXISTS "Public: update registry" ON registry;
DROP POLICY IF EXISTS "Public: delete registry" ON registry;

CREATE POLICY "Public: read registry entries" ON registry FOR SELECT USING (true);
CREATE POLICY "Public: insert registry entry" ON registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Public: update registry" ON registry FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public: delete registry" ON registry FOR DELETE USING (true);


-- TABLE: content_corpus (CMS Strategy Backlog)
ALTER TABLE content_corpus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public: read content corpus" ON content_corpus;
DROP POLICY IF EXISTS "Public: insert content corpus" ON content_corpus;
DROP POLICY IF EXISTS "Public: update content corpus" ON content_corpus;
DROP POLICY IF EXISTS "Public: delete content corpus" ON content_corpus;

CREATE POLICY "Public: read content corpus" ON content_corpus FOR SELECT USING (true);
CREATE POLICY "Public: insert content corpus" ON content_corpus FOR INSERT WITH CHECK (true);
CREATE POLICY "Public: update content corpus" ON content_corpus FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public: delete content corpus" ON content_corpus FOR DELETE USING (true);
