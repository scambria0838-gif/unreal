import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "Case studies for JLS Development use a fixed frame: problem, property, obstacle, plan, solution, result. Only authorized projects will be published.",
  alternates: { canonical: "/case-studies" },
};

const frames = [
  { t: "The problem", d: "What the owner walked in with — the notice, the stall, the missing permit." },
  { t: "The property", d: "Residential or commercial, and the jurisdiction that owns the file." },
  { t: "The obstacle", d: "The actual constraint: drawings, occupancy, unpermitted history, a vanished contractor." },
  { t: "The plan", d: "The sequence John recommended — not a mood." },
  { t: "The solution", d: "What was coordinated: city, trades, engineering, inspections." },
  { t: "The result", d: "What moved. No invented savings. No invented celebrity." },
];

const examples = [
  "Project shut down because of missing permits.",
  "Owner discovered previous unpermitted construction.",
  "Remodel required plans and city approvals.",
  "Commercial project needed permit coordination.",
];

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Tell the story, or do not publish the job."
        lede="These are the kinds of files JLS is built for. They become case studies only when John supplies the facts."
      />
      <section className="bg-paper py-20 text-ink">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {frames.map((frame, index) => (
              <article key={frame.t} className="border border-ink/10 p-7">
                <p className="font-mono text-[11px] text-bronze-2">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-4 font-display text-3xl">{frame.t}</h2>
                <p className="mt-3 text-sm leading-7 text-ink/65">{frame.d}</p>
              </article>
            ))}
          </div>
          <div className="mt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze-2">
              Waiting for authorization
            </p>
            <ul className="mt-6 space-y-4">
              {examples.map((example) => (
                <li key={example} className="font-display text-2xl text-ink/40">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
