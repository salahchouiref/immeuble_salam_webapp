import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../services/auth-context';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { Payment, Resident } from '../types';
import { formatAmount, formatDateShort, getCurrentMonth, getMonthName } from '../utils/format';
import { useMonthOptions } from '../hooks/useMonthOptions';

export default function PaymentsPage() {
  const { isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();
  const language = isRTL ? 'ar' : 'fr';
  const monthOptions = useMonthOptions(language);
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    resident_id: '',
    month: getCurrentMonth(),
    date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_type: 'cash' as 'cash' | 'bank_transfer' | 'other',
    note: '',
  });

  useEffect(() => {
    loadData();
  }, [filterMonth]);

  const loadData = async () => {
    try {
      const [paymentsRes, residentsRes] = await Promise.all([
        api.getPayments(filterMonth),
        api.getResidents(),
      ]);
      setPayments(paymentsRes.payments);
      setResidents(residentsRes.residents.filter(r => r.active));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingPayment(null);
    setFormData({
      resident_id: '',
      month: filterMonth,
      date: new Date().toISOString().split('T')[0],
      amount: '',
      payment_type: 'cash',
      note: '',
    });
    setShowForm(true);
  };

  const openEditForm = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      resident_id: String(payment.resident_id),
      month: payment.month,
      date: payment.date,
      amount: String(payment.amount),
      payment_type: payment.payment_type,
      note: payment.note || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.resident_id || !formData.amount || !formData.month || !formData.date) {
      toast.error(t.common.required);
      return;
    }

    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t.common.invalidAmount);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        resident_id: parseInt(formData.resident_id),
        month: formData.month,
        date: formData.date,
        amount,
        payment_type: formData.payment_type,
        note: formData.note || undefined,
      };

      if (editingPayment) {
        await api.updatePayment(editingPayment.id, payload);
        toast.success(t.payments.updated);
      } else {
        await api.createPayment(payload);
        toast.success(t.payments.saved);
      }

      setShowForm(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (payment: Payment) => {
    const ok = await confirm({
      title: t.payments.deletePayment,
      message: t.payments.deleteConfirm,
      confirmLabel: t.common.delete,
      danger: true,
    });
    if (!ok) return;
    
    try {
      await api.deletePayment(payment.id);
      toast.success(t.payments.deleted);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  const paymentTypeLabels: Record<string, string> = {
    cash: t.payments.cash,
    bank_transfer: t.payments.bankTransfer,
    other: t.payments.other,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">💳 {t.payments.title}</h1>
        {isAdmin && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            + {t.payments.addPayment}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Total */}
      <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-primary-700">{t.payments.totalReceived} - {getMonthName(filterMonth, language)}</span>
        <span className="text-xl font-bold text-primary-800">{formatAmount(totalPayments)}</span>
      </div>

      {/* Payments list */}
      {payments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.common.emptyPayments}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.payments.date}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.residents.apartment}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.residents.name}</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">{t.payments.amount}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.payments.paymentType}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.payments.note}</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDateShort(payment.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{payment.apartment_number}</td>
                    <td className="px-4 py-3 text-gray-700">{payment.resident_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-700">{formatAmount(payment.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{paymentTypeLabels[payment.payment_type]}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{payment.note}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditForm(payment)} className="p-1 hover:bg-gray-100 rounded text-blue-600" title={t.common.edit}>✏️</button>
                          <button onClick={() => handleDelete(payment)} className="p-1 hover:bg-gray-100 rounded text-red-600" title={t.common.delete}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{payment.apartment_number}</span>
                    <span className="text-sm text-gray-600">{payment.resident_name}</span>
                  </div>
                  <span className="font-bold text-primary-700">{formatAmount(payment.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDateShort(payment.date)}</span>
                  <span>{paymentTypeLabels[payment.payment_type]}</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openEditForm(payment)} className="text-xs text-blue-600">{t.common.edit}</button>
                    <button onClick={() => handleDelete(payment)} className="text-xs text-red-600">{t.common.delete}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingPayment ? t.payments.editPayment : t.payments.addPayment}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.payments.resident} *</label>
                  <select
                    value={formData.resident_id}
                    onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">{t.payments.resident}</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>{r.apartment_number} - {r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.payments.month} *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.payments.date} *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.payments.amount} (DH) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.payments.paymentType}</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="cash">{t.payments.cash}</option>
                    <option value="bank_transfer">{t.payments.bankTransfer}</option>
                    <option value="other">{t.payments.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.payments.note}</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-sm"
                  >
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
