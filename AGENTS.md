# AGENTS.md

<!-- BEGIN:project-agent-rules -->

**## Project Rules**

- **Stack:** Next.js App Router, JavaScript, Tailwind CSS, and Supabase. Do not use TypeScript.
- **Documentation:** Read relevant guides in `node_modules/next/dist/docs/` before coding. Follow the installed Next.js version.
- **Components:** Prefer Server Components. Use `"use client"` only when necessary.
- **Code Quality:** Use reusable components, clear naming, and the existing project structure. Avoid unnecessary dependencies.
- **Security:** Never expose secrets or service-role keys on the client. Enforce server-side authorization and Supabase RLS.
- **FDR Verification:** Treat API failures as errors, not invalid FDRs. Clearly label dummy API responses as simulated.
- **Workflows:** Keep lifecycle, verification, and release/refund statuses separate. Never invent AICTE rules or API contracts.
- **Audit:** Preserve verification history and log important status changes and authorised actions.
- **UI/UX:** Follow `design.md` for colours, typography, spacing, components, and responsive behaviour.
- **Validation:** Handle loading, empty, success, and error states. Run lint, tests, and build checks after changes.
- **Scope:** Implement only requested features. Avoid unrelated changes and unnecessary complexity.

<!-- END:project-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->
**## This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->