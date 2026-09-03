import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Container";

export function OwnerBuilder() {
  return (
    <section className="bg-paper py-24 text-ink md:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>Owner-builder consulting</Eyebrow>
            <h2 className="mt-6 max-w-3xl font-display text-5xl leading-[0.94] md:text-6xl">
              Keep control of your project. Get a general contractor&apos;s experience in your corner.
            </h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-ink/70">
              Some owners qualify to act as owner-builder under Arizona law. That
              exemption has conditions — occupancy, sale and rental restrictions —
              and it does not suspend inspections, drawings, or the city. Control is
              not the same as knowing how subcontractors, sequencing, and failed
              inspections actually work.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/70">
              JLS consults so you can keep the job without learning every lesson the
              expensive way. No promise of savings. No legal guarantees. A contractor
              who has built, sitting on your side of the table.
            </p>
            <div className="mt-10">
              <Button href="/review?focus=owner-builder">
                Talk to John about owner-builder consulting
              </Button>
            </div>
          </div>
          <aside className="border border-ink/15 p-8 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bronze-2">
              What consulting covers
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-7">
              <li>Whether owner-builder is even available for this property and intent.</li>
              <li>Permit path and inspection hold-points before trades are hired.</li>
              <li>How to read a subcontractor scope the way a GC would.</li>
              <li>Decisions that are expensive to reverse once they are in the wall.</li>
              <li>When you actually need an architect, an engineer, or an attorney.</li>
            </ul>
            <p className="mt-8 border-t border-ink/10 pt-6 text-xs leading-6 text-ink/55">
              A.R.S. § 32-1121 is the commonly cited exemption. John can explain the
              construction consequences. He is not your lawyer.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
