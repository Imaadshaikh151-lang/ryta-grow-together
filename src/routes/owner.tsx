import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Btn, Card, DemoNote, Field, Shell, Status, inputCls } from "@/components/Shell";
import { JobInfo } from "@/components/JobInfo";
import { actions, rupees, useStore, WORK_TYPES } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Farm owner — Post jobs & confirm workers | RYTA" },
      { name: "description", content: "Farm owners post farm jobs, confirm applicants and see daily worker costs on RYTA." },
      { property: "og:title", content: "Farm owner | RYTA" },
      { property: "og:description", content: "Post farm jobs, confirm workers and see costs." },
    ],
  }),
  component: Owner,
});

type Tab = "jobs" | "post" | "summary";
const TAB_LABEL: Record<Tab, TKey> = { jobs: "owner.tabJobs", post: "owner.tabPost", summary: "owner.tabSummary" };

function Owner() {
  const { t, date } = useT();
  const { jobs, applications } = useStore();
  const [tab, setTab] = useState<Tab>("jobs");
  const [posted, setPosted] = useState(false);
  const [f, setF] = useState({ title: "", workType: WORK_TYPES[0] as string, location: "", date: "", wage: "500", workersNeeded: "4" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.postJob({ ...f, title: f.title || t(`work.${f.workType}` as TKey), wage: +f.wage, workersNeeded: +f.workersNeeded, farm: t("owner.myFarm") });
    setF({ ...f, title: "", location: "", date: "" });
    setPosted(true);
    setTab("jobs");
  };

  const confirmed = applications.filter((a) => a.status === "confirmed");
  const cost = (jobId: string) => (jobs.find((x) => x.id === jobId)?.wage ?? 0) * confirmed.filter((a) => a.jobId === jobId).length;
  const total = jobs.reduce((s, j) => s + cost(j.id), 0);
  const farms = [...new Set(jobs.map((j) => j.farm))];

  return (
    <Shell title={t("role.owner")}>
      <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-muted p-1.5">
        {(["jobs", "post", "summary"] as const).map((x) => (
          <button key={x} onClick={() => { setTab(x); setPosted(false); }}
            className={`min-h-12 rounded-xl px-1 text-base font-semibold leading-tight ${tab === x ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
            {t(TAB_LABEL[x])}
          </button>
        ))}
      </div>

      {tab === "post" && (
        <form onSubmit={submit} className="space-y-5">
          <Field label={t("owner.workType")}>
            <select className={inputCls} value={f.workType} onChange={(e) => setF({ ...f, workType: e.target.value })}>
              {WORK_TYPES.map((w) => <option key={w} value={w}>{t(`work.${w}` as TKey)}</option>)}
            </select>
          </Field>
          <Field label={t("owner.titleOptional")}>
            <input className={inputCls} placeholder={t("owner.titlePh")} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </Field>
          <Field label={t("owner.village")}>
            <input required className={inputCls} placeholder={t("owner.villagePh")} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          </Field>
          <Field label={t("owner.date")}>
            <input required type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("owner.wage")}>
              <input required type="number" min={1} className={inputCls} value={f.wage} onChange={(e) => setF({ ...f, wage: e.target.value })} />
            </Field>
            <Field label={t("owner.workersNeeded")}>
              <input required type="number" min={1} className={inputCls} value={f.workersNeeded} onChange={(e) => setF({ ...f, workersNeeded: e.target.value })} />
            </Field>
          </div>
          <Btn type="submit">{t("owner.postJob")}</Btn>
        </form>
      )}

      {tab === "jobs" && (
        <div className="space-y-4">
          {posted && <div role="status" className="rounded-xl bg-status-confirmed p-4 text-lg font-semibold text-status-confirmed-foreground">{t("owner.posted")}</div>}
          {jobs.length === 0 && <p className="text-lg text-muted-foreground">{t("owner.noJobs")}</p>}
          {jobs.map((j) => {
            const apps = applications.filter((a) => a.jobId === j.id);
            const c = apps.filter((a) => a.status === "confirmed").length;
            const full = c >= j.workersNeeded;
            return (
              <Card key={j.id}>
                <JobInfo job={j} extra={t("job.confirmedOf", { c, n: j.workersNeeded })} />
                <div className="mt-2 border-t pt-3">
                  <p className="mb-2 font-semibold">{t("owner.applicants", { n: apps.length })}</p>
                  {apps.length === 0 && <p className="text-muted-foreground">{t("owner.noApplicants")}</p>}
                  <ul className="space-y-2">
                    {apps.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                            {a.workerName}{a.sample && <Status kind="sample">{t("demo.sample")}</Status>}
                          </div>
                          <div className="text-sm text-muted-foreground">{a.skills} · {a.location}</div>
                          {a.agent && <div className="text-sm font-medium text-primary">{t("owner.viaAgent", { agent: a.agent })}</div>}
                        </div>
                        {a.status === "confirmed" ? (
                          <Status kind="confirmed"><Check className="size-4" />{t("owner.confirmed")}</Status>
                        ) : full ? (
                          <span className="shrink-0 text-sm text-muted-foreground">{t("owner.full")}</span>
                        ) : (
                          <button onClick={() => actions.confirm(a.id)}
                            className="min-h-12 shrink-0 rounded-xl bg-primary px-4 font-semibold text-primary-foreground">{t("owner.confirm")}</button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "summary" && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {([["owner.farms", farms.length], ["owner.jobs", jobs.length], ["owner.booked", confirmed.length]] as const).map(([l, v]) => (
              <Card key={l} className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{v}</div>
                <div className="text-sm text-muted-foreground">{t(l)}</div>
              </Card>
            ))}
          </div>
          <div className="hero-gradient mb-6 rounded-2xl p-5 text-primary-foreground">
            <div className="text-base opacity-90">{t("owner.totalCost")}</div>
            <div className="font-display text-4xl font-bold">{rupees(total)}</div>
          </div>
          {farms.map((farm) => (
            <section key={farm} className="mb-6">
              <h2 className="mb-3 text-xl font-bold">🌾 {farm}</h2>
              <div className="space-y-3">
                {jobs.filter((j) => j.farm === farm).map((j) => (
                  <Card key={j.id} className="p-4">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold">{j.title}</div>
                        <div className="text-sm text-muted-foreground">{j.location} · {date(j.date)} · {rupees(j.wage)}{t("common.slashDay")}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-bold text-primary">{rupees(cost(j.id))}</div>
                        <div className="text-sm text-muted-foreground">{t("owner.bookedOf", { c: confirmed.filter((a) => a.jobId === j.id).length, n: j.workersNeeded })}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
      <DemoNote />
    </Shell>
  );
}
