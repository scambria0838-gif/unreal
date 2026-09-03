import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Container";

const items = [
  { href: "/services/permits", label: "Residential permits" },
  { href: "/services/permits", label: "Commercial permits" },
  { href: "/services/permits", label: "Remodel permits" },
  { href: "/residential/additions", label: "Additions" },
  { href: "/commercial/tenant-improvements", label: "Tenant improvements" },
  { href: "/residential/guest-houses-adus", label: "Guest houses / ADUs" },
  { href: "/services/plans-drawings", label: "Construction drawings" },
  { href: "/services/plans-drawings", label: "CAD drafting" },
  { href: "/services/plans-drawings", label: "As-built drawings" },
  { href: "/services/plans-drawings", label: "Engineering coordination" },
  { href: "/services/code-compliance", label: "Code compliance" },
  { href: "/services/code-compliance", label: "Inspection coordination" },
];

export function PermitsPlans() {
  return (
    <section className="blueprint py-24 md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Permits + plans</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[0.94] md:text-6xl">
              The city reviews a set.
              <br />
              Not a story.
            </h2>
            <p className="mt-8 text-base leading-8 text-steel">
              Permitting is a sequence: scope, drawings, zoning, trades, fees,
              inspections. CAD and as-builts exist so a reviewer and an inspector
              have something real to work from. JLS coordinates that sequence
              across Arizona jurisdictions.
            </p>
            <div className="mt-10">
              <Button href="/review?focus=permit">Get permit help</Button>
            </div>
          </div>
          <ul className="grid gap-px bg-bronze/20 sm:grid-cols-2 lg:col-span-7">
            {items.map((item) => (
              <li key={item.label} className="bg-ink/80">
                <Link
                  href={item.href}
                  className="flex h-full items-center justify-between px-5 py-5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-bronze hover:text-ink"
                >
                  <span>{item.label}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
