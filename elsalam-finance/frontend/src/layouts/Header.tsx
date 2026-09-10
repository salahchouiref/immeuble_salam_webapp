import { useAuth } from '../services/auth-context';
import { useLanguage } from '../hooks/useLanguage';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, isAdmin } = useAuth();
  const { language, t, isRTL, toggleLanguage } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between no-print">
      {/* Left side (menu + title) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{t.app.buildingName}</h2>
      </div>

      {/* Right side (role + language) */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isAdmin ? 'bg-primary-100 text-primary-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {isAdmin ? t.roles.admin : t.roles.resident}
        </span>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
          aria-label="Switch language"
        >
          <span className={language === 'ar' ? 'font-bold text-primary-600' : ''}>العربية</span>
          <span className="text-gray-400">|</span>
          <span className={language === 'fr' ? 'font-bold text-primary-600' : ''}>Français</span>
        </button>

        {/* User name */}
        <span className="hidden sm:block text-sm text-gray-600">
          {user?.name}
        </span>
      </div>
    </header>
  );
}
