"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import type { PublicGalleryImage } from "@/lib/content-db";

export default function Gallery({
  locale = "ro",
  images,
}: {
  locale?: "ro" | "en";
  images: PublicGalleryImage[];
}) {
  const t = {
    ro: { category: "Imagini", title: "Galerie foto", intro: "O privire în lumea noastră — spații gândite cu grijă, natură neîntrecută și momente de neuitat." },
    en: { category: "Images", title: "Photo gallery", intro: "A glimpse into our world — carefully designed spaces, unsurpassed nature and unforgettable moments." },
  };
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
            {t[locale].category}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
            {t[locale].title}
          </h2>
          <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-xl mx-auto leading-relaxed">
            {t[locale].intro}
          </p>
          <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${i % 5 === 0 ? "col-span-2" : ""}`}
              onClick={() => setLightbox(img.imageUrl)}
            >
              <Image
                src={img.thumbnailUrl || img.imageUrl}
                alt={img.title || "Gallery image"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn
                  size={28}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-xs px-2.5 py-1 rounded-full font-[family-name:var(--font-lato)]">
                  {img.title || (locale === "en" ? "Image" : "Imagine")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <Image
            src={lightbox}
            alt="Preview"
            width={1600}
            height={1000}
            unoptimized
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
