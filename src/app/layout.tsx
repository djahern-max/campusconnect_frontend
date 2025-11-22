import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Abacadaba",
  description: "The college and scholarship directory powered by institutions. Discover comprehensive information, virtual tours, and funding opportunities.",
  keywords: ["colleges", "universities", "scholarships", "higher education", "college search", "financial aid"],
  authors: [{ name: "Abacadaba" }],
  openGraph: {
    title: "Abacadaba - College & Scholarship Directory",
    description: "Discover colleges and scholarships with rich profiles controlled by institutions themselves.",
    type: "website",
    locale: "en_US",
    siteName: "Abacadaba",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abacadaba - College & Scholarship Directory",
    description: "Discover colleges and scholarships with rich profiles controlled by institutions themselves.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}