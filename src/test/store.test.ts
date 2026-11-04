import { beforeEach, describe, expect, it } from "vitest";
import { actions } from "@/lib/store";

// Read state through a fresh subscription-free path: re-import the module's live state via actions.
import * as store from "@/lib/store";
const getState = () => {
  let s: ReturnType<typeof store.seed> | undefined;
  // useSyncExternalStore isn't available outside React; reset + read via seed shape
  s = JSON.parse(localStorage.getItem("ryta-demo-v2") ?? "null");
  return s!;
};

describe("demo store", () => {
  beforeEach(() => actions.reset());

  it("a farm owner cannot confirm more workers than needed", () => {
    actions.postJob({ title: "T", workType: "Weeding", location: "Sirsi", date: "2026-12-01", wage: 500, workersNeeded: 1, farm: "F" });
    const jobId = getState().jobs[0].id;
    actions.saveAgent({ name: "Agent A", location: "Sirsi" });
    actions.addMember({ name: "W1", skills: "x" });
    actions.addMember({ name: "W2", skills: "x" });
    expect(actions.applyTeam(jobId)).toBe(2);
    const apps = getState().applications.filter((a) => a.jobId === jobId);
    actions.confirm(apps[0].id);
    actions.confirm(apps[1].id);
    expect(getState().applications.filter((a) => a.jobId === jobId && a.status === "confirmed")).toHaveLength(1);
  });

  it("an agent's team member is not applied twice to the same job", () => {
    actions.saveAgent({ name: "Agent A", location: "Sirsi" });
    actions.addMember({ name: "W1", skills: "x" });
    expect(actions.applyTeam("j3")).toBe(1);
    expect(actions.applyTeam("j3")).toBe(0);
  });
});
