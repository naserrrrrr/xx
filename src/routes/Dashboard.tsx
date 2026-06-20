import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Users, Link2, MapPin, Star } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { useOrg } from '../hooks/useOrg';
import { reportsApi } from '../lib/api';
import { hijriToday, greetingByHour } from '../lib/hijri';

interface DashData {
  presentToday: number;
  attendanceRate: number;
  activeLocations: number;
  topStudent: { name: string } | null;
  topPoints: number;
  trend: { label: string; value: number }[];
  leaderboard: { student: { name: string; group_name: string }; points: number }[];
}

const RANK_AVATAR = ['#6D5EF6', '#15B886', '#F5934E', '#C9C3E0'];

export default function Dashboard() {
  const { org } = useOrg();
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    if (org) reportsApi.dashboard(org.id).then(setData as any);
  }, [org]);

  if (!org) return null;

  const greeting = greetingByHour(org.timezone);
  const today = hijriToday(new Date(), org.timezone);

  return (
    <DashLayout title={`${greeting} 👋`} subtitle={`${today} — نظرة عامة على حضور اليوم`}>
      {/* stat cards */}
      <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={22} color="#6D5EF6" strokeWidth={1.9} />}
          iconBg="#EDEAFE"
          value={data ? String(data.presentToday) : '—'}
          label="الحاضرون اليوم"
        />
        <StatCard
          icon={<Link2 size={22} color="#15B886" strokeWidth={1.9} />}
          iconBg="#E7F8F1"
          value={data ? `${data.attendanceRate}%` : '—'}
          label="نسبة الحضور"
        />
        <StatCard
          icon={<MapPin size={22} color="#3B82F6" strokeWidth={1.9} />}
          iconBg="#EAF1FF"
          value={data ? String(data.activeLocations) : '—'}
          label="المواقع المفعّلة"
        />
        <StatCard
          icon={<Star size={22} color="#F59E0B" strokeWidth={1.9} />}
          iconBg="#FFF2E0"
          value={data?.topStudent?.name ?? '—'}
          valueSize="text-[18px]"
          label={data ? `الأعلى نقاطًا — ${data.topPoints} نقطة` : 'الأعلى نقاطًا'}
        />
      </div>

      {/* chart + leaderboard */}
      <div className="mt-[18px] grid gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[17px] font-extrabold">اتجاه الحضور هذا الأسبوع</div>
              <div className="mt-[3px] text-[13px] font-semibold text-muted-soft">النسبة المئوية للحضور اليومي</div>
            </div>
            <div className="rounded-[9px] bg-[#F4F1FD] px-[11px] py-[6px] text-[12.5px] font-bold text-primary">الأحد – الخميس</div>
          </div>
          <div className="mt-6 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.trend ?? []} margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#9B6CF8" />
                    <stop offset="1" stopColor="#6D5EF6" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#857F9C', fontSize: 12, fontWeight: 700, fontFamily: 'Cairo' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(109,94,246,.06)' }}
                  formatter={(v: number) => [`${v}%`, 'الحضور']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #EDEAF6', fontFamily: 'Cairo', fontSize: 13 }}
                />
                <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={42}>
                  {(data?.trend ?? []).map((_, i) => (
                    <Cell key={i} fill="url(#barGrad)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 text-[17px] font-extrabold">
            <Star size={19} color="#F59E0B" strokeWidth={1.9} /> لوحة الترتيب
          </div>
          <div className="mt-[18px] flex flex-col gap-[6px]">
            {(data?.leaderboard ?? []).map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-[10px]"
                style={{ background: i === 0 ? 'linear-gradient(120deg,#FFF7E8,#FFFDF8)' : 'transparent' }}
              >
                <span
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-lg text-[13px] font-black text-white"
                  style={{ background: i === 0 ? '#F59E0B' : '#EDEAF6', color: i === 0 ? '#fff' : '#6E6A86' }}
                >
                  {i + 1}
                </span>
                <span
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[14px] font-extrabold text-white"
                  style={{ background: RANK_AVATAR[i] ?? '#C9C3E0' }}
                >
                  {row.student.name.trim()[0]}
                </span>
                <div className="flex-1 text-[14px] font-bold">{row.student.name}</div>
                <span className="text-[14px] font-black text-[#5B4FD0]">{row.points}</span>
              </div>
            ))}
            {(!data || data.leaderboard.length === 0) && (
              <div className="py-6 text-center text-[13px] font-semibold text-muted-soft">لا توجد بيانات بعد</div>
            )}
          </div>
        </div>
      </div>
    </DashLayout>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  badge,
  valueSize = 'text-[32px]',
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  badge?: string;
  valueSize?: string;
}) {
  return (
    <div className="hover-lift card p-[22px]">
      <div className="flex items-center justify-between">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl" style={{ background: iconBg }}>
          {icon}
        </div>
        {badge && (
          <span className="rounded-lg bg-[#E7F8F1] px-2 py-1 text-[12px] font-extrabold text-success">{badge}</span>
        )}
      </div>
      <div className={`mt-4 font-black ${valueSize}`}>{value}</div>
      <div className="mt-[2px] text-[13.5px] font-semibold text-muted-soft">{label}</div>
    </div>
  );
}
