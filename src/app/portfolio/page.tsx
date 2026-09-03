import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A cinematic portfolio structure for JLS Development — ready for authorized residential, commercial, rescue, and permitting projects.",
  alternates: { canonical: "/portfolio" },
};

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

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Projects publish when John signs off."
        lede="The architecture is ready: before/after, video, plans, scope, challenges, solutions. No placeholder houses pretending to be JLS work."
      />
      <section className="bg-paper py-20 text-ink">
        <Container>
          <p className="max-w-2xl text-base leading-8 text-ink/70">
            Each authorized project will carry a category, a location (when it does
            not identify a private client), a scope, and the constraint that made
            the job more than labor. Until then, the grid stays honest.
          </p>
          <ul className="mt-12 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <li key={category} className="bg-paper p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/40">
                  Category
                </p>
                <p className="mt-4 font-display text-2xl">{category}</p>
                <p className="mt-3 text-xs text-ink/45">0 authorized projects</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
