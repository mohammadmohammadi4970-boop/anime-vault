ALTER TABLE public.clips
  ADD COLUMN IF NOT EXISTS youtube_url text;