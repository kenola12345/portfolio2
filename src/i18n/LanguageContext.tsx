import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Lang, translations } from './translations';

const STORAGE_KEY = 'lang';

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** 初期言語: 保存済みの選択 → ブラウザ言語(日本語なら ja) → en の順で決める */
function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ja') return saved;
  } catch {
    // localStorage が使えない環境ではブラウザ言語にフォールバック
  }
  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

/** 言語の状態を全体に配る Provider */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても表示切り替えは動作させる
    }
  }, []);

  // 読み上げ・検索エンジン向けに <html lang> を同期する
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
