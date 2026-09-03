import Link from "next/link";
import { coreServices, residentialServices, commercialServices } from "@/lib/services";
import { locations } from "@/lib/locations";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink-2">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-16 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-display text-4xl text-paper">JLS</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-steel">
            {site.legalName}. {site.tagline} Arizona ROC #{site.roc}.
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
            From red tag to green light.
          </p>
          <a
            href={site.phoneHref}
            className="mt-6 inline-block font-display text-3xl text-paper"
          >
            {site.phone}
          </a>
          <p className="mt-3 text-sm text-concrete">
            {site.mailingAddress.line1}
            <br />
            {site.mailingAddress.city}, {site.mailingAddress.state} {site.mailingAddress.zip}
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
          <FooterCol
            title="Work"
            links={[
              { href: "/services", label: "All services" },
              ...coreServices.slice(0, 6).map((service) => ({
                href: `/services/${service.slug}`,
                label: service.title,
              })),
            ]}
          />
          <FooterCol
            title="Residential"
            links={residentialServices.slice(0, 7).map((service) => ({
              href: `/residential/${service.slug}`,
              label: service.title,
            }))}
          />
          <FooterCol
            title="Commercial"
            links={commercialServices.slice(0, 7).map((service) => ({
              href: `/commercial/${service.slug}`,
              label: service.title,
            }))}
          />
          <FooterCol
            title="Arizona"
            links={[
              { href: "/locations", label: "All markets" },
              ...locations.map((location) => ({
                href: `/locations/${location.slug}`,
                label: location.name,
              })),
            ]}
          />
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-6 text-[11px] uppercase tracking-[0.16em] text-concrete md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} {site.legalName} · ROC #{site.roc} · {site.rocClass}
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/legal/privacy" className="hover:text-paper">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-paper">
              Terms
            </Link>
            <a href={site.rocVerifyUrl} className="hover:text-paper" rel="noreferrer" target="_blank">
              Verify license
            </a>
            <Link href="/ask-john" className="hover:text-paper">
              Ask John
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-bronze">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-steel hover:text-paper">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
