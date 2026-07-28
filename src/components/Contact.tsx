"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  room: string;
  adults: string;
  children: string;
  message: string;
}

export default function Contact({ locale = "ro" }: { locale?: "ro" | "en" }) {
  const t = locale === "en"
    ? { category: "Booking", title: "Booking & Contact", intro: "We are here to help you plan the perfect stay. Write us or call us anytime!", contactInfo: "Contact information", map: "View on map", review: "You can leave a review after your stay:", reviewLink: "leave review", newRequest: "Send a new request", firstName: "First name", lastName: "Last name", email: "Email", phone: "Phone (for WhatsApp confirmation)", adults: "Adults *", children: "Children", arrival: "Arrival date *", departure: "Departure date *", room: "Desired room type", special: "Special requests", submit: "Submit booking request", confirm: "You will be contacted within 2 hours for confirmation.", success: "Booking submitted!", thanks: "Thank you,", errorHelp: "Try again or call us:" }
    : { category: "Rezervare", title: "Rezervă & Contact", intro: "Suntem aici să te ajutăm să planifici șederea perfectă. Scrie-ne sau sună-ne oricând!", contactInfo: "Informații de contact", map: "Vezi pe hartă", review: "Poți lăsa o recenzie după sejur:", reviewLink: "lasa review", newRequest: "Trimite o nouă cerere", firstName: "Prenume", lastName: "Nume", email: "Email", phone: "Telefon (pentru WhatsApp confirmare)", adults: "Adulți *", children: "Copii", arrival: "Data sosirii *", departure: "Data plecării *", room: "Tipul camerei dorite", special: "Mențiuni speciale", submit: "Trimite cererea de rezervare", confirm: "Vei fi contactat în maxim 2 ore pentru confirmare.", success: "Rezervare trimisă!", thanks: "Mulțumim,", errorHelp: "Încearcă din nou sau sună-ne:", }

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    room: "",
    adults: "1",
    children: "0",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setWarning(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to submit booking");
      }

      const data = await response.json();
      if (data?.warning) {
        setWarning(data.warning);
      }
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          checkIn: "",
          checkOut: "",
          room: "",
          adults: "1",
          children: "0",
          message: "",
        });
        setSubmitted(false);
        setWarning(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-[family-name:var(--font-lato)] text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30 focus:border-[#8b6f47] transition-colors bg-white";

  return (
    <section className="py-24 bg-white">
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

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#f5f0e8] rounded-2xl p-7">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-stone-800 mb-6">
                {t.contactInfo}
              </h3>
              <div className="space-y-5">
                {[
                  {
                    icon: Phone,
                    label: "Telefon",
                    value: "+40 722 123 456",
                    href: "tel:+40722123456",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "contact@sofiaarmony.ro",
                    href: "mailto:contact@sofiaarmony.ro",
                  },
                  {
                    icon: MapPin,
                    label: "Adresă",
                    value: "Str. Florilor nr. 12, Sinaia, Prahova",
                    href: "#",
                  },
                  {
                    icon: Clock,
                    label: "Check-in / Check-out",
                    value: "Check-in: 14:00 · Check-out: 12:00",
                    href: "#",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-[#8b6f47] transition-colors duration-300">
                      <Icon
                        size={17}
                        className="text-[#8b6f47] group-hover:text-white transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-lato)] text-stone-400 text-xs mb-0.5">
                        {label}
                      </p>
                      <p className="font-[family-name:var(--font-lato)] text-stone-700 text-sm">
                        {value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden h-48 bg-stone-100 relative">
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=70"
                alt="Locație"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 backdrop-blur-sm text-stone-700 text-sm px-5 py-2.5 rounded-full font-[family-name:var(--font-lato)] font-medium hover:bg-white transition-colors shadow-sm"
                >
                  <MapPin size={14} className="inline mr-1.5" />
                  {t.map}
                </a>
              </div>
            </div>
          </div>

          {/* Booking form */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-[family-name:var(--font-lato)] text-red-800 text-sm">
                    {error}
                  </p>
                  <p className="font-[family-name:var(--font-lato)] text-red-600 text-xs mt-1">
                    {t.errorHelp} +40 722 123 456
                  </p>
                </div>
              </div>
            )}
            
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <CheckCircle size={56} className="text-[#8b6f47] mb-4" />
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-stone-800 mb-3">
                  {t.success}
                </h3>
                <p className="font-[family-name:var(--font-lato)] text-stone-500 max-w-sm leading-relaxed">
                  {t.thanks} {form.firstName}! {t.confirm}
                </p>
                {warning && (
                  <p className="font-[family-name:var(--font-lato)] text-amber-700 text-xs mt-3 max-w-sm">
                    {warning}
                  </p>
                )}
                <p className="font-[family-name:var(--font-lato)] text-stone-400 text-xs mt-4">
                  {t.review} <Link href="/review" className="text-[#8b6f47] underline">{t.reviewLink}</Link>
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-[#8b6f47] text-sm font-[family-name:var(--font-lato)] underline underline-offset-2 hover:text-[#6b5234]"
                >
                  {t.newRequest}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.firstName} *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="Ion"
                      value={form.firstName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.lastName} *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Popescu"
                      value={form.lastName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.email} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="ion@email.ro"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+40 7xx xxx xxx"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.adults}
                    </label>
                    <select
                      name="adults"
                      required
                      value={form.adults}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.children}
                    </label>
                    <select
                      name="children"
                      value={form.children}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.arrival}
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      required
                      value={form.checkIn}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                      {t.departure}
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      required
                      value={form.checkOut}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                    {t.room}
                  </label>
                  <select
                    name="room"
                    value={form.room}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">{locale === "en" ? "Any available room" : "Orice cameră disponibilă"}</option>
                    <option value="classic">{locale === "en" ? "Classic Room – 180 lei/night" : "Camera Clasică – 180 lei/noapte"}</option>
                    <option value="deluxe">{locale === "en" ? "Deluxe Room – 280 lei/night" : "Camera Deluxe – 280 lei/noapte"}</option>
                    <option value="suite">{locale === "en" ? "Royal Suite – 420 lei/night" : "Suite Regală – 420 lei/noapte"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-[family-name:var(--font-lato)] text-stone-500 mb-1.5 ml-1">
                    {t.special}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={locale === "en" ? "Special requests, allergies, celebrations..." : "Cereri speciale, alergii, ocazii speciale..."}
                    value={form.message}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#8b6f47] text-white rounded-xl font-[family-name:var(--font-lato)] text-sm font-medium tracking-wide hover:bg-[#6b5234] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {loading ? (locale === "en" ? "Sending..." : "Se trimite...") : t.submit}
                </button>

                <p className="text-center font-[family-name:var(--font-lato)] text-stone-400 text-xs">
                  {t.confirm}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
