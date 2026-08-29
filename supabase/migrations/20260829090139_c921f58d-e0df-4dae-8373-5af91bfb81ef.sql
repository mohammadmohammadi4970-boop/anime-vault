
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- First-time bootstrap: allowed only while no admin exists at all.
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- SHARED updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ANIME
CREATE TABLE public.anime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  aliases text[] NOT NULL DEFAULT '{}',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.anime TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anime TO authenticated;
GRANT ALL ON public.anime TO service_role;
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anime is publicly readable" ON public.anime FOR SELECT USING (true);
CREATE POLICY "Admins manage anime" ON public.anime FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER anime_touch BEFORE UPDATE ON public.anime FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_touch BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CLIPS
CREATE TABLE public.clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  anime_id uuid REFERENCES public.anime(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  character text,
  character_aliases text[] NOT NULL DEFAULT '{}',
  anime_aliases text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  thumbnail_url text,
  screenshot_urls text[] NOT NULL DEFAULT '{}',
  duration integer NOT NULL DEFAULT 0,
  resolution text NOT NULL DEFAULT '1080p',
  format text NOT NULL DEFAULT 'MP4',
  download_url text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  search_doc text NOT NULL DEFAULT '',
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(search_doc, ''))) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clips TO authenticated;
GRANT ALL ON public.clips TO service_role;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published clips are publicly readable" ON public.clips FOR SELECT USING (published = true);
CREATE POLICY "Admins read all clips" ON public.clips FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage clips" ON public.clips FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER clips_touch BEFORE UPDATE ON public.clips FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX clips_search_idx ON public.clips USING GIN (search_vector);
CREATE INDEX clips_anime_idx ON public.clips (anime_id);
CREATE INDEX clips_category_idx ON public.clips (category_id);
CREATE INDEX clips_created_idx ON public.clips (created_at DESC);

-- Search document keeps anime + category names denormalised for indexing only.
CREATE OR REPLACE FUNCTION public.clips_build_search_doc()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE a public.anime%ROWTYPE; c public.categories%ROWTYPE;
BEGIN
  SELECT * INTO a FROM public.anime WHERE id = NEW.anime_id;
  SELECT * INTO c FROM public.categories WHERE id = NEW.category_id;
  NEW.search_doc := lower(concat_ws(' ',
    NEW.title, NEW.character, array_to_string(NEW.character_aliases, ' '),
    array_to_string(NEW.anime_aliases, ' '), array_to_string(NEW.tags, ' '),
    a.name, a.slug, array_to_string(a.aliases, ' '), c.name, c.slug));
  RETURN NEW;
END; $$;
CREATE TRIGGER clips_search_doc BEFORE INSERT OR UPDATE ON public.clips
  FOR EACH ROW EXECUTE FUNCTION public.clips_build_search_doc();

CREATE OR REPLACE FUNCTION public.refresh_clip_search_docs()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'anime' THEN
    UPDATE public.clips SET updated_at = updated_at WHERE anime_id = NEW.id;
  ELSE
    UPDATE public.clips SET updated_at = updated_at WHERE category_id = NEW.id;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER anime_refresh_clips AFTER UPDATE ON public.anime FOR EACH ROW EXECUTE FUNCTION public.refresh_clip_search_docs();
CREATE TRIGGER categories_refresh_clips AFTER UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.refresh_clip_search_docs();

-- Prefix-aware multi-word search over the index.
CREATE OR REPLACE FUNCTION public.search_clips(q text)
RETURNS SETOF public.clips LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE terms text[]; tsq tsquery;
BEGIN
  terms := regexp_split_to_array(trim(regexp_replace(lower(coalesce(q, '')), '[^a-z0-9 ]', ' ', 'g')), '\s+');
  terms := array_remove(terms, '');
  IF terms IS NULL OR array_length(terms, 1) IS NULL THEN
    RETURN QUERY SELECT * FROM public.clips ORDER BY created_at DESC;
    RETURN;
  END IF;
  tsq := to_tsquery('simple', array_to_string(ARRAY(SELECT t || ':*' FROM unnest(terms) t), ' & '));
  RETURN QUERY SELECT * FROM public.clips c WHERE c.search_vector @@ tsq ORDER BY c.created_at DESC;
END; $$;
GRANT EXECUTE ON FUNCTION public.search_clips(text) TO anon, authenticated;

-- SITE CONTENT (admin-editable copy/media, layout stays in code)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is publicly readable" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_touch BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_content (key, value) VALUES
('homepage', '{"heroHeading":"KURAGAWA","heroHeadingAccent":"CLIPS","heroTagline":"Anime clips. Higher standards.","heroDescription":"High-quality anime clips for editors, creators and fans. Find, download and create something extraordinary.","heroImageUrl":"","heroNote":"New anime clips, updated as new episodes drop.","popularSearches":["Transformation","Fight","Scenery","Emotional"]}'::jsonb),
('about', '{"heading":"About Kuragawa Clips","content":"Kuragawa Clips is a curated library of high-quality anime clips for editors, creators and fans.","imageUrl":""}'::jsonb),
('footer', '{"description":"High-quality anime clips for editors, creators and fans. Anime clips. Higher standards.","copyright":"Kuragawa Clips. All rights reserved.","socialLinks":[]}'::jsonb);

