-- A reviewer can send an approval to a fraud check instead of straight to
-- Hack Club. It waits here, with everything the approval needs, until an
-- admin says yes: only then is it sent to Airtable and the hours credited,
-- and the row stays, marked cleared, so reviewers can see it was checked.
-- Saying no puts it back in the queue, flagged.
--
-- Works for both kinds of item, keyed like review_flags: 'new' by
-- submission_queue.id, 'hc' by its Airtable record id.
-- Additive only: a new table. Nothing existing is altered or dropped.

create table if not exists fraud_checks (
  item_kind             text not null check (item_kind in ('hc', 'new')),
  item_key              text not null,
  -- who approved it, and so who it's sent and signed as once cleared
  approved_by           uuid not null references users (id) on delete cascade,
  approved_hours        numeric(6, 2) not null check (approved_hours > 0),
  tracked_hours         numeric(7, 2),
  -- 'hc' only: the Hackatime project the review is for
  hackatime_project     text,
  internal_notes        text,
  participant_feedback  text not null,
  held_at               timestamptz not null default now(),
  -- set once an admin says yes; null while it's still waiting
  cleared_by            uuid references users (id) on delete set null,
  cleared_at            timestamptz,
  -- 'new' only: the Airtable record it became once sent
  sent_as               text,
  primary key (item_kind, item_key)
);

-- in case the table was made before these columns
alter table fraud_checks add column if not exists cleared_by uuid references users (id) on delete set null;
alter table fraud_checks add column if not exists cleared_at timestamptz;
alter table fraud_checks add column if not exists sent_as text;

alter table fraud_checks enable row level security;
-- Orchard may not have Supabase's anon/authenticated roles
do $$
declare
  role_name text;
begin
  foreach role_name in array array['anon', 'authenticated']
  loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format('revoke all on fraud_checks from %I', role_name);
    end if;
  end loop;
end $$;

-- PostgREST on Orchard doesn't hear this (transaction pooler): restart it
-- after running this file so it can see the new table.
notify pgrst, 'reload schema';
