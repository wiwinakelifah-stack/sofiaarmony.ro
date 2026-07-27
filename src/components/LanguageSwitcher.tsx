"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n/request";

export default function LanguageSwitcher({ solid = false }: { solid?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  const currentLocale = pathname.split("/")[1];

  return (
    <div className={`flex gap-1 border-2 rounded-lg p-1.5 transition-all ${
      solid
        ? "border-stone-300 dark:border-amber-500 bg-stone-50 dark:bg-stone-900"
        : "border-white/50 bg-white/10 dark:border-amber-500/50 dark:bg-stone-900/20"
    }`}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
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
