import Rooms from "@/components/Rooms";
import Footer from "@/components/Footer";
import { getPublicRooms } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Camerele noastre | Casa de Oaspeți Sofia Armony",
  description: "Descoperă camerele elegante: Clasică, Deluxe și Suite Regală. Fiecare cameră oferă confort și priveliști deosebite.",
};

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "ro";
  const rooms = await getPublicRooms(lang);

  return (
    <>
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              {lang === "en" ? "Stay" : "Cazare"}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              {lang === "en" ? "Our rooms" : "Camerele noastre"}
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "Each room is tastefully decorated and equipped with modern amenities for maximum comfort."
                : "Fiecare cameră este decorată cu gust și dotată cu echipamente moderne pentru confortul maxim."}
            </p>
          </div>
        </section>
        <Rooms locale={lang} rooms={rooms} />
      </main>
      <Footer locale={lang} />
    </>
  );
}
