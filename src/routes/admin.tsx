import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { AnimeTab } from "@/components/admin/AnimeTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { ClipsTab } from "@/components/admin/ClipsTab";
import { ContentTab } from "@/components/admin/ContentTab";
import { RequestsTab } from "@/components/admin/RequestsTab";
import { TagsTab } from "@/components/admin/TagsTab";
import { Btn, Field, TextInput } from "@/components/admin/shared";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kuragawa Clips" },
      {
        name: "description",
        content: "Private admin area for managing the Kuragawa Clips library.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Kuragawa Clips" },
      { property: "og:description", content: "Private admin area." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "clips" | "anime" | "categories" | "tags" | "requests" | "content";

const NAV: Array<{ id: Tab; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "clips", label: "Clips" },
  { id: "anime", label: "Anime" },
  { id: "categories", label: "Categories" },
  { id: "tags", label: "Tags" },
  { id: "requests", label: "Requests" },
  { id: "content", label: "Website Content" },
];

/** Root of /admin: figures out auth state and renders the right screen. */
function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const refreshRole = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (data) {
      setIsAdmin(true);
      return;
    }
    // Not an admin yet — if nobody has claimed admin at all, this signed-in
    // account (e.g. one that just confirmed its email) should claim it now.
    const { data: exists } = await supabase.rpc("admin_exists");
    if (!exists) {
      const { data: claimed } = await supabase.rpc("claim_admin");
      setIsAdmin(!!claimed);
      return;
    }
    setIsAdmin(false);
  };

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await refreshRole(data.session.user.id);
      setLoading(false);
    });

    void supabase.rpc("admin_exists").then(({ data }) => {
      if (active) setAdminExists(!!data);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) void refreshRole(next.user.id);
      else setIsAdmin(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!session) return <SignInScreen adminExists={adminExists} />;
  if (!isAdmin) return <NotAdminScreen email={session.user.email ?? ""} />;
  return <Dashboard email={session.user.email ?? ""} />;
}

/** Signed out: sign in, or — only while no admin account exists yet —
 * create the very first admin account. Either mode is available at any time,
 * since an account may already exist (e.g. created but awaiting email
 * confirmation) and just needs a normal sign-in once confirmed. */
function SignInScreen({ adminExists }: { adminExists: boolean | null }) {
  const [mode, setMode] = useState<"signin" | "signup">(
    adminExists === false ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) setError(e.message);
    setBusy(false);
  };

  const createAdmin = async () => {
    setBusy(true);
    setError(null);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }
    if (!signUpData.session) {
      // Email confirmation is turned on for this project — the user needs to
      // confirm their email before a session exists, so claim_admin can't run yet.
      setInfo(
        "Account created. Check your email to confirm it, then come back and sign in — the first confirmed account automatically becomes the admin.",
      );
      setBusy(false);
      return;
    }
    const { data: claimed, error: claimError } = await supabase.rpc("claim_admin");
    if (claimError) {
      setError(claimError.message);
    } else if (!claimed) {
      setError("An admin account already exists — please sign in instead.");
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <p className="eyebrow">Private</p>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {mode === "signup" ? "Create the admin account" : "Admin sign in"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signup"
          ? "No admin account exists yet — the first account you create here becomes the permanent admin."
          : "Sign in with your admin email and password."}
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void (mode === "signup" ? createAdmin() : signIn());
        }}
      >
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {info ? <p className="text-xs text-primary-soft">{info}</p> : null}

        <Btn disabled={busy} onClick={() => void (mode === "signup" ? createAdmin() : signIn())}>
          {busy ? "Please wait…" : mode === "signup" ? "Create admin account" : "Sign in"}
        </Btn>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signup" ? "signin" : "signup");
          setError(null);
          setInfo(null);
        }}
        className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {mode === "signup"
          ? "Already created an account? Sign in instead"
          : "Setting this up for the first time? Create the admin account"}
      </button>
    </main>
  );
}

/** Signed in, but this account holds no admin role. */
function NotAdminScreen({ email }: { email: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">No admin access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {email}, but this account doesn't have admin permissions on Kuragawa Clips.
      </p>
      <div className="mt-6">
        <Btn variant="ghost" onClick={() => void supabase.auth.signOut()}>
          Sign out
        </Btn>
      </div>
    </main>
  );
}

/** Signed in as admin: sidebar nav + the actual management tabs. */
function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "error" } | null>(null);

  const notify = (msg: string, kind: "ok" | "error" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Private</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{email}</span>
          <Btn variant="ghost" onClick={() => void supabase.auth.signOut()}>
            Sign out
          </Btn>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setTab(n.id)}
            aria-pressed={tab === n.id}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              tab === n.id
                ? "border-primary/50 bg-primary/15 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {toast ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-2.5 text-xs ${
            toast.kind === "ok"
              ? "border-primary/30 bg-primary/10 text-primary-soft"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.msg}
        </p>
      ) : null}

      <div className="mt-6">
        {tab === "dashboard" && <Overview />}
        {tab === "clips" && <ClipsTab />}
        {tab === "anime" && <AnimeTab notify={notify} />}
        {tab === "categories" && <CategoriesTab notify={notify} />}
        {tab === "tags" && <TagsTab notify={notify} />}
        {tab === "requests" && <RequestsTab notify={notify} />}
        {tab === "content" && <ContentTab notify={notify} />}
      </div>
    </main>
  );
}

/** Simple library overview: counts + most recent clips. */
function Overview() {
  const [counts, setCounts] = useState<{ total: number; published: number; draft: number } | null>(
    null,
  );
  const [recent, setRecent] = useState<Array<{ id: string; title: string; published: boolean }>>(
    [],
  );

  useEffect(() => {
    let active = true;
    void supabase
      .from("clips")
      .select("id, title, published, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active || !data) return;
        const published = data.filter((c) => c.published).length;
        setCounts({ total: data.length, published, draft: data.length - published });
        setRecent(data.slice(0, 6));
      });
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: "Total clips", value: counts?.total ?? "…" },
      { label: "Published", value: counts?.published ?? "…" },
      { label: "Drafts", value: counts?.draft ?? "…" },
    ],
    [counts],
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="surface-panel rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="font-display text-sm font-semibold">Recent activity</h2>
        <div className="mt-3 space-y-2">
          {recent.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm"
            >
              <span className="truncate">{c.title}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  c.published
                    ? "bg-primary/15 text-primary-soft"
                    : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {c.published ? "Published" : "Draft"}
              </span>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No clips yet — add your first one above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
