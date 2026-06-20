import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  Clock,
  Users,
  FileText,
  Palette,
  Settings,
  Link2,
} from 'lucide-react';
import { Logo, OrgAvatar } from './Logo';
import { useOrg } from '../hooks/useOrg';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/dash', label: 'الرئيسية', icon: Home, end: true },
  { to: '/dash/locations', label: 'المواقع', icon: MapPin },
  { to: '/dash/time-points', label: 'الأوقات والنقاط', icon: Clock },
  { to: '/dash/students', label: 'المستفيدون', icon: Users },
  { to: '/dash/reports', label: 'التقارير', icon: FileText },
  { to: '/dash/appearance', label: 'المظهر', icon: Palette },
  { to: '/dash/settings', label: 'الإعدادات', icon: Settings },
];

interface DashLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashLayout({ title, subtitle, actions, children }: DashLayoutProps) {
  const { org } = useOrg();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ===== Sidebar (يمين) ===== */}
      <aside className="hidden w-[252px] shrink-0 flex-col border-l border-line bg-white p-[18px] py-6 md:flex">
        <div className="flex items-center gap-[10px] px-2 pb-[22px]">
          <Logo size={34} textSize={20} />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-[14px] py-3 text-[14.5px] transition-all ${
                  isActive
                    ? 'bg-[#F1EEFE] font-extrabold text-[#5B4FD0]'
                    : 'font-bold text-[#6E6A86] hover:bg-[#F2F0FB] hover:text-ink-soft'
                }`
              }
            >
              <item.icon size={20} strokeWidth={1.9} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-[11px] rounded-2xl border border-[#EDE8F8] bg-[#F6F4FC] p-[14px]">
          <OrgAvatar name={org?.name ?? 'حاضِر'} size={40} />
          <div className="flex-1 overflow-hidden">
            <div className="truncate text-[14px] font-extrabold">{org?.name ?? '—'}</div>
            <div className="text-[12px] font-bold text-success">الباقة المجانية</div>
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-[18px] md:px-8">
          <div className="min-w-0">
            <h1 className="m-0 text-[20px] font-black md:text-[23px]">{title}</h1>
            {subtitle && (
              <div className="mt-[3px] text-[13.5px] font-semibold text-muted-soft">{subtitle}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions ?? (
              <button
                onClick={() => org && navigate(`/${org.slug}`)}
                className="btn-secondary px-4 py-[11px] text-[13.5px]"
                style={{ background: '#F4F1FD', borderColor: '#E4DEF7' }}
              >
                <Link2 size={17} strokeWidth={1.9} color="#6D5EF6" />
                <span className="hidden sm:inline">رابط التحضير</span>
              </button>
            )}
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-primary-gradient font-extrabold text-white">
              {org?.name?.trim()?.[0] ?? 'ح'}
            </div>
          </div>
        </header>
        <main className="px-5 pb-10 pt-7 md:px-8">{children}</main>

        {/* ===== شريط تنقل سفلي للجوال ===== */}
        <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-line bg-white py-2 md:hidden">
          {NAV.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 text-[10px] font-bold ${
                  isActive ? 'text-[#5B4FD0]' : 'text-muted-soft'
                }`
              }
            >
              <item.icon size={20} strokeWidth={1.9} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
