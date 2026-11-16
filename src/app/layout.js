import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav/Navbar";
import './theme.css'
import Footer from "@/components/footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "BeeWell Infant Spa | Baby Massage Classes in Douglas & Kimberley",
  description:
    "Gentle baby massage classes for babies from 0 to 12 months in Douglas and Kimberley, Northern Cape. 5 classes over 5 weeks. Bond, relax and grow.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BeeWell Infant Spa | Baby Massage Classes",
    description:
      "Certified baby massage classes in Douglas and Kimberley, Northern Cape. Book now!",
    url: "/",
    siteName: "BeeWell Infant Spa",
    locale: "en_ZA",
    type: "website",
    images: [
    {
      url: "/opengraph-image.jpg",
      width: 1200,
      height: 630,
      alt: "BeeWell Infant Spa baby massage classes",
    },
  ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeeWell Infant Spa | Baby Massage Classes",
    description:
      "Certified baby massage classes in Douglas and Kimberley, Northern Cape. Book now!",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
      <Navbar/>
      {children}
      <Footer/>
      </body>
    </html>
  );
}
