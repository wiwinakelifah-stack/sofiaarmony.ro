import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Galerie Foto | Casa de Oaspeți Sofia Armony",
  description: "Explorează fotografie frumoase ale camerelor, restaurantului, grădinii și naturii din jurul casei noastre.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-amber-300 tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              Imagini
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl mb-4">
              Galerie Foto
            </h1>
            <p className="font-[family-name:var(--font-lato)] text-white/80 max-w-2xl mx-auto leading-relaxed">
              O privire în lumea noastră — spații gândite cu grijă, natură neîntrecută și momente de neuitat.
            </p>
          </div>
        </section>
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
