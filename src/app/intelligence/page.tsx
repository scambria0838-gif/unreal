import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { articles, categories } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Construction intelligence",
  description:
    "Arizona building permits, red tags, owner-builder, inspections, ADUs, and commercial TIs — written for property owners.",
  alternates: { canonical: "/intelligence" },
};

export default function IntelligencePage() {
  return (
    <>
      <PageHero
        eyebrow="Construction intelligence"
        title="Read the file before you swing."
        lede="An education center built to rank for real Arizona construction problems — and to be useful if it never ranks."
      />
      <section className="bg-paper py-20 text-ink">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/intelligence/${category.slug}`}
                className="border border-ink/10 p-5 hover:border-ink"
              >
                <h2 className="font-display text-2xl">{category.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/60">{category.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-16 space-y-6">
            {articles.map((article) => (
              <article key={article.slug} className="border-t border-ink/10 pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bronze-2">
                  {article.category.replaceAll("-", " ")}
                </p>
                <h2 className="mt-2 font-display text-3xl">
                  <Link href={`/intelligence/${article.category}/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/65">{article.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
