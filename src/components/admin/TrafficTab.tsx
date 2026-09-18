/**
 * Traffic panel: real visitor numbers for the public site, with the owner's own
 * visits excluded (admin pages and signed-in sessions are never recorded).
 */
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Btn } from "@/components/admin/shared";
import { OPT_OUT_KEY, isTrafficOptedOut } from "@/components/site/TrafficTracker";
import { getTrafficReport, type TrafficReport } from "@/lib/traffic.functions";

const RANGES = [7, 30, 90] as const;

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct / typed in",
  search: "Search engines",
  social: "Social & chat apps",
  other: "Other websites",
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

function countryLabel(code: string): string {
  if (!code || code === "XX" || code.length !== 2) return "Not available";
  try {
    return COUNTRY_NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BreakdownList({
  rows,
  labeller,
}: {
  rows: Array<{ label: string; value: number }>;
  labeller?: (label: string) => string;
}) {
  if (rows.length === 0)
    return <p className="text-xs text-muted-foreground">No visits recorded yet.</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-foreground">{labeller ? labeller(r.label) : r.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{r.value}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary/60"
              style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0)
    return <span className="text-xs text-muted-foreground">no earlier data to compare</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs ${up ? "text-primary-soft" : "text-destructive"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% vs previous period
    </span>
  );
}

export function TrafficTab({ notify }: { notify: (msg: string, kind?: "ok" | "error") => void }) {
  const [days, setDays] = useState<number>(7);
  const [report, setReport] = useState<TrafficReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    setOptedOut(isTrafficOptedOut());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await getTrafficReport({ data: { days } });
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load traffic");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const toggleOptOut = () => {
    const next = !optedOut;
    window.localStorage.setItem(OPT_OUT_KEY, next ? "1" : "0");
    setOptedOut(next);
    notify(
      next
        ? "Visits from this browser will no longer be counted."
        : "Visits from this browser will be counted again.",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                days === r
                  ? "border-primary/50 bg-primary/15 text-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
        <Btn variant="ghost" onClick={toggleOptOut}>
          {optedOut ? "Counting my visits again" : "Don't count my visits"}
        </Btn>
      </div>

      <p className="text-xs text-muted-foreground">
        Your own browsing is already left out: admin pages are never counted, and neither is anyone
        signed in to this dashboard. Nothing personal is stored — no names, no addresses.
        {optedOut ? " This browser is also excluded." : ""}
      </p>

      {loading ? <p className="text-sm text-muted-foreground">Loading traffic…</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {report && !loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="eyebrow">Visitors</p>
              <p className="mt-1 font-display text-3xl font-bold">{report.totals.visitors}</p>
              <Delta now={report.totals.visitors} before={report.totals.prevVisitors} />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="eyebrow">Page views</p>
              <p className="mt-1 font-display text-3xl font-bold">{report.totals.pageviews}</p>
              <Delta now={report.totals.pageviews} before={report.totals.prevPageviews} />
            </div>
          </div>

          <Card title="Visitors per day">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.daily}>
                  <defs>
                    <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tickFormatter={(d: string) => d.slice(5)}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    className="text-primary"
                    stroke="currentColor"
                    fill="url(#trafficFill)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    className="text-muted-foreground"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Top pages">
              <BreakdownList rows={report.pages} />
            </Card>
            <Card title="Countries">
              <BreakdownList rows={report.countries} labeller={countryLabel} />
              <p className="mt-3 text-[11px] text-muted-foreground">
                "Not available" means the visit arrived without a country tag — usually visits from
                the editor preview, or a network that hides the location.
              </p>
            </Card>
            <Card title="Devices">
              <BreakdownList
                rows={report.devices}
                labeller={(l) => DEVICE_LABELS[l] ?? l}
              />
            </Card>
            <Card title="Where visitors come from">
              <BreakdownList rows={report.sources} labeller={(l) => SOURCE_LABELS[l] ?? l} />
            </Card>
          </div>

          <Card title="Clip views compared with downloads">
            {report.clips.length === 0 ? (
              <p className="text-xs text-muted-foreground">No clip pages viewed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 font-normal">Clip</th>
                      <th className="py-2 pr-4 font-normal">Views</th>
                      <th className="py-2 font-normal">Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.clips.map((c) => (
                      <tr key={c.slug} className="border-t border-border">
                        <td className="max-w-[28rem] truncate py-2 pr-4 text-foreground">{c.title}</td>
                        <td className="py-2 pr-4 tabular-nums">{c.views}</td>
                        <td className="py-2 tabular-nums">{c.downloads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
