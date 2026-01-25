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
