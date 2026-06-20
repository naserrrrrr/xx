-- ============================================================
-- «حاضِر» — العزل على مستوى الصفوف (Row-Level Security)
-- المبدأ: org_id لكل صف = الجهة المرتبطة بالمستخدم الحالي عبر جدول admins.
-- يستحيل لأي جهة قراءة/كتابة بيانات جهة أخرى حتى مع تعديل الروابط/المعرّفات.
-- ============================================================

-- دالة مساعدة: org_id للمستخدم الحالي (auth.uid())
create or replace function current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from admins where id = auth.uid() limit 1;
$$;

-- تفعيل RLS
alter table organizations     enable row level security;
alter table admins            enable row level security;
alter table locations         enable row level security;
alter table time_windows      enable row level security;
alter table point_rules       enable row level security;
alter table students          enable row level security;
alter table attendance_records enable row level security;
alter table audit_logs        enable row level security;

-- ===== organizations =====
-- يقرأ/يعدّل المستخدم جهته فقط. الإدراج عند التسجيل: يُسمح به للمستخدم المصادق.
drop policy if exists org_select on organizations;
create policy org_select on organizations for select
  using (id = current_org_id());

drop policy if exists org_update on organizations;
create policy org_update on organizations for update
  using (id = current_org_id());

drop policy if exists org_insert on organizations;
create policy org_insert on organizations for insert to authenticated
  with check (true);

-- ===== admins =====
drop policy if exists admins_select on admins;
create policy admins_select on admins for select
  using (org_id = current_org_id());

-- إدراج سجل المشرف لنفسه عند التسجيل (id = auth.uid())
drop policy if exists admins_insert_self on admins;
create policy admins_insert_self on admins for insert to authenticated
  with check (id = auth.uid());

drop policy if exists admins_manage on admins;
create policy admins_manage on admins for update
  using (org_id = current_org_id());

-- ===== ماكرو لسياسات org_id موحّدة على بقية الجداول =====
do $$
declare t text;
begin
  foreach t in array array['locations','time_windows','point_rules','students','attendance_records','audit_logs']
  loop
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format(
      'create policy %1$s_all on %1$s for all
         using (org_id = current_org_id())
         with check (org_id = current_org_id());', t);
  end loop;
end $$;
