import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

export const metadata = {
  title: "Contact & Rezervare | Casa de Oaspeți Sofia Armony",
  description: "Contactează-ne și rezervă camera ta. Suntem gata să răspundem la toate întrebările tale.",
};

export default async function ContactPage({
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
              {lang === "en" ? "Let's talk" : "Vorbă cu noi"}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              {lang === "en" ? "Contact & Booking" : "Contact & Rezervare"}
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "We are here to answer any question and help with your booking."
                : "Suntem aici pentru a-ți răspunde la orice întrebare și a-ți ajuta cu rezervarea."}
            </p>
          </div>
        </section>
        <Contact />
      </main>
      <Footer locale={lang} />
    </>
  );
}
