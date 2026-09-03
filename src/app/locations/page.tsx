import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { locations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Arizona markets",
  description:
    "Construction consulting, permits, and project rescue in Phoenix, Scottsdale, Tucson, and Valley cities — each with its own department.",
  alternates: { canonical: "/locations" },
};

export default function LocationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Arizona"
        title="Every city is a different counter."
        lede="These pages are not cloned city names on a template. Each market has a department, a portal, and a way projects actually stall."
      />
      <section className="bg-paper py-20 text-ink">
        <Container className="grid gap-6 md:grid-cols-2">
          {locations.map((location) => (
            <article key={location.slug} className="border border-ink/10 p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze-2">
                {location.county}
              </p>
              <h2 className="mt-3 font-display text-4xl">
                <Link href={`/locations/${location.slug}`}>{location.name}</Link>
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/70">{location.character}</p>
            </article>
          ))}
        </Container>
      </section>
    </>
  );
}
