import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/doc-footer";
import { PARTS, pagesInPart } from "@/lib/handbook";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs/")({ component: DocsIndex });

function DocsIndex() {
  const done = useProgress((s) => s.done);

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          All parts
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Handbook index</h1>
        <p className="mt-3 max-w-xl text-muted">
          Core path is Part 1 → 3 → 5 → 7. Everything else is support.
        </p>
        <div className="mt-10 flex flex-col gap-10">
          {PARTS.map((part) => {
            const pages = pagesInPart(part.id);
            return (
              <section key={part.id}>
                <h2 className="flex flex-wrap items-baseline gap-2 text-lg font-medium">
                  <span className="font-mono text-xs text-accent">{part.label}</span>
                  {part.title}
                  {part.core ? (
                    <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] tracking-wide text-accent uppercase">
                      core
                    </span>
                  ) : null}
                  {part.advanced ? (
                    <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] tracking-wide text-muted uppercase">
                      optional
                    </span>
                  ) : null}
                </h2>
                <p className="mt-1 text-sm text-muted">{part.blurb}</p>
                <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg shadow-[var(--shadow-border)]">
                  {pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        to="/docs/$slug"
                        params={{ slug: page.slug }}
                        className="flex items-center gap-3 bg-surface px-3 py-2.5 no-underline hover:bg-elevated"
                      >
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            done[page.slug] ? "bg-accent" : "bg-border",
                          )}
                        />
                        {page.num ? (
                          <span className="w-8 shrink-0 font-mono text-[11px] text-subtle">
                            {page.num}
                          </span>
                        ) : null}
                        <span className="min-w-0 flex-1 truncate text-sm text-fg">
                          {page.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
