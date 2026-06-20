import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { OrgProvider, useOrg } from './hooks/useOrg';
import Landing from './routes/Landing';
import Signup from './routes/Signup';
import Welcome from './routes/Welcome';
import Attend from './routes/Attend';
import Dashboard from './routes/Dashboard';
import Locations from './routes/Locations';
import TimePoints from './routes/TimePoints';
import Students from './routes/Students';
import Reports from './routes/Reports';
import Appearance from './routes/Appearance';
import Settings from './routes/Settings';

/** حارس: يتطلب جهة مسجّلة الدخول، وإلا يحوّل إلى /signup */
function RequireOrg({ children }: { children: ReactNode }) {
  const { org, loading } = useOrg();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-muted">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }
  if (!org) return <Navigate to="/signup" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <OrgProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/welcome" element={<RequireOrg><Welcome /></RequireOrg>} />

          <Route path="/dash" element={<RequireOrg><Dashboard /></RequireOrg>} />
          <Route path="/dash/locations" element={<RequireOrg><Locations /></RequireOrg>} />
          <Route path="/dash/time-points" element={<RequireOrg><TimePoints /></RequireOrg>} />
          <Route path="/dash/students" element={<RequireOrg><Students /></RequireOrg>} />
          <Route path="/dash/reports" element={<RequireOrg><Reports /></RequireOrg>} />
          <Route path="/dash/appearance" element={<RequireOrg><Appearance /></RequireOrg>} />
          <Route path="/dash/settings" element={<RequireOrg><Settings /></RequireOrg>} />
          {/* رابط لوحة التحكم بصيغة /dash/<slug> يفتح اللوحة نفسها */}
          <Route path="/dash/:slug/*" element={<RequireOrg><Dashboard /></RequireOrg>} />

          {/* صفحة التحضير العامة — يجب أن تبقى أخيرًا */}
          <Route path="/:slug" element={<Attend />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrgProvider>
    </BrowserRouter>
  );
}
