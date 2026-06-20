// تصدير التقارير: Excel (SheetJS) + PDF (نافذة طباعة منسّقة تضمن عربية RTL سليمة)

import * as XLSX from 'xlsx';
import type { StudentReportRow } from './api';

export interface ReportExportData {
  orgName: string;
  logoUrl: string | null;
  rows: StudentReportRow[];
  generatedAt?: Date;
}

// ===== Excel =====
export function exportExcel(data: ReportExportData): void {
  const aoa: (string | number)[][] = [
    ['الطالب', 'المجموعة', 'الحضور', 'الغياب', 'التأخير', 'النقاط', 'نسبة الحضور %'],
    ...data.rows.map((r) => [
      r.student.name,
      r.student.group_name ? `المجموعة ${r.student.group_name}` : '—',
      r.present,
      r.absent,
      r.late,
      r.points,
      r.rate,
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }];
  // اتجاه الورقة من اليمين لليسار
  ws['!dir'] = 'rtl';
  const wb = XLSX.utils.book_new();
  (wb as any).Workbook = { Views: [{ RTL: true }] }; // اتجاه المصنف RTL
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير الحضور');
  const date = (data.generatedAt ?? new Date()).toISOString().slice(0, 10);
  XLSX.writeFile(wb, `تقرير-الحضور-${data.orgName}-${date}.xlsx`);
}

// ===== PDF (عبر نافذة طباعة بالمتصفح لضمان تشكيل العربية و RTL) =====
export function exportPDF(data: ReportExportData): void {
  const win = window.open('', '_blank', 'width=900,height=1100');
  if (!win) {
    alert('يرجى السماح بالنوافذ المنبثقة لتصدير PDF.');
    return;
  }
  const date = (data.generatedAt ?? new Date()).toLocaleDateString('ar-SA-u-ca-islamic-umalqura');
  const badge = (rate: number) => {
    const [bg, fg] = rate >= 90 ? ['#E7F8F1', '#0E9A7E'] : rate >= 80 ? ['#FFF4E5', '#B26B05'] : ['#FCEDED', '#C13338'];
    return `<span style="background:${bg};color:${fg};font-weight:800;font-size:11px;border-radius:6px;padding:3px 8px;">${rate}%</span>`;
  };
  const logo = data.logoUrl
    ? `<img src="${data.logoUrl}" style="width:46px;height:46px;border-radius:11px;object-fit:cover;" />`
    : `<div style="width:46px;height:46px;border-radius:11px;background:linear-gradient(135deg,#6D5EF6,#9B6CF8);display:flex;align-items:center;justify-content:center;">
         <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
       </div>`;

  const rowsHtml = data.rows
    .map(
      (r) => `
      <tr>
        <td style="font-weight:700;">${escapeHtml(r.student.name)}</td>
        <td>${r.student.group_name ? 'المجموعة ' + escapeHtml(r.student.group_name) : '—'}</td>
        <td style="color:#15B886;font-weight:800;">${r.present}</td>
        <td>${r.absent}</td>
        <td style="color:#F59E0B;">${r.late}</td>
        <td style="font-weight:800;">${r.points}</td>
        <td>${badge(r.rate)}</td>
      </tr>`,
    )
    .join('');

  win.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
    <title>تقرير الحضور — ${escapeHtml(data.orgName)}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
      *{box-sizing:border-box;font-family:'Cairo',sans-serif;}
      body{margin:0;padding:32px;color:#1B1830;}
      .head{display:flex;align-items:center;gap:14px;border-bottom:2px solid #EDEAF6;padding-bottom:18px;}
      .head h1{font-size:22px;margin:0;font-weight:900;}
      .head .sub{color:#857F9C;font-size:13px;font-weight:600;margin-top:3px;}
      table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px;}
      th{background:#FAF9FD;color:#56516E;text-align:right;padding:11px 12px;font-weight:800;font-size:12px;border-bottom:2px solid #EDEAF6;}
      td{padding:10px 12px;border-bottom:1px solid #F2F0F8;text-align:right;font-weight:600;}
      .foot{margin-top:24px;color:#A39EB8;font-size:11px;text-align:center;}
      @media print{body{padding:0;}}
    </style></head><body>
      <div class="head">
        ${logo}
        <div>
          <h1>تقرير الحضور — ${escapeHtml(data.orgName)}</h1>
          <div class="sub">تاريخ التقرير: ${date} · عدد المستفيدين: ${data.rows.length}</div>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>الطالب</th><th>المجموعة</th><th>الحضور</th><th>الغياب</th><th>التأخير</th><th>النقاط</th><th>نسبة الحضور</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="foot">صُدِّر من «حاضِر» — نظام تحضير ذكي</div>
      <script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>
    </body></html>`);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
