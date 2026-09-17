REVOKE ALL ON FUNCTION public.traffic_daily(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.traffic_totals(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.traffic_breakdown(integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.traffic_clip_views(integer) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.traffic_daily(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traffic_totals(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traffic_breakdown(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.traffic_clip_views(integer) TO authenticated;