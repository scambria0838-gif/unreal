import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "John Scatterday",
  description:
    "John Scatterday is the qualifying party of JLS Development Enterprises Inc., Arizona ROC #167786. The expert you call when the project gets complicated.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "John Scatterday", href: "/about" },
        ])}
      />
      <PageHero
        eyebrow="John Scatterday"
        title="The expert you call when the project gets complicated."
        lede="Most contractors sell labor. John sells a way forward — because he has stood on the job and in the file."
      />
      <section className="bg-paper py-20 text-ink">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="max-w-2xl space-y-6 text-base leading-8 text-ink/75 lg:col-span-7">
            <p>
              {site.personFull} is the qualifying party and officer of {site.legalName},
              Arizona ROC #{site.roc}. The license was originally issued{" "}
              {site.licenseIssuedDisplay}. The classification is {site.rocClass}.
            </p>
            <p>
              The public record is enough to establish tenure. It is not enough to
              invent a highlight reel. This site does not publish celebrity clients,
              dollar totals, complaint counts, or project tallies until John
              authorizes each claim.
            </p>
            <p>
              What can be said without theater: he understands how projects get built,
              and he understands how permits, inspectors, municipalities, plans, and
              contractors change those projects. That combination is the practice.
            </p>
            <p>
              Homeowners, investors, developers, and business owners come here when
              the job is stuck — or when they want it to avoid getting stuck. Another
              contractor should look at this site and know it is not a handyman page.
            </p>
          </div>
          <aside className="border border-ink/10 p-8 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze-2">
              On the record
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-ink/45">Entity</dt>
                <dd>{site.legalName}</dd>
              </div>
              <div>
                <dt className="text-ink/45">ROC</dt>
                <dd>#{site.roc}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Issued</dt>
                <dd>{site.licenseIssuedDisplay}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Class</dt>
                <dd>{site.rocClass}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Mailing</dt>
                <dd>
                  {site.mailingAddress.line1}, {site.mailingAddress.city},{" "}
                  {site.mailingAddress.state} {site.mailingAddress.zip}
                </dd>
              </div>
            </dl>
          </aside>
        </Container>
      </section>
    </>
  );
}
