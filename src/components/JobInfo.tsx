import { MapPin, Calendar, Users } from "lucide-react";
import { Status } from "@/components/Shell";
import { useT, type TKey } from "@/lib/i18n";
import { rupees, type Job } from "@/lib/store";

/** Shared job header used by every role screen. */
export function JobInfo({ job, extra }: { job: Job; extra?: string }) {
  const { t, date } = useT();
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-xl font-bold">{job.title}</h3>
          <p className="text-base text-muted-foreground">{t(`work.${job.workType}` as TKey)} · {job.farm}</p>
          {job.sample && <div className="mt-1"><Status kind="sample">{t("demo.sample")}</Status></div>}
        </div>
        <span className="shrink-0 text-right text-2xl font-bold text-primary">
          {rupees(job.wage)}<span className="block text-sm font-normal text-muted-foreground">{t("common.perDay")}</span>
        </span>
      </div>
      <div className="my-3 flex flex-wrap gap-x-4 gap-y-1 text-base text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="size-4" />{job.location}</span>
        <span className="flex items-center gap-1"><Calendar className="size-4" />{date(job.date)}</span>
        <span className="flex items-center gap-1"><Users className="size-4" />{extra ?? t("job.needed", { n: job.workersNeeded })}</span>
      </div>
    </>
  );
}
