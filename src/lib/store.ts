import { useSyncExternalStore } from "react";

export type Job = {
  id: string;
  title: string;
  workType: string;
  location: string;
  date: string;
  wage: number;
  workersNeeded: number;
  farm: string;
  sample?: boolean;
};
export type Application = {
  id: string;
  jobId: string;
  workerName: string;
  skills: string;
  location: string;
  status: "applied" | "confirmed";
  agent?: string; // set when applied through a labour agent's team
  memberId?: string;
  sample?: boolean;
};
export type Availability = "everyday" | "weekdays" | "weekends" | "thisMonth";
export type Profile = { name: string; skills: string; location: string; availability: Availability };
export type TeamMember = { id: string; name: string; skills: string };
export type Agent = { name: string; location: string };
type State = { jobs: Job[]; applications: Application[]; profile: Profile | null; agent: Agent | null; team: TeamMember[] };

export const WORK_TYPES = ["Harvesting", "Sowing", "Weeding", "Ploughing", "Spraying", "Coffee picking", "Irrigation"] as const;
export const AVAILABILITY: Availability[] = ["everyday", "weekdays", "weekends", "thisMonth"];

export const seed = (): State => ({
  jobs: [
    { id: "j1", title: "Sugarcane harvesting", workType: "Harvesting", location: "Mandya", date: "2026-11-10", wage: 650, workersNeeded: 8, farm: "Cauvery Fields", sample: true },
    { id: "j2", title: "Coffee bean picking", workType: "Coffee picking", location: "Chikmagalur", date: "2026-11-12", wage: 600, workersNeeded: 12, farm: "Baba Budan Estate", sample: true },
    { id: "j3", title: "Ragi field weeding", workType: "Weeding", location: "Tumakuru", date: "2026-11-08", wage: 500, workersNeeded: 5, farm: "Green Acre Farm", sample: true },
    { id: "j4", title: "Tomato plant spraying", workType: "Spraying", location: "Kolar", date: "2026-11-15", wage: 550, workersNeeded: 3, farm: "Kolar Fresh Farms", sample: true },
  ],
  applications: [
    { id: "a1", jobId: "j1", workerName: "Ramesh K", skills: "Harvesting, Ploughing", location: "Mandya", status: "confirmed", sample: true },
    { id: "a2", jobId: "j1", workerName: "Lakshmi N", skills: "Harvesting", location: "Maddur", status: "applied", sample: true },
    { id: "a3", jobId: "j2", workerName: "Manjunath S", skills: "Coffee picking", location: "Mudigere", status: "applied", sample: true },
  ],
  profile: null,
  agent: null,
  team: [],
});

const KEY = "ryta-demo-v2";
let state: State = seed();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed(), ...JSON.parse(raw) };
  } catch {}
}
function set(next: Partial<State>) {
  state = { ...state, ...next };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}
const serverState = seed();

export function useStore() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => state,
    () => serverState,
  );
}

const uid = () => Math.random().toString(36).slice(2, 9);
const confirmedCount = (jobId: string) => state.applications.filter((a) => a.jobId === jobId && a.status === "confirmed").length;

export const actions = {
  postJob: (j: Omit<Job, "id">) => set({ jobs: [{ ...j, id: uid() }, ...state.jobs] }),
  saveProfile: (p: Profile) => set({ profile: p }),
  apply: (jobId: string) => {
    const p = state.profile;
    if (!p || state.applications.some((a) => a.jobId === jobId && !a.agent && a.workerName === p.name)) return;
    set({ applications: [...state.applications, { id: uid(), jobId, workerName: p.name, skills: p.skills, location: p.location, status: "applied" }] });
  },
  saveAgent: (a: Agent) => set({ agent: a }),
  addMember: (m: Omit<TeamMember, "id">) => set({ team: [...state.team, { ...m, id: uid() }] }),
  removeMember: (id: string) => set({ team: state.team.filter((m) => m.id !== id) }),
  /** Applies every team member not yet applied to this job. Returns how many were added. */
  applyTeam: (jobId: string) => {
    const ag = state.agent;
    if (!ag) return 0;
    const fresh = state.team.filter((m) => !state.applications.some((a) => a.jobId === jobId && a.memberId === m.id));
    set({
      applications: [
        ...state.applications,
        ...fresh.map((m) => ({ id: uid(), jobId, workerName: m.name, skills: m.skills, location: ag.location, status: "applied" as const, agent: ag.name, memberId: m.id })),
      ],
    });
    return fresh.length;
  },
  confirm: (id: string) => {
    const app = state.applications.find((a) => a.id === id);
    const job = app && state.jobs.find((j) => j.id === app.jobId);
    if (!app || !job || app.status === "confirmed" || confirmedCount(job.id) >= job.workersNeeded) return;
    set({ applications: state.applications.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a)) });
  },
  reset: () => set(seed()),
};

export const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
