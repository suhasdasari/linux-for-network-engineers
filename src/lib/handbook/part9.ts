import {
  cmd,
  h2,
  note,
  p,
  pre,
  ul,
  warn,
  type HandbookPage,
} from "./types";

const notRequired =
  "Not required for a field / FOE interview. Read if you are curious. Do not stall Parts 1, 3, 5, 7 for this.";

export const part9: HandbookPage[] = [
  {
    slug: "namespaces",
    part: "9",
    num: "A1",
    title: "Network namespaces",
    summary: "A box can have more than one routing table + NIC set. Docker already does this.",
    advanced: true,
    blocks: [
      p(notRequired),
      p(
        "A network namespace is a copy of the network stack: interfaces, routes, sockets. Containers are namespaces with nicer UX. You rarely create them by hand in a closet.",
      ),
      cmd("ip netns list", "Namespaces that someone created with `ip netns`. Empty is normal."),
      cmd(
        "sudo ip netns exec NAME ip -br a",
        "Run `ip` inside that namespace. This is how you debug a container’s “eth0” without docker exec.",
      ),
      note(
        "If `docker ps` already answers the question, you do not need `ip netns`. Interviewers who go here are hiring sysadmins, not FOE.",
      ),
    ],
  },
  {
    slug: "policy-routing",
    part: "9",
    num: "A2",
    title: "Policy routing",
    summary: "More than one default route, selected by source. Dual-homed boxes.",
    advanced: true,
    blocks: [
      p(notRequired),
      p(
        "Two NICs, two uplinks, one box: a single `default via` is not enough. Policy routing (`ip rule`) picks a table based on source address or fwmark so camera-VLAN replies go back out the camera NIC.",
      ),
      cmd("ip rule show", "The extra lookup rules. `from all lookup main` is the boring default."),
      cmd("ip route show table 100", "A non-main table. Empty unless someone built dual-home."),
      pre(
        "sudo ip rule add from 10.40.0.10 table 100\nsudo ip route add default via 10.40.0.1 table 100",
        "Temporary. Persist is distro-specific (netplan `routing-policy`, or NM). Easy to break SSH. Console only.",
      ),
      warn("Do not lab this over your only SSH session. Asymmetric routing looks like “the firewall is haunted”."),
    ],
  },
  {
    slug: "iptables-deep",
    part: "9",
    num: "A3",
    title: "iptables / nft deep",
    summary: "Enough to read a ruleset. Not enough to invent a firewall product.",
    advanced: true,
    blocks: [
      p(notRequired),
      cmd("sudo nft list ruleset", "The kernel truth on Ubuntu 24.04."),
      cmd("sudo iptables -L -n -v", "Legacy listing. Counters (`-v`) tell you if a drop is hitting."),
      cmd("sudo iptables -t nat -L -n", "MASQUERADE / DNAT. Docker lives here. This is why host ports surprise you."),
      p(
        "Chains are just lists. Packets walk INPUT (to this box), FORWARD (through this box), OUTPUT (from this box). If Docker is installed, there are extra chains. Do not flush them to “see if it helps”.",
      ),
      warn(
        "This handbook will not teach you to bypass a firewall, craft NAT to hide traffic, or disable someone else’s policy. Read, document, open a change window.",
      ),
    ],
  },
  {
    slug: "bonding",
    part: "9",
    num: "A4",
    title: "Bonding",
    summary: "Two NICs, one logical link. The switch has to agree.",
    advanced: true,
    blocks: [
      p(notRequired),
      p(
        "Linux bonding / LAG is the same conversation as EtherChannel. Mode 1 (active-backup) needs no switch config. Mode 4 (802.3ad) needs a port-channel on the switch. Mismatched modes = flapping and a very slow ticket.",
      ),
      cmd("cat /proc/net/bonding/bond0", "Active slave, mode, MII status. Empty path = no bond."),
      cmd("ip -br a", "You should see `bond0` with the address, not the members."),
      note("Closet PCs rarely need this. A single 1G drop is the design. If a vendor image ships a bond, read `/proc` before you rewrite netplan."),
    ],
  },
  {
    slug: "systemd-units",
    part: "9",
    num: "A5",
    title: "Writing a systemd unit",
    summary: "Read one, maybe drop a one-shot. You are not shipping a distro.",
    advanced: true,
    blocks: [
      p(notRequired),
      p(
        "Field work is `systemctl status` and restart. Writing units shows up when a vendor says “here is a binary, please start it on boot”. Copy a pattern, do not invent one.",
      ),
      pre(
        `[Unit]
Description=Field helper
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/field-helper
Restart=on-failure

[Install]
WantedBy=multi-user.target`,
        "Drop in `/etc/systemd/system/field-helper.service`, then `daemon-reload` and `enable --now`.",
      ),
      cmd(
        "sudo systemctl daemon-reload",
        "Required after you edit a unit file. Forgetting this is why “I changed it and nothing happened”.",
      ),
      cmd(
        "systemctl cat ssh",
        "Shows the unit text plus drop-ins. Read before you write.",
      ),
      warn("Do not wrap `docker restart` in a two-second RestartSec loop on a crashing container. You will hide the log and wear out the disk."),
    ],
  },
];
