import { AlertTriangle, ChevronDown, CircleCheck, Clock, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { CommandBlock, PreBlock } from "@/components/command-block";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import type { Block } from "@/lib/handbook/types";
import { cn } from "@/lib/utils";

export function PageBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "kicker":
      return (
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          {block.text}
        </p>
      );
    case "p":
      return (
        <p className="text-[15px] leading-relaxed text-fg/90 sm:text-base">
          <RichText text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2 className="mt-3 font-sans text-lg font-medium tracking-tight text-fg">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-sans text-base font-medium text-fg">{block.text}</h3>
      );
    case "ul":
      return (
        <ul className="flex flex-col gap-2 pl-0">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/80" />
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-fg/90">
              <span className="mt-0.5 w-5 shrink-0 font-mono text-xs tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "cmd":
      return (
        <CommandBlock command={block.command} why={block.why} danger={block.danger} />
      );
    case "pre":
      return <PreBlock code={block.code} why={block.why} />;
    case "note":
      return (
        <aside className="flex gap-3 rounded-lg bg-elevated px-4 py-3 shadow-[var(--shadow-border)]">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-fg/85">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    case "warn":
      return (
        <aside className="flex gap-3 rounded-lg bg-elevated px-4 py-3 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-danger)_40%,transparent)]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
          <p className="text-sm leading-relaxed text-fg/85">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead className="bg-elevated">
              <tr>
                {block.headers.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 font-medium tracking-wide text-muted uppercase text-[11px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-border align-top">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2.5 text-[13px] leading-snug text-fg/90">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "steps":
      return (
        <div className="rounded-lg bg-surface px-4 py-4 shadow-[var(--shadow-border)]">
          {block.title ? (
            <p className="mb-3 text-xs font-medium tracking-[0.14em] text-accent uppercase">
              {block.title}
            </p>
          ) : null}
          <ol className="flex flex-col gap-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-elevated font-mono text-[10px] text-accent">
                  {i + 1}
                </span>
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "drill":
      return <DrillBlock minutes={block.minutes} expected={block.expected} cause={block.cause} />;
    default:
      return null;
  }
}

function DrillBlock({
  minutes,
  expected,
  cause,
}: {
  minutes: number;
  expected: string;
  cause: string;
}) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(minutes * 60);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      return;
    }
    const id = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [running, left]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const spent = left <= 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock className="size-4 text-accent" />
          <span>
            Live drill · {minutes} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-lg tabular-nums",
              spent ? "text-danger" : "text-fg",
            )}
          >
            {mm}:{ss}
          </span>
          <Button
            size="sm"
            variant={running ? "outline" : "default"}
            onClick={() => {
              if (spent) {
                setLeft(minutes * 60);
                setRunning(true);
                return;
              }
              setRunning((r) => !r);
            }}
          >
            {spent ? "Reset" : running ? "Pause" : "Start"}
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-md bg-elevated px-3 py-3 text-left text-sm hover:bg-elevated/80"
      >
        <span className="flex items-center gap-2 font-medium">
          <CircleCheck className="size-4 text-accent" />
          {open ? "Hide expected output & cause" : "Reveal expected output & cause"}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs font-medium tracking-[0.14em] text-subtle uppercase">
              Expected
            </p>
            <p className="text-sm leading-relaxed text-fg/90">{expected}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium tracking-[0.14em] text-subtle uppercase">
              Root cause
            </p>
            <p className="text-sm leading-relaxed text-fg">{cause}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Run the commands first. Reveal when you would say it on the call.
        </p>
      )}
    </div>
  );
}
