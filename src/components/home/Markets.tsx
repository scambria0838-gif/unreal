import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/Container";
import { photos } from "@/lib/images";
import { commercialServices, residentialServices } from "@/lib/services";

export function Markets() {
  return (
    <section className="bg-ink py-24 md:py-32">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="relative min-h-[520px] overflow-hidden">
            <Image
              src={photos.living.src}
              alt={photos.living.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
            <div className="relative flex h-full flex-col justify-end p-8 md:p-10">
              <Eyebrow>Residential</Eyebrow>
              <h2 className="mt-4 font-display text-5xl">The house has a file.</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-steel">
                Custom homes, remodels, additions, kitchens, baths, ADUs, structural
                changes, unfinished jobs. Luxury or not — complexity is the filter.
              </p>
              <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                {residentialServices.slice(0, 8).map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/residential/${service.slug}`}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/80 hover:text-bronze"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="relative min-h-[520px] overflow-hidden">
            <Image
              src={photos.commercial.src}
              alt={photos.commercial.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
            <div className="relative flex h-full flex-col justify-end p-8 md:p-10">
              <Eyebrow>Commercial</Eyebrow>
              <h2 className="mt-4 font-display text-5xl">The suite has a use.</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-steel">
                TIs, build-outs, renovations, permit consulting, plan coordination,
                inspections, rescue. Comfortable with developers, architects,
                engineers, inspectors, and owners.
              </p>
              <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                {commercialServices.slice(0, 8).map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/commercial/${service.slug}`}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/80 hover:text-bronze"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
