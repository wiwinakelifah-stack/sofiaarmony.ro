import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Casa de Oaspeți Sofia Armony | Relaxare & Confort",
  description:
    "Descoperă ospitalitatea autentică la Casa de Oaspeți Sofia Armony. Camere elegante, priveliști deosebite și o atmosferă caldă te așteaptă.",
};

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ro' }
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lang = locale === 'en' ? 'en' : 'ro';

  return (
    <html
      lang={lang}
      className={`${playfair.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
