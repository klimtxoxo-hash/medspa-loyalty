// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// The slug identifies which medspa this deployment is for.
// Set via REACT_APP_PRACTICE_SLUG in Vercel environment variables.
export const PRACTICE_SLUG = process.env.REACT_APP_PRACTICE_SLUG || 'demo';

// ================================================================
// MULTI-TENANT DATABASE SETUP SQL
// ================================================================
// Run this ONCE in Supabase SQL Editor for your entire platform.
// You never need to run it again for new clients — just add a new
// row to the "practices" table.
// ================================================================

/*

-- 1. PRACTICES TABLE
-- One row per medspa client
create table practices (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Insert your demo/test practice
insert into practices (slug, name) values ('demo', 'Demo Medspa');

-- 2. PATIENTS TABLE
create table patients (
  id uuid references auth.users on delete cascade primary key,
  practice_id uuid references practices(id) on delete cascade not null,
  email text not null,
  full_name text,
  phone text,
  points integer default 0,
  tier text default 'Pearl',
  total_visits integer default 0,
  joined_at timestamp with time zone default now()
);

-- Auto-update tier based on points
create or replace function update_tier()
returns trigger as $$
begin
  if new.points >= 2500 then new.tier := 'Gold';
  elsif new.points >= 1000 then new.tier := 'Silver';
  else new.tier := 'Pearl';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tier_updater
  before insert or update on patients
  for each row execute function update_tier();

-- 3. STAFF TABLE
create table staff (
  id uuid references auth.users on delete cascade primary key,
  practice_id uuid references practices(id) on delete cascade,
  email text not null,
  full_name text,
  role text default 'staff' -- 'staff' | 'superadmin'
);

-- 4. POINT TRANSACTIONS TABLE
create table point_transactions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade,
  practice_id uuid references practices(id) on delete cascade,
  type text not null check (type in ('earn', 'redeem')),
  amount integer not null,
  reason text not null,
  created_by text default 'system',
  created_at timestamp with time zone default now()
);

-- 5. ROW LEVEL SECURITY
alter table practices enable row level security;
alter table patients enable row level security;
alter table staff enable row level security;
alter table point_transactions enable row level security;

-- Patients see only their own record
create policy "Patients see own record"
  on patients for select using (auth.uid() = id);

-- Patients see only their own transactions
create policy "Patients see own transactions"
  on point_transactions for select using (auth.uid() = patient_id);

-- Staff see patients in their practice only
create policy "Staff see practice patients"
  on patients for all using (
    exists (
      select 1 from staff
      where id = auth.uid()
      and (practice_id = patients.practice_id or role = 'superadmin')
    )
  );

-- Staff see transactions in their practice only
create policy "Staff see practice transactions"
  on point_transactions for all using (
    exists (
      select 1 from staff
      where id = auth.uid()
      and (practice_id = point_transactions.practice_id or role = 'superadmin')
    )
  );

-- Staff see their own record
create policy "Staff see own record"
  on staff for select using (auth.uid() = id);

-- Superadmin sees all practices
create policy "Superadmin sees all practices"
  on practices for select using (
    exists (select 1 from staff where id = auth.uid())
  );

-- 6. AUTO-CREATE PATIENT PROFILE ON SIGNUP
-- practice_id is passed through user metadata during signup
create or replace function handle_new_user()
returns trigger as $$
declare
  v_practice_id uuid;
  v_slug text;
begin
  -- Only create patient profile if not a staff member
  if exists (select 1 from staff where id = new.id) then
    return new;
  end if;

  -- Get practice_id from metadata slug
  v_slug := new.raw_user_meta_data->>'practice_slug';
  if v_slug is not null then
    select id into v_practice_id from practices where slug = v_slug;
  end if;

  if v_practice_id is not null then
    insert into patients (id, practice_id, email, full_name)
    values (
      new.id,
      v_practice_id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', '')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 7. ADD YOURSELF AS SUPERADMIN
-- Run this after creating your account, replacing your email:
--
-- insert into staff (id, email, full_name, role, practice_id)
-- select id, email, 'Khy Norris', 'superadmin', null
-- from auth.users where email = 'klimtxoxo@gmail.com';
--
-- Then for each client's staff member:
-- insert into staff (id, email, full_name, role, practice_id)
-- select u.id, u.email, 'Staff Name', 'staff', p.id
-- from auth.users u, practices p
-- where u.email = 'staff@clientmedspa.com'
-- and p.slug = 'clientslug';

*/
