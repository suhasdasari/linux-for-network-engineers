import {
  cmd,
  h2,
  note,
  ol,
  p,
  steps,
  table,
  ul,
  warn,
  type HandbookPage,
} from "./types";

export const part5: HandbookPage[] = [
  {
    slug: "closet",
    part: "5",
    num: "25",
    title: "What lives in the closet",
    summary: "Edge PC + PoE switch + cameras. You already know two of those.",
    core: true,
    blocks: [
      p(
        "A field appliance site is not a data center. It is a wall-mounted switch, a small PC (the **edge box**), cameras on PoE, and a messy cable tree. Linux lives on the PC. Everything else is still a switch problem until proven otherwise.",
      ),
      table(
        ["Piece", "Job", "Your Linux surface"],
        [
          ["PoE switch", "Power + VLAN + uplink", "Almost none. CLI of the switch."],
          ["Cameras", "Image, DHCP/static, maybe ONVIF", "Ping / DHCP / ARP from the box"],
          ["Edge PC / NVR / AI box", "Record, infer, dashboard", "This whole handbook"],
          ["Jump / OOB", "Reach the PC when the LAN is sad", "Part 4"],
        ],
      ),
      h2("Names you will hear"),
      ul([
        "**NVR** — network video recorder. Disk is the product.",
        "**Edge box** — PC in the closet, often with a GPU, often running Docker.",
        "**SafelyYou-class appliance** — a vendor image on that PC. You do not get a fake UI in this book. You get Linux.",
        "**FloorKit field edition** — this handbook. Closet work, not RHCE.",
      ]),
      note(
        "If the ticket says “no video”, start on the next page. Do not open NVIDIA docs first.",
      ),
    ],
  },
  {
    slug: "no-video",
    part: "5",
    num: "26",
    title: "Order of checks when “no video”",
    summary: "Cable → PoE/VLAN → camera IP → box NIC → route/DNS → process/docker → GPU last.",
    core: true,
    blocks: [
      p(
        "This order exists so you do not restart Docker on a camera that has no PoE. Walk it in sequence. Stop at the first fail.",
      ),
      ol([
        "**Cable** — patch both ends. Swap a known-good. Look at the switch link light.",
        "**Switch PoE / VLAN** — `show power inline`, `show int status`, correct access VLAN. Amber/off is the switch. Say so.",
        "**Camera DHCP/IP** — MAC on the switch CAM table, DHCP lease, ping from the box.",
        "**Box NIC** — `ip -br a`. The interface that faces cameras is UP with an address on *that* VLAN.",
        "**Route / DNS** — default route if the dashboard is in the cloud; DNS if the URL is a name.",
        "**Process / Docker** — `docker ps`, `docker logs --tail 100`. Exited containers do not record.",
        "**GPU only if the logs say so** — `nvidia-smi`. Missing driver is a log line, not a vibe.",
      ]),
      table(
        ["Fail here", "You do not"],
        [
          ["No link / no PoE", "Touch Linux"],
          ["Camera has no IP", "Restart the AI container"],
          ["Box NIC down", "Blame the vendor cloud"],
          ["Container exited", "Reseat the GPU"],
          ["nvidia-smi error + logs mention CUDA", "Rewrite netplan"],
        ],
      ),
      warn(
        "Skipping to GPU is how a four-minute fault becomes a four-hour RMA. The logs will mention the GPU when it is the GPU.",
      ),
    ],
  },
  {
    slug: "docker-field",
    part: "5",
    num: "27",
    title: "Docker field kit",
    summary: "ps, logs --tail 100, restart NAME. No compose architecture.",
    core: true,
    blocks: [
      p(
        "You are not becoming a platform engineer. You need three verbs to bring a closet app back: list, read, restart.",
      ),
      cmd(
        "docker ps",
        "Running containers. Empty = nothing is serving. Look at STATUS and PORTS.",
      ),
      cmd(
        "docker ps -a",
        "Includes exited. `Exited (1)` is the actual ticket. Name the container; do not guess.",
      ),
      cmd(
        "docker logs --tail 100 NAME",
        "Last 100 lines. Enough for disk-full, crash-loop, bad env, bind error. Do not dump 50k lines into chat.",
      ),
      cmd(
        "docker restart NAME",
        "Bounce that container. Same as `systemctl restart` for people who shipped a tarball of containers.",
      ),
      cmd(
        "docker inspect -f '{{.State.Status}} {{.RestartCount}}' NAME",
        "Status plus how many times it has already restarted. A climbing count is a crash loop, not a fluke.",
      ),
      h2("What you skip on purpose"),
      ul([
        "Writing `docker-compose.yml` from scratch.",
        "`docker network create` architecture debates.",
        "Building images on the closet PC.",
        "Kubernetes. If they have k8s, this is no longer a field-Linux ticket.",
      ]),
      note(
        "Need sudo? Either you are in group `docker` or you prefix `sudo`. `permission denied docker.sock` is groups, not the daemon being dead. Check `systemctl status docker` only after that.",
      ),
      warn(
        "`docker restart` is not `docker rm`. Do not remove containers on a vendor appliance unless the runbook says so. You may have just deleted the only copy of the app."),
    ],
  },
  {
    slug: "nvidia",
    part: "5",
    num: "28",
    title: "NVIDIA one-liner",
    summary: "If nvidia-smi is missing or errors, reseat / power. You are not a CUDA engineer.",
    core: true,
    blocks: [
      cmd(
        "nvidia-smi",
        "The whole GPU conversation for field work. Driver, board, memory, running processes. One command.",
      ),
      p("How to read it without becoming NVIDIA support:"),
      ul([
        "Command not found — driver not installed, or you are on a CPU-only box. Check the ticket. Do not compile CUDA.",
        "Error / “could not communicate with NVIDIA driver” — driver vs kernel mismatch, or the card fell out of the slot in a vibrating closet.",
        "Works, 0% GPU, but logs scream CUDA — then it is the container (wrong image / no `--gpus`). Still not you writing CUDA.",
        "Works, 100% memory, processes listed — the app is using the card. GPU is probably fine.",
      ]),
      h2("Field actions that are allowed"),
      ul([
        "Power cycle the PC (after you confirm it is not recording something irreplaceable).",
        "Reseat the GPU and power cables. Dust. A card that walked out of the PCIe slot is real.",
        "Reboot once. Not five times.",
        "Paste `nvidia-smi` and the last 50 docker log lines to whoever owns the image.",
      ]),
      warn(
        "Do not `apt install` random NVIDIA drivers on a vendor image. You will desync kernel modules and own the outage. Driver changes are a runbook or an RMA."),
      note(
        "No GPU in `lspci | grep -i nvidia` means you are troubleshooting a CPU box. Stop saying GPU."),
    ],
  },
  {
    slug: "disk-full",
    part: "5",
    num: "29",
    title: "Disk full kills recording",
    summary: "df -h before anything clever. 100% is an app failure, not a mystery.",
    core: true,
    blocks: [
      cmd(
        "df -h",
        "Every mount, human sizes. Look at `/` and the recording volume (often `/data`, `/var/lib`, or a second disk).",
      ),
      cmd(
        "df -i",
        "Inodes. A million tiny files can fill inodes while `df -h` still looks fine. Rare, real on log-spam boxes.",
      ),
      cmd(
        "sudo du -xh / --max-depth=2 | sort -h | tail",
        "Where the bytes went. Stop at `--max-depth` so you do not walk a 20 TB volume in the ticket window.",
      ),
      cmd(
        "lsblk",
        "Did the data disk unmount? A missing mount looks like “recordings vanished” and `df` showing only `/`.",
      ),
      h2("Safe cleanup (lab / when runbook allows)"),
      ul([
        "Old journal: `sudo journalctl --vacuum-time=7d`",
        "Exited container logs: `docker logs` then ask before `truncate`",
        "Left-behind pcaps in `/tmp`",
      ]),
      warn(
        "Deleting files under a vendor recording directory without a runbook is how you delete evidence. Fill the ticket with `df -h` and `du`, then get a yes.",
      ),
      note(
        "A disk at 100% will also break SSH (lastlog), apt, and docker pulls. It presents as “network is down”. It is not.",
      ),
    ],
  },
  {
    slug: "lab-nginx",
    part: "5",
    num: "5L",
    title: "Lab: nginx in Docker",
    summary: "Run it, curl localhost, read logs, restart. The whole field kit.",
    core: true,
    blocks: [
      p("Snapshot `before-docker`. Install Docker once on the VM, then forget the installer."),
      cmd(
        "sudo apt update && sudo apt install -y docker.io",
        "Ubuntu’s package is enough for this lab. You do not need Docker Desktop.",
      ),
      cmd(
        "sudo usermod -aG docker $USER",
        "Then log out of SSH and back in so `docker ps` works without sudo.",
      ),
      steps(
        [
          "`docker run -d --name web -p 8080:80 nginx`",
          "`docker ps` — STATUS should be Up, PORTS should include `8080->80`.",
          "`curl -I http://127.0.0.1:8080` — you want HTTP 200 or 301.",
          "`docker logs --tail 100 web` — you should see the curl.",
          "`docker restart web` then `curl -I` again.",
          "`docker stop web` — `curl` should fail. `docker start web` brings it back.",
        ],
        "The kit",
      ),
      note(
        "If `docker run` fails with no space, that is page 29, not Docker being “hard”. `df -h` first.",
      ),
    ],
  },
];
