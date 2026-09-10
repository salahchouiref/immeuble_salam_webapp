import { NavLink } from 'react-router-dom';
import { useAuth } from '../services/auth-context';
import { useLanguage } from '../hooks/useLanguage';
import { useConfirm } from '../components/ConfirmDialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: t.auth.logout,
      message: t.auth.logoutConfirm,
      confirmLabel: t.auth.logout,
      danger: true,
    });
    if (!ok) return;
    await logout();
    onClose();
  };

  const navItems = [
    { to: '/', label: t.nav.dashboard, icon: '🏠', show: true },
    { to: '/payments', label: t.nav.payments, icon: '💳', show: true },
    { to: '/expenses', label: t.nav.expenses, icon: '💸', show: true },
    { to: '/residents', label: t.nav.residents, icon: '👥', show: isAdmin },
    { to: '/categories', label: t.nav.categories, icon: '🏷️', show: isAdmin },
    { to: '/reports', label: t.nav.reports, icon: '📊', show: true },
    { to: '/history', label: t.nav.history, icon: '📜', show: true },
    { to: '/settings', label: t.nav.settings, icon: '⚙️', show: isAdmin },
    { to: '/guide', label: t.nav.guide, icon: '📖', show: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-50
          h-full w-64 bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              🏢
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">{t.app.buildingName}</h1>
              <p className="text-xs text-gray-500">{t.app.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1 overflow-y-auto">
          {navItems.filter(item => item.show).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
