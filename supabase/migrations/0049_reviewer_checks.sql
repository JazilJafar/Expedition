-- Some reviewers' approvals get checked by an admin before they count. For
-- them, approving doesn't send anything: it waits in approval_checks, with
-- everything the approval needs, until an admin says yes. Only then is it
-- sent to Airtable and the hours credited. Sending it back puts it in the
-- queue again. Set per reviewer on the admin page.
--
-- Keyed like review_flags: 'new' by submission_queue.id, 'hc' by its Airtable
-- record id.
-- Additive only: a new column and a new table.

alter table users add column if not exists review_needs_check boolean not null default false;

create table if not exists approval_checks (
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
  primary key (item_kind, item_key)
);

alter table approval_checks enable row level security;

-- Orchard may not have Supabase's anon/authenticated roles
do $$
declare
  role_name text;
begin
  foreach role_name in array array['anon', 'authenticated']
  loop
    if exists (select 1 from pg_roles where rolname = role_name) then
      execute format('revoke all on approval_checks from %I', role_name);
    end if;
  end loop;
end $$;

-- PostgREST on Orchard doesn't hear this (transaction pooler): restart it
-- after running this file so it can see the new column and table.
notify pgrst, 'reload schema';
