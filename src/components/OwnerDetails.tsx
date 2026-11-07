import { Check } from "lucide-react";
import { Btn, Status } from "@/components/Shell";
import { JobInfo } from "@/components/JobInfo";
import { Requirements } from "@/components/Workforce";
import { DailyRates } from "@/components/OwnerCards";
import { Button } from "@/components/ui/button";
import { actions, type Job, type State } from "@/lib/store";
import { validRequirements } from "@/lib/workforce";
import { useT } from "@/lib/i18n";

export function OwnerJobDetails({ job, state, onEdit }: { job: Job; state: State; onEdit: () => void }) {
  const { t } = useT();
  const apps = state.applications.filter(a => a.jobId === job.id && !a.agent);
  const confirmed = state.applications.filter(a => a.jobId === job.id && a.status === "confirmed").length;
  const full = apps.filter(a => a.status === "confirmed").length >= job.workersNeeded;
  return <div className="space-y-5">
    <JobInfo job={job} extra={t("job.confirmedOf", { c: confirmed, n: job.workersNeeded })} />
    <Requirements job={job} /><DailyRates wage={job.wage} />
    {confirmed === 0 && <Button variant="outline" className="min-h-12" onClick={onEdit}>{t("wf.editJob")}</Button>}
    <section className="border-t pt-4"><h3 className="mb-3 font-bold">{t("owner.applicants", { n: apps.length })}</h3>
      {apps.length === 0 && <p className="text-muted-foreground">{t("owner.noApplicants")}</p>}
      <ul className="divide-y">{apps.map(a => <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="min-w-0"><p className="flex flex-wrap items-center gap-2 font-semibold">{a.workerName}{a.sample && <Status kind="sample">{t("demo.sample")}</Status>}</p><p className="text-sm text-muted-foreground">{a.skills} · {a.location}</p></div>
        {a.status === "confirmed" ? <Status kind="confirmed"><Check className="size-4" />{t("owner.confirmed")}</Status> : full ? <p className="text-sm text-muted-foreground">{t("owner.full")}</p> : <div className="w-full sm:w-auto"><Btn disabled={validRequirements(job) && (!a.gender || !job.requiredSkills?.every(s => a.selectedSkills?.includes(s)))} onClick={() => actions.confirm(a.id)}>{t("owner.confirm")}</Btn></div>}
      </li>)}</ul>
    </section>
  </div>;
}