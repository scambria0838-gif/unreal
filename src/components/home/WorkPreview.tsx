import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/Container";
import { photos } from "@/lib/images";

const categories = [
  "Luxury Residential",
  "Commercial",
  "New Construction",
  "Whole Home",
  "Kitchen",
  "Bathroom",
  "Additions",
  "Tenant Improvements",
  "Project Rescue",
  "Permitting / Compliance",
];

export function WorkPreview() {
  return (
    <section className="bg-ink py-24 md:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Eyebrow>Portfolio + case studies</Eyebrow>
            <h2 className="mt-6 max-w-3xl font-display text-5xl leading-[0.94] md:text-6xl">
              The work will be published when the work is authorized.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-steel">
            Pretty pictures without a problem, an obstacle, and a result are
            marketing. This studio is built for stories John approves — including
            before/after, plans, and the actual constraint.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[photos.facade, photos.ti, photos.plans].map((photo) => (
            <div key={photo.src} className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-ink/25" />
              <p className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper">
                Awaiting project authorization
              </p>
            </div>
          ))}
        </div>

        <ul className="mt-10 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li
              key={category}
              className="border border-paper/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-steel"
            >
              {category}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
          <Link href="/portfolio" className="text-bronze hover:text-paper">
            Portfolio structure →
          </Link>
          <Link href="/case-studies" className="text-bronze hover:text-paper">
            Case study framework →
          </Link>
        </div>
      </Container>
    </section>
  );
}
