import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Recenzii | Casa de Oaspeți Sofia Armony",
  description: "Citește recenziile oaspeților noștri fericiți. Evaluare medie 4.9★ din 500+ recenzii.",
};

export default function ReviewsPage() {
  return (
    <>
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              Ce spun oaspeții
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              Recenzii & Testimoniale
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              Poveștile oaspeților noștri sunt cea mai bună dovadă a grijii cu care îi primim.
            </p>
          </div>
        </section>
        <Reviews />
      </main>
      <Footer />
    </>
  );
}
