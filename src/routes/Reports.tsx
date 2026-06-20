import { useEffect, useMemo, useState } from 'react';
import { Check, X, Star, MapPin, Search, Calendar, ChevronDown, FileDown } from 'lucide-react';
import { DashLayout } from '../components/DashLayout';
import { useOrg } from '../hooks/useOrg';
import { reportsApi, type StudentReportRow } from '../lib/api';
import { exportExcel, exportPDF } from '../lib/exporters';

const PAGE_SIZE = 6;
const RANGES = ['اليوم', 'هذا الأسبوع', 'هذا الشهر', 'كل الفترات'];

function rateBadge(rate: number) {
  if (rate >= 90) return { bg: '#E7F8F1', fg: '#0E9A7E' };
  if (rate >= 80) return { bg: '#FFF4E5', fg: '#B26B05' };
  return { bg: '#FCEDED', fg: '#C13338' };
}

const AV = ['#6D5EF6', '#15B886', '#F5934E', '#C9C3E0', '#6D5EF6', '#E5A0A2'];

export default function Reports() {
  const { org } = useOrg();
  const [rows, setRows] = useState<StudentReportRow[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof reportsApi.summary>> | null>(null);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [range, setRange] = useState('هذا الشهر');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!org) return;
    reportsApi.summary(org.id).then((s) => {
      setSummary(s);
      setRows(s.rows);
    });
  }, [org]);

  const groups = useMemo(
    () => Array.from(new Set(rows.map((r) => r.student.group_name).filter(Boolean))),
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) => (!query || r.student.name.includes(query)) && (!group || r.student.group_name === group),
      ),
    [rows, query, group],
  );

  const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const doExportExcel = () =>
    org && exportExcel({ orgName: org.name, logoUrl: org.logo_url, rows: filtered });
  const doExportPDF = () =>
    org && exportPDF({ orgName: org.name, logoUrl: org.logo_url, rows: filtered });

  return (
    <DashLayout
      title="التقارير"
      subtitle="تحليل الحضور والغياب والنقاط مع تصدير كامل"
      actions={
        <div className="flex gap-[10px]">
          <button onClick={doExportExcel} className="flex items-center gap-2 rounded-xl border-[1.5px] border-[#CEEFE2] bg-[#EAF8F2] px-4 py-[11px] text-[13.5px] font-extrabold text-[#0E9A7E]">
            <FileDown size={17} color="#15B886" /> <span className="hidden sm:inline">تصدير Excel</span>
          </button>
          <button onClick={doExportPDF} className="flex items-center gap-2 rounded-xl border-[1.5px] border-[#F6D2D3] bg-[#FCEDED] px-4 py-[11px] text-[13.5px] font-extrabold text-[#C13338]">
            <FileDown size={17} color="#E5484D" /> <span className="hidden sm:inline">تصدير PDF</span>
          </button>
        </div>
      }
    >
      {/* summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={<Check size={16} color="#15B886" strokeWidth={2} />} color="#15B886" label="الأكثر حضورًا" value={summary?.mostPresent?.student.name ?? '—'} hint={summary?.mostPresent ? `${summary.mostPresent.present} يومًا حضور` : ''} />
        <SummaryCard icon={<X size={16} color="#E5484D" strokeWidth={2} />} color="#E5484D" label="الأكثر غيابًا" value={summary?.mostAbsent?.student.name ?? '—'} hint={summary?.mostAbsent ? `${summary.mostAbsent.absent} أيام غياب` : ''} />
        <SummaryCard icon={<Star size={16} color="#F59E0B" strokeWidth={2} />} color="#F59E0B" label="الأعلى نقاطًا" value={summary?.topPoints?.student.name ?? '—'} hint={summary?.topPoints ? `${summary.topPoints.points} نقطة` : ''} />
        <SummaryCard icon={<MapPin size={16} color="#6D5EF6" strokeWidth={2} />} color="#6D5EF6" label="خارج النطاق" value={summary ? `${summary.outOfRange} محاولات` : '—'} hint="هذا الأسبوع" />
      </div>

      {/* filters */}
      <div className="card mt-[18px] flex flex-wrap items-center gap-3 p-[14px]">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-[11px] border-[1.5px] border-[#E6E1F2] bg-[#F8F6FD] px-[13px] py-[10px]">
          <Search size={17} className="text-[#9A95AE]" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="ابحث عن طالب…" className="w-full border-none bg-transparent text-[14px] font-semibold outline-none" />
        </div>
        <div className="flex items-center gap-2 rounded-[11px] border-[1.5px] border-[#E6E1F2] bg-[#F8F6FD] px-[13px] py-[10px] text-[13.5px] font-bold text-[#4B4564]">
          <Calendar size={16} color="#6D5EF6" strokeWidth={1.9} />
          <select value={range} onChange={(e) => setRange(e.target.value)} className="border-none bg-transparent outline-none">
            {RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={14} className="text-[#9A95AE]" />
        </div>
        <select value={group} onChange={(e) => { setGroup(e.target.value); setPage(1); }} className="rounded-[11px] border-[1.5px] border-[#E6E1F2] bg-[#F8F6FD] px-[13px] py-[10px] text-[13.5px] font-bold text-[#4B4564]">
          <option value="">كل المجموعات</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              المجموعة {g}
            </option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="card mt-[18px] overflow-hidden">
        <div className="hidden grid-cols-[1.8fr_1fr_.9fr_.9fr_.9fr_.9fr_1.1fr] gap-3 border-b border-line bg-[#FAF9FD] px-5 py-[15px] text-[12.5px] font-extrabold text-muted-soft md:grid">
          <span>الطالب</span><span>المجموعة</span><span>الحضور</span><span>الغياب</span><span>التأخير</span><span>النقاط</span><span>نسبة الحضور</span>
        </div>
        {pageRows.map((r, i) => {
          const badge = rateBadge(r.rate);
          return (
            <div key={r.student.id} className="grid grid-cols-2 items-center gap-3 border-b border-[#F2F0F8] px-5 py-[14px] text-[13.5px] font-semibold last:border-0 md:grid-cols-[1.8fr_1fr_.9fr_.9fr_.9fr_.9fr_1.1fr]">
              <span className="flex items-center gap-[10px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-extrabold text-white" style={{ background: AV[(page - 1) * PAGE_SIZE + i] ? `linear-gradient(135deg,${AV[((page - 1) * PAGE_SIZE + i) % AV.length]},#9B6CF8)` : '#C9C3E0' }}>
                  {r.student.name.trim()[0]}
                </span>
                {r.student.name}
              </span>
              <span className="text-muted">{r.student.group_name ? `المجموعة ${r.student.group_name}` : '—'}</span>
              <span className="font-extrabold text-success md:before:hidden before:content-['حضور:_'] before:text-muted-faint before:font-normal">{r.present}</span>
              <span className="text-muted before:content-['غياب:_'] before:text-muted-faint md:before:hidden">{r.absent}</span>
              <span className="font-bold text-warn before:content-['تأخير:_'] before:font-normal before:text-muted-faint md:before:hidden">{r.late}</span>
              <span className="font-extrabold before:content-['نقاط:_'] before:font-normal before:text-muted-faint md:before:hidden">{r.points}</span>
              <span>
                <span className="inline-block rounded-[7px] px-[10px] py-1 text-[12px] font-extrabold" style={{ background: badge.bg, color: badge.fg }}>
                  {r.rate}%
                </span>
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[14px] font-semibold text-muted-soft">لا توجد بيانات مطابقة</div>
        )}

        {/* pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-line bg-[#FAF9FD] px-5 py-[15px]">
            <span className="text-[12.5px] font-semibold text-muted-soft">
              عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length} طالبًا
            </span>
            <div className="flex items-center gap-[6px]">
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page >= pages}
                className="h-8 w-8 rounded-[9px] border border-[#E6E1F2] bg-white font-extrabold text-[#9A95AE] disabled:opacity-40"
              >
                ›
              </button>
              {Array.from({ length: pages }).slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="h-8 w-8 rounded-[9px] font-extrabold"
                  style={
                    page === i + 1
                      ? { background: 'linear-gradient(135deg,#6D5EF6,#9B6CF8)', color: '#fff', border: 'none' }
                      : { background: '#fff', color: '#4B4564', border: '1px solid #E6E1F2' }
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="h-8 w-8 rounded-[9px] border border-[#E6E1F2] bg-white font-extrabold text-[#9A95AE] disabled:opacity-40"
              >
                ‹
              </button>
            </div>
          </div>
        )}
      </div>
    </DashLayout>
  );
}

function SummaryCard({ icon, color, label, value, hint }: { icon: React.ReactNode; color: string; label: string; value: string; hint: string }) {
  return (
    <div className="hover-lift card p-[18px]">
      <div className="flex items-center gap-2 text-[12.5px] font-extrabold" style={{ color }}>
        {icon} {label}
      </div>
      <div className="mt-3 text-[18px] font-black">{value}</div>
      <div className="mt-[2px] text-[12.5px] font-semibold text-muted-soft">{hint}</div>
    </div>
  );
}
