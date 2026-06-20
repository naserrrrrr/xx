import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, QrCode, LayoutDashboard, Upload } from 'lucide-react';
import { QrModal } from '../components/QrModal';
import { useOrg } from '../hooks/useOrg';
import { org_ } from '../lib/api';
import { attendLink, dashLink } from '../lib/slug';

export default function Welcome() {
  const navigate = useNavigate();
  const { org, refresh } = useOrg();
  const [copied, setCopied] = useState<'dash' | 'attend' | null>(null);
  const [qr, setQr] = useState<{ value: string; title: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(org?.logo_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!org) {
    navigate('/signup');
    return null;
  }

  const dash = dashLink(org.slug);
  const attend = attendLink(org.slug);

  const copy = (which: 'dash' | 'attend', value: string) => {
    try {
      navigator.clipboard?.writeText(`https://${value}`);
    } catch {
      /* ignore */
    }
    setCopied(which);
    setTimeout(() => setCopied((c) => (c === which ? null : c)), 1700);
  };

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      await org_.update(org.id, { logo_url: dataUrl });
      await refresh();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_420px_at_50%_-8%,rgba(155,108,248,.16),transparent),#F6F5FB] px-6 pb-[70px] pt-[54px]">
      <div className="mx-auto max-w-[760px] text-center">
        <div className="relative mx-auto h-[88px] w-[88px]">
          <div className="absolute inset-0 animate-ring rounded-full bg-[linear-gradient(135deg,#15B886,#0EA5A4)] opacity-40" />
          <div className="relative flex h-[88px] w-[88px] animate-pop items-center justify-center rounded-full bg-[linear-gradient(135deg,#15B886,#0EA5A4)] shadow-[0_16px_34px_rgba(21,184,134,.4)]">
            <Check size={44} strokeWidth={3} color="#fff" />
          </div>
        </div>
        <h1 className="mt-6 text-[30px] font-black tracking-[-.5px] md:text-[36px]">تم إنشاء حساب جهتك! 🎉</h1>
        <p className="mt-3 text-[17px] font-medium text-muted">
          هذان رابطاك. احفظهما — لوحة التحكم لك، ورابط التحضير لطلابك.
        </p>

        <div className="mt-9 grid gap-[18px] text-right md:grid-cols-2">
          {/* dashboard link */}
          <div className="rounded-[20px] border border-[#EAE6F5] bg-white p-[26px] shadow-[0_12px_30px_rgba(60,42,140,.06)]">
            <div className="flex items-center gap-[10px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EEFE]">
                <LayoutDashboard size={21} color="#6D5EF6" strokeWidth={1.9} />
              </div>
              <div className="text-[16px] font-extrabold">لوحة التحكم</div>
            </div>
            <p className="mb-2 mt-3 text-[13px] font-semibold text-muted-soft">خاص بك وبمشرفيك فقط</p>
            <div dir="ltr" className="overflow-hidden text-ellipsis whitespace-nowrap rounded-[11px] border border-[#EBE6F7] bg-[#F6F4FC] px-[13px] py-[11px] text-left text-[13px] font-bold text-[#5B4FD0]">
              {dash}
            </div>
            <div className="mt-[14px] flex gap-[9px]">
              <button onClick={() => copy('dash', dash)} className="btn-primary flex-1 py-[11px] text-[13.5px]" style={{ borderRadius: 11 }}>
                {copied === 'dash' ? (
                  <>
                    <Check size={16} strokeWidth={2.6} /> تم النسخ
                  </>
                ) : (
                  <>
                    <Copy size={16} /> نسخ الرابط
                  </>
                )}
              </button>
              <button onClick={() => setQr({ value: dash, title: 'رابط لوحة التحكم' })} className="btn-secondary px-[13px] py-[11px] text-[13.5px]" style={{ borderRadius: 11, background: '#F4F1FD', borderColor: '#E4DEF7' }}>
                <QrCode size={16} color="#6D5EF6" /> QR
              </button>
            </div>
          </div>

          {/* attend link */}
          <div className="rounded-[20px] border border-[#EAE6F5] bg-white p-[26px] shadow-[0_12px_30px_rgba(60,42,140,.06)]">
            <div className="flex items-center gap-[10px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F8F1]">
                <Check size={21} color="#15B886" strokeWidth={1.9} />
              </div>
              <div className="text-[16px] font-extrabold">رابط التحضير</div>
            </div>
            <p className="mb-2 mt-3 text-[13px] font-semibold text-muted-soft">شاركه مع طلابك</p>
            <div dir="ltr" className="overflow-hidden text-ellipsis whitespace-nowrap rounded-[11px] border border-[#EBE6F7] bg-[#F6F4FC] px-[13px] py-[11px] text-left text-[13px] font-bold text-success">
              {attend}
            </div>
            <div className="mt-[14px] flex gap-[9px]">
              <button
                onClick={() => copy('attend', attend)}
                className="flex flex-1 items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(135deg,#15B886,#0EA5A4)] py-[11px] text-[13.5px] font-extrabold text-white shadow-[0_6px_16px_rgba(21,184,134,.32)] transition-all hover:-translate-y-[2px]"
              >
                {copied === 'attend' ? (
                  <>
                    <Check size={16} strokeWidth={2.6} /> تم النسخ
                  </>
                ) : (
                  <>
                    <Copy size={16} /> نسخ الرابط
                  </>
                )}
              </button>
              <button
                onClick={() => setQr({ value: attend, title: 'رابط التحضير' })}
                className="flex items-center gap-2 rounded-[11px] border-[1.5px] border-[#CEEFE2] bg-[#EAF8F2] px-[13px] py-[11px] text-[13.5px] font-extrabold text-[#0E9A7E]"
              >
                <QrCode size={16} color="#15B886" /> QR
              </button>
            </div>
          </div>
        </div>

        {/* upload logo */}
        <div className="mt-[18px] flex items-center gap-[18px] rounded-[20px] border-[1.5px] border-dashed border-[#C9BEF3] bg-[linear-gradient(120deg,#F1EEFE,#F8F2FE)] p-6 text-right">
          <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_6px_16px_rgba(80,60,180,.1)]">
            {logoPreview ? (
              <img src={logoPreview} alt="شعار" className="h-full w-full object-cover" />
            ) : (
              <Upload size={26} color="#6D5EF6" strokeWidth={1.9} />
            )}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-extrabold">ارفع شعار جهتك الآن</div>
            <div className="mt-[3px] text-[13.5px] font-medium text-muted">
              {logoPreview ? 'تم رفع الشعار ✓ سيظهر على صفحة التحضير.' : 'سيظهر على صفحة التحضير التي يراها طلابك. PNG أو SVG.'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
          <button onClick={() => fileRef.current?.click()} className="btn-secondary shrink-0 px-[18px] py-3 text-[14px]">
            اختيار ملف
          </button>
        </div>

        <button onClick={() => navigate('/dash')} className="btn-primary mt-[26px] px-[38px] py-[15px] text-[16px]">
          الانتقال إلى لوحة التحكم
        </button>
      </div>

      {qr && <QrModal value={qr.value} title={qr.title} onClose={() => setQr(null)} />}
    </div>
  );
}
