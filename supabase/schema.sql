create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  submission_id uuid not null unique,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null unique,
  email text not null unique,
  school text not null,
  year text not null,
  source text not null,
  expectation text not null,
  join_future text not null,
  note text not null default '',
  extra_answers jsonb not null default '{}'::jsonb,
  ip_hash text not null,
  user_agent text not null default ''
);

alter table public.registrations enable row level security;
revoke all on public.registrations from anon, authenticated;
-- No public RLS policies on purpose. Only server-side service role can access submissions.

create table if not exists public.registration_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  hit_count integer not null default 0
);
alter table public.registration_rate_limits enable row level security;
revoke all on public.registration_rate_limits from anon, authenticated;

create or replace function public.check_registration_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.registration_rate_limits%rowtype;
begin
  insert into public.registration_rate_limits(ip_hash, window_started_at, hit_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    window_started_at = case when registration_rate_limits.window_started_at < now() - interval '10 minutes' then now() else registration_rate_limits.window_started_at end,
    hit_count = case when registration_rate_limits.window_started_at < now() - interval '10 minutes' then 1 else registration_rate_limits.hit_count + 1 end
  returning * into rec;
  return rec.hit_count <= 5;
end;
$$;
revoke all on function public.check_registration_rate_limit(text) from public, anon, authenticated;

grant execute on function public.check_registration_rate_limit(text) to service_role;
