import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { useOrg } from '../hooks/useOrg';
import { timeApi, pointsApi } from '../lib/api';
import { timeToMinutes } from '../lib/attendance';
import type { PointRules, TimeWindow } from '../lib/types';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function TimePoints() {
  const { org } = useOrg();
  const [tw, setTw] = useState<TimeWindow | null>(null);
  const [pr, setPr] = useState<PointRules | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!org) return;
    timeApi.get(org.id).then(setTw);
    pointsApi.get(org.id).then(setPr);
  }, [org]);

  if (!org || !tw || !pr) return <DashLayout title="الأوقات والنقاط"><div /></DashLayout>;

  const setTime = (key: keyof TimeWindow, value: string) => setTw({ ...tw, [key]: value });
  const toggleDay = (d: number) =>
    setTw({
      ...tw,
      active_days: tw.active_days.includes(d)
        ? tw.active_days.filter((x) => x !== d)
        : [...tw.active_days, d].sort((a, b) => a - b),
    });

  // أوزان المراحل لشريط الخط الزمني (نسبية لمدد النوافذ)
  const es = timeToMinutes(tw.early_start);
  const ee = timeToMinutes(tw.early_end);
  const ne = timeToMinutes(tw.normal_end);
  const le = timeToMinutes(tw.late_end);
  const ct = timeToMinutes(tw.close_time);
  const wEarly = Math.max(ee - es, 1);
  const wNormal = Math.max(ne - ee, 1);
  const wLate = Math.max(le - ne, 1);
  const wClose = Math.max(ct - le, 1);

  const save = async () => {
    await timeApi.save(org.id, {
      early_start: tw.early_start,
      early_end: tw.early_end,
      normal_end: tw.normal_end,
      late_end: tw.late_end,
      close_time: tw.close_time,
      active_days: tw.active_days,
    });
    await pointsApi.save(org.id, {
      points_early: pr.points_early,
      points_normal: pr.points_normal,
      points_late: pr.points_late,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashLayout title="الأوقات والنقاط" subtitle="اضبط نوافذ الحضور وقيمة النقاط لكل حالة">
      {/* timeline editor */}
      <div className="card p-[26px]">
        <div className="mb-[26px] flex items-center justify-between">
          <div>
            <div className="text-[17px] font-extrabold">نوافذ وقت التحضير</div>
            <div className="mt-[3px] text-[13px] font-semibold text-muted-soft">اضبط بداية ونهاية كل نافذة</div>
          </div>
          <div className="flex items-center gap-[7px] rounded-[9px] bg-[#F4F1FD] px-[11px] py-[6px] text-[12.5px] font-bold text-primary">
            <Clock size={15} strokeWidth={2} /> التوقيت: {org.timezone}
          </div>
        </div>

        {/* gradient bar */}
        <div dir="ltr" className="flex h-16 overflow-hidden rounded-[14px]">
          <Band flex={wEarly} from="#3BC79A" to="#15B886" label="مبكر" />
          <Band flex={wNormal} from="#5C9BF6" to="#3B82F6" label="عادي" />
          <Band flex={wLate} from="#FBB24E" to="#F59E0B" label="متأخر" />
          <Band flex={wClose} from="#EC6065" to="#E5484D" label="إغلاق" small />
        </div>
        <div dir="ltr" className="mt-[10px] flex justify-between text-[12.5px] font-bold text-muted-soft">
          <span>{tw.early_start}</span>
          <span>{tw.early_end}</span>
          <span>{tw.normal_end}</span>
          <span>{tw.late_end}</span>
          <span>{tw.close_time}</span>
        </div>

        {/* time inputs */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <TimeField label="بداية المبكر" value={tw.early_start} onChange={(v) => setTime('early_start', v)} />
          <TimeField label="نهاية المبكر" value={tw.early_end} onChange={(v) => setTime('early_end', v)} />
          <TimeField label="نهاية العادي" value={tw.normal_end} onChange={(v) => setTime('normal_end', v)} />
          <TimeField label="نهاية المتأخر" value={tw.late_end} onChange={(v) => setTime('late_end', v)} />
          <TimeField label="الإغلاق" value={tw.close_time} onChange={(v) => setTime('close_time', v)} />
        </div>

        <div className="my-6 h-px bg-line" />
        <div className="mb-[14px] text-[15px] font-extrabold">أيام النشاط</div>
        <div className="flex flex-wrap gap-[9px]">
          {DAYS.map((day, i) => {
            const active = tw.active_days.includes(i);
            return (
              <button
                key={day}
                onClick={() => toggleDay(i)}
                className="rounded-[11px] px-[18px] py-[9px] text-[13.5px] font-extrabold transition-all"
                style={
                  active
                    ? { background: 'linear-gradient(135deg,#6D5EF6,#9B6CF8)', color: '#fff', boxShadow: '0 6px 14px rgba(109,94,246,.3)' }
                    : { background: '#F2F0F8', color: '#A39EB8' }
                }
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* points */}
      <div className="mb-[14px] mt-7 text-[17px] font-extrabold">نقاط كل حالة حضور</div>
      <div className="grid gap-[18px] sm:grid-cols-3">
        <PointCard color="#15B886" title="حضور مبكر" hint="نقطة لكل حضور مبكر" value={pr.points_early} onChange={(v) => setPr({ ...pr, points_early: v })} />
        <PointCard color="#3B82F6" title="حضور عادي" hint="نقطة لكل حضور عادي" value={pr.points_normal} onChange={(v) => setPr({ ...pr, points_normal: v })} />
        <PointCard color="#F59E0B" title="حضور متأخر" hint="نقطة لكل حضور متأخر" value={pr.points_late} onChange={(v) => setPr({ ...pr, points_late: v })} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button onClick={save} className="btn-primary px-[30px] py-[14px] text-[14.5px]" style={{ borderRadius: 13 }}>
          حفظ التغييرات
        </button>
        {saved && <span className="text-[13.5px] font-bold text-success">تم الحفظ ✓</span>}
      </div>
    </DashLayout>
  );
}

function Band({ flex, from, to, label, small }: { flex: number; from: string; to: string; label: string; small?: boolean }) {
  return (
    <div
      className="flex items-center justify-center font-extrabold text-white"
      style={{ flex, background: `linear-gradient(180deg,${from},${to})`, fontSize: small ? 13 : 14 }}
    >
      {label}
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-[6px] block text-[12px] font-bold text-muted">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="field bg-[#F8F6FD] px-3 py-[10px] text-center text-[14px] font-bold"
      />
    </div>
  );
}

function PointCard({ color, title, hint, value, onChange }: { color: string; title: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="card p-[22px]">
      <div className="flex items-center gap-[10px]">
        <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        <span className="text-[15px] font-extrabold">{title}</span>
      </div>
      <div className="mt-[18px] flex items-center justify-between rounded-[13px] border-[1.5px] border-[#E6E1F2] bg-[#F8F6FD] px-3 py-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-white text-[20px] font-black text-primary shadow-[0_2px_6px_rgba(0,0,0,.06)]"
        >
          −
        </button>
        <span className="text-[26px] font-black">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-white text-[20px] font-black text-primary shadow-[0_2px_6px_rgba(0,0,0,.06)]"
        >
          +
        </button>
      </div>
      <div className="mt-2 text-center text-[12.5px] font-semibold text-muted-soft">{hint}</div>
    </div>
  );
}
