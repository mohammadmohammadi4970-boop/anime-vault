-- Clip requests: public, anonymous submissions ("what anime/clip do you want
-- added"). Anyone can insert; only admins can read/manage — it's a
-- write-only mailbox from the visitor's side.
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_name text NOT NULL,
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request" ON public.requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage requests" ON public.requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Popular Clips: a real counter incremented when a visitor clicks Download,
-- so "trending" reflects actual behavior instead of a fake number.
ALTER TABLE public.clips
  ADD COLUMN IF NOT EXISTS download_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_download_count(clip_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.clips SET download_count = download_count + 1 WHERE id = clip_id;
$$;

REVOKE ALL ON FUNCTION public.increment_download_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_download_count(uuid) TO anon, authenticated;