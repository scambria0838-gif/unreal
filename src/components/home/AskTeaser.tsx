import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Container";
import { starterPrompts } from "@/lib/concierge";

export function AskTeaser() {
  return (
    <section className="bg-paper py-24 text-ink md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Eyebrow>Ask John</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[0.94] md:text-6xl">
              Describe the mess
              <br />
              in a sentence.
            </h2>
            <p className="mt-8 max-w-xl text-base leading-8 text-ink/70">
              A construction concierge that gathers facts, names the likely
              service, and gets you to a review or a phone call. It will not
              pretend to be the city. It will not promise a permit.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/ask-john">Ask John</Button>
              <Button href="/review" variant="ghost" className="!text-ink !border-ink/20 hover:!border-ink">
                Skip to project review
              </Button>
            </div>
          </div>
          <ul className="lg:col-span-6">
            {starterPrompts.map((prompt) => (
              <li key={prompt} className="border-t border-ink/10 py-5 last:border-b">
                <p className="font-display text-2xl leading-snug">&ldquo;{prompt}&rdquo;</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
