import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        lede="Project reviews, phone calls, and concierge messages exist to evaluate construction problems — not to build a marketing list."
      />
      <section className="bg-paper py-16 text-ink">
        <Container className="max-w-3xl space-y-5 text-sm leading-7 text-ink/75">
          <p>
            {site.legalName} collects the information you submit on this website —
            name, phone, email, property facts, and document descriptions — to
            respond to a requested review or consultation.
          </p>
          <p>
            Messages sent through Ask John are processed to classify the problem
            and, when you leave contact details, to request a callback. Do not
            send information you do not want discussed for that purpose.
          </p>
          <p>
            This site may use privacy-respecting analytics once configured. No
            analytics vendor is required for the site to function.
          </p>
          <p>
            To ask what is on file, call {site.phone}.
          </p>
        </Container>
      </section>
    </>
  );
}
