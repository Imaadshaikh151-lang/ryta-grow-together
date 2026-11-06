export const SKILLS = ['Harvesting', 'Weeding', 'Picking', 'Spraying', 'Planting', 'Pruning', 'Sorting', 'Other'] as const;
export type Skill = typeof SKILLS[number];
export type Gender = 'male' | 'female';
export type Workforce = { male: number; female: number; requiredSkills: Skill[]; start: string; end: string };
export type WorkerDetails = { gender?: Gender | undefined; selectedSkills?: Skill[] | undefined; from?: string; until?: string; start?: string; end?: string };
export function validRequirements(j: { workersNeeded: number } & Partial<Workforce>) {
 return Number.isInteger(j.workersNeeded) && j.workersNeeded > 0 && Number.isInteger(j.male) && Number.isInteger(j.female) && (j.male ?? -1) >= 0 && (j.female ?? -1) >= 0 && (j.male ?? 0) + (j.female ?? 0) === j.workersNeeded && !!j.requiredSkills?.length && j.requiredSkills.every(s => SKILLS.includes(s)) && validHours(j.start, j.end);
}
export function validHours(start?: string, end?: string) { return !!start && !!end && /^([01]\d|2[0-3]):[0-5]\d$/.test(start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(end) && start < end; }
export function validWorker(w: { name: string } & WorkerDetails) { return !!w.name.trim() && (w.gender === 'male' || w.gender === 'female') && !!w.selectedSkills?.length && w.selectedSkills.every(s => SKILLS.includes(s)) && validHours(w.start,w.end) && !(w.from && w.until && w.from > w.until); }
export function selectSkills(all: boolean): Skill[] { return all ? [...SKILLS] : []; }
export function overlaps(a: { date: string; start?: string; end?: string }, b: { date: string; start?: string; end?: string }) { return a.date === b.date && (!a.start || !a.end || !b.start || !b.end || (a.start < b.end && b.start < a.end)); }

import type { Job, TeamMember, Application, Offer } from './store';
export function allocate(job: Job, team: TeamMember[], jobs: Job[], applications: Application[]) {
 const booked = applications.filter(a => a.jobId === job.id && a.status === 'confirmed');
 const unknown = booked.some(a => !a.gender);
 const maleNeed = Math.max(0, (job.male ?? 0) - booked.filter(a => a.gender === 'male').length);
 const femaleNeed = Math.max(0, (job.female ?? 0) - booked.filter(a => a.gender === 'female').length);
 const available = team.filter(w => (!w.from || w.from <= job.date) && (!w.until || w.until >= job.date) && !!w.start && !!w.end && w.start <= (job.start ?? '') && w.end >= (job.end ?? '99:99') && !applications.some(a => a.memberId === w.id && a.status === 'confirmed' && (jobs.find(j => j.id === a.jobId) ? overlaps(job, jobs.find(j => j.id === a.jobId) as Job) : true)));
 const eligible = available.filter(w => validWorker(w) && job.requiredSkills?.every(s => w.selectedSkills?.includes(s))).sort((a,b) => (a.selectedSkills?.length ?? 0) - (b.selectedSkills?.length ?? 0) || a.name.localeCompare(b.name) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
 const males = eligible.filter(w => w.gender === 'male').slice(0, maleNeed);
 const females = eligible.filter(w => w.gender === 'female').slice(0, femaleNeed);
 const selected = [...males, ...females];
 const suitable = validRequirements(job) && !unknown && selected.length > 0 && males.length === maleNeed && females.length === femaleNeed;
 return { selected, available, maleShortage: maleNeed - males.length, femaleShortage: femaleNeed - females.length, suitable, incomplete: !validRequirements(job) || unknown, signature: JSON.stringify([job, selected]) };
}
export function discover(offers: Offer[], suitable: (o: Offer) => boolean, maximum: number) {
 let radius = 20;
 const ordered = [...offers].sort((a,b) => a.distance - b.distance || a.id.localeCompare(b.id));
 while (radius < maximum && !ordered.some(o => o.distance <= radius && suitable(o))) radius = Math.min(maximum, radius + 20);
 return { radius, offers: ordered.filter(o => o.distance <= radius), outside: ordered.filter(o => o.distance > maximum).length };
}
