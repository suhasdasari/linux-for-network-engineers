import {
  cmd,
  h2,
  note,
  ol,
  p,
  pre,
  steps,
  table,
  ul,
  warn,
  type HandbookPage,
} from "./types";

export const part0: HandbookPage[] = [
  {
    slug: "install-ubuntu",
    part: "0",
    num: "0.1",
    title: "Install Ubuntu Server 24.04",
    summary: "One cheap VM. Server ISO. No desktop. You will live in SSH.",
    blocks: [
      p(
        "Use **Ubuntu Server 24.04 LTS**. Not Desktop. Not a random “minimal cloud” image until you know what you are doing. Server is what a closet appliance looks like: no GUI, systemd, netplan, OpenSSH.",
      ),
      h2("Where it runs"),
      ul([
        "**VirtualBox** — fine on Windows/Linux. Bridged NIC is a checkbox.",
        "**VMware Workstation / Fusion** — same idea, often cleaner NICs.",
        "**UTM** — the usual pick on Apple Silicon. Use Virtio network.",
        "A $5 cloud VM works if you cannot run a hypervisor. Treat it as hostile: keys only, no password SSH.",
      ]),
      h2("Installer choices that matter"),
      ol([
        "English, US keyboard is fine.",
        "Use the whole disk. Default LVM is OK.",
        "Create a user that is **not** `root`. Remember the password.",
        "Check **Install OpenSSH server**.",
        "Skip Docker / extra snaps for now. You will add them later.",
      ]),
      cmd(
        "lsb_release -a",
        "Confirms you actually landed on 24.04 before you follow any command on this site.",
      ),
      note(
        "2 vCPU, 4 GB RAM, 40 GB disk is plenty. A camera box in the field is often weaker than that.",
      ),
      warn(
        "Do not dual-boot your laptop for this lab. The whole point is a disposable VM you can snapshot and wreck.",
      ),
    ],
  },
  {
    slug: "bridged-nat",
    part: "0",
    num: "0.2",
    title: "Bridged vs NAT",
    summary: "NAT hides the VM. Bridged puts it on the LAN. Pick with intent.",
    blocks: [
      p(
        "Hypervisors lie about the network unless you know which mode you clicked. This is the same conversation as access vs trunk, just for a VM NIC.",
      ),
      table(
        ["Mode", "VM can get out", "LAN can SSH in", "Use it for"],
        [
          [
            "NAT",
            "Yes",
            "Only with a port-forward",
            "Quick install when you do not care about inbound",
          ],
          [
            "Bridged",
            "Yes, via the real LAN DHCP/gateway",
            "Yes, like any other host",
            "Lab that feels like a closet box",
          ],
          [
            "Host-only / internal",
            "No, unless you add a second NIC",
            "Only from the host",
            "Isolated pair: “jump box” + “camera”",
          ],
        ],
      ),
      h2("What a network engineer should pick"),
      ul([
        "**One VM, learning SSH from the host:** bridged, or NAT plus a host-to-guest port-forward of 22.",
        "**Two VMs (appliance + fake camera):** host-only network between them, plus a NAT/bridged NIC on the appliance if you want internet for `apt`.",
        "Write down the VM MAC. DHCP reservations in the lab save you later when `ens18` comes back with a new lease.",
      ]),
      cmd(
        "ip -br a",
        "After first boot, this tells you if the NIC got an address or you are still sitting in 127.0.0.1 land.",
      ),
      warn(
        "Bridged on a corporate / hotel Wi-Fi often fails (client isolation, no promiscuous). If the VM gets no DHCP, switch to NAT + port 22 forward and keep moving.",
      ),
    ],
  },
  {
    slug: "snapshots",
    part: "0",
    num: "0.3",
    title: "Snapshot before every lab",
    summary: "The undo button. Take it before you type anything stupid.",
    blocks: [
      p(
        "A snapshot is a save-state of disk (and optionally RAM). It is the lab equivalent of `wr mem` plus a rollback. Network engineers who skip this end up reinstalling Ubuntu at 11pm.",
      ),
      h2("When to snapshot"),
      ul([
        "Fresh SSH works — call it `clean-ssh`.",
        "Before any lab that says “break the default route” or “wrong static IP”.",
        "Before you install Docker or NVIDIA drivers.",
        "After a lab that *worked*, so you can roll forward instead of redoing Part 1.",
      ]),
      h2("Hypervisor names"),
      table(
        ["Tool", "Where"],
        [
          ["VirtualBox", "Machine → Take Snapshot"],
          ["VMware", "VM → Snapshot → Take Snapshot"],
          ["UTM", "Drive / snapshot in the VM settings; keep two named restores"],
        ],
      ),
      note(
        "Name them like tickets: `before-static-ip`, `before-docker`. Future you cannot decode `snapshot 3`.",
      ),
      warn(
        "A snapshot is not a backup of production. On a live closet box you use `netplan try` and console access, not hypervisor rollback.",
      ),
    ],
  },
  {
    slug: "user-sudo-ssh",
    part: "0",
    num: "0.4",
    title: "User, sudo, enable SSH",
    summary: "A normal user with sudo. SSH listening. Root login off.",
    blocks: [
      p(
        "The installer already created a user if you followed Part 0.1. This page is the bring-up you will repeat on a real appliance that arrives with a default account.",
      ),
      cmd("whoami", "Confirms you are not root. Field boxes should be used as a named user."),
      cmd("id", "Shows uid, gid, and groups. `sudo` membership is the one that matters."),
      cmd(
        "sudo -l",
        "Lists what you are allowed to run. If this fails, you cannot change network or services.",
      ),
      cmd(
        "sudo systemctl status ssh",
        "Ubuntu’s OpenSSH unit is `ssh` (not `sshd`). `active (running)` is the green light.",
      ),
      cmd(
        "sudo ss -tulpn | grep 22",
        "Proves something is actually listening on 22, not just that systemd is happy.",
      ),
      h2("If SSH is missing"),
      cmd(
        "sudo apt update && sudo apt install -y openssh-server",
        "Installs the daemon. Needed if you skipped it in the installer.",
      ),
      cmd(
        "sudo systemctl enable --now ssh",
        "`enable` survives reboot. `--now` starts it immediately.",
      ),
      h2("Hardening you should do even in lab"),
      pre(
        "sudo mkdir -p /home/$USER/.ssh\nchmod 700 /home/$USER/.ssh",
        "The directory must be 700 or OpenSSH will ignore your keys later.",
      ),
      note(
        "Leave password SSH on **in the lab** until Part 4. On a cloud VM, keys only. Never open 22 to the whole internet for practice.",
      ),
      warn(
        "Do not `PermitRootLogin yes` to “make it easier”. Console exists for a reason. If you lock yourself out of SSH, that is a lab, not a disaster.",
      ),
    ],
  },
  {
    slug: "practice-loop",
    part: "0",
    num: "0.5",
    title: "How you will practice",
    summary: "Host → SSH into VM. Read a page. Type it. Break it. Fix it.",
    blocks: [
      p(
        "You will not learn this by highlighting commands in a browser. The loop is the whole course.",
      ),
      ol([
        "Read one page.",
        "Type the commands in the VM. Do not paste a whole page at once.",
        "Break the thing the lab tells you to break.",
        "Fix it from the symptom, not from memory of the page.",
        "If you get lost, roll the snapshot and do it again faster.",
      ]),
      h2("From the host"),
      cmd(
        "ssh youruser@10.0.0.42",
        "Replace with the VM address from `ip -br a`. This is the only “console” you should need.",
      ),
      cmd(
        "ssh -p 2222 youruser@127.0.0.1",
        "NAT mode with a port-forward. The VM still thinks it is on port 22.",
      ),
      h2("Optional second VM (“camera”)"),
      ul([
        "Same Ubuntu, smaller disk, no extra packages.",
        "Give it a static IP on the host-only LAN, e.g. `10.64.0.20/24`.",
        "You will not install camera firmware. You will ping it, DHCP it, and pretend it is a streamer.",
      ]),
      steps(
        [
          "Snapshot `clean-ssh`.",
          "From the host, SSH in.",
          "Run `hostnamectl` and `ip -br a`. Write both in a note.",
          "Disconnect. Reconnect. If that works, Part 0 is done.",
        ],
        "Exit ticket",
      ),
      note(
        "Core path after this: **Part 1 → Part 3 → Part 5 → Part 7**. Parts 2, 4, 6, 8, 9 wait until those four do not scare you.",
      ),
    ],
  },
];
