export type FieldCmd = { command: string; why: string };

/** Twenty commands from Parts 3–5. Keep in sync with the printed card. */
export const FIELD_CARD: FieldCmd[] = [
  { command: "ip -br a", why: "Every NIC, state, address. show ip int brief." },
  { command: "ip link set DEV up", why: "Admin-up. Does not plug the cable." },
  { command: "ip addr add 10.10.20.10/24 dev DEV", why: "Temporary static. Dies on reboot." },
  { command: "ip r", why: "Default route. Missing = no internet." },
  { command: "sudo ip route add default via GW", why: "Install a gateway now." },
  { command: "resolvectl status", why: "Real DNS on Ubuntu 24.04, not a stub file." },
  { command: "dig +short HOST @1.1.1.1", why: "Bypass local DNS. Isolate the resolver." },
  { command: "ping -c 3 8.8.8.8", why: "Path without DNS. Always `-c`." },
  { command: "traceroute -n 8.8.8.8", why: "Where the path dies. `-n` skips DNS." },
  { command: "curl -I https://example.com", why: "DNS + TCP + TLS in one shot." },
  { command: "sudo ss -tulpn", why: "Who is listening. sudo for process names." },
  { command: "sudo ufw status verbose", why: "Host firewall. Don’t disable blindly." },
  {
    command: "sudo tcpdump -i any -n port 67 or port 68",
    why: "DHCP discover/offer. 15 seconds, then stop.",
  },
  { command: "ssh -v user@host", why: "Verbose SSH. See key vs password vs hang." },
  { command: "scp user@host:/path/file .", why: "Pull a log off the box." },
  { command: "journalctl -u ssh -n 50", why: "Why SSH failed. Units, not /var/log hunting." },
  { command: "docker ps -a", why: "Running and exited. Exited is the ticket." },
  { command: "docker logs --tail 100 NAME", why: "Last 100 lines. Enough." },
  { command: "docker restart NAME", why: "Bounce the app. Not docker rm." },
  { command: "df -h", why: "Disk full kills recording, SSH, and Docker." },
];
