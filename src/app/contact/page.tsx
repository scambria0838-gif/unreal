import type { Metadata } from "next";
import { Suspense } from "react";
import { TriageForm } from "@/components/forms/TriageForm";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell John what's going on with the project.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell John what's going on."
        lede="Same review John uses for red tags, permits, and stuck jobs. Call if the city already posted a notice."
        primary={{ href: site.phoneHref, label: `Call ${site.phone}` }}
      />
      <section className="bg-ink py-20">
        <Container className="max-w-3xl">
          <Suspense fallback={<p className="text-steel">Loading the review form…</p>}>
            <TriageForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
