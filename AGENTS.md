# AGENTS.md

## Project Overview

**AlternativeProto** — a community-curated catalog of applications built on the AT Protocol. Users can browse projects, filter/search, view details, sign in via ATProto OAuth, leave reviews, submit new projects, vote, and claim/attest ownership of projects. Submissions are indexed from the ATProto firehose via Jetstream and stored in a Postgres database.

## Tech Stack

- **Framework**: SvelteKit 2 (Svelte 5 with runes)
- **Adapter**: `@sveltejs/adapter-static` — builds as a client-side SPA (SSR disabled)
- **Language**: TypeScript (strict mode)
- **Bundler**: Vite 7
- **Icons**: `lucide-svelte` (component imports, no icon utility helpers)
- **ATProto**: `@atcute/oauth-browser-client`, `@atcute/client`, `@atcute/identity-resolver`
- **Database**: PostgreSQL via `postgres` (postgresjs)
- **Labeler**: `@skyware/labeler`
- **Formatting**: Prettier

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server on `127.0.0.1:5173` (required for ATProto OAuth). Also starts Jetstream consumer + labeler. |
| `npm run build` | Production build → `build/` |
| `npm run preview` | Preview production build |
| `npm run check` | Run `svelte-check` for type/lint diagnostics |
| `npm run format` | Format with Prettier |
| `npm run serve` | Production server (`scripts/serve.ts`): static files + API + labeler + Jetstream |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection URL (e.g. `postgresql://user:pass@host:5432/dbname`) |
| `JETSTREAM_URL` | Jetstream WebSocket endpoint (e.g. `wss://jetstream1.us-east.bsky.network`) |
| `LABELER_DID` | DID of the labeler account (optional, enables labeler) |
| `SIGNING_KEY` | Labeler signing key (required if `LABELER_DID` is set) |
| `ADMIN_DID` | DID of the admin account whose upvotes apply `alternativeproto-verified` labels |
| `PORT` | Production server port (default: `3000`) |
| `LABELER_PORT` | Labeler port (default: `14831`) |

In development, variables are loaded from `.env` via Vite's `loadEnv`. In production, they must be set in the environment.

## Project Structure

```
src/
├── app.html              # HTML shell (%sveltekit.head%, %sveltekit.body%)
├── app.d.ts              # SvelteKit type declarations
├── style.css             # Global styles (imported in +layout.svelte)
├── lib/
│   ├── types.ts          # Shared types (Submission, SubmissionRecord, SubmissionData, Review, AuthType)
│   ├── data.ts           # Static project catalog (reference only, not displayed)
│   ├── api.ts            # Client-side API: fetch submissions from backend, create reviews/votes/submissions via PDS
│   ├── auth/
│   │   └── oauth.ts      # ATProto OAuth: init, login, logout, session restore, identity resolver
│   ├── stores/
│   │   └── session.ts    # Svelte writable store for SessionInfo
│   └── components/
│       ├── AuthButton.svelte     # Sign in/out button + login modal
│       ├── ProjectCard.svelte    # Card for project list grid (with claim + verified badge)
│       ├── ProjectDetail.svelte  # Full project detail view with review section (with claim + verified badge)
│       ├── ReviewForm.svelte     # Star rating + text review form (ATProto record creation)
│       ├── SearchBar.svelte      # Search input + tag/alternative/open-source filters
│       └── SubmitForm.svelte     # Modal form for submitting new projects (with icon upload)
└── routes/
    ├── +layout.ts                # ssr=false, prerender=false (SPA mode)
    ├── +layout.svelte            # App shell: header, footer, OAuth init, auth state, backfill trigger
    ├── +page.svelte              # Home: project list with filtering (fetches from /api/submissions)
    ├── oauth/callback/
    │   └── +page.svelte          # OAuth redirect target (handled by layout)
    └── project/[...path]/
        ├── +page.ts              # Load function: parses DID/rkey from path
        └── +page.svelte          # Project detail page

scripts/
├── db.ts                 # Postgres module: schema, CRUD, PDS/identity resolution, backfill, deduplication
├── jetstream.ts          # Jetstream WebSocket consumer: indexes submissions from firehose
├── serve.ts              # Production server: static files + API routes + labeler proxy + Jetstream
├── labeler-util.ts       # Shared labeler startup (used by both Vite plugin and serve.ts)
└── download-icon.ts      # Utility: download + normalize icons to static/icons/ (uses sharp)

static/                   # Static assets (served at /)
├── oauth-client-metadata.json    # OAuth client metadata for production
└── icons/                        # Project icon PNGs (128x128)

lexicons/
├── net/alternativeproto/
├──── review.json         # ATProto lexicon: user reviews
├──── submission.json     # ATProto lexicon: project submissions
└──── vote.json           # ATProto lexicon: up/down votes
```

