import {
  cmd,
  h2,
  note,
  p,
  pre,
  table,
  ul,
  warn,
  type HandbookPage,
} from "./types";

export const part6: HandbookPage[] = [
  {
    slug: "vlan",
    part: "6",
    num: "30",
    title: "VLAN on Linux (802.1Q)",
    summary: "Awareness. The switch still owns the VLAN. Linux can tag if it must.",
    blocks: [
      p(
        "Ninety percent of closet designs put the edge PC on an **access** port. Then there is no VLAN config on Linux at all. The other ten percent trunk two VLANs into the box (cameras + management). This page is that ten percent.",
      ),
      pre(
        "sudo ip link add link ens18 name ens18.40 type vlan id 40\nsudo ip link set ens18.40 up\nsudo ip addr add 10.40.0.10/24 dev ens18.40",
        "Temporary tagged interface. Parent NIC must be up. Switch port must be a trunk that allows 40.",
      ),
      p(
        "Persist with netplan `vlans:` (not by re-running `ip link add` in a bashrc). If the switch is access-VLAN 40, **do not** also tag 40 on Linux — you double-tag and wonder why ARP dies.",
      ),
      cmd(
        "cat /proc/net/vlan/config",
        "Kernel’s VLAN table. Empty means you are not tagging, which is normal.",
      ),
      note(
        "Awareness, not a design course. Wrong VLAN is still usually the switch. Linux tagging is how you accidentally hide that."),
    ],
  },
  {
    slug: "bridge-dummy",
    part: "6",
    num: "31",
    title: "Bridge / dummy interface",
    summary: "Awareness. Docker already made a bridge. You rarely should.",
    blocks: [
      cmd(
        "ip -br link",
        "You may already see `docker0`, `br-*`, or `cni0`. Those are bridges. Leave them unless the runbook says otherwise.",
      ),
      p(
        "A **linux bridge** is a switch inside the kernel. Docker uses one to put containers on a private subnet and NAT them out. A **dummy** interface is a always-up NIC with no jack — useful for a stable address or lab routing, not for cameras.",
      ),
      pre(
        "sudo ip link add dummy0 type dummy\nsudo ip link set dummy0 up\nsudo ip addr add 192.0.2.1/32 dev dummy0",
        "Lab only. 192.0.2.0/24 is documentation space. Do not number a dummy out of the camera subnet.",
      ),
      warn(
        "Do not `ip link delete docker0` to “clean up”. You will break every container and then spend the drill looking at netplan."),
      note("If you need two containers to talk, that is still `docker ps` and published ports for field work — not a new bridge."),
    ],
  },
  {
    slug: "nmcli-netplan",
    part: "6",
    num: "32",
    title: "nmcli vs netplan vs ip",
    summary: "When each wins. Use one writer, or they fight.",
    blocks: [
      table(
        ["Tool", "Lives until", "Who uses it", "When it wins"],
        [
          [
            "`ip`",
            "Reboot (or until overwritten)",
            "You, in a break/fix",
            "Now. Hunting. You are on console.",
          ],
          [
            "`netplan`",
            "Forever, on Ubuntu Server",
            "Ubuntu 18.04+",
            "Persisting what `ip` just proved.",
          ],
          [
            "`nmcli` / NetworkManager",
            "Forever, on desktop & some appliances",
            "Ubuntu Desktop, Fedora, vendor images",
            "When `systemctl is-active NetworkManager` is active.",
          ],
        ],
      ),
      cmd(
        "systemctl is-active systemd-networkd NetworkManager",
        "Which renderer is alive. netplan is only YAML; one of these two applies it.",
      ),
      cmd(
        "nmcli -t -f DEVICE,TYPE,STATE,CONNECTION device",
        "If NetworkManager owns the NIC, edit it here (or it will overwrite your `ip addr add`).",
      ),
      cmd(
        "networkctl status",
        "systemd-networkd view. Common on Ubuntu Server 24.04.",
      ),
      h2("Rule"),
      p(
        "Pick **one** writer. `ip` to test, netplan *or* nmcli to persist. Two YAML files + NM + a stale `dhclient` is the “it works until reboot” ticket.",
      ),
      note("Cloud-init can rewrite netplan on boot. If a change will not stick, `ls /etc/netplan` and look for `50-cloud-init.yaml`."),
    ],
  },
  {
    slug: "ntp",
    part: "6",
    num: "33",
    title: "Time / NTP",
    summary: "Certs and logs lie if the clock is wrong.",
    blocks: [
      cmd(
        "timedatectl",
        "Local time, UTC, timezone, whether NTP is active. Read this before you trust a log or a TLS error.",
      ),
      cmd(
        "timedatectl timesync-status",
        "Which server you sync from and the offset. Huge offset = you just booted or NTP is blocked.",
      ),
      cmd(
        "date -u",
        "UTC right now. Compare to your phone. Years-off clocks break HTTPS with errors that look like “network”.",
      ),
      p(
        "Ubuntu 24.04 uses **systemd-timesyncd** by default. Some appliances run chrony. You do not need both."),
      cmd(
        "sudo timedatectl set-ntp true",
        "Turns NTP on. Still needs UDP/123 (or the vendor’s NTP port) out, plus DNS if the server is a name.",
      ),
      warn(
        "Do not `date -s` a production NVR to “fix TLS” unless NTP is impossible. Manual clocks drift, and recordings with the wrong timestamp are a legal problem, not just an ops one.",
      ),
      note(
        "A camera with its own clock 3 hours off will look “offline” in a dashboard that rejects old timestamps. Check the camera and the box."),
    ],
  },
  {
    slug: "persistent",
    part: "6",
    num: "34",
    title: "Persistent vs temporary",
    summary: "ip dies on reboot. netplan does not. Say which one you used.",
    blocks: [
      p(
        "This is `config t` vs `wr mem`. If you do not write it, a power blink undoes the fix — and closet PCs get power blinked.",
      ),
      table(
        ["Change", "Temporary", "Persistent"],
        [
          ["Address / route / DNS", "`ip addr`, `ip route`, `resolvectl`", "netplan YAML (or nmcli)"],
          ["NIC admin up", "`ip link set up`", "netplan `dhcp4` / `addresses` on that NIC"],
          ["Hostname", "`hostname` (some images)", "`hostnamectl set-hostname`"],
          ["Service running", "`systemctl start`", "`systemctl enable --now`"],
          ["Firewall rule", "`nft` insert", "ufw / nft file under `/etc`"],
        ],
      ),
      cmd(
        "sudo netplan try",
        "The `reload in 120s unless confirmed` version of wr mem. Use it over SSH.",
      ),
      note(
        "Ticket hygiene: write “applied with `ip`, persisted in `/etc/netplan/50-closet.yaml`” so the next tech does not chase a ghost after reboot.",
      ),
      warn(
        "A fix you cannot survive a reboot with is not a fix. It is a demo. Finish the persist step or stay on console."),
    ],
  },
];
