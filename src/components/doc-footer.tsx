import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { HandbookPage } from "@/lib/handbook/types";

export function DocPager({
  prev,
  next,
}: {
  prev: HandbookPage | null;
  next: HandbookPage | null;
}) {
  return (
    <div className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          to="/docs/$slug"
          params={{ slug: prev.slug }}
          className="group flex flex-col gap-1 rounded-lg bg-surface px-4 py-3 no-underline shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
        >
          <span className="flex items-center gap-1 text-[11px] tracking-wide text-muted uppercase">
            <ArrowLeft className="size-3.5" /> Previous
          </span>
          <span className="text-sm font-medium text-fg group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to="/docs/$slug"
          params={{ slug: next.slug }}
          className="group flex flex-col items-end gap-1 rounded-lg bg-surface px-4 py-3 no-underline shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
        >
          <span className="flex items-center gap-1 text-[11px] tracking-wide text-muted uppercase">
            Next <ArrowRight className="size-3.5" />
          </span>
          <span className="text-sm font-medium text-fg group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-border px-6 py-8 text-sm text-muted">
      <p>Built for closet + appliance work. Not a RHCE course.</p>
      <p className="mt-1">
        FloorKit field edition ·{" "}
        <a
          href="https://getfloorkit.com"
          className="text-accent no-underline hover:underline"
        >
          getfloorkit.com
        </a>
      </p>
    </footer>
  );
}