-- SEED / TEST DATA (demonstration records only)
INSERT INTO public.categories (name, slug, description) VALUES
('Fights','fights','Combat exchanges and duels.'),
('Transformations','transformations','Power-ups, awakenings and form changes.'),
('Powers','powers','Ability showcases and techniques.'),
('Emotional','emotional','Quiet, heavy character beats.'),
('Characters','characters','Character-focused moments.'),
('Scenes','scenes','Complete standout scenes.'),
('Aesthetic','aesthetic','Atmosphere, colour and scenery.'),
('Action','action','High-motion sequences.');

INSERT INTO public.anime (name, slug, description, aliases, image_url) VALUES
('Sample Series Alpha','sample-series-alpha','Seed series record used to verify the anime directory.', ARRAY['SSA'], '/seed/clip-3.jpg'),
('Sample Series Beta','sample-series-beta','Seed series record used to verify the anime directory.', ARRAY['SSB'], '/seed/clip-5.jpg'),
('Sample Series Gamma','sample-series-gamma','Seed series record used to verify the anime directory.', ARRAY['SSG'], '/seed/clip-6.jpg');

INSERT INTO public.clips (title, slug, anime_id, category_id, character, character_aliases, anime_aliases, tags, description, thumbnail_url, screenshot_urls, duration, resolution, format, download_url, published, created_at)
SELECT v.title, v.slug, a.id, c.id, v.character, v.char_aliases, a.aliases, v.tags,
  'Seed clip record used to verify database reads, search, filters and download links.',
  v.thumb, ARRAY[v.thumb, v.shot2, v.shot3], v.duration, v.resolution, 'MP4',
  'https://drive.google.com/file/d/SAMPLE_PLACEHOLDER/view', true, v.created
FROM (VALUES
  ('Seed Clip — Awakening','seed-clip-awakening','sample-series-alpha','transformations','Character One',ARRAY['Alias One'],ARRAY['Transformation','Glow','Seed'],'/seed/clip-1.jpg','/seed/clip-2.jpg','/seed/clip-3.jpg',24,'1080p','2026-08-28T12:00:00Z'::timestamptz),
  ('Seed Clip — Ember Duel','seed-clip-ember-duel','sample-series-alpha','fights','Character Two',ARRAY['Alias Two'],ARRAY['Fight','Fire','Seed'],'/seed/clip-2.jpg','/seed/clip-3.jpg','/seed/clip-4.jpg',19,'1080p','2026-08-27T12:00:00Z'::timestamptz),
  ('Seed Clip — Rain Rooftops','seed-clip-rain-rooftops','sample-series-beta','aesthetic','Character Three',ARRAY[]::text[],ARRAY['Scenery','Night','Seed'],'/seed/clip-3.jpg','/seed/clip-4.jpg','/seed/clip-5.jpg',32,'4K','2026-08-26T12:00:00Z'::timestamptz),
  ('Seed Clip — Quiet Dusk','seed-clip-quiet-dusk','sample-series-beta','emotional','Character Four',ARRAY['Alias Four'],ARRAY['Emotional','Sky','Seed'],'/seed/clip-4.jpg','/seed/clip-5.jpg','/seed/clip-6.jpg',28,'1080p','2026-08-25T12:00:00Z'::timestamptz),
  ('Seed Clip — Violet Surge','seed-clip-violet-surge','sample-series-gamma','powers','Character Five',ARRAY[]::text[],ARRAY['Power','Lightning','Seed'],'/seed/clip-5.jpg','/seed/clip-6.jpg','/seed/clip-1.jpg',15,'1080p','2026-08-24T12:00:00Z'::timestamptz),
  ('Seed Clip — Spirit Forest','seed-clip-spirit-forest','sample-series-gamma','scenes','Character Six',ARRAY[]::text[],ARRAY['Scene','Forest','Seed'],'/seed/clip-6.jpg','/seed/clip-1.jpg','/seed/clip-2.jpg',27,'720p','2026-08-23T12:00:00Z'::timestamptz),
  ('Seed Clip — Second Wind','seed-clip-second-wind','sample-series-alpha','action','Character One',ARRAY['Alias One'],ARRAY['Action','Chase','Seed'],'/seed/clip-1.jpg','/seed/clip-3.jpg','/seed/clip-5.jpg',21,'4K','2026-08-22T12:00:00Z'::timestamptz),
  ('Seed Clip — Final Stand','seed-clip-final-stand','sample-series-beta','fights','Character Three',ARRAY[]::text[],ARRAY['Fight','Finale','Seed'],'/seed/clip-2.jpg','/seed/clip-4.jpg','/seed/clip-6.jpg',18,'1080p','2026-08-21T12:00:00Z'::timestamptz)
) AS v(title, slug, anime_slug, cat_slug, character, char_aliases, tags, thumb, shot2, shot3, duration, resolution, created)
JOIN public.anime a ON a.slug = v.anime_slug
JOIN public.categories c ON c.slug = v.cat_slug;
