-- ============================================================
-- «حاضِر» — مخطط قاعدة البيانات (Postgres / Supabase)
-- كل جدول (عدا organizations) يحمل org_id والعزل مفروض عبر RLS (الملف 0002).
-- ============================================================

create extension if not exists "pgcrypto";

-- أنواع
do $$ begin
  create type org_type as enum ('summer_center','school','university','company','training_center','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('owner','supervisor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status as enum ('early','normal','late','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rejected_reason as enum ('out_of_range','out_of_time');
exception when duplicate_object then null; end $$;

-- ===== organizations =====
create table if not exists organizations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         org_type not null default 'other',
  slug         text not null unique,
  logo_url     text,
  timezone     text not null default 'Asia/Riyadh',
  geo_required boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ===== admins / memberships =====
-- id يساوي auth.users.id (مستخدم Supabase Auth)
create table if not exists admins (
  id       uuid primary key references auth.users(id) on delete cascade,
  org_id   uuid not null references organizations(id) on delete cascade,
  email    text not null,
  role     admin_role not null default 'owner',
  created_at timestamptz not null default now()
);
create index if not exists admins_org_idx on admins(org_id);

-- ===== locations =====
create table if not exists locations (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references organizations(id) on delete cascade,
  name      text not null,
  lat       double precision not null,
  lng       double precision not null,
  radius_m  integer not null default 80 check (radius_m between 20 and 300),
  is_active boolean not null default true
);
create index if not exists locations_org_idx on locations(org_id);

-- ===== time_windows =====
create table if not exists time_windows (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  early_start time not null default '06:30',
  early_end   time not null default '07:00',
  normal_end  time not null default '07:20',
  late_end    time not null default '07:45',
  close_time  time not null default '08:00',
  active_days integer[] not null default '{0,1,2,3,4}'
);
create unique index if not exists time_windows_org_uidx on time_windows(org_id);

-- ===== point_rules =====
create table if not exists point_rules (
  org_id        uuid primary key references organizations(id) on delete cascade,
  points_early  integer not null default 10,
  points_normal integer not null default 6,
  points_late   integer not null default 2
);

-- ===== students =====
create table if not exists students (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  name         text not null,
  group_name   text not null default '',
  total_points integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists students_org_idx on students(org_id);

-- ===== attendance_records =====
create table if not exists attendance_records (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  student_id      uuid not null references students(id) on delete cascade,
  location_id     uuid references locations(id) on delete set null,
  status          attendance_status not null,
  points_awarded  integer not null default 0,
  lat             double precision,
  lng             double precision,
  distance_m      integer,
  rejected_reason rejected_reason,
  created_at      timestamptz not null default now()
);
create index if not exists attendance_org_idx on attendance_records(org_id);
create index if not exists attendance_student_idx on attendance_records(student_id);

-- قيد فريد يمنع تكرار حضور (غير مرفوض) لنفس المستفيد في نفس اليوم
create unique index if not exists attendance_unique_day
  on attendance_records (org_id, student_id, (created_at::date))
  where status <> 'rejected';

-- ===== audit_logs (سجل تدقيق لكل جهة) =====
create table if not exists audit_logs (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  actor_id   uuid,
  action     text not null,
  entity     text,
  details    jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_org_idx on audit_logs(org_id);
