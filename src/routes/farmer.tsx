import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Users, Check } from "lucide-react";
import { Btn, Card, DemoNote, Field, Shell, inputCls } from "@/components/Shell";
import { actions, niceDate, rupees, useStore, WORK_TYPES } from "@/lib/store";

export const Route = createFileRoute("/farmer")({
  head: () => ({
    meta: [
      { title: "Farmer — Post a farm job | RYTA" },
      { name: "description", content: "Post a farm job, view applicants and confirm workers on RYTA." },
      { property: "og:title", content: "Farmer dashboard | RYTA" },
      { property: "og:description", content: "Post farm jobs and confirm workers." },
    ],
  }),
  component: Farmer,
});

function Farmer() {
  const { jobs, applications } = useStore();
  const [tab, setTab] = useState<"post" | "jobs">("jobs");
  const [posted, setPosted] = useState(false);
  const [f, setF] = useState({ title: "", workType: WORK_TYPES[0], location: "", date: "", wage: "500", workersNeeded: "4" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.postJob({ ...f, title: f.title || f.workType, wage: +f.wage, workersNeeded: +f.workersNeeded, farm: "My Farm" });
    setF({ ...f, title: "", location: "", date: "" });
    setPosted(true);
    setTab("jobs");
  };

  return (
    <Shell title="Farmer">
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
        {(["jobs", "post"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPosted(false); }}
            className={`min-h-12 rounded-xl text-lg font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
            {t === "jobs" ? "My jobs" : "+ Post job"}
          </button>
        ))}
      </div>

      {tab === "post" ? (
        <form onSubmit={submit} className="space-y-5">
          <Field label="Type of work">
            <select className={inputCls} value={f.workType} onChange={(e) => setF({ ...f, workType: e.target.value })}>
              {WORK_TYPES.map((w) => <option key={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Job title (optional)">
            <input className={inputCls} placeholder="e.g. Paddy harvesting" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </Field>
          <Field label="Village / Town">
            <input required className={inputCls} placeholder="e.g. Hassan" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          </Field>
          <Field label="Work date">
            <input required type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Daily wage (₹)">
              <input required type="number" min={1} className={inputCls} value={f.wage} onChange={(e) => setF({ ...f, wage: e.target.value })} />
            </Field>
            <Field label="Workers needed">
              <input required type="number" min={1} className={inputCls} value={f.workersNeeded} onChange={(e) => setF({ ...f, workersNeeded: e.target.value })} />
            </Field>
          </div>
          <Btn type="submit">Post job</Btn>
        </form>
      ) : (
        <div className="space-y-4">
          {posted && <div className="rounded-xl bg-lime p-4 text-lg font-semibold text-lime-foreground">✓ Job posted! Labourers can now see it.</div>}
          {jobs.map((j) => {
            const apps = applications.filter((a) => a.jobId === j.id);
            const confirmed = apps.filter((a) => a.status === "confirmed").length;
            return (
              <Card key={j.id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold">{j.title}</h3>
                  <span className="text-xl font-bold text-primary">{rupees(j.wage)}<span className="text-sm font-normal text-muted-foreground">/day</span></span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-base text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="size-4" />{j.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-4" />{niceDate(j.date)}</span>
                  <span className="flex items-center gap-1"><Users className="size-4" />{confirmed}/{j.workersNeeded} confirmed</span>
                </div>
                <div className="mt-4 border-t pt-3">
                  <p className="mb-2 font-semibold">Applicants ({apps.length})</p>
                  {apps.length === 0 && <p className="text-muted-foreground">No applicants yet.</p>}
                  <ul className="space-y-2">
                    {apps.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
                        <div>
                          <div className="text-lg font-semibold">{a.workerName}</div>
                          <div className="text-sm text-muted-foreground">{a.skills} · {a.location}</div>
                        </div>
                        {a.status === "confirmed" ? (
                          <span className="flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 font-semibold text-lime-foreground"><Check className="size-4" />Confirmed</span>
                        ) : (
                          <button disabled={confirmed >= j.workersNeeded} onClick={() => actions.confirm(a.id)}
                            className="min-h-12 rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50">Confirm</button>
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
      <DemoNote />
    </Shell>
  );
}
