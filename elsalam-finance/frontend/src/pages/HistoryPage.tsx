import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { HistoryItem } from '../types';
import { formatAmount, formatDateShort, getCurrentMonth } from '../utils/format';
import { useMonthOptions } from '../hooks/useMonthOptions';

export default function HistoryPage() {
  const { t, isRTL } = useLanguage();
  const language = isRTL ? 'ar' : 'fr';
  const monthOptions = useMonthOptions(language);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => { loadHistory(); }, [filterMonth, filterType]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(filterMonth || undefined, filterType || undefined);
      setHistory(res.history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">📜 {t.history.title}</h1>

      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">{t.common.all}</option>
          {monthOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">{t.history.allTypes}</option>
          <option value="payment">{t.history.payment}</option>
          <option value="expense">{t.history.expense}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t.history.noRecords}</div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div key={`${item.type}-${item.id}`} className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4 ${item.type === 'payment' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${item.type === 'payment' ? 'bg-green-100' : 'bg-red-100'}`}>
                {item.type === 'payment' ? '📥' : '📤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.type === 'payment' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.type === 'payment' ? t.history.payment : t.history.expense}
                  </span>
                </div>
                {item.type === 'payment' ? (
                  <p className="text-sm text-gray-700">
                    {item.apartment_number} - {item.resident_name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-700">
                    {isRTL ? item.category_name_ar : item.category_name}: {item.description}
                  </p>
                )}
                {item.note && <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold ${item.type === 'payment' ? 'text-green-700' : 'text-red-700'}`}>
                  {item.type === 'payment' ? '+' : '-'}{formatAmount(item.amount)}
                </p>
                <p className="text-xs text-gray-500">{formatDateShort(item.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
