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
};
export type Application = {
  id: string;
  jobId: string;
  workerName: string;
  skills: string;
  location: string;
  status: "applied" | "confirmed";
};
export type Profile = { name: string; skills: string; location: string; availability: string };
type State = { jobs: Job[]; applications: Application[]; profile: Profile | null };

export const WORK_TYPES = ["Harvesting", "Sowing", "Weeding", "Ploughing", "Spraying", "Coffee picking", "Irrigation"];

const seed = (): State => ({
  jobs: [
    { id: "j1", title: "Sugarcane harvesting", workType: "Harvesting", location: "Mandya", date: "2026-11-10", wage: 650, workersNeeded: 8, farm: "Cauvery Fields" },
    { id: "j2", title: "Coffee bean picking", workType: "Coffee picking", location: "Chikmagalur", date: "2026-11-12", wage: 600, workersNeeded: 12, farm: "Baba Budan Estate" },
    { id: "j3", title: "Ragi field weeding", workType: "Weeding", location: "Tumakuru", date: "2026-11-08", wage: 500, workersNeeded: 5, farm: "Green Acre Farm" },
    { id: "j4", title: "Tomato plant spraying", workType: "Spraying", location: "Kolar", date: "2026-11-15", wage: 550, workersNeeded: 3, farm: "Kolar Fresh Farms" },
  ],
  applications: [
    { id: "a1", jobId: "j1", workerName: "Ramesh K (sample)", skills: "Harvesting, Ploughing", location: "Mandya", status: "confirmed" },
    { id: "a2", jobId: "j1", workerName: "Lakshmi N (sample)", skills: "Harvesting", location: "Maddur", status: "applied" },
    { id: "a3", jobId: "j2", workerName: "Manjunath S (sample)", skills: "Coffee picking", location: "Mudigere", status: "applied" },
  ],
  profile: null,
});

const KEY = "ryta-demo-v1";
let state: State = seed();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function set(next: Partial<State>) {
  state = { ...state, ...next };
  localStorage.setItem(KEY, JSON.stringify(state));
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

export const actions = {
  postJob: (j: Omit<Job, "id">) => set({ jobs: [{ ...j, id: uid() }, ...state.jobs] }),
  saveProfile: (p: Profile) => set({ profile: p }),
  apply: (jobId: string) => {
    const p = state.profile;
    if (!p || state.applications.some((a) => a.jobId === jobId && a.workerName === p.name)) return;
    set({ applications: [...state.applications, { id: uid(), jobId, workerName: p.name, skills: p.skills, location: p.location, status: "applied" }] });
  },
  confirm: (id: string) =>
    set({ applications: state.applications.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a)) }),
  reset: () => set(seed()),
};

export const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
export const niceDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
