// مخزن بيانات تجريبي محلي (localStorage) — يُستخدم في «وضع المعاينة» عند غياب مفاتيح Supabase.
// يحاكي العزل بين الجهات: كل الكيانات مرتبطة بـ org_id.

import type {
  Admin,
  AttendanceRecord,
  Location,
  Organization,
  PointRules,
  Student,
  TimeWindow,
} from './types';

export interface DB {
  organizations: Organization[];
  admins: (Admin & { password: string })[];
  locations: Location[];
  time_windows: TimeWindow[];
  point_rules: PointRules[];
  students: Student[];
  attendance_records: AttendanceRecord[];
  session: { admin_id: string } | null;
}

const KEY = 'hadir_demo_db_v1';

export function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultTimeWindow(orgId: string): TimeWindow {
  return {
    id: uid(),
    org_id: orgId,
    early_start: '06:30',
    early_end: '07:00',
    normal_end: '07:20',
    late_end: '07:45',
    close_time: '08:00',
    active_days: [0, 1, 2, 3, 4],
  };
}

function defaultPoints(orgId: string): PointRules {
  return { org_id: orgId, points_early: 10, points_normal: 6, points_late: 2 };
}

// ===== بيانات أولية: مركز طاقات الشباب =====
function seed(): DB {
  const orgId = uid();
  const org: Organization = {
    id: orgId,
    name: 'مركز طاقات الشباب',
    type: 'summer_center',
    slug: 'taqat-7f3a',
    logo_url: null,
    timezone: 'Asia/Riyadh',
    geo_required: true,
    created_at: new Date().toISOString(),
  };
  const admin = {
    id: uid(),
    org_id: orgId,
    email: 'demo@hadir.app',
    role: 'owner' as const,
    password: 'demo1234',
  };
  const locations: Location[] = [
    { id: uid(), org_id: orgId, name: 'المبنى الرئيسي', lat: 24.7741, lng: 46.7386, radius_m: 80, is_active: true },
    { id: uid(), org_id: orgId, name: 'قاعة الأنشطة', lat: 24.7752, lng: 46.7401, radius_m: 50, is_active: true },
    { id: uid(), org_id: orgId, name: 'الفرع المؤقت', lat: 24.7700, lng: 46.7300, radius_m: 100, is_active: false },
  ];

  const studentNames: [string, string, number][] = [
    ['سارة المطيري', 'أ', 412],
    ['عبدالله الزهراني', 'أ', 398],
    ['ريان القحطاني', 'ب', 377],
    ['لينا الحربي', 'ب', 351],
    ['فهد الشمري', 'أ', 320],
    ['ماجد العنزي', 'ب', 240],
    ['نورة الدوسري', 'أ', 305],
    ['خالد الغامدي', 'ب', 288],
  ];
  const students: Student[] = studentNames.map(([name, g, pts]) => ({
    id: uid(),
    org_id: orgId,
    name,
    group_name: g,
    total_points: pts,
    is_active: true,
  }));

  // سجلات حضور لآخر 22 يوم نشاط لتغذية التقارير
  const records: AttendanceRecord[] = [];
  const presentDays: Record<string, number> = {
    'سارة المطيري': 22,
    'عبدالله الزهراني': 21,
    'ريان القحطاني': 20,
    'لينا الحربي': 19,
    'فهد الشمري': 18,
    'ماجد العنزي': 15,
    'نورة الدوسري': 17,
    'خالد الغامدي': 16,
  };
  const now = Date.now();
  students.forEach((st) => {
    const days = presentDays[st.name] ?? 18;
    for (let d = 0; d < days; d++) {
      const created = new Date(now - d * 24 * 3600 * 1000);
      const r = Math.random();
      const status = r < 0.55 ? 'early' : r < 0.85 ? 'normal' : 'late';
      const pts = status === 'early' ? 10 : status === 'normal' ? 6 : 2;
      records.push({
        id: uid(),
        org_id: orgId,
        student_id: st.id,
        location_id: locations[0].id,
        status,
        points_awarded: pts,
        lat: locations[0].lat,
        lng: locations[0].lng,
        distance_m: Math.round(Math.random() * 60),
        rejected_reason: null,
        created_at: created.toISOString(),
      });
    }
  });
  // بعض محاولات «خارج النطاق»
  for (let i = 0; i < 5; i++) {
    records.push({
      id: uid(),
      org_id: orgId,
      student_id: students[5].id,
      location_id: locations[0].id,
      status: 'rejected',
      points_awarded: 0,
      lat: 24.78,
      lng: 46.75,
      distance_m: 300 + Math.round(Math.random() * 120),
      rejected_reason: 'out_of_range',
      created_at: new Date(now - i * 24 * 3600 * 1000).toISOString(),
    });
  }

  return {
    organizations: [org],
    admins: [admin],
    locations,
    time_windows: [defaultTimeWindow(orgId)],
    point_rules: [defaultPoints(orgId)],
    students,
    attendance_records: records,
    session: null,
  };
}

let cache: DB | null = null;

export function loadDB(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as DB;
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = seed();
  saveDB(cache);
  return cache;
}

export function saveDB(db: DB): void {
  cache = db;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
}

export function resetDB(): void {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export { defaultTimeWindow, defaultPoints };
