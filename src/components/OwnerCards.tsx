import { ArrowUpRight, CalendarDays, MapPin, Users, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/Shell";
import { useT } from "@/lib/i18n";
import { rupees, type Job, type Offer, type State } from "@/lib/store";
import { allocate, validRequirements } from "@/lib/workforce";

export function DailyRates({ wage }: { wage: number }) {
  const { t } = useT();
  return <div className="grid grid-cols-2 gap-3 border-t pt-3">
    {(["od.maleRate", "od.femaleRate"] as const).map(key => <div key={key}>
      <p className="text-sm text-muted-foreground">{t(key)}</p>
      <p className="font-semibold">{rupees(wage)}<span className="text-sm font-normal text-muted-foreground">{t("common.slashDay")}</span></p>
    </div>)}
  </div>;
}

export function OwnerJobCard({ job, state, onOpen }: { job: Job; state: State; onOpen: () => void }) {
  const { t, date } = useT();
  const confirmed = state.applications.filter(a => a.jobId === job.id && a.status === "confirmed").length;
  const complete = validRequirements(job);
  const label = confirmed >= job.workersNeeded ? "od.filled" : !complete ? "od.incomplete" : confirmed ? "od.progress" : "od.open";
  return <article className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-soft">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Status kind={confirmed >= job.workersNeeded ? "confirmed" : "applied"}>{t(label)}</Status>
      {job.sample && <Status kind="sample">{t("demo.sample")}</Status>}
    </div>
    <div><h3 className="break-words text-xl font-bold">{job.title}</h3><p className="mt-1 text-sm text-muted-foreground">{job.farm}</p></div>
    <div className="space-y-2 text-base text-muted-foreground">
      <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{job.location}</p>
      <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0" />{date(job.date)}</p>
    </div>
    <div className="flex items-start gap-3 rounded-md bg-muted px-3 py-2.5">
      <Users className="mt-1 size-5 shrink-0 text-primary" /><div><p className="font-semibold">{t("job.needed", { n: job.workersNeeded })}</p>
      <p className="text-sm text-muted-foreground">{t("wf.male")}: {job.male ?? t("od.notProvided")} · {t("wf.female")}: {job.female ?? t("od.notProvided")}</p></div>
    </div>
    <DailyRates wage={job.wage} />
    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Handshake className="size-4" />{t("od.offersCount", { n: state.offers.filter(o => o.jobId === job.id).length })}</span>
      <Button variant="ghost" className="min-h-11 text-primary" onClick={onOpen}>{t("od.viewJob")}<ArrowUpRight /></Button>
    </div>
  </article>;
}

export function OwnerOfferCard({ offer, job, state, onOpen }: { offer: Offer; job: Job; state: State; onOpen: () => void }) {
  const { t } = useT();
  const result = allocate(job, state.team, state.jobs, state.applications);
  const confirmed = offer.status === "confirmed";
  const current = result.signature === offer.signature;
  const match = confirmed || (current && result.suitable) ? "od.exact" : !current || result.incomplete ? "od.review" : "od.partial";
  const workers = offer.workers;
  return <article className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-soft">
    <div className="flex flex-wrap items-center justify-between gap-2"><Status kind={match === "od.exact" ? "confirmed" : "applied"}>{t(match)}</Status>{confirmed && <Status kind="confirmed">{t("owner.confirmed")}</Status>}</div>
    <h3 className="break-words text-xl font-bold">{offer.agent}</h3>
    <div className="grid grid-cols-2 gap-3"><div><p className="text-sm text-muted-foreground">{t("od.workersOffered")}</p><p className="text-2xl font-bold text-primary">{workers.length}</p></div><div><p className="text-sm text-muted-foreground">{t("wf.male")}: <strong className="text-foreground">{workers.filter(w => w.gender === "male").length}</strong></p><p className="text-sm text-muted-foreground">{t("wf.female")}: <strong className="text-foreground">{workers.filter(w => w.gender === "female").length}</strong></p></div></div>
    <DailyRates wage={offer.wage} />
    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3"><span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{t("wf.km", { n: offer.distance })}</span><Button variant="ghost" className="min-h-11 text-primary" onClick={onOpen}>{t("od.viewOffer")}<ArrowUpRight /></Button></div>
  </article>;
}