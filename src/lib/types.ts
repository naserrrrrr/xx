// أنواع البيانات المشتركة لنظام «حاضِر»

export type OrgType =
  | 'summer_center'
  | 'school'
  | 'university'
  | 'company'
  | 'training_center'
  | 'other';

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  summer_center: 'مركز صيفي',
  school: 'مدرسة',
  university: 'جامعة',
  company: 'شركة',
  training_center: 'مركز تدريب',
  other: 'أخرى',
};

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  slug: string;
  logo_url: string | null;
  timezone: string; // مثال: Asia/Riyadh
  geo_required: boolean;
  created_at: string;
}

export type AdminRole = 'owner' | 'supervisor';

export interface Admin {
  id: string;
  org_id: string;
  email: string;
  role: AdminRole;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number; // 20–300
  is_active: boolean;
}

export interface TimeWindow {
  id: string;
  org_id: string;
  early_start: string; // "HH:MM"
  early_end: string;
  normal_end: string;
  late_end: string;
  close_time: string;
  active_days: number[]; // 0=الأحد .. 6=السبت
}

export interface PointRules {
  org_id: string;
  points_early: number;
  points_normal: number;
  points_late: number;
}

export interface Student {
  id: string;
  org_id: string;
  name: string;
  group_name: string; // «المجموعة»
  total_points: number;
  is_active?: boolean;
}

export type AttendanceStatus = 'early' | 'normal' | 'late' | 'rejected';
export type RejectedReason = 'out_of_range' | 'out_of_time' | null;

export interface AttendanceRecord {
  id: string;
  org_id: string;
  student_id: string;
  location_id: string | null;
  status: AttendanceStatus;
  points_awarded: number;
  lat: number | null;
  lng: number | null;
  distance_m: number | null;
  rejected_reason: RejectedReason;
  created_at: string;
}

// المعلومات العامة المحدودة المتاحة لصفحة التحضير عبر slug (دون بيانات المستفيدين)
export interface PublicOrgInfo {
  name: string;
  logo_url: string | null;
  slug: string;
  timezone: string;
  geo_required: boolean;
  time_window: TimeWindow | null;
  locations: Pick<Location, 'id' | 'name' | 'lat' | 'lng' | 'radius_m'>[];
  point_rules: PointRules | null;
}
