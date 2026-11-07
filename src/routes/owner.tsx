import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BriefcaseBusiness, Handshake, Plus, Sprout } from "lucide-react";
import { DemoNote, Field, Shell, inputCls } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skills, OfferDetails } from "@/components/Workforce";
import { OwnerJobCard, OwnerOfferCard } from "@/components/OwnerCards";
import { OwnerJobDetails } from "@/components/OwnerDetails";
import { OwnerSummary } from "@/components/OwnerSummary";
import { allocate, discover, validRequirements, type Skill } from "@/lib/workforce";
import { actions, useStore, WORK_TYPES, type Job } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Farm owner — Jobs & provider offers | RYTA" },
      {
        name: "description",
        content:
          "Review farm jobs, post workforce requirements and inspect provider offers in RYTA's bilingual local demo.",
      },
      { property: "og:title", content: "Farm jobs & provider offers | RYTA" },
      {
        property: "og:description",
        content: "Manage farm jobs and review demo workforce offers in English and Kannada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Owner,
});

type Tab = "jobs" | "post" | "offers";
const nav = [
  { id: "jobs", label: "owner.tabJobs", icon: BriefcaseBusiness },
  { id: "post", label: "owner.postJob", icon: Plus },
  { id: "offers", label: "od.offers", icon: Handshake },
] as const;

