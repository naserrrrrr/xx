import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ShieldCheck, Clock, ChevronDown } from 'lucide-react';
import { Logo } from '../components/Logo';
import { auth, DEMO_MODE } from '../lib/api';
import { useOrg } from '../hooks/useOrg';
import { ORG_TYPE_LABELS, type OrgType } from '../lib/types';

export default function Signup() {
  const navigate = useNavigate();
  const { setOrg } = useOrg();
  const [name, setName] = useState('');
  const [type, setType] = useState<OrgType>('summer_center');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('يرجى إدخال اسم الجهة');
    if (!email.includes('@')) return setError('يرجى إدخال بريد إلكتروني صحيح');
    if (password.length < 8) return setError('كلمة المرور يجب أن تكون ٨ أحرف على الأقل');
    setLoading(true);
    try {
      const res = await auth.signup({ orgName: name.trim(), type, email: email.trim(), password });
      setOrg(res.org);
      navigate('/welcome', { state: { slug: res.slug } });
    } catch (err: any) {
      setError(err?.message ?? 'تعذّر إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-surface md:grid-cols-2">
      {/* form side */}
      <div className="flex items-center justify-center px-7 py-12">
        <form onSubmit={submit} className="w-full max-w-[440px]">
          <div className="mb-[30px]">
            <Logo size={38} textSize={23} />
          </div>
          <div className="mb-[22px] flex items-center gap-2">
            <div className="h-[6px] flex-1 rounded-full bg-primary-gradient" />
            <div className="h-[6px] flex-1 rounded-full bg-[#E4DEF3]" />
            <span className="mr-1 text-[12.5px] font-bold text-muted-soft">الخطوة 1 من 2</span>
          </div>
          <h1 className="m-0 text-[32px] font-black tracking-[-.5px]">أنشئ حساب جهتك</h1>
          <p className="mb-7 mt-[10px] text-[15.5px] font-medium text-muted">
            دقيقة واحدة، وتحصل على نظام تحضير كامل خاص بجهتك.
          </p>

          <label className="mb-[7px] block text-[13.5px] font-bold text-[#3B3556]">اسم الجهة</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: مركز طاقات الشباب"
            className="field mb-[18px] px-4 py-[14px] text-[15px]"
          />

          <label className="mb-[7px] block text-[13.5px] font-bold text-[#3B3556]">نوع الجهة</label>
          <div className="relative mb-[18px]">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OrgType)}
              className="field cursor-pointer appearance-none px-4 py-[14px] text-[15px]"
            >
              {(Object.keys(ORG_TYPE_LABELS) as OrgType[]).map((k) => (
                <option key={k} value={k}>
                  {ORG_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9A95AE]" />
          </div>

          <label className="mb-[7px] block text-[13.5px] font-bold text-[#3B3556]">البريد الإلكتروني</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            placeholder="name@center.sa"
            className="field mb-[18px] px-4 py-[14px] text-right text-[15px]"
          />

          <label className="mb-[7px] block text-[13.5px] font-bold text-[#3B3556]">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="٨ أحرف على الأقل"
            className="field mb-6 px-4 py-[14px] text-[15px]"
          />

          {error && (
            <div className="mb-4 rounded-field border border-[#F6D2D3] bg-[#FCEDED] px-4 py-3 text-[13.5px] font-bold text-[#C13338]">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-[16px]">
            {loading ? 'جارٍ الإنشاء…' : 'إنشاء الحساب مجانًا'}
          </button>
          <p className="mt-4 text-center text-[13px] font-semibold text-muted-soft">
            بإنشائك الحساب فأنت توافق على سياسة الخصوصية. المنتج مجاني بالكامل.
          </p>
          {DEMO_MODE && (
            <p className="mt-2 text-center text-[12px] font-semibold text-muted-faint">
              وضع المعاينة: البيانات تُحفظ محليًا في متصفحك فقط.
            </p>
          )}
        </form>
      </div>

      {/* visual side */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#2A2150,#4B3A8C)] p-12 md:flex">
        <div className="absolute -right-10 -top-[60px] h-[240px] w-[240px] rounded-full bg-primary-gradient opacity-[.55] blur-[60px]" />
        <div className="absolute -bottom-[80px] -left-[30px] h-[220px] w-[220px] rounded-full bg-white/[.08]" />
        <div className="relative max-w-[420px] text-white">
          <h2 className="m-0 text-[34px] font-black leading-[1.3]">
            كل ما تحتاجه جهتك،
            <br />
            جاهز فور التسجيل.
          </h2>
          <div className="mt-[34px] flex flex-col gap-[18px]">
            {[
              [<Link2 key="1" size={22} strokeWidth={1.9} />, 'رابطان فوريان', 'رابط لوحة التحكم ورابط التحضير الخاص بطلابك.'],
              [<ShieldCheck key="2" size={22} strokeWidth={1.9} />, 'بياناتك معزولة تمامًا', 'لا تختلط بيانات جهتك مع أي جهة أخرى إطلاقًا.'],
              [<Clock key="3" size={22} strokeWidth={1.9} />, 'إعداد في دقائق', 'مواقع وأوقات ونقاط — كلها بإعدادات بسيطة وواضحة.'],
            ].map(([icon, title, body], i) => (
              <div key={i} className="flex items-start gap-[14px]">
                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-white/[.16]">{icon}</div>
                <div>
                  <div className="text-[17px] font-extrabold">{title as string}</div>
                  <div className="mt-[3px] text-[14px] font-medium text-[#CFC8EC]">{body as string}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[34px] flex items-center gap-[13px] rounded-2xl border border-white/[.16] bg-white/[.1] px-5 py-[18px]">
            <ShieldCheck size={26} />
            <span className="text-[14px] font-semibold leading-[1.5] text-[#CFC8EC]">
              عزل بيانات بنسبة 100%
              <br />
              لكل جهة على حدة — في صميم النظام
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
