import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import type { Article } from "@/lib/articles";
import { getCategory } from "@/lib/articles";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";

type ArticleViewProps = {
  article: Article;
};

export function ArticleView({ article }: ArticleViewProps) {
  const category = getCategory(article.category);

  return (
    <>
      <JsonLd data={articleSchema(article)} />
      <JsonLd data={faqSchema(article.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Intelligence", href: "/intelligence" },
          { name: category?.title ?? article.category, href: `/intelligence/${article.category}` },
          { name: article.title, href: `/intelligence/${article.category}/${article.slug}` },
        ])}
      />
      <PageHero
        eyebrow={category?.title ?? "Intelligence"}
        title={article.title}
        lede={article.description}
      />
      <article className="bg-paper py-20 text-ink">
        <Container className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/40">
            Updated {article.updated} · {article.readMinutes} min
          </p>
          <div className="mt-10 space-y-6">
            {article.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-base leading-8 text-ink/80">
                {paragraph}
              </p>
            ))}
          </div>
          {article.faqs.length > 0 ? (
            <div className="mt-16 border-t border-ink/10 pt-12">
              <h2 className="font-display text-4xl">Questions</h2>
              <dl className="mt-8 space-y-8">
                {article.faqs.map((faq) => (
                  <div key={faq.q}>
                    <dt className="font-display text-2xl">{faq.q}</dt>
                    <dd className="mt-3 text-sm leading-7 text-ink/70">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          <p className="mt-16 text-sm">
            <Link href={`/intelligence/${article.category}`} className="underline underline-offset-4">
              More in {category?.title}
            </Link>
          </p>
        </Container>
      </article>
    </>
  );
}
