import { h2, p, table, type HandbookPage } from "./types";

export const glossary: HandbookPage[] = [
  {
    slug: "glossary",
    part: "ref",
    title: "Glossary",
    summary: "The words on the ticket. No fluff.",
    blocks: [
      table(
        ["Term", "Means here"],
        [
          [
            "VLAN",
            "A broadcast domain with a tag. On a closet PC it is usually the *switch* access VLAN. Linux only tags if you built 802.1Q.",
          ],
          [
            "PoE",
            "Power over Ethernet. The switch powers the camera. Linux on the NVR cannot light PoE. No power = not a Docker ticket.",
          ],
          [
            "DHCP",
            "Lease an address, mask, gateway, DNS. Exhausted pool = new cameras stay dark. tcpdump ports 67/68.",
          ],
          [
            "SSM",
            "AWS Systems Manager Session Manager. Agent on the box, outbound 443, shell without inbound 22.",
          ],
          [
            "NVR",
            "Network video recorder. Disk + ingest. `df -h` is part of the product.",
          ],
          [
            "Edge box",
            "The PC in the closet: Linux, often Docker, sometimes a GPU. The appliance.",
          ],
          [
            "Jump box",
            "A host you SSH to first, on a management path, when the camera LAN is not your friend.",
          ],
          [
            "netplan",
            "Ubuntu’s YAML for persistent network config. `ip` is temporary; netplan survives reboot.",
          ],
          [
            "journald",
            "systemd’s log store. `journalctl -u UNIT`. The modern `/var/log`.",
          ],
          [
            "LOWER_UP",
            "Carrier. Cable + far end. Admin UP without LOWER_UP is a physical plant problem.",
          ],
        ],
      ),
      h2("Also"),
      p(
        "FOE in this book means the live CLI conversation for a field / closet role — not a Cisco exam name. RHCE is the sysadmin degree we are explicitly not teaching.",
      ),
    ],
  },
];
