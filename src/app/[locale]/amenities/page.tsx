import Amenities from "@/components/Amenities";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Facilități | Casa de Oaspeți Sofia Armony",
  description: "Facilități complete: Wi-Fi, Spa, Restaurant, Parcare, Jacuzzi, Grădină și multe altele.",
};

export default async function AmenitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "ro";

  return (
    <>
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              {lang === "en" ? "Why us" : "De ce noi"}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              {lang === "en" ? "Amenities & Services" : "Facilități & Servicii"}
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "Everything you need for a perfect stay, with attention to every detail."
                : "Totul de care ai nevoie pentru o ședere perfectă, cu atenție la fiecare detaliu."}
            </p>
          </div>
        </section>
        <Amenities locale={lang} />
      </main>
      <Footer locale={lang} />
    </>
  );
}
