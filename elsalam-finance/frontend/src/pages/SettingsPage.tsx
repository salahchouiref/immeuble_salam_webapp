import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Settings } from '../types';

export default function SettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings as Record<string, string>);
      toast.success(t.settings.saved);
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error(t.common.required);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t.validation.passwordMatch);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t.validation.minLength.replace('{min}', '6'));
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success(t.settings.passwordChanged);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900">⚙️ {t.settings.title}</h1>

      {/* Building settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🏢 {t.settings.building}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.buildingName}</label>
            <input type="text" value={settings.building_name || ''} onChange={(e) => setSettings({ ...settings, building_name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.address}</label>
            <input type="text" value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.city}</label>
            <input type="text" value={settings.city || ''} onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Financial settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">💰 {t.settings.financial}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.monthlyContribution} (DH)</label>
            <input type="number" min="1" value={settings.monthly_contribution || ''} onChange={(e) => setSettings({ ...settings, monthly_contribution: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>
      </div>

      <button onClick={handleSaveSettings} disabled={saving}
        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-sm">
        {saving ? t.common.loading : t.common.save}
      </button>

      {/* Change password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🔐 {t.settings.changePassword}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.currentPassword}</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.newPassword}</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.confirmPassword}</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={changingPassword}
          className="mt-4 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors text-sm">
          {changingPassword ? t.common.loading : t.settings.changePassword}
        </button>
      </div>
    </div>
  );
}
