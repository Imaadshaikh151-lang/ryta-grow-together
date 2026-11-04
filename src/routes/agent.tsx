import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { Btn, Card, DemoNote, Field, Shell, inputCls } from "@/components/Shell";
import { JobInfo } from "@/components/JobInfo";
import { actions, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Labour agent — Manage your team | RYTA" },
      { name: "description", content: "Labour agents manage a team of farm workers and apply to farm jobs together on RYTA." },
      { property: "og:title", content: "Labour agent | RYTA" },
      { property: "og:description", content: "Manage your farm work team and apply to jobs together." },
    ],
  }),
  component: AgentPage,
});

function AgentPage() {
  const { t } = useT();
  const { jobs, applications, agent, team } = useStore();
  const [a, setA] = useState({ name: "", location: "" });
  const [m, setM] = useState({ name: "", skills: "" });
  const [msg, setMsg] = useState<{ jobId: string; n: number } | null>(null);

  if (!agent) {
    return (
      <Shell title={t("role.agent")}>
        <h1 className="mb-1 font-display text-3xl font-bold">{t("agent.setupTitle")}</h1>
        <p className="mb-6 text-lg text-muted-foreground">{t("agent.setupSub")}</p>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); actions.saveAgent(a); }}>
          <Field label={t("agent.name")}><input required className={inputCls} value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} /></Field>
          <Field label={t("agent.village")}><input required className={inputCls} placeholder={t("labourer.villagePh")} value={a.location} onChange={(e) => setA({ ...a, location: e.target.value })} /></Field>
          <Btn type="submit">{t("agent.saveContinue")}</Btn>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title={t("role.agent")}>
      <Card className="mb-6 bg-secondary">
        <div className="text-xl font-bold">{t("agent.greeting", { name: agent.name })}</div>
        <div className="text-base text-muted-foreground">{agent.location}</div>
      </Card>

      <h2 className="mb-3 text-2xl font-bold">{t("agent.teamTitle", { n: team.length })}</h2>
      <Card className="mb-8">
        {team.length === 0 ? (
          <p className="mb-4 text-muted-foreground">{t("agent.noTeam")}</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {team.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold">{w.name}</div>
                  <div className="text-sm text-muted-foreground">{w.skills}</div>
                </div>
                <button aria-label={`${t("common.remove")} ${w.name}`} onClick={() => actions.removeMember(w.id)}
                  className="grid size-12 shrink-0 place-items-center rounded-xl text-muted-foreground"><X className="size-5" /></button>
              </li>
            ))}
          </ul>
        )}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); actions.addMember(m); setM({ name: "", skills: "" }); }}>
          <Field label={t("agent.memberName")}><input required className={inputCls} value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></Field>
          <Field label={t("agent.memberSkills")}><input required className={inputCls} placeholder={t("labourer.skillsPh")} value={m.skills} onChange={(e) => setM({ ...m, skills: e.target.value })} /></Field>
          <Btn type="submit" variant="outline">{t("agent.addMember")}</Btn>
        </form>
      </Card>

      <h2 className="mb-4 text-2xl font-bold">{t("agent.jobsTitle")}</h2>
      <div className="space-y-4">
        {jobs.map((j) => {
          const mine = applications.filter((x) => x.jobId === j.id && x.agent === agent.name);
          const c = mine.filter((x) => x.status === "confirmed").length;
          const allIn = team.length > 0 && team.every((w) => mine.some((x) => x.memberId === w.id));
          return (
            <Card key={j.id}>
              <JobInfo job={j} />
              {mine.length > 0 && (
                <p className="mb-3 rounded-xl bg-status-applied p-3 font-semibold text-status-applied-foreground">
                  {t("agent.teamStatus", { a: mine.length, c })}
                </p>
              )}
              {msg?.jobId === j.id && <p role="status" className="mb-3 font-semibold text-primary">{t("agent.applyResult", { n: msg.n })}</p>}
              {team.length === 0 ? (
                <p className="text-muted-foreground">{t("agent.needTeam")}</p>
              ) : allIn ? (
                <div className="rounded-xl bg-status-confirmed p-3 text-center text-lg font-semibold text-status-confirmed-foreground">{t("agent.allApplied")}</div>
              ) : (
                <Btn variant="harvest" onClick={() => setMsg({ jobId: j.id, n: actions.applyTeam(j.id) })}>{t("agent.applyTeam")}</Btn>
              )}
            </Card>
          );
        })}
      </div>
      <DemoNote />
    </Shell>
  );
}
