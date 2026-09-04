import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Cable, Camera, Keyboard } from "lucide-react";
import { SiteFooter } from "@/components/doc-footer";
import { PAGES } from "@/lib/handbook";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({ component: Home });

const CORE = [
  { n: "01", title: "Noob", blurb: "Shell, files, permissions. Stop panicking.", slug: "shell" },
  { n: "03", title: "Network CLI", blurb: "ip, routes, DNS, sockets, tcpdump.", slug: "interfaces" },
  { n: "05", title: "The appliance", blurb: "No-video order. Docker. Disk. GPU last.", slug: "closet" },
  { n: "07", title: "Live drills", blurb: "Ten timed scenarios. Talk out loud.", slug: "drill-cameras-no-net" },
];

function Home() {
  const done = useProgress((s) => s.done);
  const corePages = PAGES.filter((p) => p.core);
  const coreDone = corePages.filter((p) => done[p.slug]).length;

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
          FloorKit field edition
        </p>
        <h1 className="mt-3 max-w-[18ch] text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          Linux for Network Engineers
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted text-pretty">
          From first SSH to a live camera box.
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          You already know switches. This is the Linux you need to bring up a closet
          appliance and pass a live CLI test. Not a sysadmin degree. Not hacking.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/docs/$slug"
            params={{ slug: "install-ubuntu" }}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg no-underline hover:bg-accent/90"
          >
            Start the lab
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/docs/$slug"
            params={{ slug: "shell" }}
            className="inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium text-fg no-underline shadow-[var(--shadow-border)] hover:bg-elevated"
          >
            Skip to Part 1
          </Link>
        </div>

        {coreDone > 0 ? (
          <p className="mt-4 text-sm text-muted">
            Core path progress{" "}
            <span className="font-mono tabular-nums text-accent">
              {coreDone}/{corePages.length}
            </span>
          </p>
        ) : null}

        <ol className="mt-12 grid gap-3 sm:grid-cols-2">
          {CORE.map((item) => (
            <li key={item.n}>
              <Link
                to="/docs/$slug"
                params={{ slug: item.slug }}
                className="flex h-full flex-col gap-2 rounded-xl bg-surface p-4 no-underline shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
              >
                <span className="font-mono text-[11px] text-accent">Part {item.n}</span>
                <span className="text-base font-medium text-fg">{item.title}</span>
                <span className="text-sm text-muted">{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs tracking-wide text-subtle uppercase">
          Do 1 → 3 → 5 → 7 before extras
        </p>

        <section className="mt-14 grid gap-8">
          <HomeBlock
            icon={<Cable className="size-4" />}
            title="Who this is for"
            items={[
              "Campus and field network engineers who already know switches.",
              "People who get dropped on a SafelyYou / NVR / jump box and need a shell.",
              "Anyone who has to pass a live CLI conversation without becoming a sysadmin.",
            ]}
          />
          <HomeBlock
            icon={<BookOpen className="size-4" />}
            title="What you will be able to do in 2 weeks"
            items={[
              "SSH into a closet PC without guessing the directory.",
              "Bring a NIC up, set IP / route / DNS, and know which failure is which.",
              "Walk the no-video checklist: cable → PoE/VLAN → camera IP → box → process → GPU last.",
              "Restart a Docker container, read 100 log lines, and notice a full disk.",
              "Talk through a 3-minute drill out loud.",
            ]}
          />
          <HomeBlock
            icon={<Camera className="size-4" />}
            title="Lab setup"
            items={[
              "One Ubuntu Server 24.04 VM (VirtualBox, VMware, UTM, or a cheap cloud VM).",
              "Optional second VM pretending to be a camera.",
              "You work from the host and SSH in. Snapshot before every lab.",
            ]}
          />
          <HomeBlock
            icon={<Keyboard className="size-4" />}
            title="How to use this book"
            items={[
              "Read a page.",
              "Type the commands. Don’t paste the whole page.",
              "Break what the lab tells you to break.",
              "Fix it from the symptom. Roll the snapshot if you get lost.",
            ]}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function HomeBlock({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-medium text-fg">
        <span className="flex size-7 items-center justify-center rounded-md bg-elevated text-accent">
          {icon}
        </span>
        {title}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg/85">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/80" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
