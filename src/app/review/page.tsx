"use client";

import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";

export default function ReviewPage() {
  const [step, setStep] = useState<"verify" | "review">("verify");
  const [verifying, setVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [verification, setVerification] = useState({
    bookingId: "",
    email: "",
  });

  const [review, setReview] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      // In a real scenario, you'd verify against your database
      // For now, just accept any booking ID and email
      if (verification.bookingId && verification.email) {
        setStep("review");
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: verification.bookingId,
          email: verification.email,
          ...review,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setStep("verify");
          setVerification({ bookingId: "", email: "" });
          setReview({ name: "", rating: 5, comment: "" });
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Review submission error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 pt-24">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {submitted ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <CheckCircle
              size={56}
              className="text-green-600 dark:text-green-400 mb-4"
            />
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-stone-800 dark:text-white mb-2">
              Thank You!
            </h2>
            <p className="text-stone-600 dark:text-stone-300">
              Your review has been submitted successfully.
            </p>
          </div>
        ) : step === "verify" ? (
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 shadow-sm">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-stone-800 dark:text-white mb-2">
              Leave a Review
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mb-8">
              Only guests who have booked with us can leave reviews. Verify your
              booking to continue.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">
                  Booking ID *
                </label>
                <input
                  type="text"
                  required
                  value={verification.bookingId}
                  onChange={(e) =>
                    setVerification({
                      ...verification,
                      bookingId: e.target.value,
                    })
                  }
                  placeholder="Enter your booking ID"
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
                />
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  You received this in your booking confirmation email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={verification.email}
                  onChange={(e) =>
                    setVerification({ ...verification, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-[#8b6f47] text-white rounded-lg font-medium hover:bg-[#6b5234] transition-colors disabled:opacity-50"
              >
                {verifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 shadow-sm">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-stone-800 dark:text-white mb-2">
              Your Experience
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mb-8">
              Tell us about your stay at Sofia Armony
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={review.name}
                  onChange={(e) =>
                    setReview({ ...review, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                  Rating *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300 dark:text-stone-600"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">
                  Your Review *
                </label>
                <textarea
                  required
                  value={review.comment}
                  onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                  }
                  placeholder="Tell us about your experience..."
                  rows={5}
                  className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("verify");
                    setReview({ name: "", rating: 5, comment: "" });
                  }}
                  className="px-6 py-3 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-lg font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#8b6f47] text-white rounded-lg font-medium hover:bg-[#6b5234] transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
