import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { coreServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Red-tag rescue, permits, drawings, owner-builder consulting, construction consulting, and project rescue across Arizona.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Knowledge. Access. Experience. Problem solving."
        lede="JLS is not a menu of finishes. It is the work that happens when a project meets a city, a drawing, a contractor, or a notice."
      />
      <section className="bg-paper py-20 text-ink">
        <Container>
          <ul className="divide-y divide-ink/10">
            {coreServices.map((service) => (
              <li key={service.slug} className="grid gap-4 py-10 md:grid-cols-12">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze-2 md:col-span-3">
                  {service.eyebrow}
                </p>
                <div className="md:col-span-9">
                  <h2 className="font-display text-4xl">
                    <Link href={`/services/${service.slug}`} className="hover:text-bronze-2">
                      {service.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{service.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
