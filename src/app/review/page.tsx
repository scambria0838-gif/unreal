import type { Metadata } from "next";
import { Suspense } from "react";
import { TriageForm } from "@/components/forms/TriageForm";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Project review",
  description:
    "Tell John what's going on — red tag, stop-work, permits, drawings, owner-builder, or a project that has gone sideways.",
  alternates: { canonical: "/review" },
};

export default function ReviewPage() {
  return (
    <>
      <PageHero
        eyebrow="Project triage"
        title="Tell John what's going on."
        lede="Not a contact form. A file. Residential or commercial, the city, the notice, the drawings, the contractor — then a review."
        primary={{ href: site.phoneHref, label: `Call ${site.phone}` }}
      />
      <section className="bg-ink py-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Suspense fallback={<p className="text-steel">Loading the review form…</p>}>
              <TriageForm />
            </Suspense>
          </div>
          <aside className="border border-paper/10 p-8 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
              If it is on fire
            </p>
            <p className="mt-4 text-sm leading-7 text-steel">
              Red tag, stop-work, or a city deadline does not wait on a form. Call
              or text {site.phone}. Then send the notice.
            </p>
            <p className="mt-6 text-sm leading-7 text-steel">
              Appointment scheduling can connect to a calendar service in
              production. This review is the intake that makes a meeting useful.
            </p>
          </aside>
        </Container>
      </section>
    </>
  );
}
