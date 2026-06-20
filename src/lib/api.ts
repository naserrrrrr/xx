// طبقة الوصول للبيانات (Data Access Layer)
// تعمل مع Supabase عند توفر المفاتيح، وإلا تستخدم المخزن التجريبي المحلي.
// كل عمليات الكتابة/القراءة مقيّدة بـ org_id (العزل مفروض أيضًا عبر RLS في قاعدة البيانات).

import { isSupabaseConfigured, supabase } from './supabase';
import {
  loadDB,
  saveDB,
  uid,
  defaultTimeWindow,
  defaultPoints,
} from './mockStore';
import { generateSlug } from './slug';
import { resolveAttendance } from './attendance';
import type {
  AttendanceRecord,
  Location,
  Organization,
  OrgType,
  PointRules,
  PublicOrgInfo,
  Student,
  TimeWindow,
} from './types';

export const DEMO_MODE = !isSupabaseConfigured;

// ============================================================
// المصادقة + الجهة الحالية
// ============================================================

export interface SignupInput {
  orgName: string;
  type: OrgType;
  email: string;
  password: string;
}

export interface AuthResult {
  org: Organization;
  slug: string;
}

export const auth = {
  async signup(input: SignupInput): Promise<AuthResult> {
    const slug = generateSlug();
    if (DEMO_MODE) {
      const db = loadDB();
      const orgId = uid();
      const org: Organization = {
        id: orgId,
        name: input.orgName,
        type: input.type,
        slug,
        logo_url: null,
        timezone: 'Asia/Riyadh',
        geo_required: true,
        created_at: new Date().toISOString(),
      };
      const admin = {
        id: uid(),
        org_id: orgId,
        email: input.email,
        role: 'owner' as const,
        password: input.password,
      };
      db.organizations.push(org);
      db.admins.push(admin);
      db.time_windows.push(defaultTimeWindow(orgId));
      db.point_rules.push(defaultPoints(orgId));
      db.session = { admin_id: admin.id };
      saveDB(db);
      return { org, slug };
    }

    // ===== Supabase =====
    const { data: authData, error: authErr } = await supabase!.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (authErr) throw authErr;
    const userId = authData.user?.id;
    if (!userId) throw new Error('تعذّر إنشاء المستخدم');

    const { data: org, error: orgErr } = await supabase!
      .from('organizations')
      .insert({ name: input.orgName, type: input.type, slug, timezone: 'Asia/Riyadh', geo_required: true })
      .select()
      .single();
    if (orgErr) throw orgErr;

    await supabase!.from('admins').insert({ id: userId, org_id: org.id, email: input.email, role: 'owner' });
    await supabase!.from('time_windows').insert({
      org_id: org.id,
      early_start: '06:30',
      early_end: '07:00',
      normal_end: '07:20',
      late_end: '07:45',
      close_time: '08:00',
      active_days: [0, 1, 2, 3, 4],
    });
    await supabase!.from('point_rules').insert({ org_id: org.id, points_early: 10, points_normal: 6, points_late: 2 });

    return { org: org as Organization, slug };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (DEMO_MODE) {
      const db = loadDB();
      const admin = db.admins.find((a) => a.email === email && a.password === password);
      if (!admin) throw new Error('بيانات الدخول غير صحيحة');
      db.session = { admin_id: admin.id };
      saveDB(db);
      const org = db.organizations.find((o) => o.id === admin.org_id)!;
      return { org, slug: org.slug };
    }
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const org = await org_.current();
    if (!org) throw new Error('لا توجد جهة مرتبطة بهذا الحساب');
    return { org, slug: org.slug };
  },

  async signOut(): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      db.session = null;
      saveDB(db);
      return;
    }
    await supabase!.auth.signOut();
  },
};

// ============================================================
// الجهة الحالية وإعداداتها
// ============================================================

export const org_ = {
  async current(): Promise<Organization | null> {
    if (DEMO_MODE) {
      const db = loadDB();
      if (!db.session) return null;
      const admin = db.admins.find((a) => a.id === db.session!.admin_id);
      if (!admin) return null;
      return db.organizations.find((o) => o.id === admin.org_id) ?? null;
    }
    const { data: u } = await supabase!.auth.getUser();
    if (!u.user) return null;
    const { data: admin } = await supabase!.from('admins').select('org_id').eq('id', u.user.id).single();
    if (!admin) return null;
    const { data: org } = await supabase!.from('organizations').select('*').eq('id', admin.org_id).single();
    return (org as Organization) ?? null;
  },

  async update(orgId: string, patch: Partial<Organization>): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      const o = db.organizations.find((x) => x.id === orgId);
      if (o) Object.assign(o, patch);
      saveDB(db);
      return;
    }
    await supabase!.from('organizations').update(patch).eq('id', orgId);
  },
};

