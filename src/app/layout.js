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

export const metadata = {
  title: "BeeWell Infant Spa",
  description: "Certified baby massage classes in Douglas and Kimberley, Northern Cape. Easy online appointment booking for parents seeking gentle care & bonding. Book now!",
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
