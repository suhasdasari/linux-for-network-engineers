import {
  cmd,
  h2,
  note,
  p,
  steps,
  table,
  ul,
  warn,
  type HandbookPage,
} from "./types";

export const part2: HandbookPage[] = [
  {
    slug: "hostname-uptime",
    part: "2",
    num: "7",
    title: "Who and what",
    summary: "hostnamectl, uname -a, uptime, whoami.",
    blocks: [
      p(
        "Before you change a packet, identify the box. Closet tickets are full of “I SSHed into the wrong NVR”.",
      ),
      cmd(
        "hostnamectl",
        "Hostname, OS, kernel, chassis. The one-pager you read aloud to the person on the phone.",
      ),
      cmd(
        "uname -a",
        "Kernel string. Needed when a vendor asks “what kernel” and when NVIDIA drivers refuse to load.",
      ),
      cmd(
        "uptime",
        "How long it has been up, load averages. A box that rebooted 4 minutes ago is a different story than a 400-day NVR.",
      ),
      cmd("whoami", "The account in this SSH session."),
      cmd("hostname -f", "FQDN if systemd/DNS has one. Compare to the cert name later."),
      cmd(
        "timedatectl",
        "Clock and timezone. Wrong time = wrong logs and dead certs. Part 6 covers NTP.",
      ),
      note("Rename only with `hostnamectl set-hostname closet-nvr-3` plus a reboot or a new SSH session so the prompt matches the ticket."),
    ],
  },
  {
    slug: "cpu-ram-disk",
    part: "2",
    num: "8",
    title: "CPU, RAM, disk",
    summary: "top/htop, free -h, df -h, lsblk. Disk full kills recording.",
    blocks: [
      cmd(
        "top",
        "Live CPU and memory. `q` quits. If one process is 99%, that is your “cameras dropped” lead.",
      ),
      cmd(
        "htop",
        "The nicer top. Install with `sudo apt install -y htop` if missing. Same job, readable on a laptop.",
      ),
      cmd(
        "free -h",
        "RAM and swap in human units. Swap at 100% + low RAM = the box is thrashing, not “the VLAN is bad”.",
      ),
      cmd(
        "df -h",
        "Filesystem fill. `100%` on `/` or the recording mount is a stop-the-line event.",
      ),
      cmd(
        "lsblk",
        "Block devices and mount points. Tells you if the data disk even mounted after a reboot.",
      ),
      cmd(
        "du -sh /var/log /opt /var/lib/docker",
        "Which tree ate the disk. Run this after `df -h` shows pain, not before.",
      ),
      table(
        ["Symptom", "Look at"],
        [
          ["UI slow, SSH laggy", "`top`, `free -h`"],
          ["Recordings stop, dashboard unhappy", "`df -h` first"],
          ["New disk “missing”", "`lsblk`, then `/etc/fstab`"],
          ["apt / docker pull fails with no space", "`df -h` on `/` and `/var`"],
        ],
      ),
      warn(
        "Do not start packet captures or “restart the camera service” until `df -h` is not 100%. A full disk makes every daemon look haunted.",
      ),
    ],
  },
  {
    slug: "logs",
    part: "2",
    num: "9",
    title: "Logs",
    summary: "journalctl -xe, journalctl -u ssh, dmesg. The box is talking.",
    blocks: [
      p(
        "Ubuntu 24.04 logs through **journald**. `/var/log/syslog` may still exist; `journalctl` is the source of truth.",
      ),
      cmd(
        "journalctl -xe",
        "Recent journal with pager, extra detail. Start here when “it just failed”.",
      ),
      cmd(
        "journalctl -u ssh -n 50",
        "Last 50 lines from the SSH unit. This is how you see failed key / password attempts.",
      ),
      cmd(
        "journalctl -u ssh -f",
        "Follow. In another window, try a bad login from the host. You should see it land.",
      ),
      cmd(
        "journalctl --since \"10 min ago\"",
        "Time window. Use it after a reboot or a PoE bounce so you are not reading yesterday.",
      ),
      cmd(
        "dmesg | tail -n 50",
        "Kernel ring: NICs, USB, GPU, OOM killer. Link flaps and “out of memory” show up here.",
      ),
      cmd(
        "journalctl -k -n 50",
        "Kernel via journald. Same story as dmesg, easier to filter by time.",
      ),
      note(
        "`-u` is a systemd unit name (`ssh`, `docker`, `nginx`). If you do not know the unit, `systemctl list-units --type=service | less`.",
      ),
    ],
  },
  {
    slug: "services",
    part: "2",
    num: "10",
    title: "Services",
    summary: "systemctl status|start|stop|restart|enable. SSH is the example.",
    blocks: [
      p(
        "systemd runs the daemons. You do not “run sshd in screen”. You talk to the unit.",
      ),
      cmd(
        "systemctl status ssh",
        "Running or not, last log lines, cgroup. Always status before restart so you have a before-picture.",
      ),
      cmd(
        "sudo systemctl restart ssh",
        "Restarts the daemon. **Existing SSH sessions stay up.** New connections use the new config.",
      ),
      cmd(
        "sudo systemctl reload ssh",
        "SIGHUP when the unit supports it. Prefer reload for config tweaks; restart when reload is not enough.",
      ),
      cmd(
        "sudo systemctl stop ssh",
        "Stops the listener. If this is your only path in, you just locked yourself out. Lab only, console ready.",
        true,
      ),
      cmd(
        "sudo systemctl start ssh",
        "Starts a stopped unit. Does not make it survive reboot.",
      ),
      cmd(
        "sudo systemctl enable ssh",
        "Creates the boot symlink. `enable --now` also starts it.",
      ),
      cmd(
        "sudo systemctl disable ssh",
        "Will not start at boot. Rarely what you want on an appliance.",
      ),
      cmd(
        "systemctl is-enabled ssh",
        "One word: enabled/disabled. Useful in a ticket comment.",
      ),
      table(
        ["Verb", "Now", "After reboot"],
        [
          ["start / stop / restart", "Yes", "No change to boot policy"],
          ["enable / disable", "No (unless `--now`)", "Yes"],
          ["reload", "Yes, if supported", "No"],
        ],
      ),
      warn(
        "Never `systemctl stop ssh` over the only SSH session on a production closet box. Use `restart` or `reload`. Keep iDRAC / console / SSM in your pocket.",
      ),
    ],
  },
  {
    slug: "lab-ssh-disk",
    part: "2",
    num: "2L",
    title: "Lab: restart SSH, check disk",
    summary: "Restart ssh without killing your session. Look at df before you blame the network.",
    blocks: [
      p("Two habits that separate field techs from people who reboot first."),
      steps(
        [
          "Open **two** SSH sessions from the host.",
          "In A: `sudo systemctl restart ssh`.",
          "Session A should still be alive. In B, disconnect and reconnect — that proves the daemon came back.",
          "In A: `df -h` and `free -h`. Write the root fill % in `/opt/field/notes.txt`.",
          "In A: `journalctl -u ssh -n 20`. Confirm the restart is in the log.",
        ],
        "Do this",
      ),
      h2("Mindset"),
      ul([
        "Restart ≠ stop. Stop is how you strand yourself.",
        "A full disk will make SSH hang on login (cannot write lastlog, journal, docker). Check `df -h` before you rebuild a VLAN.",
      ]),
      note("If you did stop SSH and lost the session, that is what the hypervisor console is for. Start the unit from there. Then snapshot again."),
    ],
  },
];
