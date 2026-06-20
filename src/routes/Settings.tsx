import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, QrCode, LogOut, Check } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { QrModal } from '../components/QrModal';
import { useOrg } from '../hooks/useOrg';
import { auth, org_ } from '../lib/api';
import { attendLink, dashLink } from '../lib/slug';
import { ORG_TYPE_LABELS, type OrgType } from '../lib/types';

const TIMEZONES = ['Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Qatar', 'Asia/Bahrain', 'Africa/Cairo', 'Asia/Amman'];

export default function Settings() {
  const { org, setOrg, refresh } = useOrg();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<OrgType>('summer_center');
  const [timezone, setTimezone] = useState('Asia/Riyadh');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [qr, setQr] = useState<{ value: string; title: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setType(org.type);
      setTimezone(org.timezone);
    }
  }, [org]);

  if (!org) return null;

  const save = async () => {
    await org_.update(org.id, { name, type, timezone });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

  const copy = (key: string, val: string) => {
    try { navigator.clipboard?.writeText(`https://${val}`); } catch { /* ignore */ }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  const signOut = async () => {
    await auth.signOut();
    setOrg(null);
    navigate('/');
  };

  const dash = dashLink(org.slug);
  const attend = attendLink(org.slug);

  return (
    <DashLayout title="الإعدادات" subtitle="بيانات الجهة والروابط والحساب">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* org info */}
        <div className="card p-6">
          <div className="text-[16px] font-extrabold">بيانات الجهة</div>
          <label className="mb-[6px] mt-4 block text-[13px] font-bold text-[#3B3556]">اسم الجهة</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="field bg-[#F8F6FD] px-4 py-3 text-[14px]" />
          <label className="mb-[6px] mt-4 block text-[13px] font-bold text-[#3B3556]">نوع الجهة</label>
          <select value={type} onChange={(e) => setType(e.target.value as OrgType)} className="field bg-[#F8F6FD] px-4 py-3 text-[14px]">
            {(Object.keys(ORG_TYPE_LABELS) as OrgType[]).map((k) => (
              <option key={k} value={k}>{ORG_TYPE_LABELS[k]}</option>
            ))}
          </select>
          <label className="mb-[6px] mt-4 block text-[13px] font-bold text-[#3B3556]">المنطقة الزمنية</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="field bg-[#F8F6FD] px-4 py-3 text-[14px]">
            {TIMEZONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={save} className="btn-primary px-6 py-3 text-[14px]" style={{ borderRadius: 12 }}>حفظ</button>
            {saved && <span className="text-[13px] font-bold text-success">تم الحفظ ✓</span>}
          </div>
        </div>

        {/* links + logo + account */}
        <div className="flex flex-col gap-5">
          <div className="card p-6">
            <div className="text-[16px] font-extrabold">الروابط</div>
            {[
              { key: 'dash', label: 'رابط لوحة التحكم', val: dash },
              { key: 'attend', label: 'رابط التحضير', val: attend },
            ].map((l) => (
              <div key={l.key} className="mt-4">
                <div className="mb-[6px] text-[12.5px] font-bold text-muted">{l.label}</div>
                <div className="flex items-center gap-2">
                  <div dir="ltr" className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-[11px] border border-[#EBE6F7] bg-[#F6F4FC] px-3 py-[10px] text-left text-[13px] font-bold text-[#5B4FD0]">
                    {l.val}
                  </div>
                  <button onClick={() => copy(l.key, l.val)} className="btn-secondary px-3 py-[10px]" style={{ borderRadius: 11 }}>
                    {copied === l.key ? <Check size={16} color="#15B886" /> : <Copy size={16} color="#6D5EF6" />}
                  </button>
                  <button onClick={() => setQr({ value: l.val, title: l.label })} className="btn-secondary px-3 py-[10px]" style={{ borderRadius: 11 }}>
                    <QrCode size={16} color="#6D5EF6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card flex items-center gap-4 p-6">
            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#EEE9FB] bg-white">
              {org.logo_url ? <img src={org.logo_url} className="h-full w-full object-cover" alt="شعار" /> : <span className="text-[22px] font-black text-primary">{org.name.trim()[0]}</span>}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">شعار الجهة</div>
              <div className="text-[12.5px] font-semibold text-muted-soft">يظهر على صفحة التحضير وتقارير PDF</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary px-4 py-[10px] text-[13.5px]">تغيير</button>
          </div>

          <button onClick={signOut} className="card flex items-center justify-center gap-2 p-4 text-[14px] font-bold text-danger hover:bg-[#FCEDED]">
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </div>

      {qr && <QrModal value={qr.value} title={qr.title} onClose={() => setQr(null)} />}
    </DashLayout>
  );
}
