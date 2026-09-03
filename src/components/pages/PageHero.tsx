import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Container";
import { site } from "@/lib/site";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
  primary?: { href: string; label: string };
};

export function PageHero({ eyebrow, title, lede, children, primary }: PageHeroProps) {
  return (
    <header className="border-b border-paper/10 bg-ink pt-28 pb-16 md:pt-36 md:pb-20">
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[0.94] md:text-7xl">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-steel">{lede}</p>
        {children}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={primary?.href ?? "/review"}>{primary?.label ?? "Request project review"}</Button>
          <Button href={site.phoneHref} variant="ghost">
            Call John — {site.phone}
          </Button>
        </div>
      </Container>
    </header>
  );
}
