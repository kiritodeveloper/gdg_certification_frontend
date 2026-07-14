import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from './components/ui';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import SpeakersPage from './pages/SpeakersPage';
import CertificatesPage from './pages/CertificatesPage';
import VerifyPage from './pages/VerifyPage';
import UsersPage from './pages/UsersPage';
import LandingPage from './pages/LandingPage';
import VerCertificadoPage from './pages/VerCertificadoPage';
import ValidarCertificadoPage from './pages/ValidarCertificadoPage';

/* Redirige /activate/:code → /ver-certificado/:code (compatibilidad con links de email) */
function ActivateRedirect() {
  const { code } = useParams();
  return <Navigate to={code ? `/ver-certificado/${code}` : '/ver-certificado'} replace />;
}

function AppRoutes() {
  const location = useLocation();

  // Public pages (no navbar, no sidebar)
  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/inicio' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/ver-certificado') ||
    location.pathname === '/validar-certificado' ||
    location.pathname.startsWith('/activate');

  return (
    <div className={isPublicPage ? '' : 'min-h-screen bg-slate-50'}>
      {!isPublicPage && <Navbar />}
      <main className={!isPublicPage ? 'ml-64 p-8' : ''}>
        <Routes>
          {/* ── Rutas públicas ─────────────────────────── */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ver-certificado" element={<VerCertificadoPage />} />
          <Route path="/ver-certificado/:code?" element={<VerCertificadoPage />} />
          <Route path="/validar-certificado" element={<ValidarCertificadoPage />} />
          {/* Legacy: /activate/:code redirige a /ver-certificado/:code */}
          <Route path="/activate/:code?" element={<ActivateRedirect />} />

          {/* ── Rutas protegidas (admin) ────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute adminOnly>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/speakers"
            element={
              <ProtectedRoute adminOnly>
                <SpeakersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <VerifyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback: redirige al inicio (no al dashboard) */}
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}