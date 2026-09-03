"use client";

import Link from "next/link";
import { useState } from "react";
import { Container, Eyebrow } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { problems, type Problem } from "@/lib/problems";

export function ProblemSelector() {
  const [active, setActive] = useState<Problem>(problems[0] ?? problems[problems.length - 1]);

  return (
    <section className="bg-paper py-24 text-ink md:py-32" id="whats-going-on">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>What&apos;s going on with your project?</Eyebrow>
            <h2 className="mt-5 font-display text-5xl leading-[0.95] md:text-6xl">
              Name the problem.
              <br />
              Then move.
            </h2>
            <p className="mt-6 text-base leading-7 text-ink/65">
              Most contractor websites ask you to browse services. This one asks what
              actually happened. Select the closest match.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {problems.map((problem) => {
              const selected = active.id === problem.id;
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => setActive(problem)}
                  className={`border px-4 py-4 text-left font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 bg-transparent text-ink hover:border-ink"
                  }`}
                >
                  {problem.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-ink/10 pt-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-bronze-2">
              {active.short}
            </p>
            <h3 className="mt-4 font-display text-4xl leading-[1.05]">{active.headline}</h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink/70">{active.body}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink">{active.next}</p>
          </div>
          <div className="flex flex-col justify-end gap-3 lg:col-span-5">
            <Button href={active.href} className="w-full">
              Tell John what&apos;s going on
            </Button>
            <Button href={active.serviceHref} variant="ghost" className="w-full !text-ink !border-ink/20 hover:!border-ink">
              Read the service path
            </Button>
            <p className="text-sm text-ink/55">
              Or{" "}
              <Link href="/ask-john" className="underline underline-offset-4">
                ask John in conversation
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
