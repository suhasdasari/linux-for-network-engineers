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

export const part3: HandbookPage[] = [
  {
    slug: "interfaces",
    part: "3",
    num: "11",
    title: "Interfaces",
    summary: "ip a, ip -br a, ip link. See the NICs before you touch them.",
    core: true,
    blocks: [
      p(
        "Forget `ifconfig` unless a vendor script forces it. The modern CLI is `ip` from iproute2. Same family as `ip route` and `ip neigh`.",
      ),
      cmd(
        "ip -br a",
        "One line per NIC: name, state, addresses. This is `show ip int brief` for Linux.",
      ),
      cmd(
        "ip a",
        "The long form: MAC, MTU, every address including IPv6 link-local. Use it when `-br` is not enough.",
      ),
      cmd(
        "ip link",
        "Layer-2 view: UP/DOWN, MAC, MTU, qdisc. No addresses. Use it when you care about the link, not the IP.",
      ),
      cmd(
        "ip -br link",
        "Brief link state. Fast way to see which NICs exist after a reboot renamed them.",
      ),
      table(
        ["Name", "Usually"],
        [
          ["`lo`", "Loopback. Always there. 127.0.0.1."],
          ["`eth0`", "Old-style first NIC. Still common on some appliances."],
          ["`ens18` / `enp0s3`", "systemd predictable names (slot/PCI). Ubuntu default."],
          ["`enx<mac>`", "USB NICs. The MAC is in the name."],
          ["`wlan0`", "Wi-Fi. Rare on closet NVRs, common on jump laptops."],
        ],
      ),
      note(
        "The name on the ticket (`eth0`) may not match the name on the box (`ens18`). Always `ip -br a` first. Do not copy a lab command that says `eth0` blindly.",
      ),
    ],
  },
  {
    slug: "link-up-down",
    part: "3",
    num: "12",
    title: "Bring up / down",
    summary: "ip link set DEV up. Admin state is not cable state.",
    core: true,
    blocks: [
      cmd(
        "ip link set ens18 up",
        "Admin-up the NIC. Equivalent to `no shutdown`. Does not magically plug the cable.",
      ),
      cmd(
        "ip link set ens18 down",
        "Admin-down. The process and the address may still be configured. The link is not.",
      ),
      cmd(
        "ip link show ens18",
        "Look for `UP` vs `DOWN`, and `LOWER_UP` (carrier). `UP` without `LOWER_UP` means no cable / no PoE / SFP dark.",
      ),
      p(
        "On a switch you already split admin down vs protocol down. Same split here: `ip link set down` is you; missing `LOWER_UP` is the physical plant.",
      ),
      warn(
        "Do not `ip link set down` the NIC you are SSHed through. You will need console. Lab: use the second NIC or the hypervisor console."),
      note(
        "These `ip` changes die on reboot. Persist with netplan (page 13 / 34). Temporary is correct while you are hunting."),
    ],
  },
  {
    slug: "addresses",
    part: "3",
    num: "13",
    title: "Addresses: DHCP vs static",
    summary: "ip addr add for now. netplan for keeps. Ubuntu 24.04.",
    core: true,
    blocks: [
      h2("See what you have"),
      cmd("ip -br a", "Which NIC has a lease or a static. `DOWN` with an address still shows the address."),
      cmd(
        "ip addr show ens18",
        "Full view including `dynamic` (DHCP) vs not. Scope global is the one you route with.",
      ),
      h2("Temporary (dies on reboot)"),
      cmd(
        "sudo ip addr add 10.10.20.10/24 dev ens18",
        "Puts a static on the NIC right now. Does not add a route. Does not write netplan.",
      ),
      cmd(
        "sudo ip addr del 10.10.20.10/24 dev ens18",
        "Removes that address only. Other addresses on the NIC stay.",
      ),
      h2("DHCP right now"),
      cmd(
        "sudo dhclient -v ens18",
        "Asks for a lease in the foreground (`-v`). Use when you suspect the server, not the NIC.",
      ),
      note(
        "Ubuntu 24.04 often uses `systemd-networkd` + netplan, not a long-lived `dhclient`. If `dhclient` is missing, use the netplan DHCP stanza and `netplan apply`.",
      ),
      h2("Persistent: netplan (Ubuntu)"),
      p("Files live in `/etc/netplan/*.yaml`. YAML is indent-sensitive. Tabs will ruin your afternoon."),
      pre(
        `network:
  version: 2
  ethernets:
    ens18:
      addresses:
        - 10.10.20.10/24
      routes:
        - to: default
          via: 10.10.20.1
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]`,
        "Replace ens18 and the prefix with the closet VLAN. This is static + default route + DNS in one file.",
      ),
      cmd(
        "sudo netplan try",
        "Applies, then waits for you to confirm. If SSH dies, it rolls back. Prefer this over `apply` on a remote box.",
      ),
      cmd(
        "sudo netplan apply",
        "Makes it permanent. No automatic rollback. Use when you are on console or already sure.",
      ),
      cmd(
        "sudo cat /etc/netplan/*.yaml",
        "Read before you write. There may be a cloud-init file fighting you.",
      ),
      warn(
        "Two netplan files both claiming `ens18` will fight. `renderer` mismatches (`NetworkManager` vs `networkd`) also fight. Change one file, comment the other."),
    ],
  },
  {
    slug: "routes",
    part: "3",
    num: "14",
    title: "Routes",
    summary: "ip r. No default route = no internet. Same as a missing 0.0.0.0/0.",
    core: true,
    blocks: [
      cmd(
        "ip r",
        "The routing table. You are looking for `default via …`. This is `show ip route`.",
      ),
      cmd("ip route show", "Same table, long flag. `ip r` is the alias you will type forever."),
      cmd(
        "ip route get 1.1.1.1",
        "What the kernel would do with that packet: out-NIC, source, gateway. Instant “is there a path” check.",
      ),
      cmd(
        "sudo ip route add default via 10.10.20.1",
        "Install a default gateway now. Fails if the GW is not on a connected subnet — add the address first.",
      ),
      cmd(
        "sudo ip route del default",
        "Breaks the internet on purpose for the lab. Your LAN IPs still ping.",
        true,
      ),
      cmd(
        "sudo ip route add 10.64.0.0/24 via 10.10.20.1",
        "A specific route. Cameras on another VLAN often need one of these, or a proper router.",
      ),
      p(
        "**No default route means no internet**, even if the NIC has an IP and the switch is happy. DNS will also look “broken” because the resolver is off-box.",
      ),
      table(
        ["You can ping", "You cannot", "Usually"],
        [
          ["Same subnet IP", "Gateway", "Wrong mask or NIC not on that L2"],
          ["Gateway", "8.8.8.8", "No default route, or upstream is filtering"],
          ["8.8.8.8", "by name", "DNS, not routing — next page"],
        ],
      ),
      note("Default route in netplan is the `routes: - to: default via:` stanza, not a separate `gateway4:` (that old key is deprecated on 24.04)."),
    ],
  },
  {
    slug: "dns",
    part: "3",
    num: "15",
    title: "DNS",
    summary: "resolv.conf, resolvectl, dig, getent. Ubuntu stubs to 127.0.0.53.",
    core: true,
    blocks: [
      p(
        "Ubuntu 24.04 runs **systemd-resolved**. `/etc/resolv.conf` is often a stub pointing at `127.0.0.53`. Editing that file by hand is how you lose the next reboot.",
      ),
      cmd(
        "cat /etc/resolv.conf",
        "See whether you are on the stub resolver or a real nameserver list.",
      ),
      cmd(
        "resolvectl status",
        "Per-link DNS, search domain, and whether DNSSEC is in the way. This is the real config.",
      ),
      cmd(
        "dig example.com",
        "Full DNS transaction. You want `status: NOERROR` and an A record. `dig` talks to the resolver in resolv.conf.",
      ),
      cmd(
        "dig +short example.com @1.1.1.1",
        "Bypass local DNS. If this works and the unscoped `dig` fails, your resolver is the fault, not the internet.",
      ),
      cmd(
        "getent hosts example.com",
        "What the OS itself will use (NSS: files, then DNS). Closest to “will curl work”.",
      ),
      cmd(
        "nslookup example.com",
        "Old habit. Fine. `dig` is clearer when you need flags.",
      ),
      pre(
        "sudo resolvectl dns ens18 1.1.1.1 8.8.8.8",
        "Temporary DNS on that link. Persist it in netplan `nameservers:` instead.",
      ),
      warn(
        "A box that pings 8.8.8.8 but cannot `curl https://apt.ubuntu.com` is DNS (or TLS time). Do not rebuild the VLAN."),
    ],
  },
  {
    slug: "test-path",
    part: "3",
    num: "16",
    title: "Test the path",
    summary: "ping, traceroute/mtr, curl -I. Prove L3 then L7.",
    core: true,
    blocks: [
      cmd(
        "ping -c 3 10.10.20.1",
        "Three pings to the gateway. `-c` so it stops. A hanging ping is how you freeze a ticket call.",
      ),
      cmd(
        "ping -c 3 8.8.8.8",
        "Off-subnet. If gateway works and this fails, the problem is north of this box.",
      ),
      cmd(
        "ping -c 3 example.com",
        "Name + ICMP. Failure here after 8.8.8.8 succeeded is DNS, not “the WAN is down”.",
      ),
      cmd(
        "traceroute -n 8.8.8.8",
        "Where the path dies. `-n` skips DNS so a broken resolver does not slow every hop.",
      ),
      cmd(
        "mtr -n 8.8.8.8",
        "Live traceroute + loss. Install `mtr` if missing. This is the WAN conversation with the ISP.",
      ),
      cmd(
        "curl -I https://example.com",
        "HTTP(S) headers only. Proves DNS + TCP + TLS. `000` or hang = path/proxy/firewall, not “the website”.",
      ),
      cmd(
        "curl -4 -I https://example.com",
        "Force IPv4. Use when a broken AAAA record makes happy IPv4 look down.",
      ),
      note(
        "ICMP is often filtered on camera VLANs. A failed ping is not proof the stream path is dead — try `curl -I` or `ss` to the actual port.",
      ),
    ],
  },
  {
    slug: "sockets",
    part: "3",
    num: "17",
    title: "Sockets",
    summary: "ss -tulpn. netstat is the old name. Same question: who is listening.",
    core: true,
    blocks: [
      cmd(
        "ss -tulpn",
        "TCP/UDP, listening, numeric, processes. This is “what ports are open on this box”. sudo to see process names.",
      ),
      cmd(
        "sudo ss -tulpn | grep -E ':22|:80|:443|:53'",
        "The usual suspects. SSH, HTTP, HTTPS, DNS.",
      ),
      cmd(
        "sudo ss -tp",
        "Established TCP plus processes. Use it when “dashboard empty” and you want to see if the app is even connected out.",
      ),
      p(
        "`netstat -tulpn` still works on some images if `net-tools` is installed. `ss` is already there. Learn `ss`.",
      ),
      table(
        ["You wanted", "ss"],
        [
          ["Listening ports", "`ss -tulpn`"],
          ["All TCP including established", "`ss -tp`"],
          ["Unix sockets (docker.sock)", "`ss -xlnp`"],
        ],
      ),
      note(
        "A process bound to `127.0.0.1:8080` is not reachable from the LAN. `0.0.0.0:8080` is. Read the Local Address column."),
    ],
  },
  {
    slug: "firewall",
    part: "3",
    num: "18",
    title: "Firewall on the box",
    summary: "ufw / nft status. Do not disable blindly.",
    core: true,
    blocks: [
      p(
        "The box may filter even when the switch ACL is clean. Ubuntu ships **ufw** as a frontend to nftables. Cloud images may use security groups *and* ufw. Check both stories.",
      ),
      cmd(
        "sudo ufw status verbose",
        "Default policy plus rules. `inactive` means ufw is not the blocker. `active` + missing 22 is how you lock yourself out.",
      ),
      cmd(
        "sudo nft list ruleset",
        "The real kernel rules. ufw, docker, and kube-proxy all land here. Docker in particular inserts chains that surprise people.",
      ),
      cmd(
        "sudo iptables -L -n",
        "Legacy view. On 24.04 it is often an nft compatibility layer. Still what some vendor docs quote.",
      ),
      h2("If you must open something"),
      cmd(
        "sudo ufw allow 22/tcp",
        "SSH. Do this *before* `ufw enable` on a remote box, or have console.",
      ),
      cmd(
        "sudo ufw allow 443/tcp",
        "Dashboard / API. Only if the appliance actually serves 443 here.",
      ),
      warn(
        "Do not `ufw disable` or `nft flush ruleset` on a production closet because “it might be the firewall”. Screenshot `ufw status verbose` first. A disable without a known-good snapshot is how you inherit someone else’s exposed Redis.",
      ),
      note(
        "Cloud: AWS SG / NSG is not ufw. If 22 is closed in the SG, no host command will open it. That is an SSM / console moment (Part 4).",
      ),
    ],
  },
  {
    slug: "tcpdump",
    part: "3",
    num: "19",
    title: "Packet peek",
    summary: "tcpdump for DHCP and DNS. Enough to see the packet, not to write a dissertation.",
    core: true,
    blocks: [
      p(
        "You already think in packets. `tcpdump` is SPAN for the box you are on. Capture short, filter hard, stop. This is not a pentest course — you are verifying DHCP, DNS, and “did the SYN leave”.",
      ),
      cmd(
        "sudo tcpdump -i any -n port 67 or port 68",
        "DHCP. Discover/offer/request/ack. If you see discovers and no offers, the server/relay/VLAN is the problem, not the camera app.",
      ),
      cmd(
        "sudo tcpdump -i any -n port 53",
        "DNS. Queries leaving, answers returning. Silence here plus a failed `dig` means the box never sent it (resolver/route).",
      ),
      cmd(
        "sudo tcpdump -i ens18 -n host 10.10.20.1 and icmp",
        "ICMP to the gateway on one NIC. Confirms the packet left the NIC you think it did.",
      ),
      cmd(
        "sudo tcpdump -i any -n tcp port 22",
        "SSH from the outside. Useful when “I cannot SSH” — do the SYNs even arrive?",
      ),
      cmd(
        "sudo timeout 15 tcpdump -i any -n -c 40 port 67 or port 68",
        "Stops itself. Use `timeout` so you do not leave a capture running on a tiny disk.",
      ),
      note(
        "`-n` skips DNS. `-i any` sees all NICs. Write to a file only when someone asked for a pcap: `-w /tmp/dhcp.pcap` and then pull it with `scp`.",
      ),
      warn(
        "Do not capture on a SPAN of a busy core “to see”. Filter. Disk fills. That is Part 5’s outage."),
    ],
  },
  {
    slug: "faults",
    part: "3",
    num: "20",
    title: "Common faults",
    summary: "A table you will reuse on every ticket. Including “that’s the switch”.",
    core: true,
    blocks: [
      p("Walk top to bottom. Do not skip. The last row is how camera tickets waste an hour."),
      table(
        ["Symptom", "Command", "If that is it"],
        [
          [
            "NIC down (admin)",
            "`ip -br link`",
            "`ip link set DEV up` then persist in netplan",
          ],
          [
            "Link down / no LOWER_UP",
            "`ip link show DEV`",
            "Cable, SFP, switch port shutdown. Not Linux.",
          ],
          [
            "Wrong VLAN / no IP",
            "`ip -br a`",
            "Switch access VLAN / trunk. Or DHCP. Linux cannot guess a VLAN it is not tagged on",
          ],
          [
            "IP but no gateway",
            "`ip r`",
            "Add default via, persist in netplan",
          ],
          [
            "Gateway but no DNS",
            "`ping 8.8.8.8` works, `dig` fails",
            "`resolvectl status`, fix nameservers",
          ],
          [
            "DNS but port blocked",
            "`curl -I` hangs, `ss` / ufw / SG",
            "Host firewall, cloud SG, or upstream ACL — not a missing IP",
          ],
          [
            "Link up, camera dark, no PoE",
            "Switch `show power inline`",
            "**That is the switch.** Linux on the NVR will not light PoE. Say so.",
          ],
        ],
      ),
      h2("The sentence you should say out loud"),
      p(
        "If the camera has no link light, or the switch port is `not providing power`, you are not in Linux yet. Do not restart Docker. Do not “check GPU”. Walk to the closet with a known-good cable.",
      ),
      note("Print this table with the field card in Part 8."),
    ],
  },
  {
    slug: "lab-break-fix",
    part: "3",
    num: "3L",
    title: "Lab: break route, DNS, static IP",
    summary: "Snapshot. Break three things. Fix them from the symptom.",
    core: true,
    blocks: [
      warn("Snapshot `before-break-fix` now. You will strand the VM on purpose."),
      h2("1. Default route"),
      steps([
        "`ip r` — note the default line.",
        "`sudo ip route del default`",
        "`ping -c 2 8.8.8.8` should fail. `ping -c 2 <gateway>` should still work.",
        "Fix: `sudo ip route add default via <gateway>`. Confirm with `ip route get 8.8.8.8`.",
      ]),
      h2("2. DNS"),
      steps([
        "`dig +short example.com` — works.",
        "Temporarily: `sudo resolvectl dns ens18 127.0.0.9` (a black hole).",
        "`ping -c 1 8.8.8.8` works. `dig example.com` fails.",
        "Fix: put a real resolver back (`1.1.1.1`) via `resolvectl` or netplan, then `dig` again.",
      ]),
      h2("3. Wrong static IP"),
      steps([
        "Pick an address **not** on your lab subnet (e.g. `172.31.255.10/24`) and `sudo ip addr add` it, then `sudo ip addr del` the good one.",
        "SSH from the host will die if you are on that NIC. Use the console.",
        "Fix from console: add the correct address, delete the wrong one, `ping` the gateway.",
        "Persist only after it works: netplan, `netplan try`.",
      ]),
      note("Pass condition: you can explain each failure in one sentence without using the word “glitch”."),
    ],
  },
];
