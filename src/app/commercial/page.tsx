import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { commercialServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Commercial construction",
  description:
    "Tenant improvements, build-outs, commercial permit consulting, plan coordination, inspections, and commercial project rescue in Arizona.",
  alternates: { canonical: "/commercial" },
};

export default function CommercialPage() {
  return (
    <>
      <PageHero
        eyebrow="Commercial"
        title="Developers, architects, engineers, inspectors, owners."
        lede="Commercial work is occupancy, exiting, and a complete set. JLS is comfortable in that room — and on the job that follows it."
        primary={{ href: "/review?focus=commercial", label: "Discuss my commercial project" }}
      />
      <section className="bg-paper py-20 text-ink">
        <Container className="grid gap-8 md:grid-cols-2">
          {commercialServices.map((service) => (
            <article key={service.slug} className="border border-ink/10 p-8">
              <h2 className="font-display text-3xl">
                <Link href={`/commercial/${service.slug}`}>{service.title}</Link>
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/70">{service.summary}</p>
            </article>
          ))}
        </Container>
      </section>
    </>
  );
}
