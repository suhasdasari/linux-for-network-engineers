import { useNavigate } from "@tanstack/react-router";
import { Command as CommandIcon, FileText, Terminal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { searchHandbook } from "@/lib/handbook";
import { PARTS } from "@/lib/handbook/types";
import { cn } from "@/lib/utils";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const hits = useMemo(() => searchHandbook(q), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && hits[active]) {
        e.preventDefault();
        go(hits[active].slug);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hits, active, onOpenChange]);

  function go(slug: string) {
    onOpenChange(false);
    void navigate({ to: "/docs/$slug", params: { slug } });
  }

  if (!open || typeof document === "undefined") return null;

  const ui = (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-24 sm:px-4">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-bg/70"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search handbook"
        className="relative z-[81] w-full max-w-lg overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(230,235,232,0.12),0_24px_48px_-16px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <CommandIcon className="size-4 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages and commands"
            className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
          />
          <kbd className="hidden rounded-sm bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
            ESC
          </kbd>
        </div>
        <div className="max-h-[min(24rem,50vh)] overflow-y-auto p-2">
          {q.trim() === "" ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Try <span className="font-mono text-accent">ip -br a</span>, DNS, Docker, or a
              drill name.
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">No matches.</p>
          ) : (
            <ul className="flex flex-col">
              {hits.map((hit, i) => {
                const part = PARTS.find((p) => p.id === hit.part);
                const Icon = hit.kind === "command" ? Terminal : FileText;
                return (
                  <li key={`${hit.kind}-${hit.slug}-${hit.snippet}-${i}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(hit.slug)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left",
                        i === active ? "bg-elevated" : "hover:bg-elevated/60",
                      )}
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fg">{hit.title}</span>
                        <span className="mt-0.5 block truncate font-mono text-[12px] text-muted">
                          {hit.kind === "command" ? hit.snippet : hit.snippet}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] tracking-wide text-subtle uppercase">
                        {part?.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}
