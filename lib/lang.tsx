"use client";

/* ============================================================
   LANGUAGE

   English is the default and the one that ships in the built HTML.
   Arabic is a choice the visitor makes, remembered after that.

   The site is prerendered in English, so a recruiter who never touches
   the switch pays nothing for the Arabic existing: the second copy of
   the content arrives as a prop and is only rendered if asked for.
   Switching costs no request.
   ============================================================ */

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from "react";

export type Lang = "en" | "ar";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Picks the right side of a pair. Falls back to English when the
      Arabic is missing, so a half-translated field degrades to
      something readable rather than to a gap. */
  pick: <T,>(en: T, ar?: T | null) => T;
};

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  pick: (en) => en,
});

export const useLang = () => useContext(LangContext);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  /* Read the stored choice after mount. The inline script in the layout
     has already set dir and lang on <html>, so there is no flash here;
     this only brings React's state in line with the DOM. */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hobz-lang") as Lang | null;
      if (stored === "ar") setLangState("ar");
    } catch {}
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    const el = document.documentElement;
    el.setAttribute("lang", next);
    el.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
    try { localStorage.setItem("hobz-lang", next); } catch {}
  }

  const pick = <T,>(en: T, ar?: T | null): T =>
    lang === "ar" && ar != null && ar !== "" ? (ar as T) : en;

  return (
    <LangContext.Provider value={{ lang, setLang, pick }}>
      {children}
    </LangContext.Provider>
  );
}

/* ---- Interface strings ---------------------------------------------
   Only the words the interface owns. Everything a visitor came to read
   lives in a content file beside its English original, not here. */
export const UI = {
  navIntro:      { en: "Intro",       ar: "البداية" },
  navWorked:     { en: "Worked with", ar: "عملت مع" },
  navWork:       { en: "Work",        ar: "الشغل" },
  navBackground: { en: "Background",  ar: "المسيرة" },
  navConsulting: { en: "Consulting",  ar: "الاستشارات" },
  navContact:    { en: "Contact",     ar: "تواصل" },
  openMenu:      { en: "Open menu",   ar: "افتح القائمة" },
  closeMenu:     { en: "Close menu",  ar: "اقفل القائمة" },
  sections:      { en: "Sections",    ar: "الأقسام" },
  more:          { en: "See more",    ar: "اقرأ المزيد" },
  showAll:       { en: "Show all",    ar: "اعرض الكل" },
  showLess:      { en: "Show less",   ar: "اعرض أقل" },
  builtSolo:     { en: "Built solo",  ar: "بنيته بنفسي" },
  usesAI:        { en: "AI",          ar: "ذكاء اصطناعي" },
  credit:        { en: "Design and code by", ar: "تصميم وبرمجة" },
  toArabic:      { en: "Switch to Arabic",   ar: "التبديل للعربية" },
  toEnglish:     { en: "Switch to English",  ar: "التبديل للإنجليزية" },
} as const;

export type UIKey = keyof typeof UI;

/** Reads an interface string in the current language. */
export function useUI() {
  const { lang } = useLang();
  return (key: UIKey) => UI[key][lang];
}
