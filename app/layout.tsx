import type { Metadata } from "next";
import { Cormorant_Garamond, Poppins, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pawiwahan Ageng Arya & Sekar — Undangan Pernikahan Adat Jawa",
  description:
    "Serat Sedhahan Pawiwahan: Katur dhumateng panjenenganipun Bapak/Ibu/Saudara/i ing pahargyan pawiwahan Raden Mas Arya Suryo Wicaksono & Raden Ajeng Sekar Arum Kinanti.",
  openGraph: {
    title: "Pawiwahan Ageng Arya & Sekar",
    description: "Undangan Pernikahan Adat Jawa Klasik Keraton",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF6F0] text-[#3D261C] font-sans">
        {children}
      </body>
    </html>
  );
}
