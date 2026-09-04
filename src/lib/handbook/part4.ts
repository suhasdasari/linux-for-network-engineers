import {
  cmd,
  h2,
  note,
  p,
  pre,
  steps,
  table,
  ul,
  warn,
  type HandbookPage,
} from "./types";

export const part4: HandbookPage[] = [
  {
    slug: "ssh-keys",
    part: "4",
    num: "21",
    title: "SSH: keys vs password",
    summary: "ssh user@host, -v, authorized_keys. How you actually get on the box.",
    blocks: [
      cmd(
        "ssh fieldtech@10.10.20.10",
        "Default port 22, password or key depending on the server. First connect asks to trust the host key — that is expected.",
      ),
      cmd(
        "ssh -v fieldtech@10.10.20.10",
        "Verbose. You will see which key files are tried, and whether the server offers password. This is the “it just hangs” microscope.",
      ),
      cmd(
        "ssh -i ~/.ssh/closet.pem ubuntu@10.10.20.10",
        "Force a specific private key. Cloud images almost always need this.",
      ),
      h2("Keys on the host (your laptop)"),
      cmd(
        "ssh-keygen -t ed25519 -f ~/.ssh/closet -C field",
        "Creates a key pair. Empty passphrase is lab-only. Protect the private file (600).",
      ),
      cmd(
        "ssh-copy-id -i ~/.ssh/closet.pub fieldtech@10.10.20.10",
        "Installs the public key on the box. Lab shortcut. On a broken box you paste by hand.",
      ),
      h2("On the box"),
      pre(
        "mkdir -p ~/.ssh\nchmod 700 ~/.ssh\nnano ~/.ssh/authorized_keys\nchmod 600 ~/.ssh/authorized_keys",
        "One public key per line. Wrong mode = OpenSSH ignores the file and you think “keys don’t work”.",
      ),
      table(
        ["Symptom", "Look at"],
        [
          ["Permission denied (publickey)", "Wrong user, wrong key, or 600/700 modes"],
          ["Connection refused", "sshd not listening, or SG/ufw, or wrong IP"],
          ["Timed out", "Path, VLAN, default route, or 22 blocked upstream"],
          ["Host key changed", "You rebuilt the VM. Remove the old line in `~/.ssh/known_hosts`"],
        ],
      ),
      warn(
        "Never copy a private key onto the appliance. Public key goes in `authorized_keys`. Private stays on your laptop / jump box.",
      ),
    ],
  },
  {
    slug: "aws-ssm",
    part: "4",
    num: "22",
    title: "What AWS SSM is",
    summary: "Jump without opening 22 to the internet. Concept, not an AWS cert.",
    blocks: [
      p(
        "**AWS Systems Manager Session Manager** is a broker. An agent on the box (`amazon-ssm-agent`) opens an **outbound** HTTPS session to AWS. You start a shell in the AWS console or CLI. No inbound port 22. No bastion public IP.",
      ),
      h2("Why field teams use it"),
      ul([
        "The appliance is in a customer LAN or a VPC with no public SSH.",
        "Security will not open 22 to `0.0.0.0/0`. Good.",
        "You still need a shell when the private IP is unreachable from your laptop.",
      ]),
      h2("What has to be true"),
      ul([
        "The instance (or hybrid instance) has the SSM agent running.",
        "The instance profile / IAM allows `ssmmessages` + `ssm` endpoints.",
        "The box can reach those endpoints — public internet, NAT, or VPC endpoints. **Outbound 443**, not inbound 22.",
        "Your IAM user/role can start a session.",
      ]),
      h2("What it is not"),
      ul([
        "Not a replacement for a serial console if the OS is not booting.",
        "Not magic through a NIC that is down. Agent needs a route.",
        "Not “AWS is the network”. If the camera VLAN is wrong, SSM will still let you onto the box so you can *see* that.",
      ]),
      cmd(
        "sudo systemctl status amazon-ssm-agent",
        "On an Amazon image this unit should be active. Missing = you are not going to SSM your way in.",
      ),
      note(
        "Other clouds have the same shape: Azure Serial Console / Run Command, GCP OS Login / IAP. The idea is identical — out-of-band or brokered shell, not a public 22.",
      ),
    ],
  },
  {
    slug: "jump-box",
    part: "4",
    num: "23",
    title: "Jump box / out-of-band",
    summary: "When the LAN is dead, how you still reach the appliance.",
    blocks: [
      p(
        "Production closets fail in a way labs do not: the data VLAN dies and you still have to get on the NVR. Plan the path **before** that day.",
      ),
      h2("Paths, in the order you try them"),
      table(
        ["Path", "Needs", "Dead when"],
        [
          ["SSH to appliance IP", "L3 on the camera/data VLAN", "VLAN, DHCP, default route, ufw"],
          ["SSH via jump box", "Jump reachable, jump can reach appliance", "Jump is on the same dead LAN"],
          ["SSM / cloud broker", "Agent + outbound 443", "NIC down, no DNS, no NAT"],
          ["BMC (iDRAC / iLO / IPMI)", "Dedicated Mgmt port", "Mgmt switch / cable"],
          ["Hypervisor console", "vSphere / Proxmox / UTM window", "Host is down"],
          ["Serial / KVM / crash cart", "Physical", "You are not in the building"],
        ],
      ),
      h2("Jump box rules that keep you honest"),
      ul([
        "Jump lives on a **management** VLAN, not the camera VLAN.",
        "Keys, not shared passwords in a group chat.",
        "The jump can `ssh` to the appliance; your laptop only `ssh`s to the jump.",
        "`ProxyJump` is the modern `ProxyCommand`. One line in `~/.ssh/config`.",
      ]),
      pre(
        `Host closet-nvr
  HostName 10.10.20.10
  User fieldtech
  ProxyJump jump@10.0.0.10`,
        "From your laptop: `ssh closet-nvr`. You never VPN all the way into the camera subnet if the jump is enough.",
      ),
      warn(
        "A jump box on the same dying access VLAN is not out-of-band. If both NICs sit in VLAN 40, you built a second hostage, not a lifeboat.",
      ),
    ],
  },
  {
    slug: "scp-sftp",
    part: "4",
    num: "24",
    title: "scp / sftp a log off the box",
    summary: "Get the file out. Do not paste 4 000 journal lines into Slack.",
    blocks: [
      cmd(
        "scp fieldtech@10.10.20.10:/opt/field/notes.txt .",
        "Pull a file to the current directory on your laptop. Colon separates host and path.",
      ),
      cmd(
        "scp /tmp/dhcp.pcap fieldtech@10.10.20.10:/tmp/",
        "Push a file to the box. Rare. Usually you are pulling logs out, not in.",
      ),
      cmd(
        "scp -r fieldtech@10.10.20.10:/var/log/nginx /tmp/nginx-logs",
        "Recursive copy. Heavy. Prefer a single `journalctl` export.",
      ),
      cmd(
        "ssh fieldtech@10.10.20.10 'journalctl -u docker -n 200 --no-pager' > docker.txt",
        "Runs the command remote, writes local. Best way to extract logs.",
      ),
      cmd(
        "sftp fieldtech@10.10.20.10",
        "Interactive. `ls`, `cd`, `get file`. Useful when you do not remember the exact path.",
      ),
      note(
        "`scp` uses SSH. If SSH is broken, scp is broken. Then you need the jump / SSM / console and a paste of the last 50 journal lines, nothing more.",
      ),
      warn(
        "Do not scp `/var/log` whole off a recording node. It can be huge. Filter first (`journalctl --since today`). Disk and patience are both finite.",
      ),
    ],
  },
  {
    slug: "lab-ssh-remote",
    part: "4",
    num: "4L",
    title: "Lab: SSH from host, fail a key, read the log",
    summary: "One good login, one failed key, journalctl -u ssh.",
    blocks: [
      steps(
        [
          "From the host: `ssh -v youruser@<vm-ip>` and log in.",
          "From the host: `ssh -i /dev/null youruser@<vm-ip>` (or a bogus key). Confirm it fails.",
          "On the VM: `journalctl -u ssh -n 50`. Find the failed attempt.",
          "Install a real key with `ssh-copy-id` (lab) and login without a password.",
          "Optional: from a second terminal, `ssh -v` and watch which key wins.",
        ],
        "Do this",
      ),
      note("Pass condition: you can point at the journal line that matches the failed login, and you know whether the server asked for a key, a password, or both."),
    ],
  },
];
