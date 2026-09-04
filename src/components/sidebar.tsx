import { Link } from "@tanstack/react-router";
import {
  Beaker,
  BookOpen,
  Box,
  Braces,
  Camera,
  Check,
  ChevronDown,
  ClipboardList,
  Cpu,
  KeyRound,
  Network,
  PanelLeftClose,
  Terminal,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PAGES, PARTS, pagesInPart } from "@/lib/handbook";
import type { PartId } from "@/lib/handbook/types";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const PART_ICONS: Record<PartId, LucideIcon> = {
  "0": Beaker,
  "1": Terminal,
  "2": Cpu,
  "3": Network,
  "4": KeyRound,
  "5": Camera,
  "6": Box,
  "7": Timer,
  "8": ClipboardList,
  "9": Braces,
  ref: BookOpen,
};

const CORE_STEPS: { n: string; slug: string; part: PartId }[] = [
  { n: "1", slug: "shell", part: "1" },
  { n: "3", slug: "interfaces", part: "3" },
  { n: "5", slug: "closet", part: "5" },
  { n: "7", slug: "drill-cameras-no-net", part: "7" },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 16 16" className="size-5" fill="none">
        <path
          d="M3.5 3.5 L8.25 8 L3.5 12.5"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <rect x="9.25" y="10" width="4" height="2" fill="currentColor" />
      </svg>
    </span>
  );
}

export function CollapsedRail({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex h-full flex-col items-center bg-surface py-3">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open handbook menu"
        title="Open menu  ["
        className="flex size-11 items-center justify-center rounded-md hover:bg-elevated"
      >
        <BrandMark />
      </button>
    </div>
  );
}

export function Sidebar({
  currentSlug,
  onNavigate,
  onClose,
}: {
  currentSlug?: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const done = useProgress((s) => s.done);
  const toggle = useProgress((s) => s.toggle);

  const coreDone = useMemo(() => {
    const core = PAGES.filter((p) => p.core);
    const n = core.filter((p) => done[p.slug]).length;
    return { n, total: core.length };
  }, [done]);

  const partProgress = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {};
    for (const step of CORE_STEPS) {
      const pages = pagesInPart(step.part);
      map[step.part] = {
        done: pages.filter((p) => done[p.slug]).length,
        total: pages.length,
      };
    }
    return map;
  }, [done]);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="relative border-b border-border px-4 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <BrandMark />
          <div className="min-w-0 flex-1">
            <Link
              to="/"
              onClick={onNavigate}
              className="block text-sm font-medium leading-snug tracking-tight text-fg no-underline hover:text-accent"
            >
              Linux for Network Engineers
            </Link>
            <a
              href="https://getfloorkit.com"
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-block text-xs font-medium tracking-[0.16em] text-accent uppercase no-underline hover:underline"
            >
              FloorKit
            </a>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close handbook menu"
              title="Close menu  ["
              className="relative -mr-1 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg"
            >
              <PanelLeftClose className="size-4" />
            </button>
          ) : null}
        </div>

        <p className="mt-4 text-xs text-muted">
          Core path{" "}
          <span className="font-mono tabular-nums text-fg">
            {coreDone.n}/{coreDone.total}
          </span>
        </p>
        <div className="mt-2 flex gap-1.5">
          {CORE_STEPS.map((step) => {
            const prog = partProgress[step.part];
            const all = prog && prog.total > 0 && prog.done === prog.total;
            const some = prog && prog.done > 0 && !all;
            return (
              <Link
                key={step.n}
                to="/docs/$slug"
                params={{ slug: step.slug }}
                onClick={onNavigate}
                title={`Part ${step.n}`}
                className={cn(
                  "flex h-8 flex-1 items-center justify-center rounded-md font-mono text-xs no-underline shadow-[var(--shadow-border)]",
                  all && "bg-accent text-accent-fg",
                  some && "bg-elevated text-accent",
                  !all && !some && "bg-elevated text-muted hover:text-fg",
                )}
              >
                {all ? <Check className="size-3.5" /> : step.n}
              </Link>
            );
          })}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-elevated">
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
            onNavigate={onNavigate}
            done={done}
            onToggleDone={toggle}
          />
        ))}
      </nav>

      <p className="hidden border-t border-border px-4 py-3 text-xs text-subtle lg:block">
        Press <kbd className="rounded-sm bg-elevated px-1 py-0.5 font-mono text-muted">[</kbd> to
        close
      </p>
    </div>
  );
}

function PartGroup({
  partId,
  currentSlug,
  onNavigate,
  done,
  onToggleDone,
}: {
  partId: PartId;
  currentSlug?: string;
  onNavigate?: () => void;
  done: Record<string, boolean>;
  onToggleDone: (slug: string) => void;
}) {
  const part = PARTS.find((p) => p.id === partId)!;
  const pages = pagesInPart(partId);
  const [open, setOpen] = useState(false);
  const Icon = PART_ICONS[partId];
  const isCurrent = pages.some((p) => p.slug === currentSlug);
  const doneCount = pages.filter((p) => done[p.slug]).length;

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-elevated",
          isCurrent && "bg-elevated/70",
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            isCurrent ? "bg-accent/15 text-accent" : "bg-elevated text-muted",
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg">{part.title}</span>
            {part.core ? (
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-xs leading-none tracking-wide text-accent uppercase">
                core
              </span>
            ) : null}
            {part.advanced ? (
              <span className="rounded-full bg-elevated px-1.5 py-0.5 text-xs leading-none tracking-wide text-muted uppercase">
                opt
              </span>
            ) : null}
          </span>
          <span className="block font-mono text-xs tabular-nums text-subtle">
            {part.label}
            {doneCount > 0 ? ` · ${doneCount}/${pages.length}` : null}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-subtle transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul className="mb-2 ml-5 border-l border-border pl-2">
          {pages.map((page) => {
            const active = page.slug === currentSlug;
            const isDone = Boolean(done[page.slug]);
            return (
              <li key={page.slug} className="flex items-stretch">
                <button
                  type="button"
                  aria-label={isDone ? "Mark unread" : "Mark read"}
                  onClick={() => onToggleDone(page.slug)}
                  className="flex w-8 shrink-0 items-center justify-center text-subtle hover:text-accent"
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full",
                      isDone
                        ? "bg-accent text-accent-fg"
                        : "shadow-[var(--shadow-border)]",
                    )}
                  >
                    {isDone ? <Check className="size-2.5" /> : null}
                  </span>
                </button>
                <Link
                  to="/docs/$slug"
                  params={{ slug: page.slug }}
                  onClick={onNavigate}
                  className={cn(
                    "relative min-w-0 flex-1 rounded-md py-1.5 pr-2 pl-2 text-sm leading-snug no-underline",
                    active
                      ? "bg-elevated font-medium text-fg"
                      : "text-muted hover:bg-elevated/70 hover:text-fg",
                  )}
                >
                  {active ? (
                    <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-accent" />
                  ) : null}
                  <span className="flex items-baseline gap-2">
                    {page.num ? (
                      <span className="w-6 shrink-0 font-mono text-xs text-subtle">
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
