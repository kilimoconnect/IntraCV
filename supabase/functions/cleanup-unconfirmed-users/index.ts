/**
 * Supabase Edge Function: cleanup-unconfirmed-users
 *
 * Deletes auth users whose email is still unconfirmed after STALE_DAYS days.
 * Runs on a cron schedule (see supabase/config.toml or the pg_cron migration).
 *
 * Environment variables (set in Supabase Dashboard → Edge Functions → Secrets):
 *   CRON_SECRET            — shared secret checked in Authorization header
 *   SUPABASE_URL           — injected automatically by Supabase runtime
 *   SUPABASE_SERVICE_ROLE_KEY — injected automatically by Supabase runtime
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STALE_DAYS = 7;

Deno.serve(async (req: Request) => {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization") ?? "";
  const providedSecret = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!cronSecret || providedSecret !== cronSecret) {
    console.warn("cleanup-unconfirmed-users: unauthorized request rejected");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Supabase admin client ──────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── Collect stale unconfirmed users (paginated) ────────────────────────────
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);
  const staleIds: string[] = [];
  let page = 1;
  const PER_PAGE = 1000;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });

    if (error) {
      console.error("cleanup-unconfirmed-users: listUsers error", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pageStale = data.users
      .filter(
        (u) =>
          !u.email_confirmed_at && new Date(u.created_at) < cutoff
      )
      .map((u) => u.id);

    staleIds.push(...pageStale);

    // Stop when we've reached the last page
    if (data.users.length < PER_PAGE) break;
    page++;
  }

  if (staleIds.length === 0) {
    console.log("cleanup-unconfirmed-users: no stale users found");
    return new Response(
      JSON.stringify({ deleted: 0, errors: 0, total: 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Delete stale users ─────────────────────────────────────────────────────
  const results = await Promise.allSettled(
    staleIds.map((id) => admin.auth.admin.deleteUser(id))
  );

  let deleted = 0;
  let errors = 0;

  for (const result of results) {
    if (result.status === "fulfilled" && !result.value.error) {
      deleted++;
    } else {
      errors++;
      const reason =
        result.status === "rejected"
          ? result.reason
          : result.value.error?.message;
      console.error("cleanup-unconfirmed-users: delete failed", reason);
    }
  }

  console.log(
    `cleanup-unconfirmed-users: done — deleted=${deleted} errors=${errors} total=${staleIds.length}`
  );

  return new Response(
    JSON.stringify({ deleted, errors, total: staleIds.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
