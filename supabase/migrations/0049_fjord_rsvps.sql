-- RSVPs for Fjord It, a separate in-person hackathon.
-- Additive only: one new table. Nothing existing is altered or dropped.
--
-- One row per Expedition user. A second RSVP for the same user does nothing.
-- The app writes the name and email already stored from Hack Club Auth.
-- RLS is on with no policies, same as every other table. The PostgREST role
-- bypasses it. Anonymous requests never reach Postgres.

create table fjord_rsvps (
  user_id    uuid primary key references users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 80),
  email      text not null check (
               email = lower(email)
               and char_length(email) <= 320
               and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
             ),
  created_at timestamptz not null default now()
);

create index fjord_rsvps_created_idx on fjord_rsvps (created_at desc);

alter table fjord_rsvps enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on fjord_rsvps from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on fjord_rsvps from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'expedition') then
    execute 'grant all on fjord_rsvps to expedition';
  end if;
end $$;

-- Harmless if PostgREST is not listening. On Orchard, restart PostgREST
-- after applying this file so it reloads the schema.
notify pgrst, 'reload schema';
