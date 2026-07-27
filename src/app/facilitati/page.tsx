import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import Amenities from "@/components/Amenities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilități | Sofia Armony Casa de Oaspeți",
  description:
    "Wi-Fi gratuit, parcare, restaurant, spa, mic dejun inclus și multe altele — tot ce ai nevoie pentru o ședere perfectă.",
};

export default function FacilitatiPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        title="Facilitățile noastre"
        subtitle="Totul de care ai nevoie pentru o ședere perfectă, cu atenție la fiecare detaliu."
        image="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80"
        breadcrumb="Facilități"
      />
      <Amenities />
      <Footer />
    </>
  );
}
