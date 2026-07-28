import Hero from "@/components/Hero";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Link from "next/link";
import enMessages from "@/i18n/messages/en.json";
import roMessages from "@/i18n/messages/ro.json";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "ro";
  const messages = lang === "en" ? enMessages : roMessages;
  const withLocale = (href: string) => `/${lang}${href === "/" ? "" : href}`;
  const offers =
    lang === "en"
      ? [
          {
            title: "Our rooms",
            desc: "Elegant and comfortable, with beautiful views",
            href: withLocale("/rooms"),
            icon: "🏨",
          },
          {
            title: "Amenities & Services",
            desc: "Spa, restaurant, free Wi-Fi and more",
            href: withLocale("/amenities"),
            icon: "✨",
          },
          {
            title: "Photo gallery",
            desc: "See the beauty of our place in pictures",
            href: withLocale("/gallery"),
            icon: "📸",
          },
          {
            title: "Reviews",
            desc: "Read what our happy guests are saying",
            href: withLocale("/reviews"),
            icon: "⭐",
          },
        ]
      : [
          {
            title: "Camerele noastre",
            desc: "Elegante și confortabile, cu priveliști deosebite",
            href: withLocale("/rooms"),
            icon: "🏨",
          },
          {
            title: "Facilități & Servicii",
            desc: "Spa, restaurant, Wi-Fi gratuit și nu numai",
            href: withLocale("/amenities"),
            icon: "✨",
          },
          {
            title: "Galerie Foto",
            desc: "Vezi frumusețea locului nostru în imagini",
            href: withLocale("/gallery"),
            icon: "📸",
          },
          {
            title: "Recenzii",
            desc: "Citește ce spun oaspeții noștri fericiți",
            href: withLocale("/reviews"),
            icon: "⭐",
          },
        ];

  return (
    <>
      <main>
        <Hero
          locale={lang}
          subtitle={messages.hero.subtitle}
          description={messages.hero.description}
          explore={messages.hero.explore}
          reserve={messages.nav.reserve}
          roomsCount={messages.hero.rooms_count}
          guestsCount={messages.hero.guests_count}
          rating={messages.hero.rating}
        />
        <About
          storyLabel={lang === "en" ? "Our story" : "Povestea noastră"}
          title={messages.about.title}
          desc1={messages.about.desc1}
          desc2={messages.about.desc2}
          sincerity={messages.about.sincerity}
          sincerityDesc={messages.about.sincerity_desc}
          quality={messages.about.quality}
          qualityDesc={messages.about.quality_desc}
          eco={messages.about.eco}
          ecoDesc={messages.about.eco_desc}
          yearsLabel={lang === "en" ? "Years of experience" : "Ani de experiență"}
        />
        
        {/* Features/CTA section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
                {lang === "en" ? "Explore more" : "Explorează mai mult"}
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
                {lang === "en" ? "Discover our offers" : "Descoperă ofertele noastre"}
              </h2>
              <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {offers.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-[#f5f0e8] rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-stone-800 mb-2 group-hover:text-[#8b6f47] transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-[family-name:var(--font-lato)] text-stone-500 text-sm">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href={withLocale("/contact")}
                className="inline-block px-8 py-3.5 bg-[#8b6f47] text-white rounded-full font-[family-name:var(--font-lato)] text-sm font-medium tracking-wide hover:bg-[#6b5234] transition-colors duration-300"
              >
                {messages.nav.reserve}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={lang} />
    </>
  );
}
