import { useEffect, useSyncExternalStore } from "react";

/**
 * English is the source dictionary. Every other language must provide every key
 * (enforced by the type below and by src/test/i18n.test.ts).
 * Use {name} placeholders for values.
 */
const en = {
  "app.tagline": "The Farmers App",
  "lang.label": "Language",
  "nav.home": "Home",

  "home.heroTitle": "The Farmers App",
  "home.heroSub": "Find farm workers or farm work near you in Karnataka.",
  "home.whoAreYou": "Who are you?",
  "home.roleNote": "Picking a role here is only for this demo. There are no accounts or logins yet.",

  "role.owner": "Farm owner",
  "role.ownerSub": "Post jobs, confirm workers, see costs",
  "role.agent": "Labour agent",
  "role.agentSub": "Manage your team and find work for them",
  "role.labourer": "Independent labourer",
  "role.labourerSub": "Find farm work and apply yourself",

  "demo.note": "Demo mode: all jobs, workers and farms are sample data saved only on this phone. They are not real or verified people, and nothing is saved on a server.",
  "demo.reset": "Reset demo data",
  "demo.resetDone": "Demo data has been reset.",
  "demo.sample": "Sample",

  "common.perDay": "per day",
  "common.slashDay": "/day",
  "common.save": "Save",
  "common.edit": "Edit",
  "common.remove": "Remove",
  "common.required": "Please fill in this field.",

  "work.Harvesting": "Harvesting",
  "work.Sowing": "Sowing",
  "work.Weeding": "Weeding",
  "work.Ploughing": "Ploughing",
  "work.Spraying": "Spraying",
  "work.Coffee picking": "Coffee picking",
  "work.Irrigation": "Irrigation",

  "avail.everyday": "Every day",
  "avail.weekdays": "Weekdays",
  "avail.weekends": "Weekends",
  "avail.thisMonth": "Only this month",

  "owner.tabJobs": "My jobs",
  "owner.tabPost": "+ Post job",
  "owner.tabSummary": "Summary",
  "owner.workType": "Type of work",
  "owner.titleOptional": "Job title (optional)",
  "owner.titlePh": "e.g. Paddy harvesting",
  "owner.village": "Village / Town",
  "owner.villagePh": "e.g. Sirsi",
  "owner.date": "Work date",
  "owner.wage": "Daily wage (₹)",
  "owner.workersNeeded": "Workers needed",
  "owner.postJob": "Post job",
  "owner.posted": "✓ Job posted on this phone (demo). Labourers and agents using this phone can now see it.",
  "owner.myFarm": "My Farm",
  "owner.applicants": "Applicants ({n})",
  "owner.noApplicants": "No applicants yet.",
  "owner.confirm": "Confirm",
  "owner.confirmed": "Confirmed",
  "owner.full": "All places filled",
  "owner.viaAgent": "Team of {agent}",
  "owner.noJobs": "No jobs yet. Tap “+ Post job” to add one.",
  "owner.farms": "Farms",
  "owner.jobs": "Jobs",
  "owner.booked": "Booked",
  "owner.totalCost": "Total worker cost (confirmed, per day)",
  "owner.bookedOf": "{c}/{n} booked",

  "job.needed": "{n} needed",
  "job.confirmedOf": "{c}/{n} confirmed",

  "labourer.profileTitle": "Your profile",
  "labourer.profileSub": "Farm owners will see this when you apply.",
  "labourer.name": "Your name",
  "labourer.skills": "Skills",
  "labourer.skillsPh": "e.g. Harvesting, Weeding",
  "labourer.village": "Village / Town",
  "labourer.villagePh": "e.g. Banavasi",
  "labourer.availability": "When can you work?",
  "labourer.saveSee": "Save & see jobs",
  "labourer.greeting": "Namaskara, {name} 👋",
  "labourer.jobsNear": "Available jobs",
  "labourer.apply": "Apply for this job",
  "labourer.applied": "✓ Applied — waiting for farm owner",
  "labourer.youConfirmed": "🎉 You are confirmed!",
  "labourer.noJobs": "No jobs right now. Please check again later.",

  "agent.setupTitle": "Your agent details",
  "agent.setupSub": "Farm owners will see your name next to your team.",
  "agent.name": "Your name",
  "agent.village": "Village / Town",
  "agent.saveContinue": "Save & continue",
  "agent.greeting": "Namaskara, {name} 👋",
  "agent.teamTitle": "My team ({n})",
  "agent.noTeam": "No team members yet. Add your workers below.",
  "agent.memberName": "Worker name",
  "agent.memberSkills": "Skills",
  "agent.addMember": "+ Add to team",
  "agent.jobsTitle": "Available jobs",
  "agent.applyTeam": "Apply with my team",
  "agent.needTeam": "Add team members first to apply.",
  "agent.teamStatus": "Team: {a} applied · {c} confirmed",
  "agent.allApplied": "✓ Whole team has applied",
  "agent.applyResult": "{n} team members applied.",
} as const;

