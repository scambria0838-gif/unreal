import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { photos } from "@/lib/images";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden grain">
      <Image
        src={photos.hero.src}
        alt={photos.hero.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bronze">
              From red tag to green light
            </p>
            <ul className="mt-8 space-y-1 font-mono text-[12px] uppercase tracking-[0.22em] text-steel md:text-[13px]">
              <li>Red tag?</li>
              <li>Stop-work order?</li>
              <li>Permit nightmare?</li>
              <li>Project gone sideways?</li>
            </ul>
            <h1 className="mt-6 max-w-5xl font-display text-[18vw] leading-[0.86] text-paper sm:text-[12vw] lg:text-[7.4rem]">
              Get it
              <br />
              moving
              <br />
              again.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-steel">
              {site.yearsConstruction} years of construction experience. Residential.
              Commercial. Permits. Consulting. Project rescue. The expert you call when
              the project gets complicated.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/review">Get my project moving</Button>
              <Button href={site.phoneHref} variant="ghost">
                Call John — {site.phone}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end">
            <div className="border border-paper/15 bg-ink/50 p-6 backdrop-blur-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-concrete">
                Licensed Arizona contractor
              </p>
              <p className="mt-3 font-display text-3xl text-paper">ROC #{site.roc}</p>
              <p className="mt-2 text-sm leading-6 text-steel">{site.rocClass}</p>
              <p className="mt-4 text-sm text-steel">{site.yearsLicensedLabel}</p>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
                {site.legalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
