import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { SearchDialog } from "@/components/search-dialog";
import { CollapsedRail, Sidebar } from "@/components/sidebar";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_KEY = "lfne-nav";

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const slug = pathname.startsWith("/docs/") ? pathname.slice("/docs/".length) : undefined;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      if (localStorage.getItem(NAV_KEY) === "closed") setDesktopOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NAV_KEY, desktopOpen ? "open" : "closed");
    } catch {
      /* ignore */
    }
  }, [desktopOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if ((meta && e.key.toLowerCase() === "k") || (e.key === "/" && !meta && !isTyping())) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === "[" && !meta && !isTyping()) {
        e.preventDefault();
        if (window.matchMedia("(min-width: 1024px)").matches) {
          setDesktopOpen((o) => !o);
        } else {
          setMobileOpen((o) => !o);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>

      <header className="no-print sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-bg/95 px-3 backdrop-blur-sm sm:px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <Link to="/" className="min-w-0 flex-1 truncate text-sm font-medium text-fg no-underline">
          Linux for Network Engineers
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-5" />
        </Button>
        <UserMenu />
      </header>

      <div
        className={cn(
          "lg:grid lg:min-h-dvh lg:transition-[grid-template-columns] lg:duration-200 lg:ease-out",
          desktopOpen
            ? "lg:grid-cols-[18rem_minmax(0,1fr)]"
            : "lg:grid-cols-[3.5rem_minmax(0,1fr)]",
        )}
      >
        <aside
          aria-hidden={!mobileOpen}
          inert={!mobileOpen ? true : undefined}
          className={cn(
            "no-print fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-[var(--shadow-border)] transition-transform duration-200 ease-out lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar
            currentSlug={slug}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </aside>

        <aside className="no-print hidden min-w-0 overflow-hidden border-r border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
          {desktopOpen ? (
            <Sidebar currentSlug={slug} onClose={() => setDesktopOpen(false)} />
          ) : (
            <CollapsedRail onOpen={() => setDesktopOpen(true)} />
          )}
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="no-print fixed inset-0 z-40 bg-bg/60 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-col">
          <div className="no-print hidden h-14 items-center justify-end gap-3 border-b border-border px-6 lg:flex">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-full max-w-sm items-center gap-2 rounded-md bg-surface px-3 text-sm text-muted shadow-[var(--shadow-border)] hover:text-fg"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Search pages and commands</span>
              <kbd className="rounded-sm bg-elevated px-1.5 py-0.5 font-mono text-xs text-subtle">
                ⌘K
              </kbd>
            </button>
            <UserMenu />
          </div>
          <div id="content" className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
            {children}
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function isTyping() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
}
