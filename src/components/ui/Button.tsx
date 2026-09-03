import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "paper" | "hazard";

const styles: Record<Variant, string> = {
  primary:
    "bg-bronze text-ink hover:bg-[#d4b57a] border border-bronze",
  ghost:
    "bg-transparent text-paper border border-paper/25 hover:border-bronze hover:text-bronze",
  paper:
    "bg-paper text-ink hover:bg-paper-2 border border-paper",
  hazard:
    "bg-hazard text-paper hover:bg-[#d46b59] border border-hazard",
};

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const isExternal = href.startsWith("tel:") || href.startsWith("sms:") || href.startsWith("http");
  const classes = `inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] tracking-[0.18em] uppercase font-medium transition-colors ${styles[variant]} ${className}`;

  if (isExternal) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
