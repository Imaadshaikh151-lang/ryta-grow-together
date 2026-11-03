import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Shell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            RYTA<span className="text-lime">.</span>
          </Link>
          {title && <span className="text-base font-medium opacity-90">{title}</span>}
        </div>
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
}: { children: ReactNode; onClick?: () => void; variant?: "primary" | "lime" | "outline"; type?: "button" | "submit"; disabled?: boolean }) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    lime: "bg-lime text-lime-foreground",
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
  return (
    <label className="block">
      <span className="mb-1.5 block text-base font-semibold">{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "min-h-14 w-full rounded-xl border-2 bg-card px-4 text-lg outline-none focus:border-primary";

export function DemoNote() {
  return (
    <p className="mt-8 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
      Demo mode: all workers, farms and jobs shown are sample data, not real or verified people.
    </p>
  );
}
