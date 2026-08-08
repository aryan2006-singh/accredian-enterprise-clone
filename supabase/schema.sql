-- Run this once against your Supabase project (SQL Editor, or `supabase db execute -f supabase/schema.sql`).

create extension if not exists pgcrypto;

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  domain text not null,
  candidates_count integer,
  delivery_mode text not null,
  location text,
  created_at timestamptz not null default now()
);

-- Row Level Security is enabled with no policies, so the anon/authenticated
-- API roles have zero access to this table. Only the server-side
-- service-role key (used in lib/supabase/serverClient.ts) can read/write it.
alter table enquiries enable row level security;
