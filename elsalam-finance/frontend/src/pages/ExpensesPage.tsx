import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../services/auth-context';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { Expense, Category } from '../types';
import { formatAmount, formatDateShort, getCurrentMonth, getMonthName } from '../utils/format';
import { useMonthOptions } from '../hooks/useMonthOptions';

export default function ExpensesPage() {
  const { isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();
  const language = isRTL ? 'ar' : 'fr';
  const monthOptions = useMonthOptions(language);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    month: getCurrentMonth(),
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    payment_method: 'cash' as 'cash' | 'bank_transfer' | 'other',
    note: '',
  });

  useEffect(() => {
    loadData();
  }, [filterMonth]);

  const loadData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        api.getExpenses(filterMonth),
        api.getCategories(),
      ]);
      setExpenses(expensesRes.expenses);
      setCategories(categoriesRes.categories.filter(c => c.active));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (cat: Category) => isRTL ? cat.name_ar : cat.name;

  const openAddForm = () => {
    setEditingExpense(null);
    setFormData({
      category_id: '',
      month: filterMonth,
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      payment_method: 'cash',
      note: '',
    });
    setShowForm(true);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category_id: String(expense.category_id),
      month: expense.month,
      date: expense.date,
      description: expense.description,
      amount: String(expense.amount),
      payment_method: expense.payment_method,
      note: expense.note || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.category_id || !formData.amount || !formData.description || !formData.month || !formData.date) {
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
        category_id: parseInt(formData.category_id),
        month: formData.month,
        date: formData.date,
        description: formData.description,
        amount,
        payment_method: formData.payment_method,
        note: formData.note || undefined,
      };

      if (editingExpense) {
        await api.updateExpense(editingExpense.id, payload);
        toast.success(t.expenses.updated);
      } else {
        await api.createExpense(payload);
        toast.success(t.expenses.saved);
      }

      setShowForm(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense: Expense) => {
    const ok = await confirm({
      title: t.expenses.deleteExpense,
      message: t.expenses.deleteConfirm,
      confirmLabel: t.common.delete,
      danger: true,
    });
    if (!ok) return;
    
    try {
      await api.deleteExpense(expense.id);
      toast.success(t.expenses.deleted);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t.common.error);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const paymentMethodLabels: Record<string, string> = {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">💸 {t.expenses.title}</h1>
        {isAdmin && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            + {t.expenses.addExpense}
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

      <div className="bg-red-50 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-red-700">{t.expenses.totalExpenses} - {getMonthName(filterMonth, language)}</span>
        <span className="text-xl font-bold text-red-800">{formatAmount(totalExpenses)}</span>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.common.emptyExpenses}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.expenses.date}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.expenses.category}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.expenses.description}</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">{t.expenses.amount}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t.expenses.paymentMethod}</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDateShort(expense.date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {isRTL ? expense.category_name_ar : expense.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{expense.description}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-700">-{formatAmount(expense.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{paymentMethodLabels[expense.payment_method]}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditForm(expense)} className="p-1 hover:bg-gray-100 rounded text-blue-600" title={t.common.edit}>✏️</button>
                          <button onClick={() => handleDelete(expense)} className="p-1 hover:bg-gray-100 rounded text-red-600" title={t.common.delete}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded font-medium">
                    {isRTL ? expense.category_name_ar : expense.category_name}
                  </span>
                  <span className="font-bold text-red-700">-{formatAmount(expense.amount)}</span>
                </div>
                <p className="text-sm text-gray-700">{expense.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>{formatDateShort(expense.date)}</span>
                  <span>{paymentMethodLabels[expense.payment_method]}</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openEditForm(expense)} className="text-xs text-blue-600">{t.common.edit}</button>
                    <button onClick={() => handleDelete(expense)} className="text-xs text-red-600">{t.common.delete}</button>
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
                  {editingExpense ? t.expenses.editExpense : t.expenses.addExpense}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.category} *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">{t.expenses.category}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{getCategoryName(c)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.description} *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.month} *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.date} *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.amount} (DH) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.paymentMethod}</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="cash">{t.payments.cash}</option>
                    <option value="bank_transfer">{t.payments.bankTransfer}</option>
                    <option value="other">{t.payments.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.expenses.note}</label>
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
