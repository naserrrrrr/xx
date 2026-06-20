import { Check } from 'lucide-react';

interface LogoProps {
  size?: number;
  withText?: boolean;
  textSize?: number;
}

/** شعار «حاضِر»: مربّع بتدرّج primary بداخله ✓ بيضاء + الكلمة بخط Cairo 900 */
export function Logo({ size = 38, withText = true, textSize = 23 }: LogoProps) {
  const radius = Math.round(size * 0.29);
  return (
    <div className="flex items-center gap-[11px]">
      <div
        className="flex items-center justify-center bg-primary-gradient"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          boxShadow: '0 8px 18px rgba(109,94,246,.4)',
        }}
      >
        <Check size={Math.round(size * 0.55)} strokeWidth={3} color="#fff" />
      </div>
      {withText && (
        <span className="font-black" style={{ fontSize: textSize }}>
          حاضِر
        </span>
      )}
    </div>
  );
}

/** أيقونة الشعار بحرف الجهة (المربّع الأبيض) */
export function OrgAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const letter = name?.trim()?.[0] ?? 'ح';
  return (
    <div
      className="flex items-center justify-center bg-white font-black text-primary border"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        borderColor: '#EEE9FB',
        fontSize: Math.round(size * 0.42),
      }}
    >
      {letter}
    </div>
  );
}