export type TKey = keyof typeof en;
type Dict = Record<TKey, string>;

const kn: Dict = {
  "app.tagline": "ರೈತರ ಆ್ಯಪ್",
  "lang.label": "ಭಾಷೆ",
  "nav.home": "ಮುಖಪುಟ",

  "home.heroTitle": "ರೈತರ ಆ್ಯಪ್",
  "home.heroSub": "ಕರ್ನಾಟಕದಲ್ಲಿ ನಿಮ್ಮ ಹತ್ತಿರದ ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಅಥವಾ ಕೃಷಿ ಕೆಲಸವನ್ನು ಹುಡುಕಿ.",
  "home.whoAreYou": "ನೀವು ಯಾರು?",
  "home.roleNote": "ಇಲ್ಲಿ ಪಾತ್ರ ಆಯ್ಕೆ ಮಾಡುವುದು ಈ ಡೆಮೊಗಾಗಿ ಮಾತ್ರ. ಇನ್ನೂ ಖಾತೆ ಅಥವಾ ಲಾಗಿನ್ ಇಲ್ಲ.",

  "role.owner": "ಜಮೀನು ಮಾಲೀಕರು",
  "role.ownerSub": "ಕೆಲಸ ಹಾಕಿ, ಕಾರ್ಮಿಕರನ್ನು ಖಚಿತಪಡಿಸಿ, ಖರ್ಚು ನೋಡಿ",
  "role.agent": "ಕಾರ್ಮಿಕ ಏಜೆಂಟ್",
  "role.agentSub": "ನಿಮ್ಮ ತಂಡವನ್ನು ನೋಡಿಕೊಳ್ಳಿ, ಅವರಿಗೆ ಕೆಲಸ ಹುಡುಕಿ",
  "role.labourer": "ಸ್ವತಂತ್ರ ಕಾರ್ಮಿಕ",
  "role.labourerSub": "ಕೃಷಿ ಕೆಲಸ ಹುಡುಕಿ, ನೀವೇ ಅರ್ಜಿ ಹಾಕಿ",

  "demo.note": "ಡೆಮೊ ಮೋಡ್: ಎಲ್ಲಾ ಕೆಲಸಗಳು, ಕಾರ್ಮಿಕರು ಮತ್ತು ಜಮೀನುಗಳು ಮಾದರಿ ಮಾಹಿತಿ ಮಾತ್ರ, ಈ ಫೋನ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತವೆ. ಇವರು ನಿಜವಾದ ಅಥವಾ ಪರಿಶೀಲಿಸಿದ ವ್ಯಕ್ತಿಗಳಲ್ಲ, ಮತ್ತು ಯಾವುದೂ ಸರ್ವರ್‌ನಲ್ಲಿ ಉಳಿಯುವುದಿಲ್ಲ.",
  "demo.reset": "ಡೆಮೊ ಮಾಹಿತಿ ಮರುಹೊಂದಿಸಿ",
  "demo.resetDone": "ಡೆಮೊ ಮಾಹಿತಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.",
  "demo.sample": "ಮಾದರಿ",

  "common.perDay": "ದಿನಕ್ಕೆ",
  "common.slashDay": "/ದಿನ",
  "common.save": "ಉಳಿಸಿ",
  "common.edit": "ಬದಲಿಸಿ",
  "common.remove": "ತೆಗೆದುಹಾಕಿ",
  "common.required": "ದಯವಿಟ್ಟು ಇದನ್ನು ತುಂಬಿ.",

  "work.Harvesting": "ಕೊಯ್ಲು",
  "work.Sowing": "ಬಿತ್ತನೆ",
  "work.Weeding": "ಕಳೆ ತೆಗೆಯುವುದು",
  "work.Ploughing": "ಉಳುಮೆ",
  "work.Spraying": "ಔಷಧಿ ಸಿಂಪಡಣೆ",
  "work.Coffee picking": "ಕಾಫಿ ಕೊಯ್ಲು",
  "work.Irrigation": "ನೀರಾವರಿ",

  "avail.everyday": "ಪ್ರತಿದಿನ",
  "avail.weekdays": "ವಾರದ ದಿನಗಳು",
  "avail.weekends": "ವಾರಾಂತ್ಯ",
  "avail.thisMonth": "ಈ ತಿಂಗಳು ಮಾತ್ರ",

  "owner.tabJobs": "ನನ್ನ ಕೆಲಸಗಳು",
  "owner.tabPost": "+ ಕೆಲಸ ಹಾಕಿ",
  "owner.tabSummary": "ಸಾರಾಂಶ",
  "owner.workType": "ಕೆಲಸದ ಬಗೆ",
  "owner.titleOptional": "ಕೆಲಸದ ಹೆಸರು (ಐಚ್ಛಿಕ)",
  "owner.titlePh": "ಉದಾ: ಭತ್ತದ ಕೊಯ್ಲು",
  "owner.village": "ಊರು / ಪಟ್ಟಣ",
  "owner.villagePh": "ಉದಾ: ಶಿರಸಿ",
  "owner.date": "ಕೆಲಸದ ದಿನಾಂಕ",
  "owner.wage": "ದಿನಗೂಲಿ (₹)",
  "owner.workersNeeded": "ಬೇಕಾದ ಕಾರ್ಮಿಕರು",
  "owner.postJob": "ಕೆಲಸ ಹಾಕಿ",
  "owner.posted": "✓ ಕೆಲಸವನ್ನು ಈ ಫೋನ್‌ನಲ್ಲಿ ಹಾಕಲಾಗಿದೆ (ಡೆಮೊ). ಈ ಫೋನ್ ಬಳಸುವ ಕಾರ್ಮಿಕರು ಮತ್ತು ಏಜೆಂಟರು ಈಗ ಇದನ್ನು ನೋಡಬಹುದು.",
  "owner.myFarm": "ನನ್ನ ಜಮೀನು",
  "owner.applicants": "ಅರ್ಜಿದಾರರು ({n})",
  "owner.noApplicants": "ಇನ್ನೂ ಯಾರೂ ಅರ್ಜಿ ಹಾಕಿಲ್ಲ.",
  "owner.confirm": "ಖಚಿತಪಡಿಸಿ",
  "owner.confirmed": "ಖಚಿತವಾಗಿದೆ",
  "owner.full": "ಎಲ್ಲಾ ಸ್ಥಾನ ತುಂಬಿದೆ",
  "owner.viaAgent": "{agent} ಅವರ ತಂಡ",
  "owner.noJobs": "ಇನ್ನೂ ಕೆಲಸಗಳಿಲ್ಲ. ಸೇರಿಸಲು “+ ಕೆಲಸ ಹಾಕಿ” ಒತ್ತಿ.",
  "owner.farms": "ಜಮೀನುಗಳು",
  "owner.jobs": "ಕೆಲಸಗಳು",
  "owner.booked": "ಬುಕ್ ಆಗಿದೆ",
  "owner.totalCost": "ಒಟ್ಟು ಕಾರ್ಮಿಕ ಖರ್ಚು (ಖಚಿತ, ದಿನಕ್ಕೆ)",
  "owner.bookedOf": "{c}/{n} ಬುಕ್ ಆಗಿದೆ",

  "job.needed": "{n} ಜನ ಬೇಕು",
  "job.confirmedOf": "{c}/{n} ಖಚಿತ",

  "labourer.profileTitle": "ನಿಮ್ಮ ವಿವರ",
  "labourer.profileSub": "ನೀವು ಅರ್ಜಿ ಹಾಕಿದಾಗ ಜಮೀನು ಮಾಲೀಕರು ಇದನ್ನು ನೋಡುತ್ತಾರೆ.",
  "labourer.name": "ನಿಮ್ಮ ಹೆಸರು",
  "labourer.skills": "ಕೌಶಲ್ಯಗಳು",
  "labourer.skillsPh": "ಉದಾ: ಕೊಯ್ಲು, ಕಳೆ ತೆಗೆಯುವುದು",
  "labourer.village": "ಊರು / ಪಟ್ಟಣ",
  "labourer.villagePh": "ಉದಾ: ಬನವಾಸಿ",
  "labourer.availability": "ನೀವು ಯಾವಾಗ ಕೆಲಸ ಮಾಡಬಹುದು?",
  "labourer.saveSee": "ಉಳಿಸಿ, ಕೆಲಸ ನೋಡಿ",
  "labourer.greeting": "ನಮಸ್ಕಾರ, {name} 👋",
  "labourer.jobsNear": "ಲಭ್ಯವಿರುವ ಕೆಲಸಗಳು",
  "labourer.apply": "ಈ ಕೆಲಸಕ್ಕೆ ಅರ್ಜಿ ಹಾಕಿ",
  "labourer.applied": "✓ ಅರ್ಜಿ ಹಾಕಲಾಗಿದೆ — ಮಾಲೀಕರ ಉತ್ತರಕ್ಕೆ ಕಾಯಲಾಗುತ್ತಿದೆ",
  "labourer.youConfirmed": "🎉 ನಿಮ್ಮನ್ನು ಖಚಿತಪಡಿಸಲಾಗಿದೆ!",
  "labourer.noJobs": "ಈಗ ಯಾವುದೇ ಕೆಲಸವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ನೋಡಿ.",

  "agent.setupTitle": "ನಿಮ್ಮ ಏಜೆಂಟ್ ವಿವರ",
  "agent.setupSub": "ನಿಮ್ಮ ತಂಡದ ಜೊತೆ ನಿಮ್ಮ ಹೆಸರನ್ನು ಜಮೀನು ಮಾಲೀಕರು ನೋಡುತ್ತಾರೆ.",
  "agent.name": "ನಿಮ್ಮ ಹೆಸರು",
  "agent.village": "ಊರು / ಪಟ್ಟಣ",
  "agent.saveContinue": "ಉಳಿಸಿ, ಮುಂದುವರಿಯಿರಿ",
  "agent.greeting": "ನಮಸ್ಕಾರ, {name} 👋",
  "agent.teamTitle": "ನನ್ನ ತಂಡ ({n})",
  "agent.noTeam": "ಇನ್ನೂ ತಂಡದಲ್ಲಿ ಯಾರೂ ಇಲ್ಲ. ಕೆಳಗೆ ನಿಮ್ಮ ಕಾರ್ಮಿಕರನ್ನು ಸೇರಿಸಿ.",
  "agent.memberName": "ಕಾರ್ಮಿಕರ ಹೆಸರು",
  "agent.memberSkills": "ಕೌಶಲ್ಯಗಳು",
  "agent.addMember": "+ ತಂಡಕ್ಕೆ ಸೇರಿಸಿ",
  "agent.jobsTitle": "ಲಭ್ಯವಿರುವ ಕೆಲಸಗಳು",
  "agent.applyTeam": "ನನ್ನ ತಂಡದೊಂದಿಗೆ ಅರ್ಜಿ ಹಾಕಿ",
  "agent.needTeam": "ಅರ್ಜಿ ಹಾಕಲು ಮೊದಲು ತಂಡಕ್ಕೆ ಕಾರ್ಮಿಕರನ್ನು ಸೇರಿಸಿ.",
  "agent.teamStatus": "ತಂಡ: {a} ಅರ್ಜಿ · {c} ಖಚಿತ",
  "agent.allApplied": "✓ ಇಡೀ ತಂಡ ಅರ್ಜಿ ಹಾಕಿದೆ",
  "agent.applyResult": "{n} ತಂಡದ ಸದಸ್ಯರು ಅರ್ಜಿ ಹಾಕಿದ್ದಾರೆ.",
};

export const LANGS = { en: "English", kn: "ಕನ್ನಡ" } as const;
export type Lang = keyof typeof LANGS;
export const dictionaries: Record<Lang, Dict> = { en, kn };

export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>) {
  let s = dictionaries[lang][key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

const KEY = "ryta-lang";
let current: Lang = "en";
let loaded = false;
const listeners = new Set<() => void>();

export function setLang(l: Lang) {
  current = l;
  try { localStorage.setItem(KEY, l); } catch {}
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "kn") current = saved;
  }
  listeners.add(fn);
  fn();
  return () => { listeners.delete(fn); };
}

export function useT() {
  const lang = useSyncExternalStore(subscribe, () => current, () => "en" as Lang);
  useEffect(() => { document.documentElement.lang = lang === "kn" ? "kn" : "en-IN"; }, [lang]);
  const t = (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const date = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", { day: "numeric", month: "short", weekday: "short" });
  return { lang, t, date };
}
