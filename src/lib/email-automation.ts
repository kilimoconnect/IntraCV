/**
 * email-automation.ts
 *
 * FuseCV Email Machine — Personalized, high-converting, low-spam automation.
 *
 * Flows:
 *   signup_no_purchase — 4 emails over 7 days to convert free users
 *   cv_purchased       — 2 follow-up emails to upsell cover letter + interview prep
 *   dormant            — 2 reactivation emails at 30 and 60 days
 *
 * Architecture:
 *   - email_automation_queue table in Supabase holds scheduled emails
 *   - scheduleFlow() writes rows; cancelFlow() marks them cancelled
 *   - processQueue() is called by the /api/email-automation/cron endpoint
 *     every 15 minutes and sends any due pending emails via Brevo
 */

import { createAdminSupabase } from "@/lib/supabase/admin";

// ─── Config ──────────────────────────────────────────────────────────────────

const BREVO_API_KEY  = process.env.BREVO_API_KEY!;
const FROM_EMAIL     = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME      = process.env.BREVO_FROM_NAME  || "FuseCV";
const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL || "https://fusecv.com";

const STUDIO_URL    = `${SITE_URL}/dashboard?tab=studio`;
const INTERVIEW_URL = `${SITE_URL}/dashboard?tab=interview`;
const DASHBOARD_URL = `${SITE_URL}/dashboard`;

// ─── Types ───────────────────────────────────────────────────────────────────

export type FlowId = "signup_no_purchase" | "cv_purchased" | "dormant";
type CareerCategory = "junior" | "mid-senior" | "executive";
type CvPlan = "starter" | "professional" | "full";

interface FlowEmail {
  emailNumber: number;
  delayMinutes: number;
}

interface QueueRow {
  id: string;
  user_id: string;
  flow: FlowId;
  email_number: number;
  metadata: Record<string, string>;
}

interface UserContext {
  email: string;
  firstName: string;
  headline: string;
  careerCategory: CareerCategory;
  hasPurchased: boolean;
  marketingUnsubscribed: boolean;
}

// ─── Flow schedules ───────────────────────────────────────────────────────────

const FLOW_SCHEDULES: Record<FlowId, FlowEmail[]> = {
  signup_no_purchase: [
    { emailNumber: 1, delayMinutes: 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 3 },
    { emailNumber: 4, delayMinutes: 60 * 24 * 7 },
  ],
  // Email 1 already sent immediately by purchase-emails.ts
  cv_purchased: [
    { emailNumber: 2, delayMinutes: 60 * 24 * 2 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 5 },
  ],
  dormant: [
    { emailNumber: 1, delayMinutes: 60 * 24 * 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 * 60 },
  ],
};

// ─── Queue management ─────────────────────────────────────────────────────────

/**
 * Schedule all emails for a flow starting from now.
 * Uses ON CONFLICT DO NOTHING so re-triggering is safe.
 */
export async function scheduleFlow(
  userId: string,
  flow: FlowId,
  metadata: Record<string, string> = {}
): Promise<void> {
  const admin = createAdminSupabase();
  const now = Date.now();
  const schedule = FLOW_SCHEDULES[flow];

  const rows = schedule.map(({ emailNumber, delayMinutes }) => ({
    user_id: userId,
    flow,
    email_number: emailNumber,
    scheduled_at: new Date(now + delayMinutes * 60 * 1000).toISOString(),
    status: "pending",
    metadata,
  }));

  const { error } = await admin
    .from("email_automation_queue")
    .upsert(rows, { onConflict: "user_id,flow,email_number", ignoreDuplicates: true });

  if (error) console.error(`[email-automation] scheduleFlow(${flow}) error:`, error.message);
}

/**
 * Cancel all pending emails in a flow for a user.
 */
export async function cancelFlow(userId: string, flow: FlowId): Promise<void> {
  const admin = createAdminSupabase();
  const { error } = await admin
    .from("email_automation_queue")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("flow", flow)
    .eq("status", "pending");

  if (error) console.error(`[email-automation] cancelFlow(${flow}) error:`, error.message);
}

/**
 * Cancel all pending emails across all flows for a user.
 * Call when user becomes fully inactive or permanently unsubscribes.
 */
export async function cancelAllFlows(userId: string): Promise<void> {
  const admin = createAdminSupabase();
  await admin
    .from("email_automation_queue")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "pending");
}

// ─── Process queue (called by cron) ──────────────────────────────────────────

