import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import fr from './fr';
import ar from './ar';

export type Language = 'fr' | 'ar';

export type Translations = typeof fr;

const translations: Record<Language, Translations> = { fr, ar };

const STORAGE_KEY = 'elsalam-language';

export function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'ar') return stored;
  } catch {}
  return 'fr';
}

export function setLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

export function getDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

interface I18nContextValue {
  language: Language;
  t: Translations;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  toggleLanguage: () => void;
  switchLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => (prev === 'fr' ? 'ar' : 'fr'));
  }, []);

  const switchLanguage = useCallback((lang: Language) => {
    setLang(lang);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t: translations[language],
      dir: getDirection(language),
      isRTL: language === 'ar',
      toggleLanguage,
      switchLanguage,
    }),
    [language, toggleLanguage, switchLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}