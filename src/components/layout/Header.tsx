"use client";

import Link from "next/link";
import { useState } from "react";
import { nav, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-paper/10 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-baseline gap-3" onClick={() => setOpen(false)}>
          <span className="font-display text-[28px] leading-none tracking-tight text-paper">
            JLS
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-steel sm:block">
            Development Enterprises
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {nav.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel transition-colors hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.phoneHref}
            className="hidden font-mono text-[11px] tracking-[0.14em] text-bronze sm:inline md:tracking-[0.18em]"
          >
            {site.phone}
          </a>
          <Link
            href="/review"
            className="hidden border border-bronze bg-bronze px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink hover:bg-[#d4b57a] md:inline"
          >
            Project review
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border border-paper/15 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-4 flex-col gap-1.5">
              <span className={`h-px w-full bg-paper transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-full bg-paper transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-paper/10 bg-ink lg:hidden">
          <nav className="flex flex-col px-5 py-6" aria-label="Mobile">
            {[...nav.primary, ...nav.more].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-paper/10 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-paper"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={site.phoneHref}
              className="mt-5 bg-bronze px-4 py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-ink"
            >
              Call {site.phone}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
