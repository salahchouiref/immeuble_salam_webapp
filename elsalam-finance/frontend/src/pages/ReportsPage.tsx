import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { MonthlyReport } from '../types';
import { formatAmount, getCurrentMonth, getMonthName } from '../utils/format';
import { useMonthOptions } from '../hooks/useMonthOptions';

export default function ReportsPage() {
  const { t, isRTL } = useLanguage();
  const language = isRTL ? 'ar' : 'fr';
  const monthOptions = useMonthOptions(language);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadReport(); }, [selectedMonth]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.getMonthlyReport(selectedMonth);
      setReport(res.report);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => { window.print(); };

  if (loading && !report) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const categoryEmojis: Record<string, string> = {
    'Femme de ménage': '🧹', 'عاملة النظافة': '🧹', 'Électricité': '💡', 'الكهرباء': '💡',
    'Eau': '💧', 'الماء': '💧', 'Entretien': '🔧', 'الصيانة': '🔧',
    'Réparation': '🛠️', 'الإصلاح': '🛠️', 'Ascenseur': '🛗', 'المصعد': '🛗',
    'Parties communes': '🏢', 'المرافق المشتركة': '🏢',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <h1 className="text-xl font-bold text-gray-900">📊 {t.reports.title}</h1>
        <div className="flex gap-2">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
            {monthOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
            🖨️ {t.reports.print}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto" id="report">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">🏢 {t.app.buildingName}</h2>
            <p className="text-sm text-gray-500">{t.reports.monthlyReport} - {getMonthName(selectedMonth, language)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">{formatAmount(report.totalPayments)}</p>
              <p className="text-xs text-primary-600 mt-1">{t.reports.entries}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{formatAmount(report.totalExpenses)}</p>
              <p className="text-xs text-red-600 mt-1">{t.reports.exits}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-center text-sm text-gray-600 mb-1">{t.reports.monthlyBalance}</p>
            <p className={`text-center text-3xl font-bold ${report.monthlyBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatAmount(report.monthlyBalance)}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t.reports.residentsSummary}</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xl font-bold text-green-700">{report.paidCount}</p>
                <p className="text-xs text-green-600">{t.reports.paid}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xl font-bold text-orange-700">{report.partialCount}</p>
                <p className="text-xs text-orange-600">{t.reports.partial}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xl font-bold text-red-700">{report.notPaidCount}</p>
                <p className="text-xs text-red-600">{t.reports.notPaid}</p>
              </div>
            </div>
          </div>

          {report.expenseBreakdown.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t.reports.exits}</h3>
              <div className="space-y-2">
                {report.expenseBreakdown.map((item) => {
                  const catName = isRTL ? item.categoryNameAr : item.categoryName;
                  const emoji = categoryEmojis[catName] || '📌';
                  return (
                    <div key={item.categoryId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>{emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{catName}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatAmount(item.total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
