import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, Plus, Upload, Download, Trash2, Users } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { useOrg } from '../hooks/useOrg';
import { studentsApi } from '../lib/api';
import type { Student } from '../lib/types';

export default function Students() {
  const { org } = useOrg();
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (org) setStudents(await studentsApi.list(org.id));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  const groups = Array.from(new Set(students.map((s) => s.group_name).filter(Boolean)));
  const filtered = students.filter(
    (s) => (!query || s.name.includes(query)) && (!group || s.group_name === group),
  );

  const add = async () => {
    if (!org || !newName.trim()) return;
    await studentsApi.add(org.id, newName.trim(), newGroup.trim());
    setNewName('');
    setNewGroup('');
    setAdding(false);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm('حذف هذا المستفيد؟ (حذف ناعم)')) return;
    await studentsApi.softDelete(id);
    await load();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['الاسم', 'المجموعة'],
      ['سارة المطيري', 'أ'],
      ['عبدالله الزهراني', 'ب'],
    ]);
    ws['!cols'] = [{ wch: 24 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    (wb as any).Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(wb, ws, 'المستفيدون');
    XLSX.writeFile(wb, 'قالب-المستفيدين.xlsx');
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !org) return;
    setUploadMsg('جارٍ المعالجة…');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      const mapped = rows
        .map((r) => {
          const name = r['الاسم'] ?? r['name'] ?? r['Name'] ?? Object.values(r)[0];
          const grp = r['المجموعة'] ?? r['group'] ?? r['الصف'] ?? Object.values(r)[1] ?? '';
          return { name: String(name ?? '').trim(), group_name: String(grp ?? '').trim() };
        })
        .filter((r) => r.name);
      if (mapped.length === 0) {
        setUploadMsg('لم يُعثر على بيانات صالحة. تأكد من وجود عمود «الاسم».');
        return;
      }
      const added = await studentsApi.bulkAdd(org.id, mapped);
      setUploadMsg(`تم استيراد ${added} مستفيدًا بنجاح ✓`);
      await load();
    } catch {
      setUploadMsg('تعذّرت قراءة الملف. استخدم صيغة Excel أو CSV.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  return (
    <DashLayout
      title="المستفيدون"
      subtitle="قاعدة المشاركين — ارفع قائمة جاهزة أو دعهم يسجّلون ذاتيًا"
      actions={
        <button onClick={() => setAdding((v) => !v)} className="btn-primary px-[18px] py-3 text-[14px]" style={{ borderRadius: 12 }}>
          <Plus size={18} strokeWidth={2.2} /> إضافة مستفيد
        </button>
      }
    >
      {/* upload / template row */}
      <div className="card mb-[18px] flex flex-wrap items-center gap-3 p-4">
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onUpload} />
        <button onClick={() => fileRef.current?.click()} className="btn-secondary px-4 py-[10px] text-[13.5px]">
          <Upload size={17} color="#6D5EF6" /> رفع Excel / CSV
        </button>
        <button onClick={downloadTemplate} className="btn-secondary px-4 py-[10px] text-[13.5px]" style={{ background: '#F4F1FD', borderColor: '#E4DEF7' }}>
          <Download size={17} color="#6D5EF6" /> تنزيل قالب
        </button>
        <span className="text-[12.5px] font-semibold text-muted-soft">
          أو اترك القائمة فارغة ودع المستفيدين يسجّلون ذاتيًا عبر رابط التحضير.
        </span>
        {uploadMsg && <span className="text-[13px] font-bold text-success">{uploadMsg}</span>}
      </div>

      {/* add form */}
      {adding && (
        <div className="card mb-[18px] flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1">
            <label className="mb-[6px] block text-[12.5px] font-bold text-muted">الاسم</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم المستفيد" className="field bg-[#F8F6FD] px-3 py-[10px] text-[14px]" />
          </div>
          <div className="w-32">
            <label className="mb-[6px] block text-[12.5px] font-bold text-muted">المجموعة</label>
            <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="أ / ب" className="field bg-[#F8F6FD] px-3 py-[10px] text-[14px]" />
          </div>
          <button onClick={add} className="btn-primary px-5 py-[11px] text-[14px]" style={{ borderRadius: 11 }}>
            حفظ
          </button>
        </div>
      )}

      {/* filters */}
      <div className="card mb-[18px] flex flex-wrap items-center gap-3 p-[14px]">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-[11px] border-[1.5px] border-[#E6E1F2] bg-[#F8F6FD] px-[13px] py-[10px]">
          <Search size={17} className="text-[#9A95AE]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مستفيد…" className="w-full border-none bg-transparent text-[14px] font-semibold outline-none" />
        </div>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="rounded-[11px] border-[1.5px] border-[#E6E1F2] bg-[#F8F6FD] px-[13px] py-[10px] text-[13.5px] font-bold text-[#4B4564]">
          <option value="">كل المجموعات</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              المجموعة {g}
            </option>
          ))}
        </select>
      </div>

      {/* list */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 border-b border-line bg-[#FAF9FD] px-5 py-[15px] text-[12.5px] font-extrabold text-muted-soft">
          <span>المستفيد</span>
          <span>المجموعة</span>
          <span>النقاط</span>
          <span>إجراء</span>
        </div>
        {filtered.map((s) => (
          <div key={s.id} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 border-b border-[#F2F0F8] px-5 py-[14px] text-[13.5px] font-semibold last:border-0">
            <span className="flex items-center gap-[10px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-gradient text-[13px] font-extrabold text-white">
                {s.name.trim()[0]}
              </span>
              {s.name}
            </span>
            <span className="text-muted">{s.group_name ? `المجموعة ${s.group_name}` : '—'}</span>
            <span className="font-extrabold">{s.total_points}</span>
            <button onClick={() => del(s.id)} className="text-muted-faint hover:text-danger" aria-label="حذف">
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Users size={32} className="text-muted-faint" />
            <span className="text-[14px] font-semibold text-muted-soft">لا يوجد مستفيدون مطابقون</span>
          </div>
        )}
      </div>
    </DashLayout>
  );
}