export async function processQueue(): Promise<{ sent: number; skipped: number; failed: number }> {
  const admin = createAdminSupabase();
  let sent = 0, skipped = 0, failed = 0;

  // Fetch up to 50 due emails
  const { data: rows, error } = await admin
    .from("email_automation_queue")
    .select("id, user_id, flow, email_number, metadata")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(50);

  if (error) {
    console.error("[email-automation] processQueue fetch error:", error.message);
    return { sent: 0, skipped: 0, failed: 0 };
  }

  if (!rows || rows.length === 0) return { sent: 0, skipped: 0, failed: 0 };

  for (const row of rows as QueueRow[]) {
    // Mark processing first to avoid double-send if cron overlaps
    await admin
      .from("email_automation_queue")
      .update({ status: "processing" })
      .eq("id", row.id)
      .eq("status", "pending"); // only claim if still pending

    try {
      const ctx = await fetchUserContext(row.user_id);

      if (!ctx) { await markStatus(row.id, "failed"); failed++; continue; }
      if (ctx.marketingUnsubscribed) { await markStatus(row.id, "cancelled"); skipped++; continue; }

      // Flow 1 guard: if user has since purchased, cancel remaining emails
      if (row.flow === "signup_no_purchase" && ctx.hasPurchased) {
        await cancelFlow(row.user_id, "signup_no_purchase");
        await markStatus(row.id, "cancelled");
        skipped++;
        continue;
      }

      // Flow 2 guard: skip cover letter email if user bought professional/full
      if (row.flow === "cv_purchased" && row.email_number === 2) {
        const plan = row.metadata?.plan as CvPlan | undefined;
        if (plan === "professional" || plan === "full") {
          await markStatus(row.id, "cancelled");
          skipped++;
          continue;
        }
      }

      const emailOpts = buildEmail(row.flow, row.email_number, ctx);
      if (!emailOpts) { await markStatus(row.id, "cancelled"); skipped++; continue; }

      await sendBrevoEmail({ to: ctx.email, toName: ctx.firstName, ...emailOpts });
      await markStatus(row.id, "sent", new Date().toISOString());
      sent++;
    } catch (e) {
      console.error(`[email-automation] Failed to send row ${row.id}:`, e);
      await markStatus(row.id, "failed");
      failed++;
    }
  }

  return { sent, skipped, failed };
}

async function markStatus(id: string, status: string, sentAt?: string): Promise<void> {
  const admin = createAdminSupabase();
  const update: Record<string, string> = { status };
  if (sentAt) update.sent_at = sentAt;
  await admin.from("email_automation_queue").update(update).eq("id", id);
}

// ─── User context fetcher ─────────────────────────────────────────────────────

async function fetchUserContext(userId: string): Promise<UserContext | null> {
  try {
    const admin = createAdminSupabase();

    const [{ data: { user } }, { data: pi }, { data: tokens }] = await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("cv_personal_info").select("headline, career_category").eq("user_id", userId).maybeSingle(),
      admin.from("cv_download_tokens").select("id").eq("user_id", userId).limit(1),
    ]);

    if (!user?.email) return null;

    const fullName = user.user_metadata?.full_name || "";
    const firstName = fullName.trim().split(" ")[0] || "there";

    return {
      email: user.email,
      firstName,
      headline: pi?.headline || "",
      careerCategory: (pi?.career_category as CareerCategory) || "junior",
      hasPurchased: (tokens?.length ?? 0) > 0,
      marketingUnsubscribed: !!user.user_metadata?.marketing_unsubscribed,
    };
  } catch (e) {
    console.error("[email-automation] fetchUserContext error:", e);
    return null;
  }
}

// ─── Email builder ────────────────────────────────────────────────────────────

function buildEmail(
  flow: FlowId,
  emailNumber: number,
  ctx: UserContext
): { subject: string; html: string; text: string } | null {
  switch (flow) {
    case "signup_no_purchase":
      return buildSignupEmail(emailNumber, ctx);
    case "cv_purchased":
      return buildPurchasedEmail(emailNumber, ctx);
    case "dormant":
      return buildDormantEmail(emailNumber, ctx);
    default:
      return null;
  }
}

// ─── Flow 1: Signed up, no purchase ──────────────────────────────────────────

