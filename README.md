# Domicile Deck

A governed command deck for builders. One switchboard to launch tasks, run workflows, and keep the guardrails on.

Domicile Deck is a keyboard-first control surface for local development. It pairs a command wall with safety semantics (wired vs stubbed, confirm vs arm) so you can move fast without losing control.

## What it is

- Command wall for repeatable actions (wired vs stubbed)
- Project intake that turns scripts into ready-to-wire commands
- Command palette for quick search and execution
- Role-based command execution with dry-run, guarded, and live modes
- Optional live shell for full host control (guarded)

## Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in NEXTAUTH_SECRET at minimum
npm run dev
```

Open `http://localhost:3000`.

## Authentication

Domicile Deck uses [NextAuth](https://next-auth.js.org/) to gate command execution.

### Default local users

| Email | Role | Environment variable for password |
|-------|------|------------------------------------|
| `admin@domiciledeck.local` | `admin` | `ADMIN_PASSWORD` |
| `operator@domiciledeck.local` | `operator` | `OPERATOR_PASSWORD` |

Sign in at `/auth/signin`.

### GitHub OAuth (optional)

Set `GITHUB_ID` and `GITHUB_SECRET` in `.env.local` to enable GitHub sign-in. GitHub users are granted the `viewer` role by default; promote them in the users table.

## Execution modes

Every command run accepts a `mode` field:

| Mode | Behaviour |
|------|-----------|
| `dry-run` | Validates the command and returns the full command string without executing it. No side effects. |
| `guarded` | Requires `confirm` / `armed` flags just like `live`; useful for staging destructive operations. |
| `live` | Full execution via Node.js child process (default). |

Example request:

```bash
curl -X POST http://localhost:3000/api/commands/run \
  -H 'Content-Type: application/json' \
  -d '{"commandId":"git-status","mode":"dry-run"}'
```

## Role-based permissions

| Role | Can execute | Can run dangerous commands |
|------|-------------|---------------------------|
| `admin` | ✅ | ✅ |
| `operator` | ✅ | ❌ |
| `viewer` | ❌ | ❌ |

## Rate limits

| Tier | Operations | Window | Max requests |
|------|-----------|--------|--------------|
| `standard` | Normal commands | 60 s | 30 |
| `strict` | Dangerous commands | 60 s | 5 |

## Persistent storage (Supabase)

The app stores run history in Supabase when configured, and falls back to an in-memory store otherwise.

### Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` against your project via the Supabase SQL editor or `supabase db push`.
3. Set the three Supabase env vars in `.env.local` (see table below).

## Live shell (optional)

Run the terminal server in a separate terminal:

```bash
TERMINAL_PORT=3211 TERMINAL_ALLOWED_ROOTS=/Users/joewales,/Users/joewales/NODE_OUT_Master npm run terminal:server
```

Set an auth token if you want a shared secret:

```bash
TERMINAL_AUTH_TOKEN=your_token npm run terminal:server
```

## Terminal server contract

The optional WebSocket terminal server (`server/terminal-server.js`) exposes a full PTY session over an authenticated WebSocket connection.

| Item | Default | Notes |
|------|---------|-------|
| Port | `3211` | Set via `TERMINAL_PORT` |
| Auth token | _(none)_ | Set `TERMINAL_AUTH_TOKEN`; if set the client must send `{"type":"auth","token":"<value>"}` as the first message |
| Allowed roots | _(any)_ | Comma-separated absolute paths in `TERMINAL_ALLOWED_ROOTS`; the server rejects `cd` attempts outside these roots |
| Protocol | WebSocket (`ws://`) | The front-end terminal page connects to `ws://localhost:<TERMINAL_PORT>` |

**Security reminders**
- Treat the terminal server like SSH — keep it off the public internet.
- Always set `TERMINAL_AUTH_TOKEN` and `TERMINAL_ALLOWED_ROOTS` in shared or multi-user environments.
- Bind the server to `127.0.0.1` only (default) and never expose it via a reverse proxy without additional auth.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in values.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXTAUTH_SECRET` | **Yes** | — | Secret used to sign JWTs; generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes in prod | `http://localhost:3000` | Canonical URL of the app |
| `ADMIN_PASSWORD` | No | `change-me-admin` | Password for the built-in admin user |
| `OPERATOR_PASSWORD` | No | `change-me-operator` | Password for the built-in operator user |
| `GITHUB_ID` | No | — | GitHub OAuth app client ID |
| `GITHUB_SECRET` | No | — | GitHub OAuth app client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | No | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | — | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service-role key (server only) |
| `NEXT_PUBLIC_APP_NAME` | No | `Domicile Deck` | Display name used in the UI |
| `TERMINAL_PORT` | No | `3211` | Port the terminal server listens on |
| `TERMINAL_ALLOWED_ROOTS` | Recommended | _(any)_ | Comma-separated absolute paths the shell may access |
| `TERMINAL_AUTH_TOKEN` | Recommended | _(none)_ | Shared secret required to connect to the terminal server |
| `OPENAI_API_KEY` | No | — | OpenAI key (reserved for future AI-assisted commands) |
| `VERCEL_ANALYTICS_ID` | No | — | Vercel Analytics project ID |

## Deployment

Vercel (manual deploy):

```bash
vercel --prod
```

## Safety notes

- The live shell is powerful. Treat it like SSH access.
- Keep it private, require a token, and restrict allowed roots.
- Use wired commands for reproducible actions and auditability.
- Change the default `ADMIN_PASSWORD` and `OPERATOR_PASSWORD` before any shared deployment.

## Tech

- Next.js 14 (App Router)
- NextAuth v4
- Supabase (optional persistence)
- Tailwind CSS
- Framer Motion
- Zustand

## Status

Active build. Core UI, command execution, auth, and run persistence are wired. Live shell is available behind explicit opt-in.
