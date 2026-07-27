"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n/request";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  const currentLocale = pathname.split("/")[1];

  return (
    <div className="flex gap-1 border border-stone-200 dark:border-stone-700 rounded-lg p-1 bg-stone-50 dark:bg-stone-900">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            currentLocale === locale
              ? "bg-[#8b6f47] text-white"
              : "text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
