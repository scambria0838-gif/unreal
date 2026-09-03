import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { residentialServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Residential construction",
  description:
    "Custom homes, remodels, additions, kitchens, baths, ADUs, structural work, and residential project rescue in Arizona.",
  alternates: { canonical: "/residential" },
};

export default function ResidentialPage() {
  return (
    <>
      <PageHero
        eyebrow="Residential"
        title="A house is a permit path with rooms on it."
        lede="Luxury or not, the filter is complexity: drawings, structure, unpermitted history, and a city that will inspect what you cover."
        primary={{ href: "/review?focus=remodel", label: "Discuss my build" }}
      />
      <section className="bg-paper py-20 text-ink">
        <Container className="grid gap-8 md:grid-cols-2">
          {residentialServices.map((service) => (
            <article key={service.slug} className="border border-ink/10 p-8">
              <h2 className="font-display text-3xl">
                <Link href={`/residential/${service.slug}`}>{service.title}</Link>
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/70">{service.summary}</p>
            </article>
          ))}
        </Container>
      </section>
    </>
  );
}
