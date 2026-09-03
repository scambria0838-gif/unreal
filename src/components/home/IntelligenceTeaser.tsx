import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui/Container";
import { articles, categories } from "@/lib/articles";

export function IntelligenceTeaser() {
  const featured = articles.slice(0, 4);

  return (
    <section className="bg-ink-2 py-24 md:py-32">
      <Container>
        <Eyebrow>Construction intelligence</Eyebrow>
        <h2 className="mt-6 max-w-4xl font-display text-5xl leading-[0.94] md:text-6xl">
          Arizona is not one building department.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-steel">
          Education written like a contractor talks — not like a content farm.
          Permits, red tags, owner-builder, TIs, inspections.
        </p>

        <div className="mt-12 grid gap-px bg-paper/10 md:grid-cols-2">
          {featured.map((article) => (
            <Link
              key={article.slug}
              href={`/intelligence/${article.category}/${article.slug}`}
              className="bg-ink-2 p-8 transition-colors hover:bg-ink-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
                {article.category.replaceAll("-", " ")}
              </p>
              <h3 className="mt-4 font-display text-3xl leading-[1.1]">{article.title}</h3>
              <p className="mt-3 text-sm leading-7 text-steel">{article.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/intelligence/${category.slug}`}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-steel hover:text-bronze"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
