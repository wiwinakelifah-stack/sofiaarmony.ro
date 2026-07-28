"use client";

import { locales } from "@/i18n/request";

export default function LanguageSwitcher({
  solid = false,
  currentLocale,
}: {
  solid?: boolean;
  currentLocale: "ro" | "en";
}) {
  const switchLanguage = async (locale: string) => {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    window.location.reload();
  };

  return (
    <div className={`flex gap-1 border-2 rounded-lg p-1.5 transition-all ${
      solid
        ? "border-stone-300 dark:border-amber-500 bg-stone-50 dark:bg-stone-900"
        : "border-white/50 bg-white/10 dark:border-amber-500/50 dark:bg-stone-900/20"
    }`}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => void switchLanguage(locale)}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
            currentLocale === locale
              ? "bg-[#8b6f47] text-white shadow-md scale-105"
              : `${solid ? "text-stone-700 dark:text-stone-200" : "text-white/90 dark:text-stone-200"} hover:bg-[#8b6f47]/20 dark:hover:bg-amber-500/20`
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
