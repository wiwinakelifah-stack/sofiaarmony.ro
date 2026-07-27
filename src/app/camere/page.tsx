import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import Rooms from "@/components/Rooms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camere | Sofia Armony Casa de Oaspeți",
  description:
    "Descoperă camerele elegante ale Casei de Oaspeți Sofia Armony — Clasică, Deluxe și Suite Regală, fiecare cu personalitate aparte.",
};

export default function CamerePage() {
  return (
    <>
      <Navbar />
      <PageHeader
        title="Camerele noastre"
        subtitle="Fiecare cameră este gândită cu atenție pentru a oferi confortul și intimitatea pe care le meriți."
        image="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80"
        breadcrumb="Camere"
      />
      <Rooms />
      <Footer />
    </>
  );
}
