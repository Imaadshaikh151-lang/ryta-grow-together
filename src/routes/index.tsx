import { createFileRoute, Link } from "@tanstack/react-router";
import { Tractor, Building2, HardHat, ChevronRight } from "lucide-react";
import { DemoNote, Shell } from "@/components/Shell";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RYTA — Grow Together | Farm labour marketplace" },
      { name: "description", content: "RYTA connects farmers and farm labourers across Karnataka. Post farm jobs, find work, grow together." },
      { property: "og:title", content: "RYTA — Grow Together" },
      { property: "og:description", content: "Simple farm labour marketplace for India." },
    ],
  }),
  component: Index,
});

const roles = [
  { to: "/farmer", icon: Tractor, title: "I am a Farmer", sub: "Post jobs & confirm workers" },
  { to: "/labourer", icon: HardHat, title: "I am a Labourer", sub: "Find farm work & apply" },
  { to: "/owner", icon: Building2, title: "I am a Farm Owner", sub: "See farms, bookings & costs" },
] as const;

function Index() {
  return (
    <Shell>
      <section className="hero-gradient -mx-4 -mt-6 mb-8 px-6 pb-10 pt-10 text-primary-foreground">
        <h1 className="font-display text-5xl font-bold leading-tight">Grow<br />Together.</h1>
        <p className="mt-4 text-lg opacity-90">Find farm workers or farm work near you in Karnataka.</p>
      </section>
      <h2 className="mb-4 text-xl font-bold">Who are you?</h2>
      <div className="space-y-4">
        {roles.map((r) => (
          <Link key={r.to} to={r.to}
            className="flex items-center gap-4 rounded-2xl border-2 bg-card p-5 shadow-soft transition active:scale-[0.98] hover:border-primary">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-lime text-lime-foreground">
              <r.icon className="size-7" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold">{r.title}</div>
              <div className="text-base text-muted-foreground">{r.sub}</div>
            </div>
            <ChevronRight className="size-6 text-primary" />
          </Link>
        ))}
      </div>
      <DemoNote />
      <button onClick={() => actions.reset()} className="mt-3 w-full text-sm text-muted-foreground underline">
        Reset demo data
      </button>
    </Shell>
  );
}
