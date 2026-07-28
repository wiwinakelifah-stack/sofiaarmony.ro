import { Star, Quote } from "lucide-react";
import type { PublicReview } from "@/lib/content-db";

function formatDate(value: string, locale: "ro" | "en") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function Reviews({
  locale = "ro",
  reviews,
}: {
  locale?: "ro" | "en";
  reviews: PublicReview[];
}) {
  const t = locale === "en"
    ? { category: "What guests say", title: "Reviews", intro: "Our guests' stories are the best proof of the care we take to welcome them.", rating: "approved reviews" }
    : { category: "Ce spun oaspeții", title: "Recenzii", intro: "Poveștile oaspeților noștri sunt cea mai bună dovadă a grijii cu care îi primim.", rating: "review-uri aprobate" };

  const average = reviews.length
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <section id="reviews" className="py-24 bg-[#f5f0e8]">
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

        {/* Overall rating */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-4 shadow-sm">
            <span className="font-[family-name:var(--font-playfair)] text-5xl font-semibold text-stone-800">
              {average ? average.toFixed(1) : "0.0"}
            </span>
            <div className="text-left">
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#c9a96e" color="#c9a96e" />
                ))}
              </div>
              <p className="font-[family-name:var(--font-lato)] text-stone-500 text-xs">
                {reviews.length} {t.rating}
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
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
                {`“${review.comment}”`}
              </p>
              {/* Author */}
              <div className="border-t border-stone-100 pt-4">
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-stone-800 font-semibold text-sm">
                    {review.userName}
                  </p>
                  <p className="font-[family-name:var(--font-lato)] text-stone-400 text-xs">
                    {formatDate(review.publishedAt, locale)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-2xl p-8 text-center text-stone-500">
              {locale === "en"
                ? "No approved reviews yet."
                : "Nu exista inca review-uri aprobate."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
