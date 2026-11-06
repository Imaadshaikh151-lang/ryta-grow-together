import { useSyncExternalStore } from "react";
import { allocate, validRequirements, validWorker, type Workforce, type WorkerDetails, type Skill } from "@/lib/workforce";

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
} & Partial<Workforce>;
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
  offerId?: string;
  gender?: "male" | "female" | undefined;
  selectedSkills?: Skill[] | undefined;
};
export type Availability = "everyday" | "weekdays" | "weekends" | "thisMonth";
export type Profile = { name: string; skills: string; location: string; availability: Availability } & WorkerDetails;
export type TeamMember = { id: string; name: string; skills: string } & WorkerDetails;
export type Agent = { name: string; location: string };
export type Offer = { id: string; jobId: string; agent: string; distance: number; transport: number; wage: number; memberIds: string[]; signature: string; status: "proposed" | "confirmed"; workers: TeamMember[] };
export type State = { jobs: Job[]; applications: Application[]; profile: Profile | null; agent: Agent | null; team: TeamMember[]; offers: Offer[]; maxRadius: number };

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
  offers: [],
  maxRadius: 60,
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
  postJob: (j: Omit<Job, "id">) => {
    if (!validRequirements(j)) return false;
    set({ jobs: [{ ...j, id: uid() }, ...state.jobs] }); return true;
  },
  editJob: (id: string, j: Omit<Job, "id">) => {
    if (!validRequirements(j) || state.applications.some(a => a.jobId === id && a.status === "confirmed")) return false;
    set({ jobs: state.jobs.map(old => old.id === id ? { ...j, id } : old) }); return true;
  },
  saveProfile: (p: Profile) => set({ profile: p }),
  apply: (jobId: string) => {
    const p = state.profile;
    if (!p || state.applications.some((a) => a.jobId === jobId && !a.agent && a.workerName === p.name)) return;
    set({ applications: [...state.applications, { id: uid(), jobId, workerName: p.name, skills: p.skills, selectedSkills:p.selectedSkills, gender:p.gender, location: p.location, status: "applied" }] });
  },
  saveAgent: (a: Agent) => set({ agent: a }),
  addMember: (m: Omit<TeamMember, "id">) => { if (validWorker(m)) set({ team: [...state.team, { ...m, id: uid() }] }); },
  editMember: (id: string, m: Omit<TeamMember, "id">) => { if (validWorker(m)) set({ team: state.team.map(old => old.id === id ? { ...m, id } : old) }); },
  removeMember: (id: string) => set({ team: state.team.filter((m) => m.id !== id) }),
  setRadius: (n: number) => { if (Number.isFinite(n) && n >= 20) set({ maxRadius: n }); },
  submitOffer: (jobId: string, quote: { distance: number; transport: number; wage: number }) => {
    const job = state.jobs.find(j => j.id === jobId);
    const agent = state.agent;
    if (!job || !agent || !validRequirements(job) || !Number.isFinite(quote.distance) || quote.distance < 0 || !Number.isFinite(quote.transport) || quote.transport < 0 || !Number.isFinite(quote.wage) || quote.wage <= 0) return false;
    const old = state.offers.find(o => o.jobId === jobId && o.agent === agent.name);
    if (old?.status === "confirmed") return false;
    const result = allocate(job, state.team, state.jobs, state.applications);
    const offer: Offer = { ...quote, id: old?.id ?? uid(), jobId, agent: agent.name, memberIds: result.selected.map(w => w.id), signature: result.signature, status: "proposed", workers: result.selected.map(w => ({ ...w, selectedSkills: [...(w.selectedSkills ?? [])] })) };
    set({ offers: [...state.offers.filter(o => o.id !== offer.id), offer] }); return true;
  },
  confirmOffer: (id: string) => {
    const offer = state.offers.find(o => o.id === id);
    const job = offer && state.jobs.find(j => j.id === offer.jobId);
    if (!offer || !job || offer.status === "confirmed" || offer.distance > state.maxRadius) return false;
    const result = allocate(job, state.team, state.jobs, state.applications);
    if (!result.suitable || result.signature !== offer.signature || result.selected.map(w => w.id).join() !== offer.memberIds.join()) return false;
    const records: Application[] = result.selected.map(w => ({ id: uid(), jobId: job.id, workerName: w.name, skills: w.skills, selectedSkills: w.selectedSkills, gender: w.gender, location: state.agent?.location ?? "", status: "confirmed", agent: offer.agent, memberId: w.id, offerId: offer.id }));
    set({ offers: state.offers.map(o => o.id === id ? { ...o, status: "confirmed" } : o), applications: [...state.applications.filter(a => !(a.jobId === job.id && a.agent === offer.agent && a.status === "applied")), ...records] }); return true;
  },
  confirm: (id: string) => {
    const app = state.applications.find((a) => a.id === id);
    const job = app && state.jobs.find((j) => j.id === app.jobId);
    if (!app || !job || app.status === "confirmed" || confirmedCount(job.id) >= job.workersNeeded) return;
    if (app.agent || (validRequirements(job) && (!app.gender || !job.requiredSkills?.every(s => app.selectedSkills?.includes(s)) || state.applications.filter(a => a.jobId === job.id && a.status === "confirmed" && a.gender === app.gender).length >= (app.gender === "male" ? (job.male ?? 0) : (job.female ?? 0))))) return;
    set({ applications: state.applications.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a)) });
  },
  reset: () => set(seed()),
};

export const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
