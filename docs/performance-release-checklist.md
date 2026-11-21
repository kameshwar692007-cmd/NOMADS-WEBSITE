# Performance release checklist

## Implemented (PR #65 then #66)
- Lazy-loading offscreen Studio, Event, Tournament and admin listing artwork.
- Async decoding of images; navigation without the artificial 240ms timeout.
- Image audit / optional WebP generation via `npm run images:audit` and `npm run images:webp`. **Generated variants are not automatically used.**
- Browser-side WebP conversion for newly uploaded event, tournament and studio posters when smaller. The image keeps its original pixel dimensions; animated GIFs are not converted.
- Cache-Control for Vercel static /assets/ files and unique Supabase poster object names.

## Release gates
- [ ] PR #65 merged, then rebase PR #66 onto main and merge only after green checks.
- [ ] `npm ci && npm test && npm run build` pass on the final merge commit.
- [ ] Run `npm run images:audit`, inspect largest files and compare original/WebP output visually. Commit optimized assets and switch references only where fidelity is acceptable. Do not use lossy compression for crisp pixel art.
- [ ] Test 360px mobile on slow 4G, tablet and desktop; verify gameplay movement, NPCs, menus, carousels and modals.
- [ ] With an authenticated staff account, create/edit/delete a test event, tournament and studio project; upload a transparent PNG, photographic JPEG, WebP and animated GIF; confirm correct public rendering and that draft records remain hidden.
- [ ] Run Lighthouse (mobile throttling) on /, /studio, /events, /esports, /admin; record LCP, INP, CLS and transferred bytes before and after.
- [ ] Profile campus FPS, long tasks and network waterfall on a mid-range Android device; investigate only measured hotspots.
- [ ] Check Supabase query timings and duplicate requests; ensure RLS permissions are correct.
- [ ] Confirm Vercel production environment variables and redeploy; verify public pages are not in offline demo mode.
- [ ] Validate rollback path to previous production deployment.

## Cautions
- Do not share Supabase service-role credentials in the browser or commit them to Git.
- Cache duration for unique uploaded poster URLs is long; editing a poster should create a new object URL.
- Existing assets are still unconverted until separately reviewed and committed.
- This checklist is not a certification of production performance. Record actual measured results before declaring the release production-ready.
