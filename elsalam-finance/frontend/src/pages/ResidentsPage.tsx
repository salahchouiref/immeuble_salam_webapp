import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { Resident } from '../types';

export default function ResidentsPage() {
  const { t, isRTL } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    apartment_number: '',
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => { loadResidents(); }, []);

  const loadResidents = async () => {
    try {
      const res = await api.getResidents();
      setResidents(res.residents);
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingResident(null);
    setFormData({ apartment_number: '', name: '', phone: '', email: '' });
    setShowForm(true);
  };

  const openEditForm = (r: Resident) => {
    setEditingResident(r);
    setFormData({ apartment_number: r.apartment_number, name: r.name, phone: r.phone || '', email: r.email || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.apartment_number || !formData.name) {
      toast.error(t.common.required);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        apartment_number: formData.apartment_number,
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      };
      if (editingResident) {
        await api.updateResident(editingResident.id, payload);
        toast.success(t.residents.updated);
      } else {
        await api.createResident(payload);
        toast.success(t.residents.saved);
      }
      setShowForm(false);
      loadResidents();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (r: Resident) => {
    const newActive = !r.active;
    const ok = await confirm({
      title: t.residents.status,
      message: newActive ? t.residents.activateConfirm : t.residents.deactivateConfirm,
      confirmLabel: newActive ? t.residents.active : t.residents.deactivateResident,
      danger: !newActive,
    });
    if (!ok) return;
    try {
      await api.updateResidentStatus(r.id, newActive);
      toast.success(newActive ? t.residents.activated : t.residents.deactivated);
      loadResidents();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    }
  };

  const handleDelete = async (r: Resident) => {
    const ok = await confirm({
      title: t.residents.deleteResident,
      message: t.residents.deleteConfirm,
      confirmLabel: t.common.delete,
      danger: true,
    });
    if (!ok) return;
    try {
      await api.deleteResident(r.id);
      toast.success(t.residents.deleted);
      loadResidents();
    } catch (error: any) {
      toast.error(error.status === 400 ? t.residents.hasPaymentRecords : (error.message || t.common.error));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">👥 {t.residents.title}</h1>
        <button onClick={openAddForm} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm">
          + {t.residents.addResident}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {residents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t.common.empty}
          </div>
        ) : (
          residents.map((r) => (
            <div key={r.id} className={`bg-white rounded-xl border p-4 shadow-sm ${!r.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{r.apartment_number}</h3>
                  <p className="text-sm text-gray-700">{r.name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {r.active ? t.residents.active : t.residents.inactive}
                </span>
              </div>
              {r.phone && <p className="text-xs text-gray-500 mt-1">📞 {r.phone}</p>}
              {r.email && <p className="text-xs text-gray-500">✉️ {r.email}</p>}
              <div className="flex gap-3 mt-3">
                <button onClick={() => openEditForm(r)} className="text-xs text-blue-600 hover:underline">{t.common.edit}</button>
                <button onClick={() => handleToggleActive(r)} className={`text-xs hover:underline ${r.active ? 'text-orange-600' : 'text-green-600'}`}>
                  {r.active ? t.residents.deactivateResident : t.residents.active}
                </button>
                <button onClick={() => handleDelete(r)} className="text-xs text-red-600 hover:underline">{t.common.delete}</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{editingResident ? t.residents.editResident : t.residents.addResident}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.residents.apartment} *</label>
                  <input type="text" value={formData.apartment_number} onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="A01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.residents.name} *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.residents.phone}</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.residents.email}</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr" />
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