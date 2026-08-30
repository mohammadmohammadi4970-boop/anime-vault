import { useState, type ReactNode } from "react";

import { uploadImage } from "@/lib/admin-storage";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 placeholder:text-muted-foreground";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={inputClass} />;
}

export function Btn({
  children,
  variant = "primary",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/85",
    ghost: "border border-border bg-surface text-foreground hover:border-border-strong",
    danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
  }[variant];
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

/** Image field: upload to storage, or paste an external URL. */
export function ImageField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Field label={label}>
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload below"
        />
      </Field>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError(null);
            try {
              onChange(await uploadImage(file, folder));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
          className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
        />
        {value ? (
          <img src={value} alt="" className="h-10 w-16 rounded-lg border border-border object-cover" />
        ) : null}
      </div>
      {busy ? <p className="mt-1 text-xs text-muted-foreground">Uploading…</p> : null}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function csv(list: string[] | null | undefined): string {
  return (list ?? []).join(", ");
}

export function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