function buildSignupEmail(n: number, ctx: UserContext) {
  const { firstName, headline, careerCategory } = ctx;

  // Career-stage personalization line for email 2
  const stageLine = careerCategory === "executive"
    ? `At your level, recruiters scan for strategic impact and leadership at scale. Generic CVs lose that signal immediately.`
    : careerCategory === "mid-senior"
    ? `At your stage, recruiters look for ownership, results, and progression. A strong CV makes all three visible.`
    : `Even early in your career, you have real value — projects, coursework, initiative. A clear CV makes that visible.`;

  const industryHint = headline ? ` in ${headline.split(" ").slice(-2).join(" ")}` : "";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Your stronger CV version is ready",
      body: `We reviewed your CV and found clear opportunities to improve how your experience is presented.\n\nYour upgraded version is ready to preview.`,
      cta: STUDIO_URL,
      ctaLabel: "Preview Your CV",
    },
    2: {
      subject: `${firstName}, strong experience can look weak on paper`,
      body: `You have built valuable experience${industryHint}.\n\nBut if your CV uses generic wording or hides results, recruiters may never see it.\n\n${stageLine}\n\nWe improved that for you.`,
      cta: STUDIO_URL,
      ctaLabel: "Preview here",
    },
    3: {
      subject: "Still applying with the old version?",
      body: `If applications are going out with your old CV, you may be reducing your odds without realizing it.\n\nYour improved version is still available.`,
      cta: STUDIO_URL,
      ctaLabel: "View Your Improved CV",
    },
    4: {
      subject: "One better CV can change a year",
      body: `Sometimes one stronger application leads to:\n\n- A better salary\n- A better role\n- Better momentum\n\nYour preview is still waiting.`,
      cta: STUDIO_URL,
      ctaLabel: "See the Difference",
    },
  };

  const e = emails[n];
  if (!e) return null;
  return format(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow 2: Purchased CV — upsell follow-ups ─────────────────────────────────

function buildPurchasedEmail(n: number, ctx: UserContext) {
  const { firstName, headline } = ctx;
  const roleHint = headline || "your target role";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    2: {
      subject: "Need a matching cover letter?",
      body: `A strong CV gets attention.\n\nA tailored cover letter can increase trust and explain why you are the right fit.\n\nGenerate one in minutes — it uses the same job description you already provided.`,
      cta: STUDIO_URL,
      ctaLabel: "Generate My Cover Letter",
    },
    3: {
      subject: "Prepare before interviews arrive",
      body: `Many people improve their CV first, then need interview prep fast when calls start coming.\n\nWe created role-specific interview questions for ${roleHint} — with model answers based on your profile.\n\nBetter to practice now than scramble later.`,
      cta: INTERVIEW_URL,
      ctaLabel: "Practice Interview Questions",
    },
  };

  const e = emails[n];
  if (!e) return null;
  return format(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow 3: Dormant reactivation ────────────────────────────────────────────

function buildDormantEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const stageBody = careerCategory === "executive"
    ? `Leaders update their positioning when new opportunities arise — board roles, advisory positions, senior moves.\n\nIf something is on the horizon, your CV should be ready.`
    : careerCategory === "mid-senior"
    ? `People at your stage usually revisit their CV before a promotion, a salary conversation, or a move to a stronger company.\n\nIf any of those are on your mind, now is a good time.`
    : `People revisit their CV before promotions, salary moves, job switches, or new goals.\n\nIf now is your moment, we are ready.`;

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Ready for your next move?",
      body: stageBody,
      cta: DASHBOARD_URL,
      ctaLabel: "Update My CV",
    },
    2: {
      subject: "Your experience has grown. Has your CV?",
      body: `You may have more wins, stronger skills, and better results than when you last updated your CV.\n\nLet us reflect that properly. It takes less time than you think.`,
      cta: DASHBOARD_URL,
      ctaLabel: "Refresh My CV",
    },
  };

  const e = emails[n];
  if (!e) return null;
  return format(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Email formatter ──────────────────────────────────────────────────────────

function format(
  firstName: string,
  subject: string,
  body: string,
  ctaHref: string,
  ctaLabel: string
): { subject: string; html: string; text: string } {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- Logo -->
        <tr><td style="border-radius:12px 12px 0 0;background:#ffffff;border:1px solid #e2e8f0;border-bottom:none;padding:20px 32px 16px;text-align:center">
          <img src="${SITE_URL}/fusecv-logo.png" alt="FuseCV" width="120" height="37" style="display:block;margin:0 auto;max-width:120px;height:auto" />
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
          <p style="color:#1e293b;font-size:15px;line-height:1.75;margin:0 0 20px">Hi ${firstName},</p>
          ${body.split("\n\n").map(para => {
            if (para.startsWith("- ")) {
              const items = para.split("\n").map(i => i.replace(/^- /, "")).filter(Boolean);
              return `<ul style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 20px;padding-left:20px">
                ${items.map(i => `<li style="margin-bottom:6px">${i}</li>`).join("")}
              </ul>`;
            }
            return `<p style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 20px">${para.replace(/\n/g, "<br>")}</p>`;
          }).join("")}

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-top:8px">
            <tr><td style="border-radius:10px;background:#ff751f;text-align:center">
              <a href="${ctaHref}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px">
                ${ctaLabel} &rarr;
              </a>
            </td></tr>
          </table>

          <p style="color:#1e293b;font-size:15px;line-height:1.75;margin:28px 0 0">— FuseCV</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center">
          <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.6">
            <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:underline">fusecv.com</a>
            &nbsp;&bull;&nbsp;
            <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},

${body}

${ctaLabel}: ${ctaHref}

— FuseCV
${SITE_URL}

To unsubscribe: ${unsubUrl}`;

  return { subject, html, text };
}

// ─── Brevo sender ─────────────────────────────────────────────────────────────

async function sendBrevoEmail(opts: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not set");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: opts.to, name: opts.toName }],
      subject: opts.subject,
      headers: { "X-Entity-Ref-ID": `automation-${opts.to}` },
      htmlContent: opts.html,
      textContent: opts.text,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo error: ${JSON.stringify(err)}`);
  }
}
