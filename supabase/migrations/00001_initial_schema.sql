-- ============================================================================
-- Life Dashboard — Initial Schema
-- ============================================================================
-- Tables: profiles, diagnostics, diagnostic_responses, plans, sub_goals,
--         actions, action_checkins, journal_entries
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES
-- Extends Supabase auth.users with app-specific fields
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  has_completed_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. DIAGNOSTICS
-- Summary record per diagnostic session with final pillar scores
-- ============================================================================

-- Enum for pillar IDs
create type public.pillar_id as enum (
  'mental-health',
  'physical-wellbeing',
  'relationships',
  'spirituality',
  'finances',
  'intellectual-growth',
  'purpose'
);

create type public.diagnostic_status as enum ('in_progress', 'completed');

create table public.diagnostics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.diagnostic_status not null default 'in_progress',
  current_pillar_index smallint not null default 0, -- For resuming onboarding (0-6)
  insights text[] not null default '{}', -- AI-generated insights during onboarding
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_diagnostics_user_id on public.diagnostics(user_id);

-- ============================================================================
-- 3. PILLAR SCORES
-- Individual pillar scores for a diagnostic (0-10 scale)
-- ============================================================================
create table public.pillar_scores (
  id uuid primary key default uuid_generate_v4(),
  diagnostic_id uuid not null references public.diagnostics(id) on delete cascade,
  pillar_id public.pillar_id not null,
  score numeric(3,1) not null check (score >= 0 and score <= 10),
  created_at timestamptz not null default now(),
  unique (diagnostic_id, pillar_id)
);

create index idx_pillar_scores_diagnostic on public.pillar_scores(diagnostic_id);

-- ============================================================================
-- 4. DIAGNOSTIC RESPONSES
-- Granular responses per pillar per question (for coaching engine context)
-- ============================================================================
create type public.question_type as enum ('scale', 'multiple-choice', 'text');

create table public.diagnostic_responses (
  id uuid primary key default uuid_generate_v4(),
  diagnostic_id uuid not null references public.diagnostics(id) on delete cascade,
  pillar_id public.pillar_id not null,
  question_id text not null, -- Matches question IDs from the onboarding flow
  question_type public.question_type not null,
  response_text text, -- For text responses
  response_number numeric, -- For scale responses
  response_array text[], -- For multiple-choice responses
  created_at timestamptz not null default now()
);

create index idx_diagnostic_responses_diagnostic on public.diagnostic_responses(diagnostic_id);
create index idx_diagnostic_responses_pillar on public.diagnostic_responses(diagnostic_id, pillar_id);

-- ============================================================================
-- 5. PLANS
-- Harada plan with central goal, linked to a diagnostic
-- ============================================================================
create type public.plan_status as enum ('draft', 'confirmed');

create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  diagnostic_id uuid not null references public.diagnostics(id) on delete cascade,
  central_goal text not null,
  status public.plan_status not null default 'draft',
  coaching_rationale text, -- AI explanation of why this plan was generated
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index idx_plans_user_id on public.plans(user_id);

-- ============================================================================
-- 6. SUB-GOALS
-- 8 sub-goals per plan, one per area (maps to Open Window 64 structure)
-- ============================================================================
create table public.sub_goals (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  pillar_id public.pillar_id not null,
  title text not null,
  current_score numeric(3,1) not null check (current_score >= 0 and current_score <= 10),
  target_score numeric(3,1) not null check (target_score >= 0 and target_score <= 10),
  rationale text, -- Why this target was calibrated by the coaching engine
  position smallint not null check (position >= 1 and position <= 8), -- Position in Open Window 64
  created_at timestamptz not null default now(),
  unique (plan_id, position)
);

create index idx_sub_goals_plan on public.sub_goals(plan_id);

-- ============================================================================
-- 7. ACTIONS
-- 64 actions total (8 per sub-goal), the actionable items
-- ============================================================================
create type public.action_frequency as enum ('daily', 'weekly', 'monthly', 'quarterly');

create table public.actions (
  id uuid primary key default uuid_generate_v4(),
  sub_goal_id uuid not null references public.sub_goals(id) on delete cascade,
  title text not null,
  frequency public.action_frequency not null default 'daily',
  position smallint not null check (position >= 1 and position <= 8), -- Position within sub-goal
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sub_goal_id, position)
);

create index idx_actions_sub_goal on public.actions(sub_goal_id);

