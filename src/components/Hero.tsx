import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-amber-300 tracking-[0.3em] uppercase text-sm font-[family-name:var(--font-lato)] mb-4 opacity-0 animate-[fadeIn_1s_ease-out_0.3s_forwards]">
          Bun venit la
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-tight mb-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
          Sofia Armony
        </h1>
        <p className="font-[family-name:var(--font-lato)] text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
          O oază de liniște și eleganță, unde fiecare moment devine o amintire
          prețioasă. Descoperă confortul autentic în inima naturii.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fadeInUp_0.8s_ease-out_0.9s_forwards]">
          <Link
            href="/rooms"
            className="px-8 py-3.5 bg-[#8b6f47] text-white rounded-full font-[family-name:var(--font-lato)] text-sm font-medium tracking-wide hover:bg-[#6b5234] transition-all duration-300 hover:scale-105"
          >
            Explorează camerele
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3.5 border border-white/70 text-white rounded-full font-[family-name:var(--font-lato)] text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            Rezervă acum
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-white/20">
          {[
            { value: "12+", label: "Camere elegante" },
            { value: "500+", label: "Oaspeți fericiți" },
            { value: "4.9★", label: "Evaluare medie" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <div className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-white">
                {stat.value}
              </div>
              <div className="font-[family-name:var(--font-lato)] text-white/70 text-xs tracking-wide mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <Link
        href="/rooms"
        className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </Link>
    </section>
  );
}
