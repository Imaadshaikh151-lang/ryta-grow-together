<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All user-facing text lives in `src/lib/i18n.ts` (English source + Kannada, typed so every key must exist) and is read with `useT()`; never hard-code copy in components — keeps both languages complete.
- Demo data lives only in browser storage via `src/lib/store.ts`; sample records carry `sample: true` and are labelled — the app has no backend yet.
- Workforce matching is a pure shared module; offers are separate from jobs and confirmed applications retain worker snapshots, enabling deterministic allocation and atomic demo team confirmation.
- Provider distance is explicitly entered as a demo estimate, never inferred from village names; discovery operates only on submitted local offers.
- Owner summary cards and expandable details are presentation-only modules; they reuse existing store actions and allocation results, keeping other role screens and marketplace rules unchanged.
- Deletion is limited to unconfirmed cards owned by the acting role (checked in store actions); confirmed bookings are cancelled with who/when, never erased; "completed" is derived from a past work date — preserves booking history.
