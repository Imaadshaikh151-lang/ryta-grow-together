import { ClearSamples } from "@/components/Cleanup";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tractor, Users, HardHat, ChevronRight } from "lucide-react";
import { DemoNote, Shell } from "@/components/Shell";
import { actions } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RYTA — The Farmers App | Farm labour in Karnataka" },
      {
        name: "description",
        content:
          "RYTA connects farm owners, labour agents and independent labourers in Karnataka. Available in English and Kannada.",
      },
      { property: "og:title", content: "RYTA — The Farmers App" },
      {
        property: "og:description",
        content: "Farm labour marketplace for Karnataka, in English and Kannada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const roles = [
  { to: "/owner", icon: Tractor, title: "role.owner", sub: "role.ownerSub" },
  { to: "/agent", icon: Users, title: "role.agent", sub: "role.agentSub" },
  { to: "/labourer", icon: HardHat, title: "role.labourer", sub: "role.labourerSub" },
] as const;

function Index() {
  const { t } = useT();
  const [resetDone, setResetDone] = useState(false);
  return (
    <Shell>
      <section className="hero-gradient -mx-4 -mt-6 mb-8 px-6 pb-10 pt-10 text-primary-foreground">
        <h1 className="font-display text-5xl font-bold leading-tight">RYTA</h1>
        <p className="mt-1 font-display text-2xl font-semibold">{t("home.heroTitle")}</p>
        <p className="mt-4 text-lg opacity-90">{t("home.heroSub")}</p>
      </section>
      <h2 className="mb-4 text-xl font-bold">{t("home.whoAreYou")}</h2>
      <div className="space-y-4">
        {roles.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="flex items-center gap-4 rounded-2xl border-2 bg-card p-5 shadow-soft transition active:scale-[0.98] hover:border-primary"
          >
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-harvest text-harvest-foreground">
              <r.icon className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-bold">{t(r.title)}</div>
              <div className="text-base text-muted-foreground">{t(r.sub)}</div>
            </div>
            <ChevronRight className="size-6 shrink-0 text-primary" />
          </Link>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{t("home.roleNote")}</p>
      <DemoNote />
      <button
        onClick={() => {
          actions.reset();
          setResetDone(true);
        }}
        className="mt-3 min-h-12 w-full text-sm text-muted-foreground underline"
      >
        {t("demo.reset")}
      </button>
      <ClearSamples />
      {resetDone && (
        <p role="status" className="text-center text-sm font-semibold text-primary">
          {t("demo.resetDone")}
        </p>
      )}
    </Shell>
  );
}