-- ============================================================================
-- 8. ACTION CHECK-INS
-- Tracks completion of actions across different periods
-- ============================================================================
create table public.action_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_id uuid not null references public.actions(id) on delete cascade,
  completed boolean not null default false,
  period_type public.action_frequency not null, -- daily/weekly/monthly/quarterly
  period_start date not null, -- Start date of the period this check-in belongs to
  checked_at timestamptz, -- When the user checked/unchecked
  created_at timestamptz not null default now(),
  unique (user_id, action_id, period_type, period_start)
);

create index idx_action_checkins_user_date on public.action_checkins(user_id, period_start);
create index idx_action_checkins_action on public.action_checkins(action_id);

-- ============================================================================
-- 9. JOURNAL ENTRIES
-- Daily reflections
-- ============================================================================
create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index idx_journal_entries_user_date on public.journal_entries(user_id, date);

-- ============================================================================
-- 10. UPDATED_AT TRIGGER
-- Auto-update updated_at timestamp on row changes
-- ============================================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.update_updated_at();

-- ============================================================================
-- 11. ROW LEVEL SECURITY
-- Each user can only access their own data
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.diagnostics enable row level security;
alter table public.pillar_scores enable row level security;
alter table public.diagnostic_responses enable row level security;
alter table public.plans enable row level security;
alter table public.sub_goals enable row level security;
alter table public.actions enable row level security;
alter table public.action_checkins enable row level security;
alter table public.journal_entries enable row level security;

-- PROFILES: Users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- DIAGNOSTICS: Users can CRUD their own diagnostics
create policy "Users can view own diagnostics"
  on public.diagnostics for select
  using (auth.uid() = user_id);

create policy "Users can create own diagnostics"
  on public.diagnostics for insert
  with check (auth.uid() = user_id);

create policy "Users can update own diagnostics"
  on public.diagnostics for update
  using (auth.uid() = user_id);

-- PILLAR SCORES: Users can CRUD scores for their own diagnostics
create policy "Users can view own pillar scores"
  on public.pillar_scores for select
  using (
    exists (
      select 1 from public.diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Users can create own pillar scores"
  on public.pillar_scores for insert
  with check (
    exists (
      select 1 from public.diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Users can update own pillar scores"
  on public.pillar_scores for update
  using (
    exists (
      select 1 from public.diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

-- DIAGNOSTIC RESPONSES: Users can CRUD responses for their own diagnostics
create policy "Users can view own diagnostic responses"
  on public.diagnostic_responses for select
  using (
    exists (
      select 1 from public.diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Users can create own diagnostic responses"
  on public.diagnostic_responses for insert
  with check (
    exists (
      select 1 from public.diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

-- PLANS: Users can CRUD their own plans
create policy "Users can view own plans"
  on public.plans for select
  using (auth.uid() = user_id);

create policy "Users can create own plans"
  on public.plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on public.plans for update
  using (auth.uid() = user_id);

-- SUB-GOALS: Users can view/create/update sub-goals for their own plans
create policy "Users can view own sub-goals"
  on public.sub_goals for select
  using (
    exists (
      select 1 from public.plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

create policy "Users can create own sub-goals"
  on public.sub_goals for insert
  with check (
    exists (
      select 1 from public.plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

create policy "Users can update own sub-goals"
  on public.sub_goals for update
  using (
    exists (
      select 1 from public.plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

-- ACTIONS: Users can view/create/update actions for their own sub-goals
create policy "Users can view own actions"
  on public.actions for select
  using (
    exists (
      select 1 from public.sub_goals sg
      join public.plans p on p.id = sg.plan_id
      where sg.id = sub_goal_id and p.user_id = auth.uid()
    )
  );

create policy "Users can create own actions"
  on public.actions for insert
  with check (
    exists (
      select 1 from public.sub_goals sg
      join public.plans p on p.id = sg.plan_id
      where sg.id = sub_goal_id and p.user_id = auth.uid()
    )
  );

create policy "Users can update own actions"
  on public.actions for update
  using (
    exists (
      select 1 from public.sub_goals sg
      join public.plans p on p.id = sg.plan_id
      where sg.id = sub_goal_id and p.user_id = auth.uid()
    )
  );

-- ACTION CHECK-INS: Users can CRUD their own check-ins
create policy "Users can view own action checkins"
  on public.action_checkins for select
  using (auth.uid() = user_id);

create policy "Users can create own action checkins"
  on public.action_checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own action checkins"
  on public.action_checkins for update
  using (auth.uid() = user_id);

-- JOURNAL ENTRIES: Users can CRUD their own entries
create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can create own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);
