import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { locations, type Location } from "@/lib/locations";
import { breadcrumbSchema, locationServiceSchema } from "@/lib/schema";

type LocationViewProps = {
  location: Location;
};

export function LocationView({ location }: LocationViewProps) {
  const nearby = locations.filter((item) => location.nearby.includes(item.slug));

  return (
    <>
      <JsonLd data={locationServiceSchema(location)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Arizona", href: "/locations" },
          { name: location.name, href: `/locations/${location.slug}` },
        ])}
      />
      <PageHero
        eyebrow={`${location.name}, Arizona`}
        title={`When the ${location.name} project gets complicated.`}
        lede={location.character}
        primary={{ href: `/review?city=${location.slug}`, label: `Review a ${location.name} project` }}
      />
      <section className="bg-paper py-20 text-ink">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-4xl">How permitting works here</h2>
            <p className="mt-5 text-base leading-8 text-ink/70">{location.permitting}</p>
            <h2 className="mt-14 font-display text-4xl">What usually goes sideways</h2>
            <ul className="mt-6 space-y-3">
              {location.commonProblems.map((item) => (
                <li key={item} className="border-l border-bronze-2 pl-4 text-sm leading-7">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="border border-ink/10 p-8 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze-2">
              Jurisdiction
            </p>
            <p className="mt-4 text-sm leading-7">
              {location.department}
              <br />
              {location.county}
            </p>
            <a
              href={location.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm underline underline-offset-4"
            >
              {location.portal}
            </a>
            <p className="mt-8 border-t border-ink/10 pt-6 text-sm leading-7 text-ink/70">
              {location.johnNote}
            </p>
          </aside>
        </Container>
      </section>
      {nearby.length > 0 ? (
        <section className="bg-ink py-16">
          <Container>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">Nearby markets</p>
            <ul className="mt-6 flex flex-wrap gap-5">
              {nearby.map((item) => (
                <li key={item.slug}>
                  <Link href={`/locations/${item.slug}`} className="hover:text-bronze">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
