import { FIELD_CARD } from "./field-card";
import { cmd, h2, note, p, type HandbookPage } from "./types";

export const part8: HandbookPage[] = [
  {
    slug: "field-card",
    part: "8",
    num: "FC",
    title: "Field card",
    summary: "Twenty commands from Parts 3–5. Print this page. Pocket it.",
    print: true,
    blocks: [
      p(
        "One page. No theory. If you only remember this sheet on a live CLI test, you will still pass.",
      ),
      h2("The twenty"),
      ...FIELD_CARD.map((row) => cmd(row.command, row.why)),
      note(
        "Print from this page (use the Print card button). Footer is FloorKit — closet + appliance work, not an RHCE course.",
      ),
    ],
  },
];
