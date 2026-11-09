import { beforeEach, describe, expect, it } from "vitest";
import { actions, isCompleted, sampleCleanup, seed, type State } from "@/lib/store";
const S = (): State => JSON.parse(localStorage.getItem("ryta-demo-v2") ?? "{}");
const job = (date = "2099-01-01") => ({
  title: "Mine",
  workType: "Weeding",
  location: "Sirsi",
  date,
  wage: 500,
  workersNeeded: 2,
  male: 1,
  female: 1,
  requiredSkills: ["Weeding" as const],
  start: "08:00",
  end: "16:00",
  farm: "F",
});
const agentSetup = () => {
  actions.saveAgent({ name: "Suresh", location: "Banavasi" });
  for (const g of ["male", "female"] as const)
    actions.addMember({
      name: g,
      skills: "Weeding",
      gender: g,
      selectedSkills: ["Weeding"],
      start: "07:00",
      end: "18:00",
    });
};
describe("cleanup and delete controls", () => {
  beforeEach(() => actions.reset());
  it("owner deletes own unconfirmed job but not sample or confirmed ones", () => {
    actions.postJob(job());
    const id = S().jobs[0]!.id;
    expect(actions.deleteJob("j1")).toBe(false);
    expect(actions.deleteJob(id)).toBe(true);
    expect(S().jobs.some((j) => j.id === id)).toBe(false);
  });
  it("agent deletes only own proposed offer; cancelling a confirmed one keeps history", () => {
    actions.postJob(job());
    agentSetup();
    const id = S().jobs[0]!.id;
    actions.submitOffer(id, { distance: 10, transport: 0, wage: 500 });
    const offer = S().offers[0]!;
    expect(actions.deleteOffer(offer.id, "Someone else")).toBe(false);
    expect(actions.confirmOffer(offer.id)).toBe(true);
    expect(actions.deleteOffer(offer.id, "Suresh")).toBe(false);
    expect(actions.deleteJob(id)).toBe(false);
    expect(actions.cancelOffer(offer.id, { role: "agent", name: "Other" })).toBe(false);
    expect(actions.cancelOffer(offer.id, { role: "agent", name: "Suresh" })).toBe(true);
    const s = S();
    expect(s.offers[0]!.status).toBe("cancelled");
    expect(s.offers[0]!.cancelled?.name).toBe("Suresh");
    expect(
      s.applications.filter((a) => a.offerId === offer.id).every((a) => a.status === "cancelled"),
    ).toBe(true);
  });
  it("labourer withdraws own pending application only, cancels own confirmed one", () => {
    actions.saveProfile({
      name: "Asha",
      skills: "Weeding",
      location: "Sirsi",
      availability: "everyday",
      gender: "female",
      selectedSkills: ["Weeding"],
    });
    actions.postJob(job());
    const id = S().jobs[0]!.id;
    actions.apply(id);
    const app = S().applications.find((a) => a.workerName === "Asha")!;
    expect(actions.withdrawApplication("a2", "Asha")).toBe(false);
    expect(actions.withdrawApplication(app.id, "Asha")).toBe(true);
    actions.apply(id);
    const again = S().applications.find((a) => a.workerName === "Asha")!;
    actions.confirm(again.id);
    expect(actions.withdrawApplication(again.id, "Asha")).toBe(false);
    expect(actions.cancelApplication(again.id, { role: "labourer", name: "Ravi" })).toBe(false);
    expect(actions.cancelApplication(again.id, { role: "labourer", name: "Asha" })).toBe(true);
    expect(S().applications.find((a) => a.id === again.id)?.status).toBe("cancelled");
  });
  it("completed bookings cannot be cancelled", () => {
    expect(isCompleted({ date: "2000-01-01" })).toBe(true);
    actions.saveProfile({
      name: "Asha",
      skills: "Weeding",
      location: "Sirsi",
      availability: "everyday",
      gender: "female",
      selectedSkills: ["Weeding"],
    });
    actions.postJob(job("2000-01-01"));
    actions.apply(S().jobs[0]!.id);
    const app = S().applications.find((a) => a.workerName === "Asha")!;
    actions.confirm(app.id);
    expect(actions.cancelApplication(app.id, { role: "owner", name: "Me" })).toBe(false);
    expect(S().applications.find((a) => a.id === app.id)?.status).toBe("confirmed");
  });
  it("clearing samples keeps user records, profiles, rosters and confirmed history", () => {
    agentSetup();
    actions.postJob(job());
    const r = sampleCleanup(seed());
    expect(r.removedJobs).toBe(3);
    actions.clearSamples();
    const s = S();
    expect(s.jobs.map((j) => j.id).sort()).toEqual(
      [s.jobs.find((j) => !j.sample)!.id, "j1"].sort(),
    );
    expect(s.applications.map((a) => a.id)).toEqual(["a1"]);
    expect(s.team).toHaveLength(2);
    expect(s.agent?.name).toBe("Suresh");
  });
});
