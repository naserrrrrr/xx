// عرض التاريخ الهجري باستخدام تقويم Intl الإسلامي

const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** يعيد سلسلة مثل: "الأحد، 14 شعبان 1447" */
export function hijriToday(date: Date = new Date(), timezone = 'Asia/Riyadh'): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      timeZone: timezone,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = fmt.formatToParts(date);
    let day = 1;
    let month = 1;
    let year = 1447;
    for (const p of parts) {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') month = parseInt(p.value, 10);
      if (p.type === 'year') year = parseInt(p.value, 10);
    }
    const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' });
    const wd = weekdayFmt.format(date);
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const weekday = WEEKDAYS[map[wd] ?? 0];
    return `${weekday}، ${day} ${HIJRI_MONTHS[(month - 1) % 12]} ${year}`;
  } catch {
    return '';
  }
}

export function greetingByHour(timezone = 'Asia/Riyadh'): string {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', hour12: false });
  const hour = parseInt(fmt.format(new Date()), 10);
  if (hour >= 4 && hour < 12) return 'صباح الخير';
  if (hour >= 12 && hour < 17) return 'مساء الخير';
  return 'مساء الخير';
}
