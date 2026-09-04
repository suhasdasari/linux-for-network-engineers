import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { PAGES, PARTS, pagesInPart } from "@/lib/handbook";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function Sidebar({
  currentSlug,
  onNavigate,
}: {
  currentSlug?: string;
  onNavigate?: () => void;
}) {
  const done = useProgress((s) => s.done);
  const toggle = useProgress((s) => s.toggle);
  const currentPart = PAGES.find((p) => p.slug === currentSlug)?.part;

  const coreDone = useMemo(() => {
    const core = PAGES.filter((p) => p.core);
    const n = core.filter((p) => done[p.slug]).length;
    return { n, total: core.length };
  }, [done]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="block text-fg no-underline hover:text-accent"
        >
          <span className="block text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            FloorKit field edition
          </span>
          <span className="mt-1 block font-medium tracking-tight">
            Linux for Network Engineers
          </span>
        </Link>
        <p className="mt-3 text-[12px] leading-snug text-muted">
          Core path {coreDone.n}/{coreDone.total}
          <span className="mx-1.5 text-subtle">·</span>
          1 → 3 → 5 → 7
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{
              width: `${coreDone.total ? (coreDone.n / coreDone.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Handbook">
        {PARTS.map((part) => (
          <PartGroup
            key={part.id}
            partId={part.id}
            currentSlug={currentSlug}
            forceOpen={currentPart === part.id}
            defaultOpen={!part.collapsed}
            onNavigate={onNavigate}
            done={done}
            onToggleDone={toggle}
          />
        ))}
      </nav>
    </div>
  );
}

function PartGroup({
  partId,
  currentSlug,
  forceOpen,
  defaultOpen,
  onNavigate,
  done,
  onToggleDone,
}: {
  partId: (typeof PARTS)[number]["id"];
  currentSlug?: string;
  forceOpen: boolean;
  defaultOpen: boolean;
  onNavigate?: () => void;
  done: Record<string, boolean>;
  onToggleDone: (slug: string) => void;
}) {
  const part = PARTS.find((p) => p.id === partId)!;
  const pages = pagesInPart(partId);
  const [open, setOpen] = useState(defaultOpen);
  const shown = forceOpen || open;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-elevated"
        aria-expanded={shown}
      >
        <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-subtle">
          {part.label.replace("Part ", "P").replace("Ref", "Ref")}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
          {part.title}
        </span>
        {part.core ? (
          <span className="rounded-full bg-elevated px-1.5 py-0.5 text-[9px] tracking-wide text-accent uppercase">
            core
          </span>
        ) : null}
        {part.advanced ? (
          <span className="rounded-full bg-elevated px-1.5 py-0.5 text-[9px] tracking-wide text-muted uppercase">
            opt
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-subtle transition-transform duration-200 ease-out",
            shown && "rotate-180",
          )}
        />
      </button>
      {shown ? (
        <ul className="mb-2 ml-2 border-l border-border pl-1">
          {pages.map((page) => {
            const active = page.slug === currentSlug;
            return (
              <li key={page.slug} className="flex items-stretch">
                <button
                  type="button"
                  aria-label={done[page.slug] ? "Mark unread" : "Mark read"}
                  onClick={() => onToggleDone(page.slug)}
                  className="flex w-9 shrink-0 items-center justify-center text-subtle hover:text-accent"
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      done[page.slug] ? "bg-accent" : "bg-border",
                    )}
                  />
                </button>
                <Link
                  to="/docs/$slug"
                  params={{ slug: page.slug }}
                  onClick={onNavigate}
                  className={cn(
                    "min-w-0 flex-1 rounded-md px-2 py-1.5 text-[13px] leading-snug no-underline",
                    active
                      ? "bg-elevated text-fg"
                      : "text-muted hover:bg-elevated/70 hover:text-fg",
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    {page.num ? (
                      <span className="w-6 shrink-0 font-mono text-[10px] text-subtle">
                        {page.num}
                      </span>
                    ) : null}
                    <span className="truncate">{page.title}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
