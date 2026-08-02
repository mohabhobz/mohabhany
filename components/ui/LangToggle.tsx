"use client";

import { useLang, useUI } from "@/lib/lang";

/**
 * Language switch, parked beside the theme switch.
 *
 * The button shows the language it takes you TO, not the one you are in:
 * in English it reads ع, in Arabic it reads EN. A control that names its
 * destination needs no explaining; one that names the current state has
 * to be read twice.
 */
export function LangToggle() {
  const { lang, setLang } = useLang();
  const t = useUI();
  const label = lang === "en" ? t("toArabic") : t("toEnglish");

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      aria-label={label}
      title={label}
      className="lang-toggle"
      /* lang on the button itself so the browser picks the right face and
         shaping for the glyph inside, whichever way the page is set. */
      lang={lang === "en" ? "ar" : "en"}
    >
      {lang === "en" ? "ع" : "EN"}
    </button>
  );
}
