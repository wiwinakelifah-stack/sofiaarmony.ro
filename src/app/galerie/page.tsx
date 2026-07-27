import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import Gallery from "@/components/Gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie Foto | Sofia Armony Casa de Oaspeți",
  description:
    "O privire în lumea noastră — camere, grădini, restaurant, priveliști și momente de neuitat la Sofia Armony.",
};

export default function GaleriePage() {
  return (
    <>
      <Navbar />
      <PageHeader
        title="Galerie foto"
        subtitle="O privire în lumea noastră — spații gândite cu grijă, natură neîntrecută și momente de neuitat."
        image="https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1600&q=80"
        breadcrumb="Galerie"
      />
      <Gallery />
      <Footer />
    </>
  );
}
