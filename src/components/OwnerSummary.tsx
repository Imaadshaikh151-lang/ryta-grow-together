import { ChevronDown } from "lucide-react";
import { rupees, type State } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function OwnerSummary({ state }: { state: State }) {
  const { t, date } = useT();
  const { jobs, offers, applications } = state;
  const confirmed = applications.filter(a => a.status === "confirmed");
  const farms = [...new Set(jobs.map(j => j.farm))];
  const cost = (id: string) => confirmed.filter(a => a.jobId === id).reduce((s, a) => s + (offers.find(o => o.id === a.offerId)?.wage ?? jobs.find(j => j.id === id)?.wage ?? 0), 0) + offers.filter(o => o.jobId === id && o.status === "confirmed").reduce((s, o) => s + o.transport, 0);
  return <details className="group mt-8 border-y">
    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 font-semibold">{t("od.summary")}<ChevronDown className="size-5 transition-transform group-open:rotate-180" /></summary>
    <div className="space-y-5 pb-6"><dl className="grid grid-cols-3 gap-3">{([["owner.farms", farms.length], ["owner.jobs", jobs.length], ["owner.booked", confirmed.length]] as const).map(([key, n]) => <div key={key}><dt className="text-sm text-muted-foreground">{t(key)}</dt><dd className="text-2xl font-bold text-primary">{n}</dd></div>)}</dl>
      <div className="border-l-4 border-primary bg-muted p-4"><p className="text-sm text-muted-foreground">{t("wf.confirmedCost")}</p><p className="text-3xl font-bold text-primary">{rupees(jobs.reduce((s, j) => s + cost(j.id), 0))}</p></div>
      {farms.map(farm => <section key={farm}><h3 className="mb-2 font-bold">{farm}</h3><ul className="divide-y">{jobs.filter(j => j.farm === farm).map(j => <li key={j.id} className="flex flex-wrap justify-between gap-2 py-3"><div><p className="font-semibold">{j.title}</p><p className="text-sm text-muted-foreground">{j.location} · {date(j.date)} · {rupees(j.wage)}{t("common.slashDay")}</p></div><div className="text-right"><p className="font-bold text-primary">{rupees(cost(j.id))}</p><p className="text-sm text-muted-foreground">{t("owner.bookedOf", { c: confirmed.filter(a => a.jobId === j.id).length, n: j.workersNeeded })}</p></div></li>)}</ul></section>)}
    </div>
  </details>;
}