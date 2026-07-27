import { Users, Maximize2, Eye } from "lucide-react";

const rooms = [
  {
    name: "Camera Clasică",
    description:
      "Eleganță simplă cu mobilier din lemn masiv, pat confortabil queen-size și baie privată. Perfectă pentru cupluri sau călătorii solo.",
    price: 180,
    guests: 2,
    size: 22,
    view: "Grădină",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    badge: null,
  },
  {
    name: "Camera Deluxe",
    description:
      "Spațiu generos cu living separat, pat king-size, cadă free-standing și terasă privată cu priveliște spre pădure.",
    price: 280,
    guests: 2,
    size: 38,
    view: "Pădure",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    badge: "Cel mai popular",
  },
  {
    name: "Suite Regală",
    description:
      "Experiența supremă: dormitor și living de lux, jacuzzi privat, șemineu și priveliște panoramică spre munți.",
    price: 420,
    guests: 4,
    size: 65,
    view: "Panoramic munți",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    badge: "Premium",
  },
];

export default function Rooms() {
  return (
    <section className="py-24 bg-[#faf9f7]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
            Cazare
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
            Camerele noastre
          </h2>
          <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-xl mx-auto leading-relaxed">
            Fiecare cameră este gândită cu atenție pentru a oferi confortul și
            intimitatea pe care le meriți.
          </p>
          <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div
              key={room.name}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-60">
                <img
                  src={room.image}
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
                    {room.price}
                  </span>
                  <span className="font-[family-name:var(--font-lato)] text-stone-500 text-xs block">
                    lei / noapte
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

                {/* Meta */}
                <div className="flex items-center gap-4 text-stone-400 text-xs font-[family-name:var(--font-lato)] mb-6 border-t border-stone-100 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {room.guests} oaspeți
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={13} />
                    {room.size} m²
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} />
                    {room.view}
                  </span>
                </div>

                <a
                  href="/contact"
                  className="block w-full text-center py-2.5 border border-[#8b6f47] text-[#8b6f47] rounded-xl text-sm font-medium font-[family-name:var(--font-lato)] hover:bg-[#8b6f47] hover:text-white transition-colors duration-300"
                >
                  Rezervă această cameră
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
