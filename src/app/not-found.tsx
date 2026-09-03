import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-20">
      <Container>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-bronze">404</p>
        <h1 className="mt-6 font-display text-6xl">This page is not on the set.</h1>
        <p className="mt-6 max-w-lg text-steel">
          The URL does not match a service, a city, or an article. Start at the
          review if the project is the point.
        </p>
        <div className="mt-10 flex gap-3">
          <Button href="/">Back to the site</Button>
          <Button href="/review" variant="ghost">
            Project review
          </Button>
        </div>
      </Container>
    </section>
  );
}
