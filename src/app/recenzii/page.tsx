import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import Reviews from "@/components/Reviews";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recenzii | Sofia Armony Casa de Oaspeți",
  description:
    "Ce spun oaspeții noștri despre experiența la Sofia Armony. Evaluare medie 4.9 din 500+ recenzii.",
};

export default function RecenziiPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        title="Recenzii"
        subtitle="Poveștile oaspeților noștri sunt cea mai bună dovadă a grijii cu care îi primim."
        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
        breadcrumb="Recenzii"
      />
      <Reviews />
      <Footer />
    </>
  );
}
