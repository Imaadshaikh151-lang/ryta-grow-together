import { Link } from "@tanstack/react-router";
import { useId, type ReactNode } from "react";
import { LANGS, setLang, useT, type Lang } from "@/lib/i18n";

export function LanguageSwitch() {
  const { lang, t } = useT();
  return (
    <div role="group" aria-label={t("lang.label")} className="flex rounded-full bg-primary-deep p-1">
      {(Object.keys(LANGS) as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`min-h-10 rounded-full px-3 text-sm font-semibold transition ${lang === l ? "bg-harvest text-harvest-foreground" : "text-primary-foreground"}`}>
          {LANGS[l]}
        </button>
      ))}
    </div>
  );
}

export function Shell({ title, children }: { title?: string; children: ReactNode }) {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2.5">
          <Link to="/" aria-label={t("nav.home")} className="leading-none">
            <span className="font-display text-2xl font-bold tracking-tight">RYTA<span className="text-harvest">.</span></span>
            <span className="block text-xs opacity-85">{t("app.tagline")}</span>
          </Link>
          <LanguageSwitch />
        </div>
        {title && (
          <div className="mx-auto max-w-xl px-4 pb-2.5 text-base font-semibold opacity-95">{title}</div>
        )}
      </header>
      <main className="mx-auto max-w-xl px-4 py-6 pb-16">{children}</main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card p-5 shadow-soft ${className}`}>{children}</div>;
}

export function Btn({
  children, onClick, variant = "primary", type = "button", disabled,
}: { children: ReactNode; onClick?: () => void; variant?: "primary" | "harvest" | "outline"; type?: "button" | "submit"; disabled?: boolean }) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    harvest: "bg-harvest text-harvest-foreground",
    outline: "border-2 border-primary text-primary bg-card",
  }[variant];
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`min-h-14 w-full rounded-xl px-5 text-lg font-semibold transition active:scale-[0.98] disabled:opacity-50 ${v}`}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <label className="block">
      <span id={id} className="mb-1.5 block text-base font-semibold">{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "min-h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary";

/** Status pill: applied (waiting), confirmed (success), sample (demo data). */
export function Status({ kind, children }: { kind: "applied" | "confirmed" | "sample"; children: ReactNode }) {
  const v = {
    applied: "bg-status-applied text-status-applied-foreground",
    confirmed: "bg-status-confirmed text-status-confirmed-foreground",
    sample: "bg-muted text-muted-foreground border border-dashed",
  }[kind];
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${v}`}>{children}</span>;
}

export function DemoNote() {
  const { t } = useT();
  return <p className="mt-8 rounded-xl bg-muted p-4 text-sm text-muted-foreground">{t("demo.note")}</p>;
}
