ALTER TABLE public.clips
  ADD COLUMN IF NOT EXISTS season integer,
  ADD COLUMN IF NOT EXISTS episode integer;

CREATE INDEX IF NOT EXISTS clips_anime_season_episode_idx ON public.clips (anime_id, season, episode);

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are publicly readable" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags" ON public.tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER tags_touch BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- seed the tag registry from tags already used by clips
INSERT INTO public.tags (name, slug)
SELECT DISTINCT t, lower(regexp_replace(regexp_replace(t, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
FROM public.clips c, unnest(c.tags) AS t
WHERE t <> ''
ON CONFLICT (slug) DO NOTHING;

-- rename a tag everywhere it is used (admin only)
CREATE OR REPLACE FUNCTION public.rename_tag(_old text, _new text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.clips
     SET tags = array_replace(tags, _old, _new)
   WHERE _old = ANY(tags);
END; $$;

REVOKE EXECUTE ON FUNCTION public.rename_tag(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rename_tag(text, text) TO authenticated;

-- include season/episode in the search document
CREATE OR REPLACE FUNCTION public.clips_build_search_doc()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE a public.anime%ROWTYPE; c public.categories%ROWTYPE;
BEGIN
  SELECT * INTO a FROM public.anime WHERE id = NEW.anime_id;
  SELECT * INTO c FROM public.categories WHERE id = NEW.category_id;
  NEW.search_doc := lower(concat_ws(' ',
    NEW.title, NEW.character, array_to_string(NEW.character_aliases, ' '),
    array_to_string(NEW.anime_aliases, ' '), array_to_string(NEW.tags, ' '),
    a.name, a.slug, array_to_string(a.aliases, ' '), c.name, c.slug,
    CASE WHEN NEW.season IS NOT NULL THEN concat('season s', NEW.season::text, ' s', NEW.season::text) END,
    CASE WHEN NEW.episode IS NOT NULL THEN concat('episode ep e', NEW.episode::text, ' ', NEW.episode::text, ' ep', NEW.episode::text, ' e', NEW.episode::text) END));
  RETURN NEW;
END; $$;

UPDATE public.clips SET updated_at = updated_at;

-- smarter query parsing: ignore filler words, keep prefix matching
CREATE OR REPLACE FUNCTION public.search_clips(q text)
RETURNS SETOF public.clips LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE terms text[]; tsq tsquery;
BEGIN
  terms := regexp_split_to_array(trim(regexp_replace(lower(coalesce(q, '')), '[^a-z0-9 ]', ' ', 'g')), '\s+');
  terms := array_remove(terms, '');
  terms := ARRAY(SELECT t FROM unnest(terms) t WHERE t NOT IN ('the','a','of','and','clip','clips'));
  IF terms IS NULL OR array_length(terms, 1) IS NULL THEN
    RETURN QUERY SELECT * FROM public.clips ORDER BY created_at DESC;
    RETURN;
  END IF;
  tsq := to_tsquery('simple', array_to_string(ARRAY(SELECT t || ':*' FROM unnest(terms) t), ' & '));
  RETURN QUERY SELECT * FROM public.clips c WHERE c.search_vector @@ tsq ORDER BY c.created_at DESC;
END; $$;