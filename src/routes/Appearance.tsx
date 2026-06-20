import { useRef } from 'react';
import { Upload, Smartphone } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { useOrg } from '../hooks/useOrg';
import { org_ } from '../lib/api';

export default function Appearance() {
  const { org, refresh } = useOrg();
  const fileRef = useRef<HTMLInputElement>(null);
  if (!org) return null;

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await org_.update(org.id, { logo_url: reader.result as string });
      await refresh();
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashLayout title="المظهر" subtitle="شعار جهتك كما يظهر للمستفيدين على صفحة التحضير">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <div className="text-[16px] font-extrabold">شعار الجهة</div>
          <p className="mt-2 text-[14px] font-medium text-muted">
            يظهر الشعار في أعلى صفحة التحضير وفي ترويسة تقارير PDF. يُفضّل صورة مربّعة بصيغة PNG أو SVG.
          </p>
          <div className="mt-5 flex items-center gap-5">
            <div className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-[22px] border border-[#EEE9FB] bg-white shadow-card">
              {org.logo_url ? (
                <img src={org.logo_url} className="h-full w-full object-cover" alt="شعار" />
              ) : (
                <span className="text-[36px] font-black text-primary">{org.name.trim()[0]}</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
            <button onClick={() => fileRef.current?.click()} className="btn-primary px-5 py-3 text-[14px]" style={{ borderRadius: 12 }}>
              <Upload size={18} /> رفع شعار
            </button>
          </div>
          <div className="mt-6 rounded-2xl border border-[#EAE6F5] bg-[#F4F2FB] p-4 text-[13px] font-semibold text-muted">
            الهوية البصرية للنظام موحّدة (تدرّج بنفسجي + خط Cairo) لضمان تجربة متناسقة للمستفيدين، مع إبراز شعار جهتك.
          </div>
        </div>

        {/* live preview */}
        <div className="card flex flex-col items-center p-6">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-muted-soft">
            <Smartphone size={16} /> معاينة صفحة التحضير
          </div>
          <div className="flex w-full flex-col items-center rounded-[24px] bg-[linear-gradient(175deg,#F6F5FB,#EFEBFB)] px-5 py-8">
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[20px] border border-[#EEE9FB] bg-white text-[24px] font-black text-primary shadow-card">
              {org.logo_url ? <img src={org.logo_url} className="h-full w-full object-cover" alt="" /> : org.name.trim()[0]}
            </div>
            <div className="mt-3 text-[16px] font-extrabold">{org.name}</div>
            <div className="mt-1 text-[12px] font-semibold text-muted-soft">سجّل حضورك من هنا</div>
            <div className="mt-5 flex h-[96px] w-[96px] items-center justify-center rounded-full bg-primary-gradient text-[13px] font-extrabold text-white shadow-btn">
              تسجيل
            </div>
          </div>
        </div>
      </div>
    </DashLayout>
  );
}
