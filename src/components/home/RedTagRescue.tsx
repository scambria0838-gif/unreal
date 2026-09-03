import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Container";

const steps = [
  { n: "01", t: "Review the situation", d: "The notice, the property, the work, the jurisdiction." },
  { n: "02", t: "Identify the violation", d: "What the city actually wrote — not the hallway version." },
  { n: "03", t: "Determine requirements", d: "Permit, plans, corrections, or removal." },
  { n: "04", t: "Coordinate drawings", d: "As-builts, CAD, engineering if the file needs them." },
  { n: "05", t: "Address the municipality", d: "A complete response, not a speech at the counter." },
  { n: "06", t: "Prepare for recheck", d: "Make the work inspectable. Then call the inspection." },
  { n: "07", t: "Get it moving again", d: "Back into a legal sequence — not a hopeful one." },
];

export function RedTagRescue() {
  return (
    <section className="bg-ink-2 py-24 md:py-32" id="red-tag">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Red tag / stop-work rescue</Eyebrow>
            <h2 className="mt-6 font-display text-5xl leading-[0.92] md:text-6xl">
              Red tagged?
              <br />
              Don&apos;t panic.
              <br />
              Don&apos;t guess.
              <br />
              Get a plan.
            </h2>
            <p className="mt-8 text-base leading-8 text-steel">
              A red tag is an instruction to stop cited work. It is not a demolition
              order, a debate, or a reason to finish &ldquo;just the last bit.&rdquo;
              Continuing can turn a permit problem into a citation.
            </p>
            <p className="mt-5 text-base leading-8 text-steel">
              John reviews the notice and the property, then builds the path that
              jurisdiction is likely to require. No promise the city will say yes on
              a timetable. A plan you can act on.
            </p>
            <div className="mt-10">
              <Button href="/review?focus=red-tag">Start my red-tag review</Button>
            </div>
          </div>

          <ol className="lg:col-span-7">
            {steps.map((step, index) => (
              <li
                key={step.n}
                className={`grid grid-cols-[72px_1fr] gap-6 py-6 ${
                  index !== steps.length - 1 ? "border-b border-paper/10" : ""
                }`}
              >
                <span className="font-mono text-sm text-bronze">{step.n}</span>
                <div>
                  <h3 className="font-display text-2xl">{step.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-steel">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
