import { Container, Eyebrow } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const pieces = [
  { n: "01", t: "Permits", d: "The city reviews a scope, not a hope." },
  { n: "02", t: "Inspectors", d: "They inspect what they can see against what was approved." },
  { n: "03", t: "Drawings", d: "If the set is wrong, the field will be wrong." },
  { n: "04", t: "Contractors", d: "Labor without a file is how jobs get tagged." },
  { n: "05", t: "Engineering", d: "Structure does not negotiate." },
  { n: "06", t: "Codes", d: "Adopted requirements, enforced locally." },
  { n: "07", t: "Municipalities", d: "Phoenix is not Scottsdale. Tucson is not the county." },
];

export function ConstructionIsEasy() {
  return (
    <section className="bg-ink py-24 md:py-32">
      <Container>
        <Reveal>
          <Eyebrow>Construction problem solvers</Eyebrow>
          <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl">
            Construction is easy —
            <br />
            until it isn&apos;t.
          </h2>
        </Reveal>
        <Reveal className="mt-8 max-w-2xl">
          <p className="text-lg leading-8 text-steel">
            A straightforward remodel becomes an expensive problem when permits,
            inspectors, drawings, contractors, engineering, codes, and municipal
            requirements stop lining up. Most people only meet one of those pieces.
            John works where they collide.
          </p>
          <p className="mt-5 text-lg leading-8 text-steel">
            He understands construction from both sides: how projects actually get
            built, and how the city, the plans, and the contractor change the job.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
          {pieces.map((piece) => (
            <div key={piece.n} className="bg-ink p-6">
              <p className="font-mono text-[11px] text-bronze">{piece.n}</p>
              <h3 className="mt-6 font-display text-3xl">{piece.t}</h3>
              <p className="mt-3 text-sm leading-6 text-steel">{piece.d}</p>
            </div>
          ))}
          <div className="bg-bronze p-6 text-ink sm:col-span-2 lg:col-span-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]">The product</p>
            <p className="mt-6 font-display text-3xl leading-none">
              Knowledge. Access. Experience. Problem solving.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
