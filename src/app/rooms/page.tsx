import Navbar from "@/components/Navbar";
import Rooms from "@/components/Rooms";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Camerele noastre | Casa de Oaspeți Sofia Armony",
  description: "Descoperă camerele elegante: Clasică, Deluxe și Suite Regală. Fiecare cameră oferă confort și priveliști deosebite.",
};

export default function RoomsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              Cazare
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              Camerele noastre
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              Fiecare cameră este decorată cu gust și dotată cu echipamente moderne pentru confortul maxim.
            </p>
          </div>
        </section>
        <Rooms />
      </main>
      <Footer />
    </>
  );
}
