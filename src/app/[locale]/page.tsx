import Hero from "@/components/Hero";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <About />
        
        {/* Features/CTA section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
                Explorează mai mult
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
                Descoperă ofertele noastre
              </h2>
              <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  title: "Camerele noastre",
                  desc: "Elegante și confortabile, cu priveliști deosebite",
                  href: "/rooms",
                  icon: "🏨",
                },
                {
                  title: "Facilități & Servicii",
                  desc: "Spa, restaurant, Wi-Fi gratuit și nu numai",
                  href: "/amenities",
                  icon: "✨",
                },
                {
                  title: "Galerie Foto",
                  desc: "Vezi frumusețea locului nostru în imagini",
                  href: "/gallery",
                  icon: "📸",
                },
                {
                  title: "Recenzii",
                  desc: "Citește ce spun oaspeții noștri fericiți",
                  href: "/reviews",
                  icon: "⭐",
                },
              ].map((item) => (
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
                href="/contact"
                className="inline-block px-8 py-3.5 bg-[#8b6f47] text-white rounded-full font-[family-name:var(--font-lato)] text-sm font-medium tracking-wide hover:bg-[#6b5234] transition-colors duration-300"
              >
                Rezervă acum
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