// ============================================================
// المواقع
// ============================================================

export const locationsApi = {
  async list(orgId: string): Promise<Location[]> {
    if (DEMO_MODE) return loadDB().locations.filter((l) => l.org_id === orgId);
    const { data } = await supabase!.from('locations').select('*').eq('org_id', orgId).order('name');
    return (data as Location[]) ?? [];
  },
  async add(orgId: string, loc: Omit<Location, 'id' | 'org_id'>): Promise<Location> {
    if (DEMO_MODE) {
      const db = loadDB();
      const created: Location = { ...loc, id: uid(), org_id: orgId };
      db.locations.push(created);
      saveDB(db);
      return created;
    }
    const { data } = await supabase!.from('locations').insert({ ...loc, org_id: orgId }).select().single();
    return data as Location;
  },
  async update(id: string, patch: Partial<Location>): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      const l = db.locations.find((x) => x.id === id);
      if (l) Object.assign(l, patch);
      saveDB(db);
      return;
    }
    await supabase!.from('locations').update(patch).eq('id', id);
  },
  async remove(id: string): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      db.locations = db.locations.filter((x) => x.id !== id);
      saveDB(db);
      return;
    }
    await supabase!.from('locations').delete().eq('id', id);
  },
};

// ============================================================
// نوافذ الوقت + النقاط
// ============================================================

export const timeApi = {
  async get(orgId: string): Promise<TimeWindow> {
    if (DEMO_MODE) {
      const db = loadDB();
      let tw = db.time_windows.find((t) => t.org_id === orgId);
      if (!tw) {
        tw = defaultTimeWindow(orgId);
        db.time_windows.push(tw);
        saveDB(db);
      }
      return tw;
    }
    const { data } = await supabase!.from('time_windows').select('*').eq('org_id', orgId).single();
    return data as TimeWindow;
  },
  async save(orgId: string, patch: Partial<TimeWindow>): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      const tw = db.time_windows.find((t) => t.org_id === orgId);
      if (tw) Object.assign(tw, patch);
      saveDB(db);
      return;
    }
    await supabase!.from('time_windows').update(patch).eq('org_id', orgId);
  },
};

export const pointsApi = {
  async get(orgId: string): Promise<PointRules> {
    if (DEMO_MODE) {
      const db = loadDB();
      let pr = db.point_rules.find((p) => p.org_id === orgId);
      if (!pr) {
        pr = defaultPoints(orgId);
        db.point_rules.push(pr);
        saveDB(db);
      }
      return pr;
    }
    const { data } = await supabase!.from('point_rules').select('*').eq('org_id', orgId).single();
    return data as PointRules;
  },
  async save(orgId: string, patch: Partial<PointRules>): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      const pr = db.point_rules.find((p) => p.org_id === orgId);
      if (pr) Object.assign(pr, patch);
      saveDB(db);
      return;
    }
    await supabase!.from('point_rules').update(patch).eq('org_id', orgId);
  },
};

// ============================================================
// المستفيدون (الطلاب)
// ============================================================

export const studentsApi = {
  async list(orgId: string): Promise<Student[]> {
    if (DEMO_MODE)
      return loadDB().students.filter((s) => s.org_id === orgId && s.is_active !== false);
    const { data } = await supabase!.from('students').select('*').eq('org_id', orgId).eq('is_active', true);
    return (data as Student[]) ?? [];
  },
  async add(orgId: string, name: string, group_name: string): Promise<Student> {
    if (DEMO_MODE) {
      const db = loadDB();
      const s: Student = { id: uid(), org_id: orgId, name, group_name, total_points: 0, is_active: true };
      db.students.push(s);
      saveDB(db);
      return s;
    }
    const { data } = await supabase!
      .from('students')
      .insert({ org_id: orgId, name, group_name, total_points: 0, is_active: true })
      .select()
      .single();
    return data as Student;
  },
  async bulkAdd(orgId: string, rows: { name: string; group_name: string }[]): Promise<number> {
    if (DEMO_MODE) {
      const db = loadDB();
      let added = 0;
      for (const r of rows) {
        if (!r.name) continue;
        const exists = db.students.some(
          (s) => s.org_id === orgId && s.name === r.name && s.is_active !== false,
        );
        if (exists) continue;
        db.students.push({
          id: uid(),
          org_id: orgId,
          name: r.name,
          group_name: r.group_name || '',
          total_points: 0,
          is_active: true,
        });
        added++;
      }
      saveDB(db);
      return added;
    }
    const payload = rows
      .filter((r) => r.name)
      .map((r) => ({ org_id: orgId, name: r.name, group_name: r.group_name || '', total_points: 0, is_active: true }));
    const { data } = await supabase!.from('students').insert(payload).select('id');
    return data?.length ?? 0;
  },
  async softDelete(id: string): Promise<void> {
    if (DEMO_MODE) {
      const db = loadDB();
      const s = db.students.find((x) => x.id === id);
      if (s) s.is_active = false;
      saveDB(db);
      return;
    }
    await supabase!.from('students').update({ is_active: false }).eq('id', id);
  },
};

