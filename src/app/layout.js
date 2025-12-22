import './globals.css'
import { Geist, Geist_Mono } from "next/font/google";


import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VendOps",
  description: "Vending management system",
};

export default function RootLayout({ children }) {
  

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="./manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
