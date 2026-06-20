import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Clock, MapPin, X, Loader2 } from 'lucide-react';
import { attend } from '../lib/api';
import { evaluateWindow, STATUS_LABELS, type WindowState } from '../lib/attendance';
import type { AttendanceStatus, PublicOrgInfo } from '../lib/types';

type Phase = 'loading' | 'notfound' | 'idle' | 'submitting' | 'success' | 'error' | 'duplicate';

const WINDOW_BADGE: Record<WindowState, { text: string; ok: boolean }> = {
  before: { text: 'لم تفتح النافذة بعد', ok: false },
  early: { text: 'النافذة مفتوحة — حضور مبكر', ok: true },
  normal: { text: 'النافذة مفتوحة', ok: true },
  late: { text: 'النافذة مفتوحة — متأخر', ok: true },
  closed: { text: 'أُغلقت النافذة', ok: false },
  inactive_day: { text: 'لا يوجد نشاط اليوم', ok: false },
};

export default function Attend() {
  const { slug = '' } = useParams();
  const [info, setInfo] = useState<PublicOrgInfo | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [studentName, setStudentName] = useState('');
  const [result, setResult] = useState<{
    status: AttendanceStatus;
    points: number;
    distance_m: number | null;
    reason: string | null;
    timeLabel: string;
  } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    attend
      .publicInfo(slug)
      .then((i) => {
        if (!i) {
          setPhase('notfound');
        } else {
          setInfo(i);
          setPhase('idle');
        }
      })
      .catch(() => setPhase('notfound'));
  }, [slug]);

  // تحديث شارة الوقت كل دقيقة
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const windowEval =
    info?.time_window != null ? evaluateWindow(info.time_window, info.timezone) : null;
  void tick;

  const getPosition = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise((resolve) => {
      if (!('geolocation' in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    });

  const doAttend = async () => {
    if (!studentName.trim()) {
      alert('يرجى إدخال اسمك أولًا');
      return;
    }
    setPhase('submitting');
    const position = info?.geo_required ? await getPosition() : await getPosition();
    try {
      const res = await attend.submit(slug, studentName.trim(), position);
      const timeLabel = windowEval?.label ?? '';
      if (res.duplicate) {
        setResult({ status: res.status, points: 0, distance_m: res.distance_m, reason: null, timeLabel });
        setPhase('duplicate');
        return;
      }
      if (res.accepted) {
        setResult({ status: res.status, points: res.points, distance_m: res.distance_m, reason: null, timeLabel });
        setPhase('success');
      } else {
        const reason = res.rejected_reason === 'out_of_time' ? 'out_of_time' : 'out_of_range';
        setResult({ status: 'rejected', points: 0, distance_m: res.distance_m, reason, timeLabel });
        setPhase('error');
      }
    } catch {
      setResult({ status: 'rejected', points: 0, distance_m: null, reason: 'out_of_range', timeLabel: '' });
      setPhase('error');
    }
  };

  const reset = () => {
    setResult(null);
    setPhase('idle');
  };

  // ===== شاشات الحالة =====
  if (phase === 'loading') {
    return (
      <Shell>
        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-[14px] font-bold">جارٍ التحميل…</span>
        </div>
      </Shell>
    );
  }

  if (phase === 'notfound' || !info) {
    return (
      <Shell>
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCEDED]">
            <X size={40} color="#E5484D" />
          </div>
          <div className="text-[19px] font-extrabold">الرابط غير صحيح</div>
          <p className="text-[14px] font-medium text-muted">تعذّر العثور على هذه الجهة. تأكد من الرابط.</p>
        </div>
      </Shell>
    );
  }

  const logo = info.logo_url ? (
    <img src={info.logo_url} alt={info.name} className="h-[78px] w-[78px] rounded-[22px] border border-[#EEE9FB] object-cover" />
  ) : (
    <div className="flex h-[78px] w-[78px] items-center justify-center rounded-[22px] border border-[#EEE9FB] bg-white text-[27px] font-black text-primary shadow-[0_8px_20px_rgba(80,60,180,.14)]">
      {info.name.trim()[0]}
    </div>
  );

  return (
    <Shell>
      {/* IDLE */}
      {(phase === 'idle' || phase === 'submitting') && (
        <div className="flex h-full flex-col items-center bg-[linear-gradient(175deg,#F6F5FB,#EFEBFB)] px-6 pb-8 pt-[54px]">
          {logo}
          <div className="mt-4 text-[19px] font-extrabold text-[#241E3C]">{info.name}</div>
          <div className="mt-1 text-[13px] font-semibold text-[#8A85A0]">سجّل حضورك من هنا</div>
          {windowEval && (
            <div
              className="mt-[18px] flex items-center gap-[6px] rounded-full border bg-white px-[14px] py-[7px] text-[12.5px] font-bold"
              style={{
                borderColor: WINDOW_BADGE[windowEval.state].ok ? '#EAE5F8' : '#F6D2D3',
                color: WINDOW_BADGE[windowEval.state].ok ? '#15B886' : '#C13338',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: WINDOW_BADGE[windowEval.state].ok ? '#15B886' : '#E5484D',
                  boxShadow: WINDOW_BADGE[windowEval.state].ok ? '0 0 0 4px rgba(21,184,134,.18)' : 'none',
                }}
              />
              {WINDOW_BADGE[windowEval.state].text} — {windowEval.label}
            </div>
          )}

          <div className="mt-6 w-full max-w-[300px]">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="اكتب اسمك للتسجيل"
              className="field bg-white px-4 py-3 text-center text-[15px]"
            />
          </div>

          <div className="flex-1" />
          <button
            onClick={doAttend}
            disabled={phase === 'submitting'}
            className="relative mb-[18px] flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full bg-primary-gradient text-white shadow-[0_16px_36px_rgba(109,94,246,.5)] disabled:opacity-80"
          >
            {phase === 'idle' && <span className="absolute inset-0 animate-ring rounded-full bg-primary-gradient opacity-[.45]" />}
            {phase === 'submitting' ? (
              <Loader2 size={38} className="animate-spin" />
            ) : (
              <>
                <Check size={38} strokeWidth={2} />
                <span className="mt-2 text-[17px] font-extrabold">تسجيل الحضور</span>
              </>
            )}
          </button>
          <div className="text-[12px] font-semibold text-[#9A95AE]">
            {phase === 'submitting' ? 'جارٍ تحديد موقعك…' : 'اضغط لتسجيل حضورك الآن'}
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {phase === 'success' && result && (
        <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(175deg,#15B886,#0E8F73)] px-[26px] py-10 text-center text-white">
          <div className="relative mb-2 flex h-[104px] w-[104px] items-center justify-center">
            <div className="absolute inset-0 animate-ring rounded-full bg-white/25" />
            <div className="relative flex h-[104px] w-[104px] animate-pop items-center justify-center rounded-full bg-white/[.18]">
              <Check size={56} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-[14px] text-[25px] font-black">تم تسجيل حضورك!</div>
          <div className="mt-[6px] text-[14px] font-semibold text-white/85">
            {info.name} — {result.timeLabel}
          </div>
          <div className="mt-[22px] inline-flex items-center gap-2 rounded-full bg-white/20 px-[18px] py-[9px] text-[15px] font-extrabold">
            <span className="h-[9px] w-[9px] rounded-full bg-white" /> {STATUS_LABELS[result.status]}
          </div>
          <div className="mt-[18px] rounded-[18px] bg-white/[.14] px-7 py-4">
            <div className="text-[34px] font-black">+{result.points}</div>
            <div className="mt-[2px] text-[13px] font-bold text-white/85">نقطة مكتسبة</div>
          </div>
          <button onClick={reset} className="hover-lift mt-[26px] rounded-[13px] bg-white px-[34px] py-[13px] text-[15px] font-extrabold text-[#0E8F73]">
            تم
          </button>
        </div>
      )}

      {/* DUPLICATE */}
      {phase === 'duplicate' && result && (
        <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(175deg,#3B82F6,#2C63C4)] px-7 py-10 text-center text-white">
          <div className="flex h-[104px] w-[104px] animate-pop items-center justify-center rounded-full bg-white/[.18]">
            <Check size={52} strokeWidth={3} />
          </div>
          <div className="mt-5 text-[23px] font-black">سُجّل حضورك مسبقًا</div>
          <p className="mt-[10px] text-[14.5px] font-medium leading-[1.7] text-white/90">
            لقد سجّلت حضورك اليوم بالفعل ({STATUS_LABELS[result.status]}). لا حاجة للتسجيل مرة أخرى.
          </p>
          <button onClick={reset} className="hover-lift mt-6 rounded-[13px] bg-white px-[34px] py-[13px] text-[15px] font-extrabold text-[#2C63C4]">
            حسنًا
          </button>
        </div>
      )}

      {/* ERROR */}
      {phase === 'error' && result && (
        <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(175deg,#E5484D,#C13338)] px-7 py-10 text-center text-white">
          <div className="flex h-[104px] w-[104px] animate-pop items-center justify-center rounded-full bg-white/[.18]">
            <X size={52} strokeWidth={3} />
          </div>
          <div className="mt-5 text-[24px] font-black">
            {result.reason === 'out_of_time' ? 'خارج وقت التحضير' : 'خارج النطاق المسموح'}
          </div>
          <p className="mt-[10px] text-[14.5px] font-medium leading-[1.7] text-white/90">
            {result.reason === 'out_of_time'
              ? 'النافذة غير مفتوحة الآن. حاول خلال وقت التحضير المعتمد.'
              : 'يبدو أنك تبعد عن الموقع المعتمد. اقترب من المكان ثم حاول مجددًا.'}
          </p>
          {result.distance_m != null && result.reason === 'out_of_range' && (
            <div className="mt-[18px] flex items-center gap-2 rounded-[14px] bg-white/[.14] px-5 py-3 text-[13.5px] font-bold">
              <MapPin size={16} /> تبعد ~{result.distance_m} م عن الموقع
            </div>
          )}
          <div className="mt-[14px] text-[12px] font-semibold text-white/70">سُجّلت المحاولة في تقارير الجهة.</div>
          <button onClick={reset} className="hover-lift mt-6 rounded-[13px] bg-white px-[34px] py-[13px] text-[15px] font-extrabold text-[#C13338]">
            حاول مجددًا
          </button>
        </div>
      )}
    </Shell>
  );
}

/** إطار العرض: على الجوال يملأ الشاشة، وعلى سطح المكتب يظهر داخل هيكل جوال */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(700px_500px_at_50%_0%,rgba(155,108,248,.14),transparent),#EAE7F4] sm:p-8">
      {/* جوال: ملء الشاشة */}
      <div className="block h-screen w-screen sm:hidden">{children}</div>
      {/* سطح المكتب: هيكل جوال */}
      <div className="relative hidden h-[600px] w-[300px] rounded-[46px] bg-[#0F0B22] p-[13px] shadow-[0_40px_80px_rgba(40,26,90,.3)] sm:block">
        <div className="absolute left-1/2 top-[13px] z-[3] h-[26px] w-[122px] -translate-x-1/2 rounded-b-2xl bg-[#0F0B22]" />
        <div className="h-full w-full overflow-hidden rounded-[34px]">{children}</div>
      </div>
    </div>
  );
}
