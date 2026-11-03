import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Users } from "lucide-react";
import { Btn, Card, DemoNote, Field, Shell, inputCls } from "@/components/Shell";
import { actions, niceDate, rupees, useStore } from "@/lib/store";

export const Route = createFileRoute("/labourer")({
  head: () => ({
    meta: [
      { title: "Labourer — Find farm work | RYTA" },
      { name: "description", content: "Create a simple profile, browse farm jobs in Karnataka and apply on RYTA." },
      { property: "og:title", content: "Find farm work | RYTA" },
      { property: "og:description", content: "Browse farm jobs and apply." },
    ],
  }),
  component: Labourer,
});

function Labourer() {
  const { jobs, applications, profile } = useStore();
  const [editing, setEditing] = useState(false);
  const [p, setP] = useState(profile ?? { name: "", skills: "", location: "", availability: "Weekdays" });

  if (!profile || editing) {
    return (
      <Shell title="Labourer">
        <h1 className="mb-1 font-display text-3xl font-bold">Your profile</h1>
        <p className="mb-6 text-lg text-muted-foreground">Farmers will see this when you apply.</p>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); actions.saveProfile(p); setEditing(false); }}>
          <Field label="Your name"><input required className={inputCls} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
          <Field label="Skills"><input required className={inputCls} placeholder="e.g. Harvesting, Weeding" value={p.skills} onChange={(e) => setP({ ...p, skills: e.target.value })} /></Field>
          <Field label="Village / Town"><input required className={inputCls} placeholder="e.g. Mandya" value={p.location} onChange={(e) => setP({ ...p, location: e.target.value })} /></Field>
          <Field label="When can you work?">
            <select className={inputCls} value={p.availability} onChange={(e) => setP({ ...p, availability: e.target.value })}>
              {["Every day", "Weekdays", "Weekends", "Only this month"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Btn type="submit">Save & see jobs</Btn>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title="Labourer">
      <Card className="mb-6 bg-secondary">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold">Namaskara, {profile.name} 👋</div>
            <div className="text-base text-muted-foreground">{profile.skills} · {profile.location} · {profile.availability}</div>
          </div>
          <button onClick={() => setEditing(true)} className="font-semibold text-primary underline">Edit</button>
        </div>
      </Card>
      <h2 className="mb-4 text-2xl font-bold">Jobs near you</h2>
      <div className="space-y-4">
        {jobs.map((j) => {
          const mine = applications.find((a) => a.jobId === j.id && a.workerName === profile.name);
          return (
            <Card key={j.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold">{j.title}</h3>
                  <p className="text-base text-muted-foreground">{j.farm}</p>
                </div>
                <span className="text-2xl font-bold text-primary">{rupees(j.wage)}<span className="block text-right text-sm font-normal text-muted-foreground">per day</span></span>
              </div>
              <div className="my-3 flex flex-wrap gap-x-4 gap-y-1 text-base text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-4" />{j.location}</span>
                <span className="flex items-center gap-1"><Calendar className="size-4" />{niceDate(j.date)}</span>
                <span className="flex items-center gap-1"><Users className="size-4" />{j.workersNeeded} needed</span>
              </div>
              {mine ? (
                <div className={`rounded-xl p-3 text-center text-lg font-semibold ${mine.status === "confirmed" ? "bg-lime text-lime-foreground" : "bg-muted"}`}>
                  {mine.status === "confirmed" ? "🎉 You are confirmed!" : "✓ Applied — waiting for farmer"}
                </div>
              ) : (
                <Btn variant="lime" onClick={() => actions.apply(j.id)}>Apply for this job</Btn>
              )}
            </Card>
          );
        })}
      </div>
      <DemoNote />
    </Shell>
  );
}
