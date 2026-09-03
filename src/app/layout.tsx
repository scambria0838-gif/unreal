import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/ui/JsonLd";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Inter_Tight({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.shortName} — ${site.tagline}`,
    template: `%s — ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    "Arizona general contractor",
    "red tag resolution",
    "stop work order",
    "building permits Phoenix",
    "Scottsdale construction consultant",
    "owner builder Arizona",
    "unpermitted construction",
    "tenant improvement permits",
    "John Scatterday",
    "JLS Development Enterprises",
    "ROC 167786",
  ],
  authors: [{ name: site.personFull }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.legalName,
    title: `${site.shortName} — From red tag to green light`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.shortName} — From red tag to green light`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-paper">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
