-- ============================================================
-- «حاضِر» — دوال عامة آمنة (SECURITY DEFINER) لصفحة التحضير
-- تكشف قراءة محدودة جدًا عبر slug، وتطبّق منطق الحضور على الخادم.
-- لا تكشف أي بيانات للمستفيدين الآخرين.
-- ============================================================

-- ===== قراءة عامة محدودة بالـ slug =====
create or replace function get_public_org(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_org organizations%rowtype;
  v_tw  jsonb;
  v_pr  jsonb;
  v_locs jsonb;
begin
  select * into v_org from organizations where slug = p_slug;
  if not found then
    return null;
  end if;

  select to_jsonb(t) into v_tw from (
    select early_start, early_end, normal_end, late_end, close_time, active_days, org_id, id
    from time_windows where org_id = v_org.id
  ) t;

  select to_jsonb(p) into v_pr from (
    select org_id, points_early, points_normal, points_late
    from point_rules where org_id = v_org.id
  ) p;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', id, 'name', name, 'lat', lat, 'lng', lng, 'radius_m', radius_m)), '[]'::jsonb)
    into v_locs
  from locations where org_id = v_org.id and is_active = true;

  return jsonb_build_object(
    'name', v_org.name,
    'logo_url', v_org.logo_url,
    'slug', v_org.slug,
    'timezone', v_org.timezone,
    'geo_required', v_org.geo_required,
    'time_window', v_tw,
    'point_rules', v_pr,
    'locations', v_locs
  );
end;
$$;

grant execute on function get_public_org(text) to anon, authenticated;

-- ===== المسافة (Haversine) بالأمتار =====
create or replace function haversine_m(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision
language sql
immutable
as $$
  select 6371000 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- ===== تسجيل الحضور (يطبّق الوقت + الجغرافيا + منع التكرار) =====
create or replace function submit_attendance(
  p_slug text,
  p_student_name text,
  p_lat double precision,
  p_lng double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org organizations%rowtype;
  v_tw  time_windows%rowtype;
  v_pr  point_rules%rowtype;
  v_student students%rowtype;
  v_now_time time;
  v_dow int;
  v_status attendance_status;
  v_points int := 0;
  v_reason rejected_reason;
  v_distance int;
  v_loc_id uuid;
  v_min_dist double precision;
  v_loc record;
begin
  select * into v_org from organizations where slug = p_slug;
  if not found then raise exception 'org_not_found'; end if;

  select * into v_tw from time_windows where org_id = v_org.id;
  select * into v_pr from point_rules where org_id = v_org.id;

  -- الوقت واليوم وفق منطقة الجهة الزمنية
  v_now_time := (now() at time zone v_org.timezone)::time;
  v_dow := extract(dow from (now() at time zone v_org.timezone))::int;

  -- إيجاد/إنشاء المستفيد (تسجيل ذاتي)
  select * into v_student from students
   where org_id = v_org.id and name = p_student_name and is_active = true
   limit 1;
  if not found then
    insert into students(org_id, name, group_name) values (v_org.id, p_student_name, '')
    returning * into v_student;
  end if;

  -- منع التكرار في نفس اليوم
  if exists (
    select 1 from attendance_records
     where org_id = v_org.id and student_id = v_student.id
       and status <> 'rejected'
       and (created_at at time zone v_org.timezone)::date = (now() at time zone v_org.timezone)::date
  ) then
    return jsonb_build_object('accepted', false, 'duplicate', true,
      'status', 'normal', 'rejected_reason', null, 'points', 0, 'distance_m', null);
  end if;

  -- تحقق الوقت
  if not (v_dow = any(v_tw.active_days))
     or v_now_time < v_tw.early_start
     or v_now_time > greatest(v_tw.late_end, v_tw.close_time) then
    v_reason := 'out_of_time';
    insert into attendance_records(org_id, student_id, status, points_awarded, lat, lng, rejected_reason)
      values (v_org.id, v_student.id, 'rejected', 0, p_lat, p_lng, v_reason);
    return jsonb_build_object('accepted', false, 'status', 'rejected',
      'rejected_reason', v_reason, 'points', 0, 'distance_m', null);
  end if;

  -- تحقق الموقع (أقرب موقع مفعّل)
  v_min_dist := null;
  if p_lat is not null and p_lng is not null then
    for v_loc in select id, lat, lng, radius_m from locations where org_id = v_org.id and is_active = true loop
      declare d double precision := haversine_m(p_lat, p_lng, v_loc.lat, v_loc.lng);
      begin
        if v_min_dist is null or d < v_min_dist then
          v_min_dist := d; v_loc_id := v_loc.id; v_distance := round(d);
        end if;
      end;
    end loop;
  end if;

  if v_org.geo_required then
    if v_min_dist is null then
      v_reason := 'out_of_range';
      insert into attendance_records(org_id, student_id, status, points_awarded, lat, lng, rejected_reason)
        values (v_org.id, v_student.id, 'rejected', 0, p_lat, p_lng, v_reason);
      return jsonb_build_object('accepted', false, 'status', 'rejected',
        'rejected_reason', v_reason, 'points', 0, 'distance_m', null);
    end if;
    -- تحقق ضد نصف قطر الموقع الأقرب
    if v_distance > (select radius_m from locations where id = v_loc_id) then
      v_reason := 'out_of_range';
      insert into attendance_records(org_id, student_id, location_id, status, points_awarded, lat, lng, distance_m, rejected_reason)
        values (v_org.id, v_student.id, v_loc_id, 'rejected', 0, p_lat, p_lng, v_distance, v_reason);
      return jsonb_build_object('accepted', false, 'status', 'rejected',
        'rejected_reason', v_reason, 'points', 0, 'distance_m', v_distance);
    end if;
  end if;

  -- تحديد الحالة والنقاط
  if v_now_time <= v_tw.early_end then
    v_status := 'early'; v_points := v_pr.points_early;
  elsif v_now_time <= v_tw.normal_end then
    v_status := 'normal'; v_points := v_pr.points_normal;
  else
    v_status := 'late'; v_points := v_pr.points_late;
  end if;

  insert into attendance_records(org_id, student_id, location_id, status, points_awarded, lat, lng, distance_m)
    values (v_org.id, v_student.id, v_loc_id, v_status, v_points, p_lat, p_lng, v_distance);

  update students set total_points = total_points + v_points where id = v_student.id;

  return jsonb_build_object('accepted', true, 'status', v_status,
    'rejected_reason', null, 'points', v_points, 'distance_m', v_distance);
end;
$$;

grant execute on function submit_attendance(text, text, double precision, double precision) to anon, authenticated;
