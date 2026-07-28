import {
  Wifi,
  Car,
  UtensilsCrossed,
  TreePine,
  Waves,
  Coffee,
  Flame,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const amenities = {
  ro: [
  {
    icon: Wifi,
    title: "Wi-Fi Gratuit",
    desc: "Conexiune de mare viteză în toată proprietatea",
  },
  {
    icon: Car,
    title: "Parcare Gratuită",
    desc: "Parcare securizată și supravegheată video",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant & Bar",
    desc: "Bucătărie tradițională românească și internațională",
  },
  {
    icon: TreePine,
    title: "Grădină & Terasă",
    desc: "Spații de relaxare în aer liber cu priveliști superbe",
  },
  {
    icon: Waves,
    title: "Jacuzzi & Spa",
    desc: "Relaxare completă în spa-ul nostru exclusiv",
  },
  {
    icon: Coffee,
    title: "Mic Dejun Inclus",
    desc: "Mic dejun bufet cu produse locale proaspete",
  },
  {
    icon: Flame,
    title: "Șemineu Comun",
    desc: "Sală de relaxare cu șemineu pentru serile reci",
  },
  {
    icon: MapPin,
    title: "Tur Ghidat Local",
    desc: "Descoperă obiectivele zonei cu ghidul nostru",
  },
  ],
  en: [
  {
    icon: Wifi,
    title: "Free Wi-Fi",
    desc: "High-speed internet throughout the property",
  },
  {
    icon: Car,
    title: "Free Parking",
    desc: "Secure parking with video surveillance",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant & Bar",
    desc: "Traditional Romanian and international cuisine",
  },
  {
    icon: TreePine,
    title: "Garden & Terrace",
    desc: "Outdoor relaxation spaces with beautiful views",
  },
  {
    icon: Waves,
    title: "Jacuzzi & Spa",
    desc: "Complete relaxation in our exclusive spa",
  },
  {
    icon: Coffee,
    title: "Breakfast Included",
    desc: "Buffet breakfast with fresh local products",
  },
  {
    icon: Flame,
    title: "Common Fireplace",
    desc: "Relaxation room with fireplace for cold evenings",
  },
  {
    icon: MapPin,
    title: "Local Guided Tour",
    desc: "Discover nearby attractions with our guide",
  },
  ],
};

export default function Amenities({ locale = "ro" }: { locale?: "ro" | "en" }) {
  const selectedAmenities = amenities[locale];
  const t =
    locale === "en"
      ? { category: "Why us", title: "Our amenities", intro: "Everything you need for a perfect stay, with attention to every detail.", ctaTitle: "The perfect experience awaits", ctaDesc: "Book now and benefit from a 15% discount for stays of at least 3 nights.", ctaButton: "Book now with discount" }
      : { category: "De ce noi", title: "Facilitățile noastre", intro: "Totul de care ai nevoie pentru o ședere perfectă, cu atenție la fiecare detaliu.", ctaTitle: "Experiența perfectă te așteaptă", ctaDesc: "Rezervă acum și beneficiază de reducere 15% pentru șederi de minim 3 nopți.", ctaButton: "Rezervă acum cu reducere" };

  return (
    <section className="py-24 bg-[#f5f0e8]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
            {t.category}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
            {t.title}
          </h2>
          <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-xl mx-auto leading-relaxed">
            {t.intro}
          </p>
          <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {selectedAmenities.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div className="w-12 h-12 bg-[#f5f0e8] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#8b6f47] transition-colors duration-300">
                <Icon
                  size={22}
                  className="text-[#8b6f47] group-hover:text-white transition-colors duration-300"
                />
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-stone-800 font-semibold mb-2">
                {title}
              </h3>
              <p className="font-[family-name:var(--font-lato)] text-stone-500 text-sm leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 relative rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-stone-900/65" />
          <div className="relative z-10 py-16 px-8 text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-4">
              {t.ctaTitle}
            </h3>
            <p className="font-[family-name:var(--font-lato)] text-white/75 max-w-xl mx-auto mb-8">
              {t.ctaDesc}
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 bg-[#c9a96e] text-white rounded-full font-[family-name:var(--font-lato)] text-sm font-medium tracking-wide hover:bg-[#8b6f47] transition-colors duration-300"
            >
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
