import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CommandBlock({
  command,
  why,
  danger = false,
}: {
  command: string;
  why: string;
  danger?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const el = document.createElement("textarea");
      el.value = command;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-code shadow-[var(--shadow-border)]",
        danger && "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-danger)_55%,transparent)]",
      )}
    >
      <div className="flex items-start gap-2 px-3 py-2.5 sm:px-4">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 select-none font-mono text-sm",
            danger ? "text-danger" : "text-accent",
          )}
        >
          $
        </span>
        <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-relaxed text-fg sm:text-sm">
          <code>{command}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          className="relative -mr-1 -mt-0.5 size-10 shrink-0 rounded-sm text-muted hover:bg-elevated hover:text-fg"
          aria-label={copied ? "Copied" : "Copy command"}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <Copy
              className={cn(
                "size-4 transition-[opacity,transform,filter] duration-200 ease-out",
                copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100",
              )}
            />
            <Check
              className={cn(
                "absolute size-4 text-accent transition-[opacity,transform,filter] duration-200 ease-out",
                copied ? "scale-100 opacity-100" : "scale-[0.25] opacity-0 blur-[4px]",
              )}
            />
          </span>
        </button>
      </div>
      <p className="border-t border-border/80 px-3 py-2 font-sans text-[13px] leading-snug text-muted sm:px-4">
        <span className="mr-2 font-medium tracking-wide text-subtle uppercase">Why</span>
        {why}
      </p>
    </div>
  );
}

export function PreBlock({ code, why }: { code: string; why?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-lg bg-code shadow-[var(--shadow-border)]">
      <div className="flex items-start gap-2 px-3 py-2.5 sm:px-4">
        <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] leading-relaxed text-fg sm:text-sm">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          className="relative size-10 shrink-0 rounded-sm text-muted hover:bg-elevated hover:text-fg"
          aria-label={copied ? "Copied" : "Copy snippet"}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
          </span>
        </button>
      </div>
      {why ? (
        <p className="border-t border-border/80 px-3 py-2 text-[13px] leading-snug text-muted sm:px-4">
          <span className="mr-2 font-medium tracking-wide text-subtle uppercase">Why</span>
          {why}
        </p>
      ) : null}
    </div>
  );
}
