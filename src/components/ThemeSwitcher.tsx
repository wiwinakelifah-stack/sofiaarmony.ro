"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-lg border-2 border-stone-300 dark:border-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-[#8b6f47] dark:hover:border-amber-400 transition-all"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-blue-500" />
      )}
    </button>
  );
}
