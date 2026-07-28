"use client";

import Navbar from "./Navbar";

export default function LayoutWrapper({
  locale,
  children,
}: {
  locale: "ro" | "en";
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar locale={locale} />
      {children}
    </>
  );
}
