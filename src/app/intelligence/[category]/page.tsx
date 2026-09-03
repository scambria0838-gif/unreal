import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/PageHero";
import { Container } from "@/components/ui/Container";
import { articlesIn, categories, getCategory } from "@/lib/articles";

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.title,
    description: category.description,
    alternates: { canonical: `/intelligence/${category.slug}` },
  };
}

export default async function Page({ params }: Props) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const posts = articlesIn(slug);

  return (
    <>
      <PageHero eyebrow="Intelligence" title={category.title} lede={category.description} />
      <section className="bg-paper py-20 text-ink">
        <Container className="max-w-3xl">
          {posts.length === 0 ? (
            <p>Articles for this category are in production.</p>
          ) : (
            <ul className="space-y-10">
              {posts.map((article) => (
                <li key={article.slug}>
                  <h2 className="font-display text-4xl">
                    <Link href={`/intelligence/${article.category}/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-ink/70">{article.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
