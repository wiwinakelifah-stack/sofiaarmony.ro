import { Phone, Mail, MapPin, Share2, Heart, Camera } from "lucide-react";
import Link from "next/link";

type Locale = "ro" | "en";

export default function Footer({ locale = "ro" }: { locale?: Locale }) {
  const year = new Date().getFullYear();
  const isEn = locale === "en";

  const text = {
    brandTagline: isEn ? "Guest House" : "Casa de Oaspeți",
    description: isEn
      ? "A destination where peace and elegance meet. We are waiting for you to discover authentic Romanian comfort."
      : "O destinație unde liniștea și eleganța se întâlnesc. Te așteptăm să descoperi confortul autentic românesc.",
    navigation: isEn ? "Navigation" : "Navigare",
    contact: "Contact",
    privacy: isEn ? "Privacy Policy" : "Politica de confidențialitate",
    terms: isEn ? "Terms and Conditions" : "Termeni și condiții",
    copyright: isEn
      ? `© ${year} Sofia Armony Guest House. All rights reserved.`
      : `© ${year} Sofia Armony Casa de Oaspeți. Toate drepturile rezervate.`,
    navLinks: [
      { label: isEn ? "Home" : "Acasă", href: "/" },
      { label: isEn ? "Rooms" : "Camere", href: "/rooms" },
      { label: isEn ? "Amenities" : "Facilități", href: "/amenities" },
      { label: isEn ? "Gallery" : "Galerie", href: "/gallery" },
      { label: isEn ? "Reviews" : "Recenzii", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-[#1c1917] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">
                Sofia Armony
              </h3>
              <p className="text-[#c9a96e] text-xs tracking-widest uppercase mt-0.5 font-[family-name:var(--font-lato)]">
                {text.brandTagline}
              </p>
            </div>
            <p className="font-[family-name:var(--font-lato)] text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
              {text.description}
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: Camera, href: "#", label: "Instagram" },
                { icon: Share2, href: "#", label: "Facebook" },
                { icon: Heart, href: "#", label: "TikTok" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-[family-name:var(--font-playfair)] text-sm font-semibold mb-5 text-stone-200">
              {text.navigation}
            </h4>
            <ul className="space-y-3">
              {text.navLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-[family-name:var(--font-lato)] text-stone-400 text-sm hover:text-[#c9a96e] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[family-name:var(--font-playfair)] text-sm font-semibold mb-5 text-stone-200">
              {text.contact}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
                <span className="font-[family-name:var(--font-lato)] text-stone-400 text-sm leading-relaxed">
                  Str. Florilor nr. 12, Sinaia, Prahova
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-[#c9a96e] flex-shrink-0" />
                <a
                  href="tel:+40722123456"
                  className="font-[family-name:var(--font-lato)] text-stone-400 text-sm hover:text-[#c9a96e] transition-colors"
                >
                  +40 722 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-[#c9a96e] flex-shrink-0" />
                <a
                  href="mailto:contact@sofiaarmony.ro"
                  className="font-[family-name:var(--font-lato)] text-stone-400 text-sm hover:text-[#c9a96e] transition-colors"
                >
                  contact@sofiaarmony.ro
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-[family-name:var(--font-lato)] text-stone-500 text-xs">
            {text.copyright}
          </p>
          <div className="flex gap-5">
            {[text.privacy, text.terms].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="font-[family-name:var(--font-lato)] text-stone-500 text-xs hover:text-stone-300 transition-colors"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
