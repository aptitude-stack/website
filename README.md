# Aptitude Registry Website

Operator-gated catalog UI for browsing governed Aptitude skills from the registry API.

## Requirements

- Bun
- Node.js compatible with the pinned Next.js version
- Server-side registry credentials in `.env.local`

Copy `.env.local.example` to `.env.local` and set:

```bash
REGISTRY_BASE_URL=https://api.aptitude-registry.dev
REGISTRY_READ_TOKEN=your_token_id.your_token_secret
APTITUDE_OPERATOR_PASSWORD=change_me_locally
APTITUDE_SESSION_SECRET=change_me_to_a_long_random_value
```

`REGISTRY_READ_TOKEN` is server-side only. Do not expose it through `NEXT_PUBLIC_*`.
`APTITUDE_OPERATOR_PASSWORD` and `APTITUDE_SESSION_SECRET` are also server-side
only. Local development falls back to the password `aptitude-dev` and a local
session secret if those auth variables are omitted; production requires both.

`/login` is public. `/catalog`, `/skills/*`, `/audit/*`, and `/api/search` require
the operator session cookie. The catalog reads `GET /catalog/top-skills` and the
browser search API reads `POST /catalog/search`. If the registry URL, token,
response, or network is unavailable, the catalog renders an empty result set
instead of failing the whole page.

## Local Development

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Checks

```bash
bun run test
bun run typecheck
bun run build
```

`bun run lint` currently runs the same type-aware check as `typecheck`; add ESLint or Biome before treating it as a style lint gate.

## Deployment

The Vercel project uses bun install/build commands from `vercel.json`. Security headers are defined centrally in `next.config.ts`; keep route and API cache headers there instead of duplicating them in provider-specific config.

Set the same server-side registry variables in Vercel production:

```text
REGISTRY_BASE_URL=https://api.aptitude-registry.dev
REGISTRY_READ_TOKEN=<read token>
APTITUDE_OPERATOR_PASSWORD=<operator password>
APTITUDE_SESSION_SECRET=<long random session signing secret>
```
