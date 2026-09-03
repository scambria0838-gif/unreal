import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  wide?: boolean;
};

export function Container({ children, className = "", wide = false }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-[1600px]" : "max-w-[1320px]"} px-5 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.28em] text-bronze ${className}`}>
      {children}
    </p>
  );
}
