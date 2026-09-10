import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth-context';
import { useLanguage } from '../hooks/useLanguage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, isRTL, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      if (err.status === 429) {
        setError(err.message || t.auth.maxSessions);
      } else {
        setError(err.message || t.auth.invalidCredentials);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Language switcher */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-sm font-medium transition-colors shadow-sm"
          >
            <span className={language === 'ar' ? 'font-bold text-primary-600' : ''}>العربية</span>
            <span className="text-gray-400">|</span>
            <span className={language === 'fr' ? 'font-bold text-primary-600' : ''}>Français</span>
          </button>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🏢
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t.app.buildingName}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.app.subtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.auth.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder={t.auth.email}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.auth.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder={t.auth.password}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? t.common.loading : t.auth.signIn}
            </button>
          </form>
        </div>

        {/* Demo info */}
        <div className="mt-6 bg-white/60 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">{t.demo.warning}</p>
          <p className="text-xs text-gray-400">{t.demo.explanation}</p>
          <div className="mt-2 text-xs text-gray-500 space-y-0.5">
            <p>Admin: admin@elsalam.com</p>
            <p>Habitant (partagé): habitant@elsalam.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
