-- ─────────────────────────────────────────────────────────────────────────────
-- Domicile Deck — initial Supabase schema
--
-- Run this once against your Supabase project via the SQL Editor or
-- the Supabase CLI (`supabase db push`).
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable the uuid-ossp extension for uuid_generate_v4()
create extension if not exists "uuid-ossp";

-- ─── users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default uuid_generate_v4(),
  email       text unique not null,
  name        text,
  role        text not null default 'viewer'
                check (role in ('admin', 'operator', 'viewer')),
  created_at  timestamptz not null default now()
);

-- ─── projects ────────────────────────────────────────────────────────────────
create table if not exists projects (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  status          text not null default 'idle'
                    check (status in ('active', 'idle', 'error', 'deploying')),
  git_branch      text,
  git_remote      text,
  deployment_url  text,
  local_path      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── commands ────────────────────────────────────────────────────────────────
create table if not exists commands (
  id                    text primary key,
  name                  text not null,
  description           text,
  category              text not null,
  command               text not null,
  icon                  text,
  shortcut              text,
  status                text default 'stub'
                          check (status in ('wired', 'stub')),
  dangerous             boolean not null default false,
  requires_confirmation boolean not null default false,
  params                jsonb,
  created_at            timestamptz not null default now()
);

-- ─── runs ────────────────────────────────────────────────────────────────────
create table if not exists runs (
  id            text primary key,
  command_id    text not null references commands(id) on delete cascade,
  mode          text not null default 'live'
                  check (mode in ('dry-run', 'guarded', 'live')),
  status        text not null default 'queued'
                  check (status in ('queued', 'running', 'completed', 'failed')),
  output        text not null default '',
  stderr        text not null default '',
  exit_code     integer,
  executed_by   text not null default 'anonymous',
  executed_at   timestamptz not null default now(),
  completed_at  timestamptz
);

-- ─── settings ────────────────────────────────────────────────────────────────
create table if not exists settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ─── indexes ─────────────────────────────────────────────────────────────────
create index if not exists runs_command_id_idx  on runs(command_id);
create index if not exists runs_executed_at_idx on runs(executed_at desc);
create index if not exists runs_status_idx      on runs(status);

-- ─── Row-Level Security (RLS) ─────────────────────────────────────────────────
-- Enable RLS on all tables and add permissive service-role policies.
-- Tighten these with user-specific policies when Supabase Auth is fully wired.

alter table users    enable row level security;
alter table projects enable row level security;
alter table commands enable row level security;
alter table runs     enable row level security;
alter table settings enable row level security;

-- Service role bypass (used by the Next.js server with SUPABASE_SERVICE_ROLE_KEY)
create policy "service role full access on users"
  on users for all using (true) with check (true);

create policy "service role full access on projects"
  on projects for all using (true) with check (true);

create policy "service role full access on commands"
  on commands for all using (true) with check (true);

create policy "service role full access on runs"
  on runs for all using (true) with check (true);

create policy "service role full access on settings"
  on settings for all using (true) with check (true);