// ============================================================
// التحضير العام (عبر slug) — قراءة محدودة + تسجيل
// ============================================================

export const attend = {
  async publicInfo(slug: string): Promise<PublicOrgInfo | null> {
    if (DEMO_MODE) {
      const db = loadDB();
      const org = db.organizations.find((o) => o.slug === slug);
      if (!org) return null;
      const tw = db.time_windows.find((t) => t.org_id === org.id) ?? null;
      const pr = db.point_rules.find((p) => p.org_id === org.id) ?? null;
      const locs = db.locations
        .filter((l) => l.org_id === org.id && l.is_active)
        .map((l) => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng, radius_m: l.radius_m }));
      return {
        name: org.name,
        logo_url: org.logo_url,
        slug: org.slug,
        timezone: org.timezone,
        geo_required: org.geo_required,
        time_window: tw,
        locations: locs,
        point_rules: pr,
      };
    }
    // عبر دالة آمنة (SECURITY DEFINER) تكشف القراءة المحدودة فقط
    const { data, error } = await supabase!.rpc('get_public_org', { p_slug: slug });
    if (error || !data) return null;
    return data as PublicOrgInfo;
  },

  /**
   * تسجيل حضور من صفحة التحضير العامة.
   * في وضع المعاينة: نطبّق المنطق محليًا ونمنع التكرار في نفس اليوم.
   * في Supabase: نستدعي دالة آمنة submit_attendance تطبّق نفس المنطق على الخادم.
   */
  async submit(
    slug: string,
    studentName: string,
    position: { lat: number; lng: number } | null,
  ): Promise<{
    accepted: boolean;
    status: AttendanceRecord['status'];
    rejected_reason: AttendanceRecord['rejected_reason'];
    points: number;
    distance_m: number | null;
    duplicate?: boolean;
  }> {
    if (DEMO_MODE) {
      const db = loadDB();
      const org = db.organizations.find((o) => o.slug === slug);
      if (!org) throw new Error('الجهة غير موجودة');
      const tw = db.time_windows.find((t) => t.org_id === org.id)!;
      const pr = db.point_rules.find((p) => p.org_id === org.id)!;
      const locs = db.locations
        .filter((l) => l.org_id === org.id && l.is_active)
        .map((l) => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng, radius_m: l.radius_m }));

      // الطالب: ابحث أو أنشئ (تسجيل ذاتي)
      let student = db.students.find(
        (s) => s.org_id === org.id && s.name === studentName && s.is_active !== false,
      );
      if (!student) {
        student = { id: uid(), org_id: org.id, name: studentName, group_name: '', total_points: 0, is_active: true };
        db.students.push(student);
      }

      // منع التكرار في نفس اليوم
      const todayKey = new Date().toDateString();
      const already = db.attendance_records.find(
        (r) =>
          r.org_id === org.id &&
          r.student_id === student!.id &&
          r.status !== 'rejected' &&
          new Date(r.created_at).toDateString() === todayKey,
      );
      if (already) {
        saveDB(db);
        return {
          accepted: false,
          status: already.status,
          rejected_reason: null,
          points: 0,
          distance_m: already.distance_m,
          duplicate: true,
        };
      }

      const res = resolveAttendance({
        timeWindow: tw,
        pointRules: pr,
        timezone: org.timezone,
        geoRequired: org.geo_required,
        locations: locs,
        position,
      });

      const record: AttendanceRecord = {
        id: uid(),
        org_id: org.id,
        student_id: student.id,
        location_id: res.location_id,
        status: res.status,
        points_awarded: res.points,
        lat: position?.lat ?? null,
        lng: position?.lng ?? null,
        distance_m: res.distance_m,
        rejected_reason: res.rejected_reason,
        created_at: new Date().toISOString(),
      };
      db.attendance_records.push(record);
      if (res.accepted) student.total_points += res.points;
      saveDB(db);

      return {
        accepted: res.accepted,
        status: res.status,
        rejected_reason: res.rejected_reason,
        points: res.points,
        distance_m: res.distance_m,
      };
    }

    const { data, error } = await supabase!.rpc('submit_attendance', {
      p_slug: slug,
      p_student_name: studentName,
      p_lat: position?.lat ?? null,
      p_lng: position?.lng ?? null,
    });
    if (error) throw error;
    return data as any;
  },
};

