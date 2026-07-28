import { Users, Maximize2, Eye } from "lucide-react";
import Link from "next/link";
import type { PublicRoom } from "@/lib/content-db";

export default function Rooms({
  locale = "ro",
  rooms,
}: {
  locale?: "ro" | "en";
  rooms: PublicRoom[];
}) {
  const t =
    locale === "en"
      ? { title: "Our rooms", intro: "Each room is carefully designed to offer the comfort and privacy you deserve.", category: "Stay", reserve: "Book this room", perNight: "lei / night", guests: "guests", contact: "Book this room" }
      : { title: "Camerele noastre", intro: "Fiecare cameră este gândită cu atenție pentru a oferi confortul și intimitatea pe care le meriți.", category: "Cazare", reserve: "Rezervă această cameră", perNight: "lei / noapte", guests: "oaspeți", contact: "Rezervă această cameră" };

  return (
    <section className="py-24 bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
            {t.category}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
            {t.title}
          </h2>
          <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-xl mx-auto leading-relaxed">
            {t.intro}
          </p>
          <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-60">
                <img
                  src={room.mainImageUrl}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {room.badge && (
                  <span className="absolute top-4 left-4 bg-[#8b6f47] text-white text-xs px-3 py-1 rounded-full font-[family-name:var(--font-lato)] font-medium tracking-wide">
                    {room.badge}
                  </span>
                )}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-sm">
                  <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-stone-800">
                    {room.pricePerNight}
                  </span>
                  <span className="font-[family-name:var(--font-lato)] text-stone-500 text-xs block">
                    {t.perNight}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-stone-800 mb-2">
                  {room.name}
                </h3>
                <p className="font-[family-name:var(--font-lato)] text-stone-500 text-sm leading-relaxed mb-5">
                  {room.description}
                </p>

                {room.amenities.length > 0 && (
                  <p className="font-[family-name:var(--font-lato)] text-stone-400 text-xs mb-3">
                    {room.amenities.join(" • ")}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-stone-400 text-xs font-[family-name:var(--font-lato)] mb-6 border-t border-stone-100 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {room.maxGuests} {t.guests}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={13} />
                    {room.sizeSqm} m²
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} />
                    {room.view}
                  </span>
                </div>

                <Link
                  href="/contact"
                  className="block w-full text-center py-2.5 border border-[#8b6f47] text-[#8b6f47] rounded-xl text-sm font-medium font-[family-name:var(--font-lato)] hover:bg-[#8b6f47] hover:text-white transition-colors duration-300"
                >
                  {t.reserve}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
