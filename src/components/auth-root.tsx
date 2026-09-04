import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/sidebar";
import { loadProgress, setPageDone } from "@/lib/progress-api";
import { useProgress } from "@/lib/progress";

export const PRIVY_APP_ID =
  (import.meta.env.VITE_PRIVY_APP_ID as string | undefined) || "cmtmeg40z00yt0cjuzdfy766b";

const PRIVY_CONFIG = {
  appearance: {
    theme: "dark" as const,
    accentColor: "#8fbfa7" as `#${string}`,
    logo: "/favicon.svg",
  },
  loginMethods: ["email", "google"] as Array<"email" | "google">,
  embeddedWallets: {
    ethereum: {
      createOnLogin: "off" as const,
    },
  },
};

export function AuthRoot({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <BootScreen />;
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={PRIVY_CONFIG}>
      <LoginGate>{children}</LoginGate>
    </PrivyProvider>
  );
}

function LoginGate({ children }: { children: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  if (!ready) return <BootScreen />;
  if (!authenticated) return <LoginScreen />;
  return (
    <>
      <ProgressSync />
      {children}
    </>
  );
}

function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="flex flex-col items-center gap-3">
        <BrandMark className="size-10" />
        <p className="text-sm text-muted">Loading handbook…</p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const { login } = usePrivy();
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <main className="w-full max-w-md">
        <BrandMark className="size-10" />
        <h1 className="mt-5 text-3xl font-medium tracking-tight text-balance">
          Linux for Network Engineers
        </h1>
        <a
          href="https://getfloorkit.com"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-medium tracking-[0.18em] text-accent uppercase no-underline hover:underline"
        >
          FloorKit
        </a>
        <p className="mt-4 text-muted text-pretty">
          Sign in to open the handbook and keep your core path — 1 → 3 → 5 → 7 —
          on this account.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg hover:bg-accent/90"
        >
          Sign in
        </button>
        <p className="mt-4 text-xs text-subtle">
          Progress is saved to your login. Built for closet + appliance work.
        </p>
      </main>
    </div>
  );
}

function ProgressSync() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const hydrate = useProgress((s) => s.hydrate);
  const reset = useProgress((s) => s.reset);
  const hydrating = useRef(false);

  useEffect(() => {
    if (!authenticated || !user?.id) {
      reset();
      return;
    }
    let cancelled = false;
    hydrating.current = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token || cancelled) return;
        const remote = await loadProgress({ data: { token } });
        if (!cancelled) hydrate(user.id, remote);
      } catch {
        if (!cancelled) hydrate(user.id, {});
      } finally {
        hydrating.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated, user?.id, getAccessToken, hydrate, reset]);

  useEffect(() => {
    if (!authenticated) return;
    return useProgress.subscribe((state, prev) => {
      if (hydrating.current) return;
      if (state.done === prev.done) return;
      const slugs = new Set([...Object.keys(state.done), ...Object.keys(prev.done)]);
      void (async () => {
        const token = await getAccessToken();
        if (!token) return;
        for (const slug of slugs) {
          const next = Boolean(state.done[slug]);
          const before = Boolean(prev.done[slug]);
          if (next === before) continue;
          try {
            await setPageDone({ data: { token, slug, done: next } });
          } catch {
            /* keep local mark; retry on next toggle */
          }
        }
      })();
    });
  }, [authenticated, getAccessToken]);

  return null;
}
