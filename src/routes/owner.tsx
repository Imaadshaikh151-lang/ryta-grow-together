import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Btn, Card, DemoNote, Field, Shell, Status, inputCls } from "@/components/Shell";
import { JobInfo } from "@/components/JobInfo";
import { Skills, Requirements, OfferDetails } from "@/components/Workforce";
import { allocate, discover, validRequirements, type Skill } from "@/lib/workforce";
import { actions, rupees, useStore, WORK_TYPES } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Farm owner — Post jobs & confirm workers | RYTA" },
      {
        name: "description",
        content:
          "Farm owners post farm jobs, confirm applicants and see daily worker costs on RYTA.",
      },
      { property: "og:title", content: "Farm owner | RYTA" },
      { property: "og:description", content: "Post farm jobs, confirm workers and see costs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Owner,
});

type Tab = "jobs" | "post" | "summary";
const TAB_LABEL: Record<Tab, TKey> = {
  jobs: "owner.tabJobs",
  post: "owner.tabPost",
  summary: "owner.tabSummary",
};

function Owner() {
  const { t, date } = useT();
  const state = useStore();
  const { jobs, applications, offers, maxRadius } = state;
  const [tab, setTab] = useState<Tab>("jobs");
  const [posted, setPosted] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [offerError, setOfferError] = useState(false);
  const [f, setF] = useState({
    title: "",
    workType: WORK_TYPES[0] as string,
    location: "",
    date: "",
    wage: "500",
    workersNeeded: "4",
    male: "2",
    female: "2",
    requiredSkills: [] as Skill[],
    start: "08:00",
    end: "17:00",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const old = jobs.find((j) => j.id === editing);
    const job = {
      ...f,
      male: +f.male,
      female: +f.female,
      title: f.title || t(`work.${f.workType}` as TKey),
      wage: +f.wage,
      workersNeeded: +f.workersNeeded,
      farm: old?.farm ?? t("owner.myFarm"),
      ...(old?.sample ? { sample: true } : {}),
    };
    if (!validRequirements(job)) {
      setError(true);
      return;
    }
    if (!(editing ? actions.editJob(editing, job) : actions.postJob(job))) {
      setError(true);
      return;
    }
    setEditing(null);
    setError(false);
    setF({ ...f, title: "", location: "", date: "" });
    setPosted(true);
    setTab("jobs");
  };

  const confirmed = applications.filter((a) => a.status === "confirmed");
  const cost = (jobId: string) =>
    confirmed
      .filter((a) => a.jobId === jobId)
      .reduce(
        (s, a) =>
          s +
          (offers.find((o) => o.id === a.offerId)?.wage ??
            jobs.find((j) => j.id === jobId)?.wage ??
            0),
        0,
      ) +
    offers
      .filter((o) => o.jobId === jobId && o.status === "confirmed")
      .reduce((s, o) => s + o.transport, 0);
  const total = jobs.reduce((s, j) => s + cost(j.id), 0);
  const farms = [...new Set(jobs.map((j) => j.farm))];

  return (
    <Shell title={t("role.owner")}>
      <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-muted p-1.5">
        {(["jobs", "post", "summary"] as const).map((x) => (
          <Btn
            key={x}
            variant={tab === x ? "primary" : "outline"}
            onClick={() => {
              setTab(x);
              setPosted(false);
            }}
          >
            {t(TAB_LABEL[x])}
          </Btn>
        ))}
      </div>

      {tab === "post" && (
        <form onSubmit={submit} className="space-y-5">
          <Field label={t("owner.workType")}>
            <select
              className={inputCls}
              value={f.workType}
              onChange={(e) => setF({ ...f, workType: e.target.value })}
            >
              {WORK_TYPES.map((w) => (
                <option key={w} value={w}>
                  {t(`work.${w}` as TKey)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("owner.titleOptional")}>
            <input
              className={inputCls}
              placeholder={t("owner.titlePh")}
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
            />
          </Field>
          <Field label={t("owner.village")}>
            <input
              required
              className={inputCls}
              placeholder={t("owner.villagePh")}
              value={f.location}
              onChange={(e) => setF({ ...f, location: e.target.value })}
            />
          </Field>
          <Field label={t("owner.date")}>
            <input
              required
              type="date"
              className={inputCls}
              value={f.date}
              onChange={(e) => setF({ ...f, date: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("owner.wage")}>
              <input
                required
                type="number"
                min={1}
                className={inputCls}
                value={f.wage}
                onChange={(e) => setF({ ...f, wage: e.target.value })}
              />
            </Field>
            <Field label={t("owner.workersNeeded")}>
              <input
                required
                type="number"
                min={1}
                className={inputCls}
                value={f.workersNeeded}
                onChange={(e) => setF({ ...f, workersNeeded: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("wf.males")}>
              <input
                required
                type="number"
                min={0}
                step={1}
                className={inputCls}
                value={f.male}
                onChange={(e) => setF({ ...f, male: e.target.value })}
              />
            </Field>
            <Field label={t("wf.females")}>
              <input
                required
                type="number"
                min={0}
                step={1}
                className={inputCls}
                value={f.female}
                onChange={(e) => setF({ ...f, female: e.target.value })}
              />
            </Field>
            <Field label={t("wf.start")}>
              <input
                required
                type="time"
                className={inputCls}
                value={f.start}
                onChange={(e) => setF({ ...f, start: e.target.value })}
              />
            </Field>
            <Field label={t("wf.end")}>
              <input
                required
                type="time"
                className={inputCls}
                value={f.end}
                onChange={(e) => setF({ ...f, end: e.target.value })}
              />
            </Field>
          </div>
          <Skills
            value={f.requiredSkills}
            onChange={(requiredSkills) => setF({ ...f, requiredSkills })}
          />
          {error && (
            <p role="alert" className="font-semibold">
              {t("wf.invalid")}
            </p>
          )}
          <Btn type="submit">{t("owner.postJob")}</Btn>
        </form>
      )}

      {tab === "jobs" && (
        <div className="space-y-4">
          <Field label={t("wf.radius")}>
            <input
              type="number"
              min={20}
              step={1}
              className={inputCls}
              value={maxRadius}
              onChange={(e) => actions.setRadius(+e.target.value)}
            />
          </Field>
          {offerError && <p role="alert">{t("wf.changed")}</p>}
          {posted && (
            <div
              role="status"
              className="rounded-xl bg-status-confirmed p-4 text-lg font-semibold text-status-confirmed-foreground"
            >
              {t("owner.posted")}
            </div>
          )}
          {jobs.length === 0 && (
            <p className="text-lg text-muted-foreground">{t("owner.noJobs")}</p>
          )}
          {jobs.map((j) => {
            const apps = applications.filter((a) => a.jobId === j.id && !a.agent);
            const c = apps.filter((a) => a.status === "confirmed").length;
            const full = c >= j.workersNeeded;
            const discovery = discover(
              offers.filter((o) => o.jobId === j.id),
              (o) =>
                o.status === "confirmed" || allocate(j, state.team, jobs, applications).suitable,
              maxRadius,
            );
            const allConfirmed = applications.filter(
              (a) => a.jobId === j.id && a.status === "confirmed",
            ).length;
            return (
              <section className="space-y-4" key={j.id}>
                <Card>
                  <JobInfo
                    job={j}
                    extra={t("job.confirmedOf", { c: allConfirmed, n: j.workersNeeded })}
                  />
                  <Requirements job={j} />
                  {allConfirmed === 0 && (
                    <div className="mt-3">
                      <Btn
                        variant="outline"
                        onClick={() => {
                          setEditing(j.id);
                          setError(false);
                          setF({
                            title: j.title,
                            workType: j.workType,
                            location: j.location,
                            date: j.date,
                            wage: String(j.wage),
                            workersNeeded: String(j.workersNeeded),
                            male: String(j.male ?? 0),
                            female: String(j.female ?? 0),
                            requiredSkills: j.requiredSkills ?? [],
                            start: j.start ?? "08:00",
                            end: j.end ?? "17:00",
                          });
                          setTab("post");
                        }}
                      >
                        {t("wf.editJob")}
                      </Btn>
                    </div>
                  )}
                  <div className="mt-2 border-t pt-3">
                    <p className="mb-2 font-semibold">
                      {t("owner.applicants", { n: apps.length })}
                    </p>
                    {apps.length === 0 && (
                      <p className="text-muted-foreground">{t("owner.noApplicants")}</p>
                    )}
                    <ul className="space-y-2">
                      {apps.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                              {a.workerName}
                              {a.sample && <Status kind="sample">{t("demo.sample")}</Status>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {a.skills} · {a.location}
                            </div>
                            {a.agent && (
                              <div className="text-sm font-medium text-primary">
                                {t("owner.viaAgent", { agent: a.agent })}
                              </div>
                            )}
                          </div>
                          {a.status === "confirmed" ? (
                            <Status kind="confirmed">
                              <Check className="size-4" />
                              {t("owner.confirmed")}
                            </Status>
                          ) : full ? (
                            <span className="shrink-0 text-sm text-muted-foreground">
                              {t("owner.full")}
                            </span>
                          ) : (
                            <Btn
                              disabled={
                                validRequirements(j) &&
                                (!a.gender ||
                                  !j.requiredSkills?.every((s) => a.selectedSkills?.includes(s)))
                              }
                              onClick={() => actions.confirm(a.id)}
                            >
                              {t("owner.confirm")}
                            </Btn>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
                <p className="text-sm text-muted-foreground">
                  {t("wf.search", { n: discovery.radius })}
                </p>
                {discovery.outside > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("wf.outside", { n: discovery.outside })}
                  </p>
                )}
                {discovery.offers.map((o) => (
                  <Card key={o.id}>
                    <OfferDetails
                      offer={o}
                      state={state}
                      onConfirm={() => setOfferError(!actions.confirmOffer(o.id))}
                    />
                  </Card>
                ))}
              </section>
            );
          })}
        </div>
      )}

      {tab === "summary" && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {(
              [
                ["owner.farms", farms.length],
                ["owner.jobs", jobs.length],
                ["owner.booked", confirmed.length],
              ] as const
            ).map(([l, v]) => (
              <Card key={l} className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{v}</div>
                <div className="text-sm text-muted-foreground">{t(l)}</div>
              </Card>
            ))}
          </div>
          <div className="hero-gradient mb-6 rounded-2xl p-5 text-primary-foreground">
            <div className="text-base opacity-90">{t("wf.confirmedCost")}</div>
            <div className="font-display text-4xl font-bold">{rupees(total)}</div>
          </div>
          {farms.map((farm) => (
            <section key={farm} className="mb-6">
              <h2 className="mb-3 text-xl font-bold">🌾 {farm}</h2>
              <div className="space-y-3">
                {jobs
                  .filter((j) => j.farm === farm)
                  .map((j) => (
                    <Card key={j.id} className="p-4">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-lg font-semibold">{j.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {j.location} · {date(j.date)} · {rupees(j.wage)}
                            {t("common.slashDay")}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-bold text-primary">{rupees(cost(j.id))}</div>
                          <div className="text-sm text-muted-foreground">
                            {t("owner.bookedOf", {
                              c: confirmed.filter((a) => a.jobId === j.id).length,
                              n: j.workersNeeded,
                            })}
                          </div>
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
