import { beforeEach, describe, expect, it } from "vitest";
import { actions, type State, type Job } from "@/lib/store";
import { allocate, discover, SKILLS, selectSkills, validRequirements } from "@/lib/workforce";
const getState = (): State => JSON.parse(localStorage.getItem("ryta-demo-v2") ?? "{}");
const request = (): Omit<Job, "id"> => ({
  title: "Test harvest",
  workType: "Harvesting",
  location: "Sirsi",
  date: "2026-11-10",
  wage: 500,
  workersNeeded: 8,
  male: 5,
  female: 3,
  requiredSkills: ["Harvesting", "Weeding"],
  start: "08:00",
  end: "16:00",
  farm: "Demo farm",
});
function setup() {
  actions.saveAgent({ name: "Demo agent", location: "Banavasi" });
  for (let i = 0; i < 10; i++)
    actions.addMember({
      name: `Worker ${i}`,
      skills: "Harvesting, Weeding",
      gender: i < 6 ? "male" : "female",
      selectedSkills: ["Harvesting", "Weeding"],
      start: "08:00",
      end: "17:00",
    });
  actions.postJob(request());
  const job = getState().jobs[0];
  if (!job) throw new Error("Job missing");
  return job;
}
describe("workforce demo rules", () => {
  beforeEach(() => actions.reset());
  it("requires exact male + female = total", () => {
    expect(actions.postJob({ ...request(), male: 4 })).toBe(false);
    expect(actions.postJob(request())).toBe(true);
  });
  it("requires skills and valid working hours", () => {
    expect(validRequirements({ ...request(), requiredSkills: [] })).toBe(false);
    expect(validRequirements({ ...request(), start: "17:00", end: "08:00" })).toBe(false);
  });
  it("Select All includes all eight specified skills", () => {
    expect(selectSkills(true)).toEqual([
      "Harvesting",
      "Weeding",
      "Picking",
      "Spraying",
      "Planting",
      "Pruning",
      "Sorting",
      "Other",
    ]);
    expect(selectSkills(false)).toEqual([]);
  });
  it("stores and edits each individual gender and multiple skills", () => {
    setup();
    const w = getState().team[0];
    if (!w) throw new Error("Worker missing");
    actions.editMember(w.id, {
      ...w,
      gender: "female",
      selectedSkills: [...SKILLS],
      skills: SKILLS.join(", "),
    });
    expect(getState().team.find((x) => x.id === w.id)?.gender).toBe("female");
    expect(getState().team.find((x) => x.id === w.id)?.selectedSkills).toHaveLength(8);
  });
  it("deterministically chooses 8 of 10, with 5 male and 3 female", () => {
    const job = setup(),
      s = getState();
    const r = allocate(job, s.team, s.jobs, s.applications);
    expect(r.suitable).toBe(true);
    expect(r.selected).toHaveLength(8);
    expect(r.selected.filter((w) => w.gender === "male")).toHaveLength(5);
    expect(r.selected.filter((w) => w.gender === "female")).toHaveLength(3);
    expect(
      allocate(job, [...s.team].reverse(), s.jobs, s.applications).selected.map((w) => w.id),
    ).toEqual(r.selected.map((w) => w.id));
  });
  it("confirms in one action, retains eight records and leaves two unallocated", () => {
    const job = setup();
    expect(actions.submitOffer(job.id, { distance: 12, transport: 200, wage: 550 })).toBe(true);
    const o = getState().offers[0];
    if (!o) throw new Error("Offer missing");
    expect(actions.confirmOffer(o.id)).toBe(true);
    const s = getState();
    expect(
      s.applications.filter((a) => a.offerId === o.id && a.status === "confirmed"),
    ).toHaveLength(8);
    expect(s.team.filter((w) => !s.applications.some((a) => a.memberId === w.id))).toHaveLength(2);
    expect(actions.confirmOffer(o.id)).toBe(false);
  });
  it("identifies shortages without confirming an unsuitable team", () => {
    const job = setup();
    for (const w of getState().team.filter((w) => w.gender === "female"))
      actions.removeMember(w.id);
    const s = getState();
    expect(allocate(job, s.team, s.jobs, s.applications).femaleShortage).toBe(3);
    actions.submitOffer(job.id, { distance: 1, transport: 0, wage: 500 });
    const o = getState().offers[0];
    if (!o) throw new Error("Offer missing");
    expect(actions.confirmOffer(o.id)).toBe(false);
  });
  it("excludes missing skills and unavailable dates or hours", () => {
    const job = setup(),
      s = getState();
    const team = s.team.map((w, i) =>
      i === 0
        ? { ...w, selectedSkills: [] }
        : i === 1
          ? { ...w, from: "2026-11-11" }
          : i === 2
            ? { ...w, start: "10:00" }
            : w,
    );
    const r = allocate(job, team, s.jobs, s.applications);
    expect(r.suitable).toBe(false);
    expect(r.maleShortage).toBe(2);
  });
  it("excludes overlapping confirmed bookings, allowing nonoverlapping hours", () => {
    const job = setup();
    actions.submitOffer(job.id, { distance: 10, transport: 0, wage: 500 });
    const o = getState().offers[0];
    if (!o) throw new Error("Offer missing");
    actions.confirmOffer(o.id);
    const s = getState();
    const r = allocate({ ...job, id: "next" }, s.team, s.jobs, s.applications);
    expect(r.suitable).toBe(false);
    expect(r.selected).toHaveLength(2);
    expect(
      allocate(
        { ...job, id: "later", start: "16:00", end: "17:00" },
        s.team,
        s.jobs,
        s.applications,
      ).suitable,
    ).toBe(true);
  });
  it("rejects stale proposals after roster edits", () => {
    const job = setup();
    actions.submitOffer(job.id, { distance: 10, transport: 0, wage: 500 });
    const o = getState().offers[0],
      w = getState().team[0];
    if (!o || !w) throw new Error("Missing fixture");
    actions.editMember(w.id, { ...w, name: "Changed worker" });
    expect(actions.confirmOffer(o.id)).toBe(false);
  });
  it("starts at 20km, expands for suitable offers and respects maximum", () => {
    const job = setup();
    actions.submitOffer(job.id, { distance: 35, transport: 0, wage: 500 });
    const s = getState();
    expect(discover(s.offers, () => true, 60).radius).toBe(40);
    expect(discover(s.offers, () => true, 30).offers).toHaveLength(0);
    expect(discover(s.offers, () => true, 30).outside).toBe(1);
    expect(discover(s.offers, () => false, 60).radius).toBe(60);
    actions.setRadius(30);
    const o = s.offers[0];
    if (!o) throw new Error("Offer missing");
    expect(actions.confirmOffer(o.id)).toBe(false);
    expect(discover([{ ...o, distance: 10 }], () => true, 60).radius).toBe(20);
  });
  it("cannot exceed capacity with competing offers", () => {
    const job = setup();
    actions.submitOffer(job.id, { distance: 10, transport: 0, wage: 500 });
    const o = getState().offers[0];
    if (!o) throw new Error("Offer missing");
    expect(actions.confirmOffer(o.id)).toBe(true);
    actions.saveAgent({ name: "Other agent", location: "Sirsi" });
    actions.submitOffer(job.id, { distance: 10, transport: 0, wage: 500 });
    const next = getState().offers.find((x) => x.agent === "Other agent");
    if (!next) throw new Error("Offer missing");
    expect(actions.confirmOffer(next.id)).toBe(false);
    expect(
      getState().applications.filter((a) => a.jobId === job.id && a.status === "confirmed"),
    ).toHaveLength(8);
  });
});
