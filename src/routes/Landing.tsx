import { useNavigate } from 'react-router-dom';
import {
  Check,
  Play,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  BarChart3,
  School,
  Tent,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Landing() {
  const navigate = useNavigate();
  const goSignup = () => navigate('/signup');

  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ===== Top nav ===== */}
      <div className="sticky top-0 z-50 border-b border-[rgba(120,100,200,.1)] bg-[rgba(246,245,251,.82)] backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-[14px]">
          <Logo size={38} textSize={23} />
          <div className="flex items-center gap-7">
            <nav className="hidden gap-7 text-[15px] font-semibold text-[#56516E] md:flex">
              <a href="#features" className="cursor-pointer hover:text-primary">المزايا</a>
              <a href="#how" className="cursor-pointer hover:text-primary">كيف يعمل</a>
              <a href="#pricing" className="cursor-pointer hover:text-primary">مجاني</a>
              <a href="#audience" className="cursor-pointer hover:text-primary">لمن</a>
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={goSignup} className="px-2 py-2 text-[14px] font-bold text-[#4B3FD4]">
                دخول
              </button>
              <button onClick={goSignup} className="btn-primary px-5 py-[11px] text-[14px]">
                ابدأ مجانًا
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[radial-gradient(1200px_520px_at_85%_-10%,rgba(155,108,248,.18),transparent),radial-gradient(900px_480px_at_5%_10%,rgba(109,94,246,.14),transparent),#F6F5FB]">
        <div className="mx-auto grid max-w-content items-center gap-12 px-6 pb-[90px] pt-[70px] md:grid-cols-[1.05fr_.95fr]">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E3F7] bg-white px-[15px] py-[7px] text-[13px] font-bold text-[#5B4FD0] shadow-[0_4px_14px_rgba(80,60,180,.07)]">
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(21,184,134,.18)]" />
              نظام تحضير ذكي لكل جهة — بحساب مستقل
            </div>
            <h1 className="mt-[22px] text-[40px] font-black leading-[1.12] tracking-[-1px] md:text-[55px]">
              تحضير ذكي لكل المؤسسات،
              <br />
              <span className="bg-[linear-gradient(120deg,#6D5EF6,#9B6CF8)] bg-clip-text text-transparent">
                بدون أي تعقيد.
              </span>
            </h1>
            <p className="mt-[22px] max-w-[480px] text-[18px] font-medium leading-[1.7] text-[#56516E] md:text-[19px]">
              أنشئ حساب جهتك في دقيقة، شارك رابط التحضير مع طلابك، ودعهم يسجّلون حضورهم من جوالهم — مع
              تحكّم كامل بالموقع والوقت والنقاط والتقارير.
            </p>
            <div className="mt-8 flex flex-wrap gap-[14px]">
              <button onClick={goSignup} className="btn-primary px-[30px] py-4 text-[17px]" style={{ borderRadius: 15 }}>
                أنشئ حساب جهتك مجانًا
              </button>
              <button
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary px-[26px] py-4 text-[17px]"
                style={{ borderRadius: 15, color: '#3B3556' }}
              >
                <Play size={20} color="#6D5EF6" />
                شاهد كيف يعمل
              </button>
            </div>
            <div className="mt-[38px] flex gap-7">
              <div>
                <div className="text-[26px] font-black text-ink-soft">5 ثوانٍ</div>
                <div className="text-[13px] font-semibold text-[#807B96]">لتسجيل الحضور</div>
              </div>
              <div className="w-px bg-[#E2DEF0]" />
              <div>
                <div className="text-[26px] font-black text-ink-soft">100%</div>
                <div className="text-[13px] font-semibold text-[#807B96]">عزل بيانات</div>
              </div>
            </div>
          </div>

          {/* phone mockup */}
          <div className="flex animate-rise justify-center">
            <div className="relative">
              <div className="absolute -inset-[26px] rounded-[54px] bg-[linear-gradient(135deg,rgba(109,94,246,.25),rgba(155,108,248,.12))] blur-[30px]" />
              <div className="relative h-[580px] w-[286px] animate-floaty rounded-[46px] bg-[#0F0B22] p-[13px] shadow-[0_40px_80px_rgba(40,26,90,.35)]">
                <div className="absolute left-1/2 top-[13px] z-[3] h-[26px] w-[122px] -translate-x-1/2 rounded-b-2xl bg-[#0F0B22]" />
                <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[34px] bg-[linear-gradient(170deg,#F6F5FB_0%,#EFEBFB_100%)] px-[22px] pb-[26px] pt-[54px]">
                  <div className="flex h-[74px] w-[74px] items-center justify-center rounded-[20px] border border-[#EEE9FB] bg-white text-[25px] font-black text-primary shadow-[0_8px_20px_rgba(80,60,180,.14)]">
                    ط
                  </div>
                  <div className="mt-4 text-[18px] font-extrabold text-[#241E3C]">مركز طاقات الشباب</div>
                  <div className="mt-1 text-[12.5px] font-semibold text-[#8A85A0]">نادي المهارات — الفترة الصباحية</div>
                  <div className="mt-[18px] flex items-center gap-[6px] rounded-full border border-[#EAE5F8] bg-white px-[13px] py-[6px] text-[12px] font-bold text-success">
                    <Clock size={14} strokeWidth={2.4} />
                    النافذة مفتوحة — 07:12 ص
                  </div>
                  <div className="flex-1" />
                  <div className="relative mb-[6px] flex h-[152px] w-[152px] items-center justify-center">
                    <div className="absolute inset-0 animate-ring rounded-full bg-primary-gradient opacity-50" />
                    <div className="absolute inset-0 animate-ring rounded-full bg-primary-gradient opacity-50 [animation-delay:1.2s]" />
                    <div className="relative flex h-[128px] w-[128px] flex-col items-center justify-center rounded-full bg-primary-gradient text-white shadow-[0_16px_34px_rgba(109,94,246,.5)]">
                      <Check size={34} strokeWidth={2} />
                      <span className="mt-[7px] text-[16px] font-extrabold">تسجيل الحضور</span>
                    </div>
                  </div>
                  <div className="mb-[6px] text-[12px] font-semibold text-[#9A95AE]">اضغط لتسجيل حضورك الآن</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="mx-auto max-w-content px-6 pb-[30px] pt-[84px] text-center">
        <div className="text-[14px] font-extrabold tracking-[1px] text-primary">كيف يعمل</div>
        <h2 className="mt-[10px] text-[32px] font-black tracking-[-.5px] md:text-[40px]">ثلاث خطوات وتبدأ التحضير</h2>
        <p className="mx-auto mt-[14px] max-w-[520px] text-[17px] font-medium text-muted">
          من إنشاء الحساب حتى أول حضور مُسجّل، خلال دقائق معدودة.
        </p>
        <div className="mt-[50px] grid gap-6 md:grid-cols-3">
          {[
            ['01', 'أنشئ حسابك', 'سجّل اسم جهتك ونوعها وبريدك. تحصل فورًا على رابط لوحة تحكم ورابط تحضير خاصين بك.'],
            ['02', 'اضبط الإعدادات', 'حدّد المواقع المسموحة، نوافذ الوقت (مبكر/عادي/متأخر)، وقيمة النقاط لكل حالة — كلها بنقرات بسيطة.'],
            ['03', 'شارك رابط التحضير', 'أرسل الرابط أو رمز الـ QR لطلابك، فيسجّلون حضورهم من جوالهم — وتظهر النتائج في تقاريرك لحظيًا.'],
          ].map(([num, title, body], i) => (
            <div key={num} className="hover-lift relative rounded-[22px] border border-[#EEEBF7] bg-white p-[34px_26px] text-right shadow-card-lg">
              <div className="absolute left-[26px] top-6 text-[46px] font-black leading-none text-[#F0ECFB]">{num}</div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EEEAFE,#F6F1FE)]">
                {[<School key="a" size={27} color="#6D5EF6" strokeWidth={1.9} />, <Clock key="b" size={27} color="#6D5EF6" strokeWidth={1.9} />, <BarChart3 key="c" size={27} color="#6D5EF6" strokeWidth={1.9} />][i]}
              </div>
              <h3 className="mb-2 mt-5 text-[21px] font-extrabold">{title}</h3>
              <p className="m-0 text-[15px] font-medium leading-[1.7] text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="mx-auto max-w-content px-6 pb-[30px] pt-[74px]">
        <div className="text-center">
          <div className="text-[14px] font-extrabold tracking-[1px] text-primary">المزايا</div>
          <h2 className="mt-[10px] text-[32px] font-black tracking-[-.5px] md:text-[40px]">كل ما تحتاجه جهتك في مكان واحد</h2>
        </div>
        <div className="mt-[46px] grid gap-[22px] md:grid-cols-3">
          <div className="hover-lift flex flex-col rounded-[22px] bg-[linear-gradient(160deg,#6D5EF6,#8B5CF6)] p-[30px] text-white shadow-feature md:row-span-2">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-white/[.18]">
              <ShieldCheck size={26} strokeWidth={1.9} />
            </div>
            <h3 className="mb-[10px] mt-[22px] text-[23px] font-extrabold">عزل بيانات صارم لكل جهة</h3>
            <p className="m-0 text-[15px] font-medium leading-[1.8] opacity-90">
              كل جهة تعمل في فضائها الخاص بمعرّف فريد غير قابل للتخمين. يستحيل تقنيًا أن تطّلع جهة على
              بيانات جهة أخرى — العزل في صميم النظام لا في الواجهة فقط.
            </p>
            <div className="flex-1" />
            <div className="mt-[26px] flex flex-wrap gap-[10px]">
              <span className="rounded-[9px] bg-white/[.16] px-3 py-[7px] text-[12.5px] font-bold">Row-Level Security</span>
              <span className="rounded-[9px] bg-white/[.16] px-3 py-[7px] text-[12.5px] font-bold">روابط مشفّرة</span>
            </div>
          </div>
          {[
            [<MapPin key="1" size={25} color="#6D5EF6" strokeWidth={1.9} />, 'تحكّم بالموقع الجغرافي', 'حدّد مواقع معتمدة بنطاق بالأمتار، وارفض أي محاولة تسجيل خارج النطاق تلقائيًا.'],
            [<Clock key="2" size={25} color="#6D5EF6" strokeWidth={1.9} />, 'تحكّم دقيق بالأوقات', 'نوافذ مبكر/عادي/متأخر ووقت إغلاق، باحترام المنطقة الزمنية لجهتك.'],
            [<Sparkles key="3" size={25} color="#6D5EF6" strokeWidth={1.9} />, 'نظام نقاط محفّز', 'امنح نقاطًا لكل حالة حضور، واعرض لوحة ترتيب تشجّع طلابك على الالتزام.'],
            [<BarChart3 key="4" size={25} color="#6D5EF6" strokeWidth={1.9} />, 'تقارير وتصدير Excel/PDF', 'تقارير غنية بالفلاتر، قابلة للتصدير بصيغة Excel وPDF مع شعار جهتك.'],
          ].map(([icon, title, body], i) => (
            <div key={i} className="hover-lift rounded-[22px] border border-[#EEEBF7] bg-white p-7 shadow-card-lg">
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[#F1EEFE]">{icon}</div>
              <h3 className="mb-[7px] mt-[18px] text-[19px] font-extrabold">{title as string}</h3>
              <p className="m-0 text-[14.5px] font-medium leading-[1.7] text-muted">{body as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== AUDIENCE ===== */}
      <section id="audience" className="mt-16 border-t border-[#EFECF8] bg-[linear-gradient(180deg,#fff,#F6F4FC)]">
        <div className="mx-auto max-w-content px-6 py-[74px]">
          <div className="text-center">
            <div className="text-[14px] font-extrabold tracking-[1px] text-primary">لمن هذا المنتج</div>
            <h2 className="mt-[10px] text-[32px] font-black tracking-[-.5px] md:text-[40px]">مصمّم لكل جهة تحتاج حضورًا منظّمًا</h2>
          </div>
          <div className="mt-[46px] grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [<Tent key="1" size={29} color="#6D5EF6" strokeWidth={1.8} />, 'المراكز الصيفية', 'برامج وأنشطة صيفية بمواعيد مرنة ومجموعات متغيّرة.'],
              [<School key="2" size={29} color="#6D5EF6" strokeWidth={1.8} />, 'المدارس', 'حضور يومي للصفوف والحلقات.'],
              [<GraduationCap key="3" size={29} color="#6D5EF6" strokeWidth={1.8} />, 'الجامعات', 'محاضرات وقاعات متعددة في حرم واحد.'],
              [<Building2 key="4" size={29} color="#6D5EF6" strokeWidth={1.8} />, 'الشركات والمراكز', 'دوام موظفين ودورات تدريبية.'],
            ].map(([icon, title, body], i) => (
              <div key={i} className="hover-lift rounded-[20px] border border-[#EEEBF7] bg-white p-[30px_24px] text-center shadow-card-lg">
                <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#EEEAFE,#F8F2FE)]">
                  {icon}
                </div>
                <h3 className="mb-[6px] mt-[18px] text-[19px] font-extrabold">{title as string}</h3>
                <p className="m-0 text-[14px] font-medium leading-[1.65] text-muted">{body as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING (free) ===== */}
      <section id="pricing" className="mx-auto max-w-content px-6 pb-[30px] pt-[74px]">
        <div className="text-center">
          <div className="text-[14px] font-extrabold tracking-[1px] text-primary">مجاني بالكامل</div>
          <h2 className="mt-[10px] text-[32px] font-black tracking-[-.5px] md:text-[40px]">كل المزايا. بدون أي اشتراك.</h2>
          <p className="mx-auto mt-[14px] max-w-[560px] text-[17px] font-medium text-muted">
            حاضِر مجاني تمامًا لكل الجهات — لا رسوم، لا بطاقة ائتمان، ولا حدود. أنشئ حساب جهتك واستخدم
            النظام كاملًا.
          </p>
        </div>
        <div className="mx-auto mt-[46px] max-w-[780px]">
          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(165deg,#2A2150,#3B2F73)] p-[44px] text-white shadow-[0_24px_50px_rgba(60,42,140,.3)]">
            <div className="absolute -left-10 -top-[50px] h-[210px] w-[210px] rounded-full bg-primary-gradient opacity-50 blur-[50px]" />
            <div className="relative grid items-center gap-[34px] md:grid-cols-[1fr_1px_1.15fr]">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(95,227,180,.32)] bg-[rgba(95,227,180,.16)] px-[14px] py-[6px] text-[13px] font-extrabold text-[#5FE3B4]">
                  مجاني للأبد
                </div>
                <div className="mt-[18px] flex items-end justify-center gap-2">
                  <span className="text-[74px] font-black leading-none">0</span>
                  <span className="mb-[14px] text-[18px] font-bold text-[#C7BFEA]">ريال</span>
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#C7BFEA]">لكل جهة — بلا اشتراك</div>
              </div>
              <div className="hidden h-[168px] bg-white/[.14] md:block" />
              <div className="flex flex-col gap-[15px] text-[15px] font-semibold">
                {[
                  'طلاب ومواقع غير محدودة',
                  'تحقق جغرافي + نوافذ وقت ونقاط',
                  'تقارير كاملة + تصدير Excel وPDF',
                  'عزل بيانات صارم لكل جهة',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-[10px]">
                    <span className="text-[17px] text-[#5FE3B4]">✓</span> {t}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={goSignup} className="btn-primary mt-8 w-full py-4 text-[16px]">
              أنشئ حساب جهتك مجانًا
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto mt-[60px] max-w-content px-6">
        <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#6D5EF6,#8B5CF6)] p-[60px] text-center shadow-[0_30px_60px_rgba(109,94,246,.35)]">
          <div className="absolute -right-[30px] -top-[60px] h-[220px] w-[220px] rounded-full bg-white/[.12]" />
          <div className="absolute -bottom-[80px] -left-[20px] h-[200px] w-[200px] rounded-full bg-white/[.1]" />
          <div className="relative">
            <h2 className="m-0 text-[30px] font-black tracking-[-.5px] text-white md:text-[38px]">جاهز تبدأ تحضير جهتك؟</h2>
            <p className="mt-[14px] text-[18px] font-medium text-white/90">أنشئ حسابك مجانًا الآن — بلا بطاقة ائتمان، وخلال دقيقة واحدة.</p>
            <button onClick={goSignup} className="hover-lift mt-7 rounded-[15px] bg-white px-[34px] py-4 text-[17px] font-extrabold text-[#5B4FD0] shadow-[0_14px_30px_rgba(20,14,45,.2)]">
              أنشئ حساب جهتك مجانًا
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="mt-[74px] bg-[#1C1633] text-[#C9C3E0]">
        <div className="mx-auto max-w-content px-6 pb-[26px] pt-[56px]">
          <div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-[11px]">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-primary-gradient">
                  <Check size={21} strokeWidth={3} color="#fff" />
                </div>
                <span className="text-[22px] font-black text-white">حاضِر</span>
              </div>
              <p className="mt-[18px] max-w-[280px] text-[14.5px] font-medium leading-[1.8] text-[#A39CC4]">
                نظام تحضير ذكي متعدد الجهات، يجمع بين البساطة للطالب والتحكّم الكامل للجهة وعزل البيانات الصارم.
              </p>
            </div>
            {[
              ['المنتج', ['المزايا', 'مجاني', 'التقارير', 'الأمان']],
              ['الجهات', ['المراكز الصيفية', 'المدارس', 'الجامعات', 'الشركات']],
              ['الدعم', ['المساعدة', 'سياسة الخصوصية', 'تواصل معنا', 'الحالة']],
            ].map(([title, items]) => (
              <div key={title as string}>
                <div className="mb-4 text-[15px] font-extrabold text-white">{title as string}</div>
                <div className="flex flex-col gap-3 text-[14px] font-medium">
                  {(items as string[]).map((it) => (
                    <span key={it} className="cursor-pointer hover:text-white">{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="my-5 mt-9 h-px bg-[#352B57]" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] font-medium text-[#8A82AC]">
            <span>© 2026 حاضِر. جميع الحقوق محفوظة.</span>
            <span>صُنع بعناية لكل جهة تهتم بحضور منظّم.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
