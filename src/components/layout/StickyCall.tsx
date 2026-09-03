import { site } from "@/lib/site";

export function StickyCall() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
      <a
        href={site.phoneHref}
        className="flex items-center justify-center bg-bronze px-4 py-3.5 font-mono text-[12px] uppercase tracking-[0.2em] text-ink shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
      >
        Call John — {site.phone}
      </a>
    </div>
  );
}
