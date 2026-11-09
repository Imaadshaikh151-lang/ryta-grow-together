import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, DemoNote, Field, Shell, inputCls } from "@/components/Shell";
import { JobInfo } from "@/components/JobInfo";
import { Skills } from "@/components/Workforce";
import type { Gender } from "@/lib/workforce";
import { CancelBooking, ConfirmAction, History } from "@/components/Cleanup";
import {
  actions,
  isCompleted,
  AVAILABILITY,
  useStore,
  type Availability,
  type Profile,
} from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/labourer")({
  head: () => ({
    meta: [
      { title: "Independent labourer — Find farm work | RYTA" },
      {
        name: "description",
        content:
          "Independent labourers create a simple profile, browse farm jobs in Karnataka and apply on RYTA.",
      },
      { property: "og:title", content: "Find farm work | RYTA" },
      { property: "og:description", content: "Browse farm jobs and apply yourself." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Labourer,
});

function Labourer() {
  const { t } = useT();
  const { jobs, applications, profile } = useStore();
  const [editing, setEditing] = useState(false);
  const [p, setP] = useState<Profile>(
    profile ?? { name: "", skills: "", location: "", availability: "weekdays" },
  );

  if (!profile || editing) {
    return (
      <Shell title={t("role.labourer")}>
        <h1 className="mb-1 font-display text-3xl font-bold">{t("labourer.profileTitle")}</h1>
        <p className="mb-6 text-lg text-muted-foreground">{t("labourer.profileSub")}</p>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            actions.saveProfile(p);
            setEditing(false);
          }}
        >
          <Field label={t("labourer.name")}>
            <input
              required
              className={inputCls}
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
            />
          </Field>
          <Field label={t("labourer.skills")}>
            <input
              required
              className={inputCls}
              placeholder={t("labourer.skillsPh")}
              value={p.skills}
              onChange={(e) => setP({ ...p, skills: e.target.value })}
            />
          </Field>
          <Field label={t("wf.gender")}>
            <select
              required
              className={inputCls}
              value={p.gender ?? ""}
              onChange={(e) => setP({ ...p, gender: e.target.value as Gender })}
            >
              <option value="" disabled>
                —
              </option>
              <option value="male">{t("wf.male")}</option>
              <option value="female">{t("wf.female")}</option>
            </select>
          </Field>
          <Skills
            value={p.selectedSkills ?? []}
            onChange={(selectedSkills) =>
              setP({ ...p, selectedSkills, skills: selectedSkills.join(", ") })
            }
          />
          <Field label={t("labourer.village")}>
            <input
              required
              className={inputCls}
              placeholder={t("labourer.villagePh")}
              value={p.location}
              onChange={(e) => setP({ ...p, location: e.target.value })}
            />
          </Field>
          <Field label={t("labourer.availability")}>
            <select
              className={inputCls}
              value={p.availability}
              onChange={(e) => setP({ ...p, availability: e.target.value as Availability })}
            >
              {AVAILABILITY.map((o) => (
                <option key={o} value={o}>
                  {t(`avail.${o}`)}
                </option>
              ))}
            </select>
          </Field>
          <Btn type="submit">{t("labourer.saveSee")}</Btn>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title={t("role.labourer")}>
      <Card className="mb-6 bg-secondary">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xl font-bold">
              {t("labourer.greeting", { name: profile.name })}
            </div>
            <div className="text-base text-muted-foreground">
              {profile.skills} · {profile.location} · {t(`avail.${profile.availability}`)}
            </div>
          </div>
          <button
            onClick={() => {
              setP(profile);
              setEditing(true);
            }}
            className="min-h-12 shrink-0 px-2 font-semibold text-primary underline"
          >
            {t("common.edit")}
          </button>
        </div>
      </Card>
      <h2 className="mb-4 text-2xl font-bold">{t("labourer.jobsNear")}</h2>
      {jobs.length === 0 && <p className="text-lg text-muted-foreground">{t("labourer.noJobs")}</p>}
      <div className="space-y-4">
        {jobs.map((j) => {
          const mine = applications.find(
            (a) => a.jobId === j.id && !a.agent && a.workerName === profile.name,
          );
          return (
            <Card key={j.id}>
              <JobInfo job={j} />
              {mine?.status === "cancelled" ? (
                <div className="rounded-xl bg-muted p-3 text-center text-lg font-semibold text-muted-foreground">
                  {t("cl.cancelled")}
                </div>
              ) : mine ? (
                <>
                  <div
                    className={`rounded-xl p-3 text-center text-lg font-semibold ${mine.status === "confirmed" ? "bg-status-confirmed text-status-confirmed-foreground" : "bg-status-applied text-status-applied-foreground"}`}
                  >
                    {mine.status === "confirmed"
                      ? t("labourer.youConfirmed")
                      : t("labourer.applied")}
                  </div>
                  {mine.status === "applied" && (
                    <ConfirmAction
                      label={t("cl.withdraw")}
                      title={t("cl.withdrawTitle")}
                      body={t("cl.deleteBody", { name: j.title })}
                      confirm={t("cl.withdraw")}
                      done={t("cl.withdrawn")}
                      onConfirm={() => actions.withdrawApplication(mine.id, profile.name)}
                    />
                  )}
                  {mine.status === "confirmed" && !isCompleted(j) && (
                    <CancelBooking
                      name={j.title}
                      onConfirm={() =>
                        actions.cancelApplication(mine.id, { role: "labourer", name: profile.name })
                      }
                    />
                  )}
                </>
              ) : (
                <Btn variant="harvest" onClick={() => actions.apply(j.id)}>
                  {t("labourer.apply")}
                </Btn>
              )}
            </Card>
          );
        })}
      </div>
      <History
        items={applications
          .filter((a) => !a.agent && a.workerName === profile.name)
          .map((a) => ({ a, j: jobs.find((j) => j.id === a.jobId) }))
          .filter(
            ({ a, j }) =>
              j && (a.status === "cancelled" || (a.status === "confirmed" && isCompleted(j))),
          )
          .map(({ a, j }) => ({
            id: a.id,
            title: j!.title,
            sub: j!.location,
            date: j!.date,
            cancelled: a.cancelled,
          }))}
      />
      <DemoNote />
    </Shell>
  );
}
