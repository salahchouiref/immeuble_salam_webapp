import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { DashboardData } from '../types';
import { formatAmount, getMonthName } from '../utils/format';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();
  const language = isRTL ? 'ar' : 'fr';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getDashboard();
      setData(response.data);
      setCurrentMonth(response.currentMonth);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t.dashboard.noData}
      </div>
    );
  }

  if (data.totalResidents === 0 && data.totalPayments === 0 && data.totalExpenses === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-gray-700 font-medium mb-1">{t.dashboard.title}</p>
        <p className="text-sm text-gray-500">{t.dashboard.noResidents}</p>
      </div>
    );
  }

  const statusColors = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-orange-100 text-orange-800 border-orange-200',
    not_paid: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    paid: '🟢',
    partial: '🟠',
    not_paid: '🔴',
  };

  const statusLabels = {
    paid: t.paymentStatus.paid,
    partial: t.paymentStatus.partial,
    not_paid: t.paymentStatus.notPaid,
  };

  const categoryEmojis: Record<string, string> = {
    'Femme de ménage': '🧹',
    'عاملة النظافة': '🧹',
    'Électricité': '💡',
    'الكهرباء': '💡',
    'Eau': '💧',
    'الماء': '💧',
    'Entretien': '🔧',
    'الصيانة': '🔧',
    'Réparation': '🛠️',
    'الإصلاح': '🛠️',
    'Ascenseur': '🛗',
    'المصعد': '🛗',
    'Parties communes': '🏢',
    'المرافق المشتركة': '🏢',
  };

  return (
    <div className="space-y-6">
      {/* Main cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          label={t.dashboard.currentBalance}
          value={formatAmount(data.currentBalance)}
          color="primary"
        />
        <StatCard
          icon="📥"
          label={t.dashboard.totalPayments}
          value={formatAmount(data.totalPayments)}
          color="green"
        />
        <StatCard
          icon="📤"
          label={t.dashboard.totalExpenses}
          value={formatAmount(data.totalExpenses)}
          color="red"
        />
        <StatCard
          icon="👥"
          label={t.dashboard.totalResidents}
          value={String(data.totalResidents)}
          color="blue"
        />
      </div>

      {/* Monthly section */}
      {currentMonth && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            📅 {getMonthName(currentMonth, language)}
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-700">{formatAmount(data.monthlyExpected)}</p>
              <p className="text-xs text-primary-600 mt-1">{t.dashboard.expectedContributions}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{formatAmount(data.monthlyReceived)}</p>
              <p className="text-xs text-green-600 mt-1">{t.dashboard.receivedContributions}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">{formatAmount(data.monthlyRemaining)}</p>
              <p className="text-xs text-orange-600 mt-1">{t.dashboard.remainingToReceive}</p>
            </div>
          </div>

          {/* Monthly expenses */}
          {data.monthlyExpenses > 0 && (
            <div className="p-3 bg-red-50 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700 font-medium">{t.dashboard.monthlyExpenses}</span>
                <span className="text-xl font-bold text-red-700">{formatAmount(data.monthlyExpenses)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expense breakdown */}
      {data.expenseBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t.dashboard.recentExpenses}</h3>
          <div className="space-y-2">
            {data.expenseBreakdown.map((item) => {
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

      {/* Payment status */}
      {data.paymentStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t.dashboard.paymentStatus}</h3>
          
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">{t.residents.apartment}</th>
                  <th className="text-left py-2 font-medium text-gray-500">{t.residents.name}</th>
                  <th className="text-right py-2 font-medium text-gray-500">{t.paymentStatus.expected}</th>
                  <th className="text-right py-2 font-medium text-gray-500">{t.paymentStatus.paidAmount}</th>
                  <th className="text-right py-2 font-medium text-gray-500">{t.paymentStatus.remaining}</th>
                  <th className="text-center py-2 font-medium text-gray-500">{t.residents.status}</th>
                </tr>
              </thead>
              <tbody>
                {data.paymentStatus.map((item) => (
                  <tr key={item.residentId} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 font-medium text-gray-900">{item.apartmentNumber}</td>
                    <td className="py-2.5 text-gray-700">{item.residentName}</td>
                    <td className="py-2.5 text-right text-gray-700">{formatAmount(item.expected)}</td>
                    <td className="py-2.5 text-right text-gray-700">{formatAmount(item.paid)}</td>
                    <td className="py-2.5 text-right text-gray-700">{formatAmount(item.remaining)}</td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
                        {statusIcons[item.status]} {statusLabels[item.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {data.paymentStatus.map((item) => (
              <div key={item.residentId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.apartmentNumber}</span>
                    <span className="text-sm text-gray-600">{item.residentName}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
                    {statusIcons[item.status]} {statusLabels[item.status]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">{t.paymentStatus.expected}</span>
                    <p className="font-medium">{formatAmount(item.expected)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t.paymentStatus.paidAmount}</span>
                    <p className="font-medium">{formatAmount(item.paid)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t.paymentStatus.remaining}</span>
                    <p className="font-medium">{formatAmount(item.remaining)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: string;
  color: 'primary' | 'green' | 'red' | 'blue';
}) {
  const colorMap = {
    primary: 'bg-primary-50 border-primary-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}
