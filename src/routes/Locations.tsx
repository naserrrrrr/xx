import { useEffect, useState } from 'react';
import { MapPin, Plus, Crosshair, LocateFixed } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { Toggle } from '../components/Toggle';
import { MapPicker } from '../components/MapPicker';
import { useOrg } from '../hooks/useOrg';
import { locationsApi, org_ } from '../lib/api';
import type { Location } from '../lib/types';

export default function Locations() {
  const { org, refresh } = useOrg();
  const [locations, setLocations] = useState<Location[]>([]);
  const [geoRequired, setGeoRequired] = useState(org?.geo_required ?? true);

  // نموذج إضافة موقع
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(80);
  const [lat, setLat] = useState(24.7741);
  const [lng, setLng] = useState(46.7386);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    if (!org) return;
    setLocations(await locationsApi.list(org.id));
    setGeoRequired(org.geo_required);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  };

  const save = async () => {
    if (!org || !name.trim()) {
      alert('يرجى إدخال اسم الموقع');
      return;
    }
    if (editingId) {
      await locationsApi.update(editingId, { name: name.trim(), radius_m: radius, lat, lng });
    } else {
      await locationsApi.add(org.id, { name: name.trim(), lat, lng, radius_m: radius, is_active: true });
    }
    setName('');
    setRadius(80);
    setEditingId(null);
    await load();
  };

  const edit = (loc: Location) => {
    setEditingId(loc.id);
    setName(loc.name);
    setRadius(loc.radius_m);
    setLat(loc.lat);
    setLng(loc.lng);
  };

  const toggleActive = async (loc: Location) => {
    await locationsApi.update(loc.id, { is_active: !loc.is_active });
    await load();
  };

  const toggleGeo = async (v: boolean) => {
    if (!org) return;
    setGeoRequired(v);
    await org_.update(org.id, { geo_required: v });
    await refresh();
  };

  return (
    <DashLayout
      title="المواقع"
      subtitle="حدّد الأماكن المعتمدة للتحضير ونطاق السماح لكل منها"
      actions={
        <button onClick={() => { setEditingId(null); setName(''); }} className="btn-primary px-[18px] py-3 text-[14px]" style={{ borderRadius: 12 }}>
          <Plus size={18} strokeWidth={2.2} /> موقع جديد
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        {/* location cards */}
        <div className="flex flex-col gap-[14px]">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="card flex items-center gap-4 p-5"
              style={{ opacity: loc.is_active ? 1 : 0.7 }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
                style={{ background: loc.is_active ? '#EDEAFE' : '#F0EEF6' }}
              >
                <MapPin size={24} color={loc.is_active ? '#6D5EF6' : '#9A95AE'} strokeWidth={1.9} />
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-extrabold" style={{ color: loc.is_active ? undefined : '#6E6A86' }}>
                  {loc.name}
                </div>
                <div className="mt-[3px] text-[13px] font-semibold text-muted-soft">
                  {loc.is_active ? 'مفعّل' : 'مُعطّل حاليًا'} · نطاق {loc.radius_m} م
                </div>
              </div>
              <div className="flex items-center gap-[14px]">
                <Toggle checked={loc.is_active} onChange={() => toggleActive(loc)} ariaLabel="تفعيل الموقع" />
                <button
                  onClick={() => edit(loc)}
                  className="rounded-[10px] border border-[#EBE6F7] bg-[#F6F4FC] px-3 py-2 text-[13px] font-bold text-[#6E6A86] hover:border-primary"
                >
                  تعديل
                </button>
              </div>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="card p-8 text-center text-[14px] font-semibold text-muted-soft">
              لا توجد مواقع بعد — أضف موقعك الأول من اللوحة المجاورة.
            </div>
          )}

          {/* geo toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EAE6F5] bg-[#F4F2FB] px-5 py-4">
            <div className="flex items-center gap-3">
              <Crosshair size={22} color="#6D5EF6" strokeWidth={1.9} />
              <div>
                <div className="text-[14.5px] font-extrabold">التحقق الجغرافي العام</div>
                <div className="text-[12.5px] font-semibold text-muted-soft">رفض أي تسجيل خارج النطاق المعتمد</div>
              </div>
            </div>
            <Toggle checked={geoRequired} onChange={toggleGeo} ariaLabel="التحقق الجغرافي العام" />
          </div>
        </div>

        {/* add location panel with map */}
        <div className="card p-[22px]">
          <div className="flex items-center justify-between">
            <div className="text-[16px] font-extrabold">{editingId ? 'تعديل الموقع' : 'إضافة موقع جديد'}</div>
            <button onClick={useMyLocation} className="flex items-center gap-1 text-[12.5px] font-bold text-primary">
              <LocateFixed size={15} /> موقعي الحالي
            </button>
          </div>
          <div className="mt-4">
            <MapPicker lat={lat} lng={lng} radius={radius} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
          </div>
          <label className="mb-[7px] mt-4 block text-[13px] font-bold text-[#3B3556]">اسم الموقع</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: المبنى الرئيسي"
            className="field bg-[#F8F6FD] px-[14px] py-3 text-[14px]"
          />
          <label className="mb-[9px] mt-[14px] block text-[13px] font-bold text-[#3B3556]">
            نصف القطر المسموح: <span className="text-primary">{radius} متر</span>
          </label>
          <input
            type="range"
            min={20}
            max={300}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            className="w-full"
            style={{ accentColor: '#6D5EF6' }}
          />
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-muted-faint">
            <span>20 م</span>
            <span>300 م</span>
          </div>
          <button onClick={save} className="btn-primary mt-[18px] w-full py-[13px] text-[14.5px]" style={{ borderRadius: 12 }}>
            {editingId ? 'حفظ التعديلات' : 'حفظ الموقع'}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setName(''); setRadius(80); }}
              className="mt-2 w-full text-[13px] font-bold text-muted-soft"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </div>
    </DashLayout>
  );
}
