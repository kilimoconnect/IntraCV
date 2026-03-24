-- =============================================
-- IntraCV Database Schema
-- Run this in your Supabase SQL Editor
-- Each CV section has its own table
-- =============================================

create extension if not exists "uuid-ossp";

-- ─── PROFILES (auth user metadata) ───
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CV PERSONAL INFO ───
create table public.cv_personal_info (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text,
  email text,
  phone text,
  location text,
  headline text,
  linkedin text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ─── CV SUMMARY ───
create table public.cv_summary (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ─── CV EXPERIENCES ───
create table public.cv_experiences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  company text,
  location text default '',
  start_date text,
  end_date text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── CV EDUCATION ───
create table public.cv_education (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  degree text not null,
  institution text,
  year text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── CV SKILLS ───
create table public.cv_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV CERTIFICATIONS ───
create table public.cv_certifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  issuer text,
  year text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV LANGUAGES ───
create table public.cv_languages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  proficiency text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV REFEREES ───
create table public.cv_referees (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  title text,
  company text,
  phone text,
  email text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV AREAS OF EXPERTISE ───
create table public.cv_areas_of_expertise (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV MEMBERSHIPS ───
create table public.cv_memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV KEY ACHIEVEMENTS ───
create table public.cv_key_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV PROJECTS ───
create table public.cv_projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  tech text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV BOARD / LEADERSHIP ROLES ───
create table public.cv_board_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  organization text,
  start_date text,
  end_date text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV EXECUTIVE TRAINING ───
create table public.cv_executive_training (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  institution text,
  year text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV PUBLICATIONS / SPEAKING ───
create table public.cv_publications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  publisher text,
  year text,
  type text default 'publication',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV TOOLS / SOFTWARE ───
create table public.cv_tools (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV VOLUNTEER EXPERIENCE ───
create table public.cv_volunteer (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV INTERESTS ───
create table public.cv_interests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV INTERNSHIPS ───
create table public.cv_internships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  company text,
  location text default '',
  start_date text,
  end_date text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV DECLARATIONS ───
create table public.cv_declarations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  declaration text,
  place text,
  date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ─── ROW LEVEL SECURITY ───

alter table public.profiles enable row level security;
alter table public.cv_personal_info enable row level security;
alter table public.cv_summary enable row level security;
alter table public.cv_experiences enable row level security;
alter table public.cv_education enable row level security;
alter table public.cv_skills enable row level security;
alter table public.cv_certifications enable row level security;
alter table public.cv_languages enable row level security;
alter table public.cv_referees enable row level security;
alter table public.cv_areas_of_expertise enable row level security;
alter table public.cv_memberships enable row level security;
alter table public.cv_key_achievements enable row level security;
alter table public.cv_projects enable row level security;
alter table public.cv_board_roles enable row level security;
alter table public.cv_executive_training enable row level security;
alter table public.cv_publications enable row level security;
alter table public.cv_tools enable row level security;
alter table public.cv_volunteer enable row level security;
alter table public.cv_interests enable row level security;
alter table public.cv_internships enable row level security;
alter table public.cv_declarations enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- CV Personal Info
create policy "Users can manage own personal info" on public.cv_personal_info
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Summary
create policy "Users can manage own summary" on public.cv_summary
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Experiences
create policy "Users can manage own experiences" on public.cv_experiences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Education
create policy "Users can manage own education" on public.cv_education
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Skills
create policy "Users can manage own skills" on public.cv_skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Certifications
create policy "Users can manage own certifications" on public.cv_certifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Languages
create policy "Users can manage own languages" on public.cv_languages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Referees
create policy "Users can manage own referees" on public.cv_referees
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Areas of Expertise
create policy "Users can manage own areas of expertise" on public.cv_areas_of_expertise
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Memberships
create policy "Users can manage own memberships" on public.cv_memberships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Key Achievements
create policy "Users can manage own achievements" on public.cv_key_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Projects
create policy "Users can manage own projects" on public.cv_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Board Roles
create policy "Users can manage own board roles" on public.cv_board_roles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Executive Training
create policy "Users can manage own executive training" on public.cv_executive_training
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Publications
create policy "Users can manage own publications" on public.cv_publications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Tools
create policy "Users can manage own tools" on public.cv_tools
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Volunteer
create policy "Users can manage own volunteer" on public.cv_volunteer
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Interests
create policy "Users can manage own interests" on public.cv_interests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Internships
create policy "Users can manage own internships" on public.cv_internships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CV Declarations
create policy "Users can manage own declarations" on public.cv_declarations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- JOB APPLICATIONS / TRACKER
-- ═══════════════════════════════════════════════
create table if not exists public.job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null default '',
  position text not null default '',
  location text default '',
  job_url text default '',
  salary_range text default '',
  status text not null default 'wishlist' check (status in ('wishlist','applied','interview','offer','rejected','accepted')),
  applied_date date,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.job_applications enable row level security;
create policy "Users can manage own job applications" on public.job_applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- SAVED CV (one per user — auto-generated on first visit)
-- ═══════════════════════════════════════════════
create table if not exists public.saved_cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  cv_data jsonb not null default '{}'::jsonb,
  style_id text not null default 'corporate',
  layout_type text not null default 'sidebar-left',
  template_type text not null default 'two-page',
  target_role text default '',
  job_description text default '',
  source_data_hash text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.saved_cvs enable row level security;
create policy "Users can manage own saved cv" on public.saved_cvs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- GENERATED DOCUMENTS (CVs, Cover Letters)
-- ═══════════════════════════════════════════════
create table if not exists public.generated_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  doc_type text not null default 'cv' check (doc_type in ('cv','cover_letter')),
  title text not null default '',
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.generated_documents enable row level security;
create policy "Users can manage own documents" on public.generated_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- AI CAREER ASSISTANT CHAT HISTORY
-- ═══════════════════════════════════════════════
create table if not exists public.ai_chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);
alter table public.ai_chat_history enable row level security;
create policy "Users can manage own chat history" on public.ai_chat_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
