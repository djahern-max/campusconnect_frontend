// src/app/layout.tsx for thecollegedirectory (campusconnect-frontend)
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Foot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://thecollegedirectory.com'),
  title: {
    default: 'The College Directory - Where institutions create rich, accurate pages that students discover through MagicScholar.ß',
    template: '%s | The College Directory',
  },
  description: 'The comprehensive directory where colleges and scholarship providers create rich, accurate pages that students discover. Reach qualified prospects with up-to-date information.',
  keywords: [
    'college directory',
    'scholarship directory',
    'higher education marketing',
    'college recruitment',
    'institutional profiles',
    'scholarship marketing',
    'college admissions',
    'student recruitment'
  ],
  authors: [{ name: 'The College Directory' }],
  creator: 'thecollegedirectory',
  publisher: 'thecollegedirectory',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thecollegedirectory.com',
    siteName: 'thecollegedirectory',
    title: 'The College Directory - Where institutions create rich, accurate pages that students discover through MagicScholar.',
    description: 'Where colleges and scholarship providers create rich, accurate pages that students discover.',
    images: [
      {
        url: '/opengraph-image.png',  // ← This is the key change
        width: 1200,
        height: 630,
        alt: 'thecollegedirectory - College & Scholarship Directory',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The College Directory - Where institutions create rich, accurate pages that students discover through MagicScholar.',
    description: 'Where colleges and scholarship providers create rich, accurate pages that students discover.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://thecollegedirectory.com" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}