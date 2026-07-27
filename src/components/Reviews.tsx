import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Maria Ionescu",
    location: "București",
    rating: 5,
    text: "O experiență de vis! Camera Deluxe a depășit toate așteptările. Priveliștea din terasă spre pădure e de o frumusețe rară. Personalul extrem de amabil și mic dejunul delicios. Ne întoarcem cu siguranță!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "Iunie 2025",
  },
  {
    name: "Alexandru Popa",
    location: "Cluj-Napoca",
    rating: 5,
    text: "Locul perfect pentru o escapadă romantică. Suite-ul Regal a fost absolut magnific – jacuzzi-ul privat și șemineul au creat o atmosferă de neuitat. Recomand din toată inima!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "Mai 2025",
  },
  {
    name: "Elena Dumitrescu",
    location: "Timișoara",
    rating: 5,
    text: "Am petrecut un weekend minunat cu familia. Copiii au adorat grădina, iar noi am apreciat liniștea și curățenia impecabilă. Mâncarea la restaurant a fost delicioasă – am mâncat preparate tradiționale excelente.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    date: "Iulie 2025",
  },
  {
    name: "Mihai Constantin",
    location: "Brașov",
    rating: 5,
    text: "Îmi este greu să găsesc cuvinte pentru a descrie cât de bine m-am simțit. Totul a fost perfect: curățenie, confort, mâncare, priveliște. O casă de oaspeți cu adevărat premium.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    date: "Aprilie 2025",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 bg-[#f5f0e8]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#8b6f47] tracking-[0.25em] uppercase text-xs font-[family-name:var(--font-lato)] mb-3">
            Ce spun oaspeții
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-stone-800 mb-4">
            Recenzii
          </h2>
          <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-xl mx-auto leading-relaxed">
            Poveștile oaspeților noștri sunt cea mai bună dovadă a grijii cu
            care îi primim.
          </p>
          <div className="mt-6 w-16 h-0.5 bg-[#c9a96e] mx-auto" />
        </div>

        {/* Overall rating */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-4 shadow-sm">
            <span className="font-[family-name:var(--font-playfair)] text-5xl font-semibold text-stone-800">
              4.9
            </span>
            <div className="text-left">
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#c9a96e" color="#c9a96e" />
                ))}
              </div>
              <p className="font-[family-name:var(--font-lato)] text-stone-500 text-xs">
                din 500+ recenzii
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
            >
              <Quote
                size={36}
                className="absolute top-5 right-5 text-[#f5f0e8]"
                strokeWidth={1}
              />
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#c9a96e" color="#c9a96e" />
                ))}
              </div>
              {/* Text */}
              <p className="font-[family-name:var(--font-lato)] text-stone-600 leading-relaxed text-sm mb-5">
                "{review.text}"
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-stone-800 font-semibold text-sm">
                    {review.name}
                  </p>
                  <p className="font-[family-name:var(--font-lato)] text-stone-400 text-xs">
                    {review.location} · {review.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
