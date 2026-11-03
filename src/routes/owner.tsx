import { createFileRoute } from "@tanstack/react-router";
import { Card, DemoNote, Shell } from "@/components/Shell";
import { niceDate, rupees, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Farm Owner — Farms, bookings & costs | RYTA" },
      { name: "description", content: "See your farms, job postings, confirmed bookings and worker costs on RYTA." },
      { property: "og:title", content: "Farm owner overview | RYTA" },
      { property: "og:description", content: "Farms, bookings and worker costs in one place." },
    ],
  }),
  component: Owner,
});

function Owner() {
  const { jobs, applications } = useStore();
  const confirmed = applications.filter((a) => a.status === "confirmed");
  const cost = (jobId: string) => {
    const j = jobs.find((x) => x.id === jobId);
    return j ? j.wage * confirmed.filter((a) => a.jobId === jobId).length : 0;
  };
  const total = jobs.reduce((s, j) => s + cost(j.id), 0);
  const farms = [...new Set(jobs.map((j) => j.farm))];

  return (
    <Shell title="Farm Owner">
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[["Farms", farms.length], ["Jobs", jobs.length], ["Booked", confirmed.length]].map(([l, v]) => (
          <Card key={l} className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{v}</div>
            <div className="text-sm text-muted-foreground">{l}</div>
          </Card>
        ))}
      </div>
      <div className="hero-gradient mb-6 rounded-2xl p-5 text-primary-foreground">
        <div className="text-base opacity-90">Total worker cost (confirmed, per day)</div>
        <div className="font-display text-4xl font-bold">{rupees(total)}</div>
      </div>
      {farms.map((farm) => (
        <section key={farm} className="mb-6">
          <h2 className="mb-3 text-xl font-bold">🌾 {farm}</h2>
          <div className="space-y-3">
            {jobs.filter((j) => j.farm === farm).map((j) => {
              const n = confirmed.filter((a) => a.jobId === j.id).length;
              return (
                <Card key={j.id} className="p-4">
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="text-lg font-semibold">{j.title}</div>
                      <div className="text-sm text-muted-foreground">{j.location} · {niceDate(j.date)} · {rupees(j.wage)}/day</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{rupees(cost(j.id))}</div>
                      <div className="text-sm text-muted-foreground">{n}/{j.workersNeeded} booked</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
      <DemoNote />
    </Shell>
  );
}
