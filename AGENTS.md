<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- When working on login, keep the UI polished and functional-looking; stub authentication should accept any email and password behind the scenes rather than advertising itself in the interface.
- Preserve existing or remote visual treatments unless explicitly asked to redesign; the user often gives DOM-path feedback for small typography, copy, and alignment fixes.
- For pull or merge work, protect local changes in stashes before fast-forwarding or merging, and explain which backups were preserved.

## Learned Workspace Facts

- This workspace uses Next.js App Router with `src/proxy.ts` for route gating and `/catalog` as the authenticated catalog destination.
- The login flow is cookie-gated: unauthenticated users should be routed to `/login`, while authenticated users proceed to `/catalog`.
