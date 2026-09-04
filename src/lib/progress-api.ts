import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export const loadProgress = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const { verifyPrivyAccessToken } = await import("./privy-verify.server");
    const userId = await verifyPrivyAccessToken(data.token);
    const sql = await getSql();
    const rows = await sql<{ slug: string }>`
      select slug from page_progress where user_id = ${userId} and done = true
    `;
    const done: Record<string, boolean> = {};
    for (const row of rows) done[row.slug] = true;
    return done;
  });

export const setPageDone = createServerFn({ method: "POST" })
  .validator((data: { token: string; slug: string; done: boolean }) => data)
  .handler(async ({ data }) => {
    const { verifyPrivyAccessToken } = await import("./privy-verify.server");
    const userId = await verifyPrivyAccessToken(data.token);
    const sql = await getSql();
    if (data.done) {
      await sql`
        insert into page_progress (user_id, slug, done)
        values (${userId}, ${data.slug}, true)
        on conflict (user_id, slug)
        do update set done = true, updated_at = now()
      `;
    } else {
      await sql`
        delete from page_progress where user_id = ${userId} and slug = ${data.slug}
      `;
    }
  });
