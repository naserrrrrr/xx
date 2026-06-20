interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}

/**
 * مفتاح تبديل بمقاس 46×26 (RTL):
 * مفعّل = تدرّج primary والمقبض يسار · معطّل = رمادي والمقبض يمين.
 */
export function Toggle({ checked, onChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 cursor-pointer rounded-full transition-all"
      style={{
        width: 46,
        height: 26,
        background: checked ? 'linear-gradient(135deg,#6D5EF6,#9B6CF8)' : '#D8D3E6',
      }}
    >
      <span
        className="absolute top-[3px] rounded-full bg-white transition-all"
        style={{
          width: 20,
          height: 20,
          left: checked ? 3 : undefined,
          right: checked ? undefined : 3,
          boxShadow: '0 2px 4px rgba(0,0,0,.2)',
        }}
      />
    </button>
  );
}
