import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms"
        lede="This website is information and an invitation to talk. It is not a bid, a permit, or legal advice."
      />
      <section className="bg-paper py-16 text-ink">
        <Container className="max-w-3xl space-y-5 text-sm leading-7 text-ink/75">
          <p>
            Content on this site describes construction, permitting, and consulting
            services offered by {site.legalName}, Arizona ROC #{site.roc}. Nothing
            here guarantees municipal approval, a lifted stop-work order, a
            particular inspection result, or a cost outcome.
          </p>
          <p>
            Requirements differ by city and county. The concierge is not a building
            official. Owner-builder information is not a legal opinion.
          </p>
          <p>
            Engagement begins when John and the client agree in writing. Until
            then, use the phone and the review form to start a conversation.
          </p>
        </Container>
      </section>
    </>
  );
}
