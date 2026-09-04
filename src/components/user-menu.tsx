import { usePrivy } from "@privy-io/react-auth";
import { PAGES } from "@/lib/handbook";
import { useProgress } from "@/lib/progress";

export function UserMenu() {
  const { user, logout } = usePrivy();
  const done = useProgress((s) => s.done);
  const reset = useProgress((s) => s.reset);
  const core = PAGES.filter((p) => p.core);
  const coreDone = core.filter((p) => done[p.slug]).length;
  const allDone = PAGES.filter((p) => done[p.slug]).length;
  const label = userLabel(user);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="hidden min-w-0 text-right sm:block">
        <p className="truncate text-xs font-medium text-fg">{label}</p>
        <p className="font-mono text-xs tabular-nums text-muted">
          {coreDone}/{core.length} core · {allDone}/{PAGES.length}
        </p>
      </div>
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-elevated font-mono text-sm text-accent shadow-[var(--shadow-border)]"
      >
        {initials(label)}
      </span>
      <button
        type="button"
        onClick={() => {
          reset();
          void logout();
        }}
        className="h-9 shrink-0 rounded-md px-2 text-xs text-muted hover:bg-elevated hover:text-fg"
      >
        Sign out
      </button>
    </div>
  );
}

function userLabel(user: ReturnType<typeof usePrivy>["user"]) {
  if (!user) return "Signed in";
  const email =
    user.email?.address ||
    user.google?.email ||
    user.apple?.email ||
    user.github?.email;
  if (email) return email;
  const wallet = user.wallet?.address;
  if (wallet) return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
  return "Signed in";
}

function initials(label: string) {
  const base = label.includes("@") ? label.slice(0, label.indexOf("@")) : label;
  const parts = base.replace(/[^\p{L}\p{N} ]+/gu, " ").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || "IN").toUpperCase();
}
