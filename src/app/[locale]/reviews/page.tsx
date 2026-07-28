import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import { getPublicReviews } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recenzii | Casa de Oaspeți Sofia Armony",
  description: "Citește recenziile oaspeților noștri fericiți. Evaluare medie 4.9★ din 500+ recenzii.",
};

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "ro";
  const reviews = await getPublicReviews();

  return (
    <>
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              {lang === "en" ? "What guests say" : "Ce spun oaspeții"}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              {lang === "en" ? "Reviews & Testimonials" : "Recenzii & Testimoniale"}
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "Our guests' stories are the best proof of the care we take to welcome them."
                : "Poveștile oaspeților noștri sunt cea mai bună dovadă a grijii cu care îi primim."}
            </p>
          </div>
        </section>
        <Reviews locale={lang} reviews={reviews} />
      </main>
      <Footer locale={lang} />
    </>
  );
}
