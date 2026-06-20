// توليد slug عشوائي غير قابل للتخمين (للروابط العامة وروابط لوحة التحكم)

const ADJECTIVES = [
  'noor',
  'amal',
  'safa',
  'wafa',
  'riyada',
  'taqat',
  'ufuq',
  'shorouq',
  'rawnaq',
  'bayan',
];

function randomToken(len = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const arr = new Uint32Array(len);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** slug عام لرابط التحضير: مثل "taqat-7f3a" */
export function generateSlug(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  return `${adj}-${randomToken(4)}`;
}

export const APP_DOMAIN = 'hadir.app';

export function attendLink(slug: string): string {
  return `${APP_DOMAIN}/${slug}`;
}

export function dashLink(slug: string): string {
  return `${APP_DOMAIN}/dash/${slug}`;
}
