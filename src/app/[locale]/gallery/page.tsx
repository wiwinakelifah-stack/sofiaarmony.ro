import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import { getPublicGallery } from "@/lib/content-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galerie Foto | Casa de Oaspeți Sofia Armony",
  description: "Explorează fotografie frumoase ale camerelor, restaurantului, grădinii și naturii din jurul casei noastre.",
};

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "ro";
  const images = await getPublicGallery(lang);

  return (
    <>
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              {lang === "en" ? "Images" : "Imagini"}
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              {lang === "en" ? "Photo Gallery" : "Galerie Foto"}
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "A glimpse into our world — carefully designed spaces, unsurpassed nature and unforgettable moments."
                : "O privire în lumea noastră — spații gândite cu grijă, natură neîntrecută și momente de neuitat."}
            </p>
          </div>
        </section>
        <Gallery locale={lang} images={images} />
      </main>
      <Footer locale={lang} />
    </>
  );
}