## Key Architecture Decisions

- **SPA mode**: SSR is disabled (`ssr = false` in root layout). The app runs entirely client-side to keep ATProto OAuth in the browser, which is respectful of the user's control over their account.
- **Static adapter with fallback**: `adapter-static` is configured with `fallback: "index.html"` so all routes are handled client-side.
- **Backend API**: The production server (`scripts/serve.ts`) and Vite dev plugin serve `/api/submissions` and `/api/submissions/:did/:rkey` endpoints backed by Postgres. The frontend fetches from these instead of directly from PDS.
- **Jetstream indexing**: A WebSocket consumer (`scripts/jetstream.ts`) subscribes to the ATProto firehose via Jetstream, filtering for `net.alternativeproto.submission` records. Creates, updates, and deletes are reflected in the database. Cursor is persisted for resumable consumption.
- **Backfill on login**: When a user signs in (OAuth callback or session restore), the frontend fires a `POST /api/backfill` with their DID. The backend fetches all their submissions from their PDS and indexes them. Rate-limited to once per hour per DID.
- **Attestation / Claim**: Service operators can "claim" a submission if their handle matches the submission URL hostname. Claiming copies the record to the claimant's PDS. The backend deduplicates by URL, preferring the attested version. Attested submissions show a verified badge with the handle.
- **OAuth flow**: Initialized once in `+layout.svelte`'s `onMount`. The callback route (`/oauth/callback/`) is detected by the layout, which finalizes auth and redirects to `/`.
- **Dev server uses `127.0.0.1`**: Required by RFC 8252 for ATProto OAuth loopback clients. The dev `client_id` is constructed dynamically in `oauth.ts`.
- **Review/vote/submission storage**: ATProto records stored in the user's own PDS repository via `com.atproto.repo.createRecord`. The client uses the authenticated `@atcute/client` for writes.
- **Identity resolution**: DIDs are resolved server-side (PLC directory / did:web) to extract both PDS endpoint and handle. Handles are stored alongside submissions for attestation matching.
- **Svelte 5 runes**: Components use `$props()`, `$state()`, `$derived()`. The `session` store is a Svelte writable accessed with `$session` in components.

## Conventions

- Imports from `src/lib/` use the `$lib` alias (e.g., `import { projects } from "$lib/data"`)
- Components accept typed props via `$props()` destructuring
- Icons are imported directly from `lucide-svelte` as components (e.g., `<ArrowLeft size={18} />`)
- CSS is global in `src/style.css`, using CSS custom properties for theming (dark theme)
- The `SearchBar` component exports its `SearchFilters` type for parent consumption

## Conventions

- Imports from `src/lib/` use the `$lib` alias (e.g., `import { projects } from "$lib/data"`)
- Components accept typed props via `$props()` destructuring
- Icons are imported directly from `lucide-svelte` as components (e.g., `<ArrowLeft size={18} />`)
- CSS is global in `src/style.css`, using CSS custom properties for theming (dark theme)
- The `SearchBar` component exports its `SearchFilters` type for parent consumption

## Quality Gate

**`npm run check` must report 0 errors and 0 warnings before a task is considered finished.** After making any changes to `.svelte`, `.ts`, or `.js` files, run `npm run check` and resolve all diagnostics. Common Svelte 5 pitfalls to watch for:
- Use `$derived()` instead of `const` for values derived from `$props()` — otherwise they only capture the initial prop value (`state_referenced_locally`)
- Elements with interactive ARIA roles (`dialog`, `radiogroup`, etc.) must be focusable — add `tabindex="-1"` rather than suppressing with `svelte-ignore` (`a11y_interactive_supports_focus`)
