import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useEffect } from "react";
import { DocPager, SiteFooter } from "@/components/doc-footer";
import { PageBody } from "@/components/page-body";
import { Button } from "@/components/ui/button";
import { neighbors, PAGES_BY_SLUG, partMeta } from "@/lib/handbook";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/docs/$slug")({
  component: DocPage,
});

function DocPage() {
  const { slug } = Route.useParams();
  const page = PAGES_BY_SLUG[slug];
  const mark = useProgress((s) => s.mark);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    const t = window.setTimeout(() => mark(page.slug), 2500);
    return () => window.clearTimeout(t);
  }, [page, mark]);

  if (!page) {
    return (
      <main className="mx-auto w-full max-w-xl px-6 py-20 text-center">
        <h1 className="text-2xl font-medium">Page not in this handbook</h1>
        <p className="mt-2 text-muted">That slug does not match a lesson.</p>
        <Link to="/docs" className="mt-6 inline-block text-accent">
          Back to the index
        </Link>
      </main>
    );
  }

  const part = partMeta(page.part);
  const { prev, next } = neighbors(page.slug);

  return (
    <div className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-[44rem] px-5 py-10 sm:px-8">
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          {part?.label}
          {page.num ? <span className="text-subtle"> · {page.num}</span> : null}
          {page.advanced ? <span className="text-muted"> · optional</span> : null}
          {page.minutes ? <span className="text-muted"> · {page.minutes} min</span> : null}
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="max-w-[22ch] text-3xl font-medium tracking-tight text-balance">
            {page.title}
          </h1>
          {page.print ? (
            <Button
              variant="outline"
              size="sm"
              className="no-print"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              Print card
            </Button>
          ) : null}
        </div>
        <p className="mt-3 max-w-xl text-muted text-pretty">{page.summary}</p>

        <div className="mt-8">
          <PageBody blocks={page.blocks} />
        </div>

        <p className="print-only mt-10 text-xs">
          FloorKit field edition · getfloorkit.com · Built for closet + appliance work. Not a
          RHCE course.
        </p>

        <DocPager prev={prev} next={next} />
      </article>
      <SiteFooter />
    </div>
  );
}
