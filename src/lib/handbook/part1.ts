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

export const part1: HandbookPage[] = [
  {
    slug: "shell",
    part: "1",
    num: "1",
    title: "Shell",
    summary: "pwd ls cd cat less head tail nano clear history",
    core: true,
    blocks: [
      p(
        "The shell is just a CLI. Same job as the switch prompt, different verbs. You are always in a directory, talking to one user, and the last command is in history.",
      ),
      cmd("pwd", "Print working directory — the folder every relative path is about to hit."),
      cmd("ls", "List names. On a switch you would `dir`; here you `ls`."),
      cmd("ls -la", "`-l` long format, `-a` includes dotfiles. You want both when something is “missing”."),
      cmd("cd /tmp", "Change directory. Absolute path, no surprises."),
      cmd("cd ~", "Home directory of the current user. Same as `cd` with no args."),
      cmd("cd -", "Jump back to the previous directory. Cheap undo for a wrong `cd`."),
      cmd("cat /etc/hostname", "Dump a small file to the screen. Bad for big logs."),
      cmd("less /var/log/syslog", "Page a file. `q` quit, `/` search, `G` end. Use this on logs."),
      cmd("head -n 20 /etc/passwd", "First 20 lines. Fast sniff of a config."),
      cmd("tail -n 20 /var/log/syslog", "Last 20 lines. The failure is usually at the bottom."),
      cmd("tail -f /var/log/syslog", "Follow as it grows. Ctrl-C to stop. Live log without journalctl."),
      cmd("nano /tmp/note.txt", "The editor that does not require a training course. Ctrl-O save, Ctrl-X exit."),
      cmd("clear", "Wipe the screen. Does not wipe history."),
      cmd("history", "Every command you typed. Numbered. Your future `!number` cheat sheet."),
      note(
        "`Ctrl-C` kills the running command. `Ctrl-D` sends EOF / logs out of a shell. Do not mix them up on a jump box.",
      ),
    ],
  },
  {
    slug: "files",
    part: "1",
    num: "2",
    title: "Files and paths",
    summary: "/ is the root. ~ is home. . is here. .. is parent.",
    core: true,
    blocks: [
      p(
        "Linux has one tree. There is no `C:`. Everything hangs off `/`. Network gear hid this behind `flash:` and `bootflash:` — same idea, one namespace.",
      ),
      table(
        ["Token", "Means", "Example"],
        [
          ["`/`", "Root of the filesystem", "`/etc/netplan`"],
          ["`~`", "Your home", "`~/.ssh/authorized_keys`"],
          ["`.`", "This directory", "`ls .`"],
          ["`..`", "Parent", "`cd ..`"],
          ["`/tmp`", "World-writable scratch. Reboot may wipe it.", "`/tmp/capture.pcap`"],
          ["`/opt`", "Add-on software. Closet apps love this.", "`/opt/field/notes.txt`"],
          ["`/var/log`", "Logs", "`/var/log/syslog`"],
          ["`/etc`", "Config. Treat like `running-config`.", "`/etc/netplan`"],
        ],
      ),
      cmd("ls /", "See the top of the tree once so `/etc` vs `/var` stops feeling random."),
      cmd("readlink -f .", "Resolves `.` and `..` into a full path. Handy after a chain of `cd`."),
      cmd(
        "ls -ld /opt /tmp /home",
        "Directory itself, not its contents. You want this when permissions look weird.",
      ),
      note(
        "Tab completion is not optional. Type `cd /et` and hit Tab. If you are hunting with arrows, you are wasting the lab.",
      ),
      warn(
        "A path that starts with `/` is absolute. A path that does not is relative to `pwd`. Most “file not found” bugs are a missing leading slash."),
    ],
  },
  {
    slug: "permissions",
    part: "1",
    num: "3",
    title: "Permissions",
    summary: "ls -l, chmod, chown. Enough to not panic. Not a CISSP.",
    core: true,
    blocks: [
      p(
        "Every file has an owner, a group, and a mode. If a service cannot read its config, it is usually this — not “the network”.",
      ),
      cmd(
        "ls -l /etc/hostname",
        "Left column is the mode: type + rwx for user, group, other.",
      ),
      p(
        "`-rw-r--r--` means a file, owner can read/write, group and other can read. That is **644**. A directory that is `drwxr-xr-x` is **755**.",
      ),
      table(
        ["Digit", "Meaning"],
        [
          ["4", "read (`r`)"],
          ["2", "write (`w`)"],
          ["1", "execute (`x`) — enter a directory, or run a binary"],
        ],
      ),
      cmd(
        "chmod 644 /opt/field/notes.txt",
        "Owner rw, everyone else r. Normal for a text file you want to read later.",
      ),
      cmd(
        "chmod 755 /opt/field",
        "Owner rwx, others rx. Normal for a directory people must enter.",
      ),
      cmd(
        "chmod 600 ~/.ssh/authorized_keys",
        "SSH will refuse keys if this file is group- or world-readable.",
      ),
      cmd(
        "sudo chown $USER:$USER /opt/field/notes.txt",
        "Fixes “I created it with sudo and now I cannot edit it”.",
      ),
      note(
        "Execute on a directory means “can `cd` into it”. A 644 directory is a trap — you can see the name and still bounce off it.",
      ),
      warn(
        "`chmod 777` is not a fix. It is a confession that you did not look at owner/group. Do not do it on a camera box."),
    ],
  },
  {
    slug: "users",
    part: "1",
    num: "4",
    title: "Users and sudo",
    summary: "Named user. sudo for privileged work. Root is a last resort.",
    core: true,
    blocks: [
      cmd("whoami", "The account this shell is acting as. Check before you `rm`."),
      cmd("id", "uid, gid, groups. `sudo` / `adm` / `docker` membership shows up here."),
      cmd("sudo whoami", "If this prints `root`, sudo works. If it asks a password, type yours, not root’s."),
      cmd(
        "sudo -i",
        "Root shell. Use it for a burst of work, then `exit`. Do not live here.",
      ),
      cmd(
        "sudo adduser fieldtech",
        "Creates a human account with a home directory. Prefer this over `useradd` until you care.",
      ),
      cmd(
        "sudo usermod -aG sudo fieldtech",
        "`-a` append, `-G` group. Without `-a` you wipe their other groups. That is a bad day.",
      ),
      h2("Password vs key"),
      p(
        "Lab: password is fine. Closet box: key in `~/.ssh/authorized_keys` for the named user. Part 4 covers the actual SSH."),
      warn(
        "`sudo su` and `sudo -i` both get you root. They do not fix a broken sudoers file. If sudo stops working, you need console, not more SSH windows.",
      ),
    ],
  },
  {
    slug: "finding",
    part: "1",
    num: "5",
    title: "Finding things",
    summary: "which, man, apropos, --help. The box documents itself.",
    core: true,
    blocks: [
      cmd(
        "which ip",
        "Where the binary is. If this is empty, the package is not installed or PATH is wrong.",
      ),
      cmd(
        "command -v docker",
        "Safer than `which` in scripts. Empty output means Docker is not on this box.",
      ),
      cmd(
        "ip --help",
        "Short usage. Almost every network binary answers `--help` faster than a man page.",
      ),
      cmd(
        "man ip",
        "The manual. `q` to quit. `man ip-route` and `man ip-address` are the useful subpages.",
      ),
      cmd(
        "apropos netplan",
        "Search man page names and blurbs. Use it when you remember the job, not the command.",
      ),
      cmd(
        "type ls",
        "Tells you if `ls` is a binary, alias, or function. Aliases are why `ls` looks colored.",
      ),
      note(
        "On a broken box, `man` may be missing. `--help` still works. That is the field order: `--help`, then man, then the web.",
      ),
    ],
  },
  {
    slug: "copy-move-delete",
    part: "1",
    num: "6",
    title: "Copy, move, delete",
    summary: "cp mv rm mkdir. Never rm -rf /.",
    core: true,
    blocks: [
      cmd("mkdir -p /opt/field", "`-p` creates parents and does not complain if it exists. Always use it."),
      cmd(
        "cp /etc/netplan/01-netcfg.yaml /tmp/01-netcfg.yaml.bak",
        "Copy before you edit. This is `copy run start` for people with no TFTP.",
      ),
      cmd(
        "mv /tmp/notes.txt /opt/field/notes.txt",
        "Move / rename. Same inode dance as renaming a VLAN SVI description, except it can clobber a target.",
      ),
      cmd(
        "rm /tmp/old.pcap",
        "Delete one file. No recycle bin. Snapshots are your recycle bin.",
      ),
      cmd(
        "rmdir /opt/empty",
        "Removes a directory only if it is empty. Prefer this when you are unsure.",
      ),
      warn(
        "Never run `rm -rf /` or `rm -rf /*`. Never tab-complete a destroy path while tired. There is no “undelete” on an appliance disk.",
      ),
      p(
        "If you must recursively delete, type the full path twice with your eyes. Then snapshot. Then run it.",
      ),
      cmd(
        "rm -i /opt/field/notes.txt",
        "`-i` asks. Use it until muscle memory is trustworthy.",
      ),
    ],
  },
  {
    slug: "lab-notes",
    part: "1",
    num: "1L",
    title: "Lab: /opt/field/notes.txt",
    summary: "Create the file, mode 644, read it with less.",
    core: true,
    blocks: [
      p("Snapshot first. Then do this without looking back, if you can."),
      steps([
        "`sudo mkdir -p /opt/field`",
        "`sudo chown $USER:$USER /opt/field`",
        "`nano /opt/field/notes.txt` — write today’s date, hostname, and the VM IP.",
        "`chmod 644 /opt/field/notes.txt`",
        "`ls -l /opt/field/notes.txt` — you want `-rw-r--r--`.",
        "`less /opt/field/notes.txt` — `q` to quit.",
      ]),
      cmd(
        "ls -l /opt/field/notes.txt",
        "Pass condition: owned by you, 644, readable with less.",
      ),
      note("If `nano` is missing: `sudo apt install -y nano`. Then try again."),
    ],
  },
];
