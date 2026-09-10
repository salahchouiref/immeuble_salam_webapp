import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Category } from '../types';

export default function CategoriesPage() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', name_ar: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', name_ar: '' });
    setShowForm(true);
  };

  const openEditForm = (c: Category) => {
    setEditingCategory(c);
    setFormData({ name: c.name, name_ar: c.name_ar });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.name_ar) {
      toast.error(t.common.required);
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      toast.success(editingCategory ? t.common.updated : t.common.saved);
      setShowForm(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: Category) => {
    try {
      await api.updateCategoryStatus(c.id, !c.active);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">🏷️ {t.nav.categories}</h1>
        <button onClick={openAddForm} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm">
          + {t.common.add}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Français</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">العربية</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">{t.residents.status}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{cat.name_ar}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.active ? t.residents.active : t.residents.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEditForm(cat)} className="text-xs text-blue-600">{t.common.edit}</button>
                      <button onClick={() => handleToggleActive(cat)} className={`text-xs ${cat.active ? 'text-orange-600' : 'text-green-600'}`}>
                        {cat.active ? t.residents.inactive : t.residents.active}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-500">{cat.name_ar}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditForm(cat)} className="text-xs text-blue-600">{t.common.edit}</button>
                <button onClick={() => handleToggleActive(cat)} className={`text-xs ${cat.active ? 'text-orange-600' : 'text-green-600'}`}>
                  {cat.active ? '◻️' : '◼️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{editingCategory ? t.common.edit : t.common.add}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Français *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العربية *</label>
                  <input type="text" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none text-right" dir="rtl" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">{t.common.cancel}</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg text-sm">
                    {saving ? t.common.loading : t.common.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
