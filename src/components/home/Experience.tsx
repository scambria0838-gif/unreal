import { Container, Eyebrow } from "@/components/ui/Container";
import { site, statsPending } from "@/lib/site";

const timeline = [
  {
    when: "Field years",
    title: "Construction, not commentary",
    body: "Decades of work on the building side of the table — how jobs actually get sequenced, staffed, and finished.",
  },
  {
    when: "2001",
    title: "Arizona ROC #167786 issued",
    body: "License originally issued August 21, 2001. Classification: KB-2 Dual, residential and small commercial. Status is publicly verifiable.",
  },
  {
    when: "2002",
    title: `${site.legalName} incorporated`,
    body: "Arizona corporation. John Samuel Scatterday, officer and qualifying party. Entity records are public through the Arizona Corporation Commission.",
  },
  {
    when: "Present",
    title: "The complicated jobs",
    body: "Permits, red tags, owner-builder consulting, residential and commercial coordination, unfinished and unpermitted rescue.",
  },
];

export function Experience() {
  return (
    <section className="bg-paper py-24 text-ink md:py-32">
      <Container>
        <Eyebrow>Experience</Eyebrow>
        <h2 className="mt-6 max-w-4xl font-display text-5xl leading-[0.94] md:text-6xl">
          Decades in construction.
          <br />
          Nothing invented for the brochure.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-ink/65">
          Public sources sometimes attach large project values and recognizable names
          to this practice. Those claims stay off this site until John verifies each
          one. The timeline below uses only what is already public or provided.
        </p>

        <ol className="mt-16 border-t border-ink/10">
          {timeline.map((item) => (
            <li
              key={item.when}
              className="grid gap-4 border-b border-ink/10 py-8 md:grid-cols-12"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-bronze-2 md:col-span-3">
                {item.when}
              </p>
              <div className="md:col-span-9">
                <h3 className="font-display text-3xl">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bronze-2">
            Figures ready for authorization
          </p>
          <div className="mt-6 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {statsPending.map((stat) => (
              <div key={stat.id} className="bg-paper p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
                  {stat.status === "pending" ? "Pending" : stat.status === "verified" ? "Verified" : "Owner-provided"}
                </p>
                <p className="mt-4 font-display text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-ink">{stat.label}</p>
                <p className="mt-3 text-xs leading-5 text-ink/50">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
