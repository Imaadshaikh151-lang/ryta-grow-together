import { useT, type TKey } from '@/lib/i18n';
import { SKILLS, selectSkills, allocate } from '@/lib/workforce';
import type { Skill } from '@/lib/workforce';
import { rupees, type Job, type Offer, type State } from '@/lib/store';
import { Btn, Status } from './Shell';
export const skillKey = (s: Skill): TKey => (s === 'Harvesting' || s === 'Weeding' || s === 'Spraying' ? `work.${s}` : `wf.${s}`) as TKey;
export function Skills({ value, onChange, label }: { value: Skill[]; onChange: (v: Skill[]) => void; label?: string }) {
 const { t } = useT();
 return <fieldset className="space-y-2"><legend className="mb-2 font-semibold">{label ?? t('wf.skills')}</legend><label className="flex min-h-10 items-center gap-3 font-semibold"><input type="checkbox" className="size-5 accent-primary" checked={value.length === SKILLS.length} onChange={e => onChange(selectSkills(e.target.checked))}/>{t('wf.all')}</label><div className="grid grid-cols-2 gap-2">{SKILLS.map(s => <label key={s} className="flex min-h-10 items-center gap-3"><input className="size-5 accent-primary" type="checkbox" checked={value.includes(s)} onChange={e => onChange(e.target.checked ? [...value, s] : value.filter(x => x !== s))}/>{t(skillKey(s))}</label>)}</div></fieldset>;
}
export function Requirements({ job }: { job: Job }) {
 const { t, date } = useT();
 return <div className="space-y-2 border-t pt-3"><h4 className="font-bold">{t('wf.request')}</h4>{job.male === undefined || job.female === undefined ? <p className="text-muted-foreground">{t('wf.missing')}</p> : <p>{t('wf.breakdown', {n: job.workersNeeded,m: job.male,f: job.female})}</p>}<p>{job.requiredSkills?.map(s => t(skillKey(s))).join(' · ')}</p>{job.start && job.end && <p>{t('wf.hours',{date:date(job.date),start:job.start,end:job.end})}</p>}<p>{t('wf.labour')}: {rupees(job.wage * job.workersNeeded)}</p></div>;
}
export function OfferDetails({ offer, state, onConfirm }: { offer: Offer; state: State; onConfirm?: () => void }) {
 const { t, date } = useT();
 const job = state.jobs.find(j => j.id === offer.jobId);
 if (!job) return null;
 const result = allocate(job, state.team, state.jobs, state.applications);
 const confirmed = offer.status === 'confirmed';
 const selected = confirmed ? offer.workers : result.selected;
 const available = confirmed ? offer.workers : result.available;
 const male = (workers: typeof selected) => workers.filter(w => w.gender === 'male').length;
 const current = result.signature === offer.signature;
 return <div className="space-y-3"><h3 className="text-xl font-bold">{t('wf.offer',{name:offer.agent})}</h3><Status kind={confirmed ? 'confirmed' : 'sample'}>{t(confirmed ? 'owner.confirmed' : 'demo.sample')}</Status><p>{t('wf.km',{n:offer.distance})}</p><p>{t('wf.supply',{n:available.length,m:male(available),f:available.filter(w => w.gender === 'female').length})}</p><p className="font-semibold">{t('wf.selected',{n:selected.length,m:male(selected),f:selected.filter(w => w.gender === 'female').length})}</p><p>{[...new Set(selected.flatMap(w => w.selectedSkills ?? []))].map(s => t(skillKey(s))).join(' · ')}</p><p>{t('wf.hours',{date:date(job.date),start:job.start ?? '—',end:job.end ?? '—'})}</p><p className="font-semibold text-primary">{confirmed || result.suitable ? t('wf.available') : result.incomplete ? t('wf.missing') : t('wf.shortage',{m:result.maleShortage,f:result.femaleShortage})}</p>{!confirmed && <p>{t('wf.unallocated',{n:state.team.length-selected.length})}</p>}<ul className="divide-y">{selected.map(w => <li className="py-2" key={w.id}>{w.name} · {w.gender && t(`wf.${w.gender}`)}<span className="block text-sm text-muted-foreground">{w.selectedSkills?.map(s => t(skillKey(s))).join(' · ')}</span></li>)}</ul><p>{t('wf.labour')}: {rupees(offer.wage * selected.length)}</p><p>{t('wf.transport')}: {rupees(offer.transport)}</p>{!confirmed && !current && <p role="alert">{t('wf.changed')}</p>}{onConfirm && !confirmed && <Btn disabled={!result.suitable || !current || offer.distance > state.maxRadius} onClick={onConfirm}>{t('wf.confirm')}</Btn>}</div>;
}
