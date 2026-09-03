import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function TrustBar() {
  return (
    <section className="bg-ink py-24 md:py-28">
      <Container>
        <div className="grid gap-12 border border-paper/10 p-8 md:p-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Trust</Eyebrow>
            <h2 className="mt-6 font-display text-5xl">
              Licensed. Verifiable. No invented testimonials.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-steel">
              {site.legalName} is a licensed Arizona contractor, ROC #{site.roc},{" "}
              {site.rocClass}. Look the number up. Reviews will be published when
              John supplies them — not manufactured for launch.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-4 lg:col-span-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-bronze">
              ROC #{site.roc}
            </p>
            <Button href={site.rocVerifyUrl} variant="ghost">
              Verify the license
            </Button>
            <Button href="/review">Request project review</Button>
            <Button href={site.phoneHref} variant="paper">
              Call {site.phone}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
