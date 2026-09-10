import { useMemo } from 'react';

export interface MonthOption {
  value: string; // YYYY-MM format
  label: string;
}

export function useMonthOptions(language: 'fr' | 'ar') {
  return useMemo(() => {
    const months = language === 'fr' ? [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ] : [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
      'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ];

    const options: MonthOption[] = [];
    const now = new Date();
    
    // Generate 12 months back and 3 months forward
    for (let i = -12; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = language === 'fr' 
        ? `${months[month]} ${year}`
        : `${months[month]} ${year}`;
      options.push({ value, label });
    }

    return options;
  }, [language]);
}
