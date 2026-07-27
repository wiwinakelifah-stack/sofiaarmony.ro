import { Heart, Award, Leaf } from "lucide-react";

export default function About() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images collage */}
          <div className="relative h-[500px] hidden lg:block">
            <div className="absolute top-0 left-0 w-64 h-72 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80"
                alt="Exterior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-16 left-52 w-56 h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1540541830731-c7b1c38da3cc?w=600&q=80"
                alt="Natură"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-8 w-72 h-52 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute bottom-16 right-0 bg-[#8b6f47] rounded-2xl p-6 text-white shadow-lg">
              <p className="font-[family-name:var(--font-playfair)] text-4xl font-semibold">10+</p>
              <p className="font-[family-name:var(--font-lato)] text-white/80 text-xs mt-1 tracking-wide">
                Ani de experiență
              </p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
              Povestea noastră
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-6 leading-tight">
              O casă departe de acasă
            </h2>
            <p className="font-[family-name:var(--font-lato)] text-stone-500 leading-relaxed mb-5">
              Sofia Armony s-a născut dintr-o pasiune pentru ospitalitate
              autentică și dorința de a oferi oaspeților noștri mai mult decât
              un simplu loc de dormit — o adevărată experiență de relaxare.
            </p>
            <p className="font-[family-name:var(--font-lato)] text-stone-500 leading-relaxed mb-8">
              Situați în inima naturii, la câțiva pași de pârtiile de ski și
              traseele montane, ne mândrim cu o gastronomie autentică, camere
              decoratede cu gust și o echipă dedicată care te va trata ca acasă.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: Heart,
                  title: "Ospitalitate sinceră",
                  desc: "Fiecare oaspete este primit cu căldura unui prieten de familie.",
                },
                {
                  icon: Award,
                  title: "Calitate garantată",
                  desc: "Standarde înalte de curățenie, confort și servicii personalizate.",
                },
                {
                  icon: Leaf,
                  title: "Turism responsabil",
                  desc: "Folosim produse locale și practici ecologice pentru un viitor mai bun.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#f5f0e8] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#8b6f47]" />
                  </div>
                  <div>
                    <h4 className="font-[family-name:var(--font-playfair)] text-stone-800 font-semibold text-sm mb-0.5">
                      {title}
                    </h4>
                    <p className="font-[family-name:var(--font-lato)] text-stone-500 text-sm">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