function Owner() {
  const { t } = useT();
  const state = useStore();
  const { jobs, offers, applications, maxRadius } = state;
  const [tab, setTab] = useState<Tab>("jobs");
  const [posted, setPosted] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [jobDetail, setJobDetail] = useState<string | null>(null);
  const [offerDetail, setOfferDetail] = useState<string | null>(null);
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
    if (
      !validRequirements(job) ||
      !(editing ? actions.editJob(editing, job) : actions.postJob(job))
    ) {
      setError(true);
      return;
    }
    setEditing(null);
    setError(false);
    setF({ ...f, title: "", location: "", date: "" });
    setPosted(true);
    setTab("jobs");
    setJobDetail(null);
  };
  const edit = (j: Job) => {
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
    setJobDetail(null);
    setTab("post");
    window.scrollTo({ top: 0 });
  };
  const selectTab = (value: string) => {
    if (value !== "jobs" && value !== "post" && value !== "offers") return;
    setTab(value);
    setJobDetail(null);
    setOfferDetail(null);
    setPosted(false);
    setOfferError(false);
  };
  const activeJob = jobs.find((j) => j.id === jobDetail);
  const activeOffer = offers.find((o) => o.id === offerDetail);
  const offerJob = activeOffer && jobs.find((j) => j.id === activeOffer.jobId);
  const openJob = (id: string) => {
    setJobDetail(id);
    window.scrollTo({ top: 0 });
  };
  const openOffer = (id: string) => {
    setOfferDetail(id);
    setOfferError(false);
    window.scrollTo({ top: 0 });
  };
  const heading = activeJob
    ? "od.jobDetails"
    : activeOffer
      ? "od.offerDetails"
      : tab === "post"
        ? editing
          ? "wf.editJob"
          : "od.postHeading"
        : tab === "offers"
          ? "od.offersHeading"
          : "od.jobsHeading";
  return (
    <Shell title={t("role.owner")} wide>
      <div className="mb-6 flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
          <Sprout className="size-6" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t(heading)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("od.demo")}</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={selectTab}>
        <TabsList
          aria-label={t("role.owner")}
          className="mb-6 grid h-auto w-full grid-cols-3 gap-1 rounded-lg border bg-card p-1.5"
        >
          {nav.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="min-h-14 min-w-0 flex-col gap-1 whitespace-normal px-1 py-2 text-center text-sm leading-snug data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:flex-row sm:gap-2 sm:text-base"
            >
              <item.icon className="size-4 shrink-0" />
              {t(item.label)}
              {item.id === "offers" && <span className="hidden sm:inline">({offers.length})</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {(activeJob || activeOffer) && (
        <Button
          variant="ghost"
          className="mb-5 min-h-11 px-0 text-primary"
          onClick={() => {
            setJobDetail(null);
            setOfferDetail(null);
          }}
        >
          <ArrowLeft />
          {t("od.back")}
        </Button>
      )}
      {tab === "jobs" &&
        (activeJob ? (
          <div className="mx-auto max-w-2xl">
            <OwnerJobDetails job={activeJob} state={state} onEdit={() => edit(activeJob)} />
          </div>
        ) : (
          <>
            {posted && (
              <p
                role="status"
                className="mb-5 rounded-lg bg-status-confirmed p-4 font-semibold text-status-confirmed-foreground"
              >
                {t("owner.posted")}
              </p>
            )}
            {jobs.length === 0 && <p className="py-8 text-muted-foreground">{t("owner.noJobs")}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <OwnerJobCard key={job.id} job={job} state={state} onOpen={() => openJob(job.id)} />
              ))}
            </div>
            <OwnerSummary state={state} />
          </>
        ))}
      {tab === "post" && (
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-7">
          <fieldset className="space-y-4">
            <legend className="mb-4 flex w-full items-center gap-3 border-b pb-3 text-lg font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm text-secondary-foreground">
                1
              </span>
              {t("od.basics")}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <Field label={t("owner.village")}>
              <input
                required
                className={inputCls}
                placeholder={t("owner.villagePh")}
                value={f.location}
                onChange={(e) => setF({ ...f, location: e.target.value })}
              />
            </Field>
          </fieldset>
          <fieldset>
            <legend className="mb-4 flex w-full items-center gap-3 border-b pb-3 text-lg font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm text-secondary-foreground">
                2
              </span>
              {t("od.schedule")}
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label={t("owner.date")}>
                  <input
                    required
                    type="date"
                    className={inputCls}
                    value={f.date}
                    onChange={(e) => setF({ ...f, date: e.target.value })}
                  />
                </Field>
              </div>
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
          </fieldset>
          <fieldset className="space-y-5">
            <legend className="mb-4 flex w-full items-center gap-3 border-b pb-3 text-lg font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm text-secondary-foreground">
                3
              </span>
              {t("od.workforce")}
            </legend>
            <Field label={t("owner.workersNeeded")}>
              <input
                required
                type="number"
                min={1}
                step={1}
                className={inputCls}
                value={f.workersNeeded}
                onChange={(e) => setF({ ...f, workersNeeded: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <Skills
              value={f.requiredSkills}
              onChange={(requiredSkills) => setF({ ...f, requiredSkills })}
            />
          </fieldset>
          <fieldset>
            <legend className="mb-4 flex w-full items-center gap-3 border-b pb-3 text-lg font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-secondary text-sm text-secondary-foreground">
                4
              </span>
              {t("od.rates")}
            </legend>
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
            <p className="mt-2 text-sm text-muted-foreground">{t("od.sharedRate")}</p>
          </fieldset>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive bg-card p-4 font-semibold text-destructive"
            >
              {t("wf.invalid")}
            </p>
          )}
          <Button
            type="submit"
            className="min-h-14 w-full whitespace-normal text-lg sm:w-auto sm:px-10"
          >
            <Plus />
            {editing ? t("common.save") : t("owner.postJob")}
          </Button>
        </form>
      )}
      {tab === "offers" &&
        (activeOffer && offerJob ? (
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 border-b pb-4 font-semibold">
              {offerJob.title} · {offerJob.location}
            </p>
            {offerError && (
              <p role="alert" className="mb-4 text-destructive">
                {t("wf.changed")}
              </p>
            )}
            <OfferDetails
              offer={activeOffer}
              state={state}
              onConfirm={() => setOfferError(!actions.confirmOffer(activeOffer.id))}
            />
          </div>
        ) : (
          <>
            <div className="mb-6 max-w-sm">
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
            </div>
            <p className="mb-6 text-sm text-muted-foreground">{t("od.sharedRate")}</p>
            {offers.length === 0 && (
              <div className="flex flex-col items-center gap-3 border-y py-12 text-center text-muted-foreground">
                <Handshake className="size-8 text-primary" />
                <p>{t("od.noOffers")}</p>
              </div>
            )}
            <div className="space-y-8">
              {jobs
                .filter((j) => offers.some((o) => o.jobId === j.id))
                .map((j) => {
                  const discovery = discover(
                    offers.filter((o) => o.jobId === j.id),
                    (o) =>
                      o.status === "confirmed" ||
                      allocate(j, state.team, jobs, applications).suitable,
                    maxRadius,
                  );
                  return (
                    <section key={j.id}>
                      <div className="mb-4 border-b pb-3">
                        <h2 className="break-words text-xl font-bold">{j.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {j.location} ·{" "}
                          {t("od.offersCount", {
                            n: offers.filter((o) => o.jobId === j.id).length,
                          })}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t("wf.search", { n: discovery.radius })}
                        </p>
                        {discovery.outside > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {t("wf.outside", { n: discovery.outside })}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {discovery.offers.map((o) => (
                          <OwnerOfferCard
                            key={o.id}
                            offer={o}
                            job={j}
                            state={state}
                            onOpen={() => openOffer(o.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
            </div>
          </>
        ))}
      <DemoNote />
    </Shell>
  );
}
