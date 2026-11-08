import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/Shell";
import { actions, sampleCleanup, useStore, type Cancellation } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";

/** Asks before any destructive action; nothing changes until the user confirms. */
export function ConfirmAction({
  label,
  title,
  body,
  confirm,
  done,
  onConfirm,
  extra,
}: {
  label: string;
  title: string;
  body: string;
  confirm: string;
  done: string;
  onConfirm: () => boolean;
  extra?: ReactNode;
}) {
  const { t } = useT();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="min-h-11 text-destructive hover:text-destructive">
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="break-words">{body}</AlertDialogDescription>
        </AlertDialogHeader>
        {extra}
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11">{t("cl.keep")}</AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => (onConfirm() ? toast.success(done) : toast.error(t("cl.failed")))}
          >
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteCard({ name, onConfirm }: { name: string; onConfirm: () => boolean }) {
  const { t } = useT();
  return (
    <ConfirmAction
      label={t("cl.delete")}
      title={t("cl.deleteTitle")}
      body={t("cl.deleteBody", { name })}
      confirm={t("cl.delete")}
      done={t("cl.deleted")}
      onConfirm={onConfirm}
    />
  );
}

export function CancelBooking({ name, onConfirm }: { name: string; onConfirm: () => boolean }) {
  const { t } = useT();
  return (
    <ConfirmAction
      label={t("cl.cancelBooking")}
      title={t("cl.cancelTitle")}
      body={t("cl.cancelBody", { name })}
      confirm={t("cl.cancelBooking")}
      done={t("cl.cancelDone")}
      onConfirm={onConfirm}
    />
  );
}

export type HistoryItem = {
  id: string;
  title: string;
  sub: string;
  date: string;
  cancelled?: Cancellation;
};

export function History({ items }: { items: HistoryItem[] }) {
  const { t, date } = useT();
  return (
    <section className="mt-8 border-t pt-5">
      <h2 className="mb-3 text-2xl font-bold">{t("cl.history")}</h2>
      {items.length === 0 && <p className="text-muted-foreground">{t("cl.noHistory")}</p>}
      <ul className="divide-y">
        {items.map((i) => (
          <li key={i.id} className="space-y-1 py-3">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="break-words">{i.title}</span>
              <Status kind={i.cancelled ? "sample" : "confirmed"}>
                {t(i.cancelled ? "cl.cancelled" : "cl.completed")}
              </Status>
            </p>
            <p className="text-sm text-muted-foreground">{i.sub}</p>
            <p className="text-sm text-muted-foreground">
              {i.cancelled
                ? t("cl.cancelledBy", {
                    who: `${i.cancelled.name} (${t(`role.${i.cancelled.role}` as TKey)})`,
                    when: date(i.cancelled.at.slice(0, 10)),
                  })
                : t("cl.completedOn", { when: date(i.date) })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClearSamples() {
  const { t } = useT();
  const state = useStore();
  const preview = sampleCleanup(state);
  if (!preview.removedJobs && !preview.removedApps)
    return <p className="mt-3 text-center text-sm text-muted-foreground">{t("cl.clearNone")}</p>;
  return (
    <div className="mt-3 flex justify-center">
      <ConfirmAction
        label={t("cl.clear")}
        title={t("cl.clearTitle")}
        body={t("cl.clearBody", { jobs: preview.removedJobs, apps: preview.removedApps })}
        extra={<p className="text-sm text-muted-foreground">{t("cl.clearKeep")}</p>}
        confirm={t("cl.clearConfirm")}
        done={t("cl.cleared")}
        onConfirm={() => {
          actions.clearSamples();
          return true;
        }}
      />
    </div>
  );
}
