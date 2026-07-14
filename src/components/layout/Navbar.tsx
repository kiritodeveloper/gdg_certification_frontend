import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileBadge,
  Users,
  LogOut,
  Search,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../hooks';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/events', label: 'Eventos', icon: Calendar, adminOnly: false },
  { to: '/speakers', label: 'Ponentes', icon: Users, adminOnly: true },
  { to: '/certificates', label: 'Certificados', icon: FileBadge, adminOnly: false },
  { to: '/verify', label: 'Verificar', icon: Search, adminOnly: false },
  { to: '/users', label: 'Usuarios', icon: Shield, adminOnly: true },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (location.pathname === '/login') return null;

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <FileBadge size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">Certificados</h1>
          <p className="text-[11px] text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(
          ({ to, label, icon: Icon, adminOnly }) =>
            (!adminOnly || isAdmin) && (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                   ${
                     isActive
                       ? 'bg-primary-50 text-primary-700'
                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            )
        )}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
            {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.nombre}</p>
            <div className="flex items-center gap-1">
              {isAdmin && <Shield size={11} className="text-gold-500" />}
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm
            text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}