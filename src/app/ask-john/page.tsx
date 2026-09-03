import type { Metadata } from "next";
import { AskJohn } from "@/components/concierge/AskJohn";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Ask John",
  description:
    "Describe a red tag, missing permit, owner-builder plan, or unpermitted room. A construction concierge that captures facts — not fake legal advice.",
  alternates: { canonical: "/ask-john" },
};

export default function AskJohnPage() {
  return (
    <>
      <PageHero
        eyebrow="Ask John"
        title="A construction concierge. Not a building official."
        lede="Calm. Direct. Capable of naming the lane you are in. Never a promise of approval. Requirements differ by jurisdiction."
      />
      <section className="bg-ink pb-24">
        <Container>
          <AskJohn />
        </Container>
      </section>
    </>
  );
}
