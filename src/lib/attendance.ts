import type { AttendanceStatus, Location, PointRules, RejectedReason, TimeWindow } from './types';

// ===== المسافة الجغرافية (Haversine) =====
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // نصف قطر الأرض بالمتر
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** أقرب موقع مفعّل + المسافة إليه */
export function nearestLocation(
  lat: number,
  lng: number,
  locations: Pick<Location, 'id' | 'name' | 'lat' | 'lng' | 'radius_m'>[],
): { location: Pick<Location, 'id' | 'name' | 'lat' | 'lng' | 'radius_m'>; distance: number } | null {
  let best: { location: any; distance: number } | null = null;
  for (const loc of locations) {
    const d = haversineMeters(lat, lng, loc.lat, loc.lng);
    if (!best || d < best.distance) best = { location: loc, distance: d };
  }
  return best;
}

// ===== الوقت ضمن منطقة الجهة الزمنية =====

/** يعيد دقائق اليوم (0–1439) ورقم اليوم (0=الأحد..6=السبت) في منطقة زمنية محددة */
export function nowInTimezone(timezone: string, at: Date = new Date()): {
  minutes: number;
  day: number;
  label: string;
} {
  // نستخرج الساعة/الدقيقة واليوم وفق المنطقة الزمنية باستخدام Intl
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = fmt.formatToParts(at);
  let hour = 0;
  let minute = 0;
  let weekday = 'Sun';
  for (const p of parts) {
    if (p.type === 'hour') hour = parseInt(p.value, 10) % 24;
    if (p.type === 'minute') minute = parseInt(p.value, 10);
    if (p.type === 'weekday') weekday = p.value;
  }
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const minutes = hour * 60 + minute;
  // عرض 12 ساعة بالعربية
  const label = formatTimeArabic(minutes);
  return { minutes, day: map[weekday] ?? 0, label };
}

/** "HH:MM" → دقائق منذ منتصف الليل */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

/** دقائق → "07:12 ص" */
export function formatTimeArabic(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 < 12 ? 'ص' : 'م';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export type WindowState = 'before' | 'early' | 'normal' | 'late' | 'closed' | 'inactive_day';

/** تقييم حالة نافذة الوقت الحالية وفق منطقة الجهة الزمنية */
export function evaluateWindow(
  tw: TimeWindow,
  timezone: string,
  at: Date = new Date(),
): { state: WindowState; minutes: number; day: number; label: string } {
  const { minutes, day, label } = nowInTimezone(timezone, at);

  if (!tw.active_days.includes(day)) {
    return { state: 'inactive_day', minutes, day, label };
  }

  const earlyStart = timeToMinutes(tw.early_start);
  const earlyEnd = timeToMinutes(tw.early_end);
  const normalEnd = timeToMinutes(tw.normal_end);
  const lateEnd = timeToMinutes(tw.late_end);
  const close = timeToMinutes(tw.close_time);

  let state: WindowState;
  if (minutes < earlyStart) state = 'before';
  else if (minutes <= earlyEnd) state = 'early';
  else if (minutes <= normalEnd) state = 'normal';
  else if (minutes <= Math.max(lateEnd, close)) state = 'late';
  else state = 'closed';

  return { state, minutes, day, label };
}

export interface AttendanceResolution {
  accepted: boolean;
  status: AttendanceStatus;
  rejected_reason: RejectedReason;
  points: number;
  distance_m: number | null;
  location_id: string | null;
  windowState: WindowState;
}

export interface ResolveInput {
  timeWindow: TimeWindow;
  pointRules: PointRules;
  timezone: string;
  geoRequired: boolean;
  locations: Pick<Location, 'id' | 'name' | 'lat' | 'lng' | 'radius_m'>[];
  position?: { lat: number; lng: number } | null;
  at?: Date;
}

/**
 * المنطق الكامل لتسجيل الحضور:
 * 1) تحقق من الوقت ضمن نافذة مفتوحة.
 * 2) إن كان geo_required: احسب أقرب موقع وتحقق من النطاق.
 * 3) عند النجاح: حدد الحالة وامنح النقاط.
 */
export function resolveAttendance(input: ResolveInput): AttendanceResolution {
  const { timeWindow, pointRules, timezone, geoRequired, locations, position, at } = input;
  const ev = evaluateWindow(timeWindow, timezone, at);

  // خارج الوقت (قبل البداية / مغلق / يوم غير نشط) → رفض
  if (ev.state === 'closed' || ev.state === 'before' || ev.state === 'inactive_day') {
    return {
      accepted: false,
      status: 'rejected',
      rejected_reason: 'out_of_time',
      points: 0,
      distance_m: null,
      location_id: null,
      windowState: ev.state,
    };
  }

  // التحقق الجغرافي
  let distance: number | null = null;
  let locationId: string | null = null;
  if (geoRequired && locations.length > 0) {
    if (!position) {
      // لا يوجد موقع جهاز → نعتبره خارج النطاق (لا يمكن التحقق)
      return {
        accepted: false,
        status: 'rejected',
        rejected_reason: 'out_of_range',
        points: 0,
        distance_m: null,
        location_id: null,
        windowState: ev.state,
      };
    }
    const near = nearestLocation(position.lat, position.lng, locations);
    if (near) {
      distance = Math.round(near.distance);
      locationId = near.location.id;
      if (near.distance > near.location.radius_m) {
        return {
          accepted: false,
          status: 'rejected',
          rejected_reason: 'out_of_range',
          points: 0,
          distance_m: distance,
          location_id: locationId,
          windowState: ev.state,
        };
      }
    }
  } else if (position && locations.length > 0) {
    // نسجّل المسافة للمعلومة حتى لو لم يكن التحقق إلزاميًا
    const near = nearestLocation(position.lat, position.lng, locations);
    if (near) {
      distance = Math.round(near.distance);
      locationId = near.location.id;
    }
  }

  // تحديد الحالة والنقاط
  const status: AttendanceStatus =
    ev.state === 'early' ? 'early' : ev.state === 'normal' ? 'normal' : 'late';
  const points =
    status === 'early'
      ? pointRules.points_early
      : status === 'normal'
        ? pointRules.points_normal
        : pointRules.points_late;

  return {
    accepted: true,
    status,
    rejected_reason: null,
    points,
    distance_m: distance,
    location_id: locationId,
    windowState: ev.state,
  };
}

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  early: 'حضور مبكر',
  normal: 'حضور عادي',
  late: 'حضور متأخر',
  rejected: 'مرفوض',
};
