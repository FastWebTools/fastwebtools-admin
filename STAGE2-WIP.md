# Stage 2 — implementation and field-switch fix completed

This supersedes the previous WIP deployment hold. Full frontend patch is now in this branch; no manual ZIP upload is needed. Live deployment state is recorded separately after native Cloudflare verification.

## Fix

Keep the viewer canvas before the focused editor so changing editor height no longer moves the iframe beneath a pointer interaction. Preserve the editor DOM placement rather than reparenting it on every refresh. Add an explicit Choose field selector retaining the same private working copy. Saved Preview returns focus to the actual viewer; successful inline Publish clears the completed editor. Private preview labels remain until a successful replacement response, including during connection errors.

## Scope

Content-mode notice/section edit controls; title, summary, report, progress, workaround, timing/priority, action labels/HTTPS URLs; safe Markdown toolbar and link dialog, Undo/Redo; actual renderer showing a labelled server-validated saved private revision; existing explicit Publish, original IDs and version conflicts. Records & drafts remains available. Design mode remains read-only: no drag/drop, footer editing, resizing or new sections in this stage.

## Verification

Final app SHA256 a24ee355fbfee3094375d20e2266a2e25732279421f8bba7e320e57d330f2fd3; HTML SHA256 690f61147929759c4846a66e8e149b911f4598007f1a920998da10a6e502b0d4.

Five consecutive isolated visual stress runs passed, 101 checks in each run. Includes actual viewer renderer, private-save/preview boundaries, canvas Publish confirmation, original-record update, immediate re-edit, conflict retention, incident progress/workaround, timing controls, unsafe action validation, safe action rendering, 42 field-picker switches without extra writes, responsive fields at 320/390/820/1440, forged-message rejection and logout clearing. Retained editor regression: 48 browser checks passed. Formatting renderer: 22 checks passed. These are isolated browser/backend/SQLite checks, not a real production user login or physical Safari test.

Native deployment must pass tested-source hashes, exact compiled bytes, current Stage 1 baseline, live public API and exact approved viewer hash, then unchanged public notices/settings/Last updated after upload. Target dashbord only with builder-stage2.config.json. Backend/auth/main API/public viewer are unchanged. No production test writes or real credential reads. No main merge or default production config change. Rollback is Stage 1 version 7e74bfde-2e17-42fa-a5fd-c8a6ba696a7c.
