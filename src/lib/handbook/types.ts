export type PartId =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "ref";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "cmd"; command: string; why: string; danger?: boolean }
  | { type: "pre"; code: string; why?: string }
  | { type: "note"; text: string }
  | { type: "warn"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "steps"; title?: string; items: string[] }
  | { type: "drill"; minutes: number; expected: string; cause: string }
  | { type: "kicker"; text: string };

export type HandbookPage = {
  slug: string;
  part: PartId;
  num?: string;
  title: string;
  summary: string;
  core?: boolean;
  advanced?: boolean;
  print?: boolean;
  minutes?: number;
  blocks: Block[];
};

export const p = (text: string): Block => ({ type: "p", text });
export const h2 = (text: string): Block => ({ type: "h2", text });
export const h3 = (text: string): Block => ({ type: "h3", text });
export const ul = (items: string[]): Block => ({ type: "ul", items });
export const ol = (items: string[]): Block => ({ type: "ol", items });
export const cmd = (command: string, why: string, danger = false): Block => ({
  type: "cmd",
  command,
  why,
  danger,
});
export const pre = (code: string, why?: string): Block => ({ type: "pre", code, why });
export const note = (text: string): Block => ({ type: "note", text });
export const warn = (text: string): Block => ({ type: "warn", text });
export const table = (headers: string[], rows: string[][]): Block => ({
  type: "table",
  headers,
  rows,
});
export const steps = (items: string[], title?: string): Block => ({
  type: "steps",
  title,
  items,
});
export const kicker = (text: string): Block => ({ type: "kicker", text });
export const drill = (minutes: number, expected: string, cause: string): Block => ({
  type: "drill",
  minutes,
  expected,
  cause,
});

export type PartMeta = {
  id: PartId;
  label: string;
  title: string;
  blurb: string;
  core?: boolean;
  advanced?: boolean;
  collapsed?: boolean;
};

export const PARTS: PartMeta[] = [
  {
    id: "0",
    label: "Part 0",
    title: "Lab",
    blurb: "One Ubuntu VM. Snapshot. SSH from the host.",
  },
  {
    id: "1",
    label: "Part 1",
    title: "Basics",
    blurb: "Shell, files, permissions. Days 1–3.",
    core: true,
  },
  {
    id: "2",
    label: "Part 2",
    title: "See the machine",
    blurb: "CPU, disk, logs, systemd. Blame the box, not the WAN.",
    collapsed: true,
  },
  {
    id: "3",
    label: "Part 3",
    title: "Network CLI",
    blurb: "ip, routes, DNS, sockets, tcpdump. The job.",
    core: true,
  },
  {
    id: "4",
    label: "Part 4",
    title: "Remote access",
    blurb: "SSH keys, SSM, jump box, scp.",
    collapsed: true,
  },
  {
    id: "5",
    label: "Part 5",
    title: "The appliance",
    blurb: "Closet, cameras, Docker, disk, GPU one-liner.",
    core: true,
  },
  {
    id: "6",
    label: "Part 6",
    title: "Extras",
    blurb: "VLAN, bridge, netplan vs ip, NTP.",
    collapsed: true,
  },
  {
    id: "7",
    label: "Part 7",
    title: "Live drills",
    blurb: "Ten timed scenarios. 2–4 minutes each.",
    core: true,
  },
  {
    id: "8",
    label: "Part 8",
    title: "Field card",
    blurb: "Twenty commands. Print it. Pocket it.",
    collapsed: true,
  },
  {
    id: "9",
    label: "Part 9",
    title: "Advanced",
    blurb: "Not required for a field / FOE interview.",
    advanced: true,
    collapsed: true,
  },
  {
    id: "ref",
    label: "Ref",
    title: "Glossary",
    blurb: "VLAN, PoE, DHCP, SSM, NVR, edge box.",
    collapsed: true,
  },
];
