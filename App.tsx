import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

function AppRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-50">
      {!isLoginPage && <Navbar />}
      <main className={!isLoginPage ? 'ml-64 p-8' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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