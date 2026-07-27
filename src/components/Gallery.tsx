"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80",
    alt: "Exterior casă",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    alt: "Camera Clasică",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    alt: "Camera Deluxe",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    alt: "Restaurant",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80",
    alt: "Spa & Jacuzzi",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    alt: "Priveliște munți",
    span: "col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    alt: "Living comun",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
    alt: "Grădina de vară",
    span: "",
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
            Imagini
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
            Galerie foto
          </h2>
          <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-xl mx-auto leading-relaxed">
            O privire în lumea noastră — spații gândite cu grijă, natură
            neîntrecută și momente de neuitat.
          </p>
          <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${img.span}`}
              onClick={() => setLightbox(img.src)}
            >
              <img
                src={img.src}
                alt={img.alt}
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
                  {img.alt}
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
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
