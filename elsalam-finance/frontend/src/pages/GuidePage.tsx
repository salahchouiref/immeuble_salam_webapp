import { useState } from 'react';
import { useAuth } from '../services/auth-context';
import { useLanguage } from '../hooks/useLanguage';

export default function GuidePage() {
  const { isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>('addPayment');

  const toggle = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900">📖 {t.guide.title}</h1>

      {isAdmin && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t.guide.forAdmin}</h2>
          <div className="space-y-3">
            <GuideSection
              id="addPayment"
              title={t.guide.addPaymentGuide.title}
              steps={t.guide.addPaymentGuide.steps}
              expanded={expandedSection === 'addPayment'}
              onToggle={() => toggle('addPayment')}
              icon="💳"
            />
            <GuideSection
              id="addExpense"
              title={t.guide.addExpenseGuide.title}
              steps={t.guide.addExpenseGuide.steps}
              expanded={expandedSection === 'addExpense'}
              onToggle={() => toggle('addExpense')}
              icon="💸"
            />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{isAdmin ? t.guide.forResident : t.guide.forAdmin}</h2>
        <div className="space-y-3">
          <GuideSection
            id="viewDashboard"
            title={t.guide.viewDashboard.title}
            steps={t.guide.viewDashboard.steps}
            expanded={expandedSection === 'viewDashboard'}
            onToggle={() => toggle('viewDashboard')}
            icon="🏠"
          />
          <GuideSection
            id="viewReports"
            title={t.guide.viewReports.title}
            steps={t.guide.viewReports.steps}
            expanded={expandedSection === 'viewReports'}
            onToggle={() => toggle('viewReports')}
            icon="📊"
          />
        </div>
      </div>
    </div>
  );
}

function GuideSection({ id, title, steps, expanded, onToggle, icon }: {
  id: string;
  title: string;
  steps: string[];
  expanded: boolean;
  onToggle: () => void;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <ol className="space-y-2 ml-4">
            {steps.map((step, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="font-medium text-primary-600">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
