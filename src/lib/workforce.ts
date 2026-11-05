export const SKILLS = ['Harvesting', 'Weeding', 'Picking', 'Spraying', 'Planting', 'Pruning', 'Sorting', 'Other'] as const;
export type Skill = typeof SKILLS[number];
export type Gender = 'male' | 'female';
export type Workforce = { male: number; female: number; requiredSkills: Skill[]; start: string; end: string };
export type WorkerDetails = { gender?: Gender; selectedSkills?: Skill[]; from?: string; until?: string; start?: string; end?: string };
export function validRequirements(j: { workersNeeded: number } & Partial<Workforce>) {
 return Number.isInteger(j.workersNeeded) && j.workersNeeded > 0 && Number.isInteger(j.male) && Number.isInteger(j.female) && (j.male ?? -1) >= 0 && (j.female ?? -1) >= 0 && (j.male ?? 0) + (j.female ?? 0) === j.workersNeeded && !!j.requiredSkills?.length && j.requiredSkills.every(s => SKILLS.includes(s)) && validHours(j.start, j.end);
}
export function validHours(start?: string, end?: string) { return !!start && !!end && /^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end) && start < end; }
export function selectSkills(all: boolean): Skill[] { return all ? [...SKILLS] : []; }
export function overlaps(a: { date: string; start?: string; end?: string }, b: { date: string; start?: string; end?: string }) { return a.date === b.date && (!a.start || !a.end || !b.start || !b.end || (a.start < b.end && b.start < a.end)); }
