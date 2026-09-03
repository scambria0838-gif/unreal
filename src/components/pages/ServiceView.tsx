import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import { allServices, servicePath, type Service } from "@/lib/services";

type ServiceViewProps = {
  service: Service;
};

export function ServiceView({ service }: ServiceViewProps) {
  const related = allServices().filter((item) =>
    service.related.includes(item.slug) || service.related.includes(`${item.group}:${item.slug}`),
  );
  const crumbs = [
    { name: "Home", href: "/" },
    {
      name: service.group === "core" ? "Services" : service.group === "residential" ? "Residential" : "Commercial",
      href: service.group === "core" ? "/services" : `/${service.group}`,
    },
    { name: service.title, href: servicePath(service) },
  ];

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(service.faqs)} />
      <PageHero
        eyebrow={service.eyebrow}
        title={service.title}
        lede={service.summary}
        primary={service.cta}
      />
      <section className="bg-paper py-20 text-ink">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-4xl">The problem</h2>
            <p className="mt-5 text-base leading-8 text-ink/70">{service.problem}</p>
            <h2 className="mt-14 font-display text-4xl">How John works it</h2>
            <ol className="mt-6 space-y-4">
              {service.approach.map((step, index) => (
                <li key={step} className="grid grid-cols-[48px_1fr] gap-4">
                  <span className="font-mono text-sm text-bronze-2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base leading-7">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="border border-ink/10 p-8 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze-2">
              Who this is for
            </p>
            <p className="mt-4 text-sm leading-7 text-ink/75">{service.who}</p>
            <div className="mt-8">
              <Button href={service.cta.href}>{service.cta.label}</Button>
            </div>
          </aside>
        </Container>
      </section>

      {service.faqs.length > 0 ? (
        <section className="bg-ink py-20">
          <Container>
            <h2 className="font-display text-4xl">Questions</h2>
            <dl className="mt-10 space-y-8">
              {service.faqs.map((faq) => (
                <div key={faq.q} className="border-t border-paper/10 pt-8">
                  <dt className="font-display text-2xl">{faq.q}</dt>
                  <dd className="mt-3 max-w-3xl text-sm leading-7 text-steel">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="border-t border-paper/10 bg-ink py-16">
          <Container>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">Related</p>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {related.slice(0, 4).map((item) => (
                <li key={servicePath(item)}>
                  <Link href={servicePath(item)} className="text-lg hover:text-bronze">
                    {item.title}
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
