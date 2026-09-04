import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrivyClient } from "@privy-io/server-auth";

const FALLBACK_APP_ID = "cmtmeg40z00yt0cjuzdfy766b";

function loadPrivySecrets() {
  const appId =
    process.env.PRIVY_APP_ID || process.env.VITE_PRIVY_APP_ID || FALLBACK_APP_ID;
  let appSecret = process.env.PRIVY_APP_SECRET || "";
  if (!appSecret) {
    try {
      const raw = readFileSync(join(process.cwd(), ".grok/app-env.json"), "utf8");
      const json = JSON.parse(raw) as { PRIVY_APP_SECRET?: string; VITE_PRIVY_APP_ID?: string };
      if (typeof json.PRIVY_APP_SECRET === "string") appSecret = json.PRIVY_APP_SECRET;
    } catch {
      /* deployed apps inject PRIVY_APP_SECRET */
    }
  }
  return { appId, appSecret };
}

let client: PrivyClient | null = null;

function getPrivyClient() {
  if (client) return client;
  const { appId, appSecret } = loadPrivySecrets();
  if (!appSecret) {
    throw new Error("PRIVY_APP_SECRET is not set");
  }
  client = new PrivyClient(appId, appSecret);
  return client;
}

export async function verifyPrivyAccessToken(token: string): Promise<string> {
  if (!token) throw new Error("Unauthorized");
  const claims = await getPrivyClient().verifyAuthToken(token);
  if (!claims.userId) throw new Error("Unauthorized");
  return claims.userId;
}
