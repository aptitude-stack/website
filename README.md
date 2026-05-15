# Aptitude Registry Website

Public catalog UI for browsing governed Aptitude skills from the registry API.

## Requirements

- Bun
- Node.js compatible with the pinned Next.js version
- Server-side registry credentials in `.env.local`

Copy `.env.local.example` to `.env.local` and set:

```bash
REGISTRY_BASE_URL=https://api.aptitude-registry.dev
REGISTRY_READ_TOKEN=your_token_id.your_token_secret
```

`REGISTRY_READ_TOKEN` is server-side only. Do not expose it through `NEXT_PUBLIC_*`.

The homepage reads `GET /catalog/top-skills` and the browser search API reads
`POST /catalog/search`. If the registry URL, token, response, or network is
unavailable, the homepage renders an empty catalog instead of failing the whole
page.

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
```
