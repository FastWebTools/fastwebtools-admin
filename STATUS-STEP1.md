# Status tab — Step 1

Integrated read-only published Status into existing admin UI at /#status. Same existing session, no additional dashboard or second login. Includes overview, active incidents, Update + Maintenance feed, maintenance, past incidents and tools/services. Existing public IDs, content, timestamps and API are retained without import/migration. Display local AM/PM. Responsive section navigation and horizontally scrollable mobile main navigation with selected tab scrolled into view. Browser Back/Forward works. No editor, publish or database mutation controls in this step.

Original app.js, worker.js, default Wrangler config and main branch remain unchanged. Additive entry and explicit status-step1.config.json target only existing frontend Worker dashbord. No changes to fastwebtools-admin authentication backend, API Worker, Status Worker, analytics or published business records.

Build: node build-status-step1.mjs. Gate: node release-step1-check.mjs. Compile dry-run using status-step1.config.json then node compiled-step1-check.mjs. Before deployment run node verify-step1-live.mjs --before; it blocks if live admin differs from exact original source. After deployment run node verify-step1-live.mjs. Local Playwright suite: 78 checks, widths 320/390/768/820/1440, zero Status writes, no real user credentials used.

Deploy only this feature branch with explicit config. No merge into main without separate approval. Previous frontend production version c7a0c142-60f6-4477-8968-30e2ccb781b6 is the rollback target. Later ordinary main-branch deploys still use the old default entry until an approved integration/merge.
