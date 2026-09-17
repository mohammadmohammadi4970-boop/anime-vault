CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  country text NOT NULL DEFAULT 'XX',
  device text NOT NULL DEFAULT 'desktop',
  referrer_kind text NOT NULL DEFAULT 'direct',
  visitor_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
  ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins read page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_idx ON public.page_views (path);

-- Reporting helpers. Each one refuses to run for non-admins.
CREATE OR REPLACE FUNCTION public.traffic_daily(_days integer)
RETURNS TABLE(day date, visitors integer, pageviews integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN QUERY
  SELECT d::date,
         COALESCE(COUNT(DISTINCT pv.visitor_hash), 0)::integer,
         COALESCE(COUNT(pv.id), 0)::integer
  FROM generate_series((now() - make_interval(days => _days - 1))::date, now()::date, '1 day') d
  LEFT JOIN public.page_views pv ON pv.created_at::date = d::date
  GROUP BY d
  ORDER BY d;
END; $$;

CREATE OR REPLACE FUNCTION public.traffic_totals(_days integer)
RETURNS TABLE(visitors integer, pageviews integer, prev_visitors integer, prev_pageviews integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE start_at timestamptz; prev_start timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized'; END IF;
  start_at := (now() - make_interval(days => _days - 1))::date;
  prev_start := (start_at::date - _days)::timestamptz;
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT visitor_hash) FROM public.page_views WHERE created_at >= start_at)::integer,
    (SELECT COUNT(*) FROM public.page_views WHERE created_at >= start_at)::integer,
    (SELECT COUNT(DISTINCT visitor_hash) FROM public.page_views WHERE created_at >= prev_start AND created_at < start_at)::integer,
    (SELECT COUNT(*) FROM public.page_views WHERE created_at >= prev_start AND created_at < start_at)::integer;
END; $$;

CREATE OR REPLACE FUNCTION public.traffic_breakdown(_days integer, _dimension text)
RETURNS TABLE(label text, value integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE start_at timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized'; END IF;
  IF _dimension NOT IN ('path', 'country', 'device', 'referrer_kind') THEN
    RAISE EXCEPTION 'unsupported dimension';
  END IF;
  start_at := (now() - make_interval(days => _days - 1))::date;
  RETURN QUERY EXECUTE format(
    'SELECT %I::text AS label, COUNT(*)::integer AS value FROM public.page_views
      WHERE created_at >= $1 GROUP BY %I ORDER BY value DESC, label LIMIT 12', _dimension, _dimension)
    USING start_at;
END; $$;

CREATE OR REPLACE FUNCTION public.traffic_clip_views(_days integer)
RETURNS TABLE(title text, slug text, views integer, downloads integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE start_at timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not authorized'; END IF;
  start_at := (now() - make_interval(days => _days - 1))::date;
  RETURN QUERY
  SELECT c.title, c.slug, COUNT(pv.id)::integer, c.download_count
  FROM public.clips c
  JOIN public.page_views pv
    ON pv.created_at >= start_at AND split_part(pv.path, '/', 3) = c.slug AND pv.path LIKE '/clips/%'
  GROUP BY c.id, c.title, c.slug, c.download_count
  ORDER BY 3 DESC
  LIMIT 12;
END; $$;

GRANT EXECUTE ON FUNCTION public.traffic_daily(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traffic_totals(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traffic_breakdown(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traffic_clip_views(integer) TO authenticated;