// ============================================================
// لوحة التحكم + التقارير (تجميعات)
// ============================================================

export interface StudentReportRow {
  student: Student;
  present: number; // أيام الحضور (مبكر+عادي+متأخر)
  absent: number; // أيام الغياب في أيام النشاط
  late: number;
  points: number;
  rate: number; // نسبة الحضور %
}

function activeDaysInLast(daysBack: number, activeDays: number[]): number {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
    if (activeDays.includes(d.getDay())) count++;
  }
  return count;
}

export const reportsApi = {
  async records(orgId: string): Promise<AttendanceRecord[]> {
    if (DEMO_MODE) return loadDB().attendance_records.filter((r) => r.org_id === orgId);
    const { data } = await supabase!.from('attendance_records').select('*').eq('org_id', orgId);
    return (data as AttendanceRecord[]) ?? [];
  },

  async studentRows(orgId: string): Promise<StudentReportRow[]> {
    const [students, records, tw] = await Promise.all([
      studentsApi.list(orgId),
      reportsApi.records(orgId),
      timeApi.get(orgId),
    ]);
    const totalActiveDays = Math.max(activeDaysInLast(30, tw.active_days), 1);

    return students
      .map((st) => {
        const recs = records.filter((r) => r.student_id === st.id);
        // أيام حضور فريدة
        const presentDays = new Set(
          recs.filter((r) => r.status !== 'rejected').map((r) => new Date(r.created_at).toDateString()),
        );
        const lateCount = recs.filter((r) => r.status === 'late').length;
        const present = presentDays.size;
        const absent = Math.max(totalActiveDays - present, 0);
        const points = recs.filter((r) => r.status !== 'rejected').reduce((s, r) => s + r.points_awarded, 0) || st.total_points;
        const rate = Math.min(Math.round((present / totalActiveDays) * 100), 100);
        return { student: st, present, absent, late: lateCount, points, rate };
      })
      .sort((a, b) => b.present - a.present);
  },

  async summary(orgId: string) {
    const rows = await reportsApi.studentRows(orgId);
    const records = await reportsApi.records(orgId);
    const mostPresent = rows[0] ?? null;
    const mostAbsent = [...rows].sort((a, b) => b.absent - a.absent)[0] ?? null;
    const topPoints = [...rows].sort((a, b) => b.points - a.points)[0] ?? null;
    const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const outOfRange = records.filter(
      (r) => r.rejected_reason === 'out_of_range' && new Date(r.created_at).getTime() >= oneWeekAgo,
    ).length;
    return { mostPresent, mostAbsent, topPoints, outOfRange, rows };
  },

  async dashboard(orgId: string) {
    const [students, records, locations, rows] = await Promise.all([
      studentsApi.list(orgId),
      reportsApi.records(orgId),
      locationsApi.list(orgId),
      reportsApi.studentRows(orgId),
    ]);
    const todayKey = new Date().toDateString();
    const presentToday = new Set(
      records
        .filter((r) => r.status !== 'rejected' && new Date(r.created_at).toDateString() === todayKey)
        .map((r) => r.student_id),
    ).size;
    const activeLocations = locations.filter((l) => l.is_active).length;
    const totalStudents = Math.max(students.length, 1);
    const attendanceRate = Math.round((presentToday / totalStudents) * 100);

    // اتجاه آخر 5 أيام نشاط (الأحد–الخميس)
    const weekLabels = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const trend = weekLabels.map((label, idx) => {
      const dayNum = idx; // 0..4
      const dayRecords = records.filter(
        (r) => r.status !== 'rejected' && new Date(r.created_at).getDay() === dayNum,
      );
      const uniqueDays = new Set(dayRecords.map((r) => new Date(r.created_at).toDateString())).size || 1;
      const avg = Math.min(Math.round((dayRecords.length / uniqueDays / totalStudents) * 100), 100);
      return { label, value: avg || 0 };
    });

    const leaderboard = [...rows].sort((a, b) => b.points - a.points).slice(0, 4);
    const top = leaderboard[0]?.student ?? null;

    return {
      presentToday,
      attendanceRate: isFinite(attendanceRate) ? attendanceRate : 0,
      activeLocations,
      topStudent: top,
      topPoints: leaderboard[0]?.points ?? 0,
      trend,
      leaderboard,
    };
  },
};
