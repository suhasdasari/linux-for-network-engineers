import { glossary } from "./glossary";
import { part0 } from "./part0";
import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";
import { part5 } from "./part5";
import { part6 } from "./part6";
import { part7 } from "./part7";
import { part8 } from "./part8";
import { part9 } from "./part9";
import { PARTS, type HandbookPage, type PartId } from "./types";

export { FIELD_CARD } from "./field-card";
export { PARTS, type HandbookPage, type PartId } from "./types";

export const PAGES: HandbookPage[] = [
  ...part0,
  ...part1,
  ...part2,
  ...part3,
  ...part4,
  ...part5,
  ...part6,
  ...part7,
  ...part8,
  ...part9,
  ...glossary,
];

export const PAGES_BY_SLUG: Record<string, HandbookPage> = Object.fromEntries(
  PAGES.map((page) => [page.slug, page]),
);

export function pagesInPart(id: PartId): HandbookPage[] {
  return PAGES.filter((page) => page.part === id);
}

export function neighbors(slug: string): {
  prev: HandbookPage | null;
  next: HandbookPage | null;
  index: number;
} {
  const index = PAGES.findIndex((page) => page.slug === slug);
  if (index < 0) return { prev: null, next: null, index: -1 };
  return {
    prev: PAGES[index - 1] ?? null,
    next: PAGES[index + 1] ?? null,
    index,
  };
}

export type SearchHit = {
  slug: string;
  title: string;
  part: PartId;
  num?: string;
  kind: "page" | "command";
  snippet: string;
};

export function searchHandbook(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const pageHits: SearchHit[] = [];
  const cmdHits: SearchHit[] = [];

  for (const page of PAGES) {
    const hay = [
      page.title,
      page.summary,
      page.num ?? "",
      ...page.blocks.flatMap((block) => {
        if (block.type === "p" || block.type === "h2" || block.type === "h3" || block.type === "note" || block.type === "warn" || block.type === "kicker") {
          return [block.text];
        }
        if (block.type === "cmd") return [block.command, block.why];
        if (block.type === "pre") return [block.code, block.why ?? ""];
        if (block.type === "ul" || block.type === "ol") return block.items;
        if (block.type === "steps") return [block.title ?? "", ...block.items];
        if (block.type === "table") return [...block.headers, ...block.rows.flat()];
        if (block.type === "drill") return [block.expected, block.cause];
        return [];
      }),
    ]
      .join("\n")
      .toLowerCase();

    if (hay.includes(q) || page.slug.includes(q)) {
      pageHits.push({
        slug: page.slug,
        title: page.title,
        part: page.part,
        num: page.num,
        kind: "page",
        snippet: page.summary,
      });
    }

    for (const block of page.blocks) {
      if (block.type !== "cmd") continue;
      if (
        block.command.toLowerCase().includes(q) ||
        block.why.toLowerCase().includes(q)
      ) {
        cmdHits.push({
          slug: page.slug,
          title: page.title,
          part: page.part,
          num: page.num,
          kind: "command",
          snippet: block.command,
        });
      }
    }
  }

  return [...pageHits, ...cmdHits].slice(0, 30);
}

export function partMeta(id: PartId) {
  return PARTS.find((part) => part.id === id);
}
