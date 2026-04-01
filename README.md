# Domicile Deck

A governed command deck for builders. One switchboard to launch tasks, run workflows, and keep the guardrails on.

Domicile Deck is a keyboard-first control surface for local development. It pairs a command wall with safety semantics (wired vs stubbed, confirm vs arm) so you can move fast without losing control.

## What it is

- Command wall for repeatable actions (wired vs stubbed)
- Project intake that turns scripts into ready-to-wire commands
- Command palette for quick search and execution
- Optional live shell for full host control (guarded)

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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

## Tech

- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- Zustand

## Status

Active build. Core UI and command execution are wired. Live shell is available behind explicit opt-in.
