"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const labels = {
  ro: {
    home: "Acasă",
    rooms: "Camere",
    amenities: "Facilități",
    gallery: "Galerie",
    reviews: "Recenzii",
    contact: "Contact",
    reserve: "Rezervă acum",
    settings: "Setări:",
    guestHouse: "Casa de Oaspeți",
  },
  en: {
    home: "Home",
    rooms: "Rooms",
    amenities: "Amenities",
    gallery: "Gallery",
    reviews: "Reviews",
    contact: "Contact",
    reserve: "Book now",
    settings: "Settings:",
    guestHouse: "Guest House",
  },
} as const;

export default function Navbar({ locale }: { locale: "ro" | "en" }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = labels[locale as keyof typeof labels];
  const isHome = pathname === "/";

  const navLinks = [
    { label: t.home, href: "/" },
    { label: t.rooms, href: "/rooms" },
    { label: t.amenities, href: "/amenities" },
    { label: t.gallery, href: "/gallery" },
    { label: t.reviews, href: "/reviews" },
    { label: t.contact, href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const solid = scrolled || !isHome;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-tight">
          <span
            className={`font-[family-name:var(--font-playfair)] text-xl font-semibold tracking-wide transition-colors duration-300 ${
              solid ? "text-stone-800" : "text-white"
            }`}
          >
            Sofia Armony
          </span>
          <span
            className={`text-xs tracking-widest uppercase transition-colors duration-300 ${
              solid ? "text-[#8b6f47]" : "text-amber-200"
            }`}
          >
            {t.guestHouse}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide font-[family-name:var(--font-lato)] transition-colors duration-300 hover:text-[#c9a96e] ${
                solid ? "text-stone-700" : "text-white/90"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Theme & Language Switchers */}
          <LanguageSwitcher solid={solid} currentLocale={locale} />
          
          <Link
            href="/contact"
            className="ml-2 px-5 py-2 text-sm font-medium rounded-full bg-[#8b6f47] text-white hover:bg-[#6b5234] transition-colors duration-300 font-[family-name:var(--font-lato)]"
          >
            {t.reserve}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden transition-colors duration-300 ${
            solid ? "text-stone-800" : "text-white"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-stone-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-stone-700 text-sm tracking-wide font-[family-name:var(--font-lato)] hover:text-[#8b6f47] transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Divider */}
          <div className="h-px bg-stone-200 my-2" />
          
          {/* Mobile Language Switcher */}
          <div className="flex gap-4 items-center justify-between">
            <span className="text-xs font-medium text-stone-500">{t.settings}</span>
            <LanguageSwitcher solid={true} currentLocale={locale} />
          </div>
          
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-5 py-2 text-sm font-medium rounded-full bg-[#8b6f47] text-white hover:bg-[#6b5234] transition-colors text-center font-[family-name:var(--font-lato)]"
          >
            {t.reserve}
          </Link>
        </div>
      )}
    </header>
  );
}
