/**
 * email-automation.ts — FuseCV Email Machine v4
 *
 * Flows (exact priority, 1 = highest):
 *   1.  checkout_abandon         — payment initiated but not completed
 *   2.  payment_failed           — gateway confirmed failure
 *   3.  preview_no_purchase      — CV preview viewed, no payment (HOT INTENT)
 *   4.  missing_info             — profile incomplete after signup
 *   5.  interview_upsell         — post CV-purchase interview prep push
 *   6.  cv_purchased             — cover letter + interview nudge after purchase
 *   7.  upload_started_no_finish — upload started, not completed
 *   8.  signup_no_purchase       — nurture sequence (segmented by career stage)
 *   9.  executive_prestige       — premium positioning for executive users
 *  10.  repeat_buyer             — 45d + 90d re-engagement for past buyers
 *
 * Frequency rules:
 *   - Max 1 marketing email per user per 24 hours
 *   - Max 2 marketing emails per user per 7 days
 *   - checkout_abandon bypasses both limits (revenue recovery)
 *   - Global suppression: if checkout_abandon is active (pending or sent within 72h),
 *     flows with priority >= 7 are suppressed
 *   - 48h purchase cooldown: no sales emails for 48h except onboarding flows (5 + 6)
 */

import { createAdminSupabase } from "@/lib/supabase/admin";

// ─── Config ──────────────────────────────────────────────────────────────────

const BREVO_API_KEY  = process.env.BREVO_API_KEY!;
const FROM_EMAIL     = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME      = process.env.BREVO_FROM_NAME  || "FuseCV";
const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL || "https://fusecv.com";

const STUDIO_URL     = `${SITE_URL}/dashboard?tab=studio`;
const INTERVIEW_URL  = `${SITE_URL}/dashboard?tab=interview`;
const DASHBOARD_URL  = `${SITE_URL}/dashboard`;
const CV_BUILDER_URL = `${SITE_URL}/cv-builder`;

// ─── Types ───────────────────────────────────────────────────────────────────

export type FlowId =
  | "checkout_abandon"
  | "payment_failed"
  | "preview_no_purchase"
  | "missing_info"
  | "interview_upsell"
  | "cv_purchased"
  | "upload_started_no_finish"
  | "signup_no_purchase"
  | "executive_prestige"
  | "repeat_buyer";

type CareerCategory = "junior" | "mid-senior" | "executive";
type CvPlan = "starter" | "professional" | "full";

interface FlowEmail   { emailNumber: number; delayMinutes: number }
interface QueueRow    { id: string; user_id: string; flow: FlowId; email_number: number; metadata: Record<string, string> }
interface UserContext {
  email: string;
  firstName: string;
  headline: string;
  careerCategory: CareerCategory;
  hasPurchased: boolean;
  hasInterviewPurchase: boolean;
  hasCompleteProfile: boolean;  // experience + summary both present
  marketingUnsubscribed: boolean;
}

// ─── Priority (1 = highest — unique, no ties) ─────────────────────────────────

export const FLOW_PRIORITY: Record<FlowId, number> = {
  checkout_abandon:         1,
  payment_failed:           2,
  preview_no_purchase:      3,
  missing_info:             4,
  interview_upsell:         5,
  cv_purchased:             6,
  upload_started_no_finish: 7,
  signup_no_purchase:       8,
  executive_prestige:       9,
  repeat_buyer:            10,
};

// Flows suppressed when checkout_abandon is active (priority >= SUPPRESS_THRESHOLD)
const CHECKOUT_SUPPRESS_THRESHOLD = 7;

// ─── Schedules ────────────────────────────────────────────────────────────────

const FLOW_SCHEDULES: Record<FlowId, FlowEmail[]> = {
  checkout_abandon: [
    { emailNumber: 1, delayMinutes: 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
  ],
  payment_failed: [
    { emailNumber: 1, delayMinutes: 10 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
  ],
  preview_no_purchase: [
    { emailNumber: 1, delayMinutes: 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 3 },
  ],
  missing_info: [
    { emailNumber: 1, delayMinutes: 60 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 3 },
  ],
  interview_upsell: [
    { emailNumber: 2, delayMinutes: 60 * 24 * 3 },  // email 1 = purchase confirmation
    { emailNumber: 3, delayMinutes: 60 * 24 * 7 },
  ],
  cv_purchased: [
    { emailNumber: 2, delayMinutes: 60 * 24 * 2 },  // email 1 = purchase confirmation
    { emailNumber: 3, delayMinutes: 60 * 24 * 5 },
  ],
  upload_started_no_finish: [
    { emailNumber: 1, delayMinutes: 15 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
  ],
  signup_no_purchase: [
    { emailNumber: 1, delayMinutes: 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 3 },
    { emailNumber: 4, delayMinutes: 60 * 24 * 7 },
  ],
  executive_prestige: [
    { emailNumber: 1, delayMinutes: 60 * 24 },
    { emailNumber: 2, delayMinutes: 60 * 24 * 3 },
  ],
  repeat_buyer: [
    { emailNumber: 1, delayMinutes: 60 * 24 * 45 },
    { emailNumber: 2, delayMinutes: 60 * 24 * 90 },
  ],
};

// ─── Queue management ─────────────────────────────────────────────────────────

/** Schedule a flow. Idempotent — safe to call multiple times. */
export async function scheduleFlow(
  userId: string,
  flow: FlowId,
  metadata: Record<string, string> = {}
): Promise<void> {
  const admin = createAdminSupabase();
  const now = Date.now();
  const schedule = FLOW_SCHEDULES[flow];
  if (!schedule) return;

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

  if (error) console.error(`[email-automation] scheduleFlow(${flow}):`, error.message);
}

/**
 * Reset a flow — delete pending/cancelled rows then reschedule fresh from now.
 * Use for repeat_buyer on new purchase so the 45d/90d timer resets.
 */
export async function resetFlow(
  userId: string,
  flow: FlowId,
  metadata: Record<string, string> = {}
): Promise<void> {
  const admin = createAdminSupabase();
  await admin
    .from("email_automation_queue")
    .delete()
    .eq("user_id", userId)
    .eq("flow", flow)
    .in("status", ["pending", "cancelled"]);
  await scheduleFlow(userId, flow, metadata);
}

/** Cancel all pending emails in a flow. */
export async function cancelFlow(userId: string, flow: FlowId): Promise<void> {
  const admin = createAdminSupabase();
  const { error } = await admin
    .from("email_automation_queue")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("flow", flow)
    .eq("status", "pending");

  if (error) console.error(`[email-automation] cancelFlow(${flow}):`, error.message);
}

/** Cancel all pending emails across all flows (e.g., on unsubscribe). */
export async function cancelAllFlows(userId: string): Promise<void> {
  const admin = createAdminSupabase();
  await admin
    .from("email_automation_queue")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "pending");
}

// ─── Process queue ────────────────────────────────────────────────────────────

export async function processQueue(): Promise<{ sent: number; skipped: number; failed: number }> {
  const admin = createAdminSupabase();
  let sent = 0, skipped = 0, failed = 0;

  // Reset any rows stuck in "processing" — safe because each cron run is atomic,
  // so anything still in "processing" at the start of a new run is guaranteed stuck.
  await admin
    .from("email_automation_queue")
    .update({ status: "pending" })
    .eq("status", "processing");

  // Fetch more than we'll send so per-user priority sorting works correctly
  const { data: rows, error } = await admin
    .from("email_automation_queue")
    .select("id, user_id, flow, email_number, metadata")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(200);

  if (error) { console.error("[email-automation] fetch error:", error.message); return { sent: 0, skipped: 0, failed: 0 }; }
  if (!rows?.length) return { sent: 0, skipped: 0, failed: 0 };

  // Group by user, sort each group by priority
  const byUser: Record<string, QueueRow[]> = {};
  for (const row of rows as QueueRow[]) {
    (byUser[row.user_id] ??= []).push(row);
  }
  for (const userRows of Object.values(byUser)) {
    userRows.sort((a, b) => (FLOW_PRIORITY[a.flow] ?? 99) - (FLOW_PRIORITY[b.flow] ?? 99));
  }

  for (const [userId, userRows] of Object.entries(byUser)) {
    // Fetch all rate-limit data in parallel (once per user)
    const [sentLast24h, sentLast7d, checkoutActive] = await Promise.all([
      getSentInWindow(userId, 24),
      getSentInWindow(userId, 168),     // 7 days
      isCheckoutAbandonActive(userId),
    ]);
    const isRateLimited = sentLast24h >= 1 || sentLast7d >= 2;

    let sentThisUser = false;

    for (const row of userRows) {
      const priority = FLOW_PRIORITY[row.flow] ?? 99;
      const bypassRateLimit = row.flow === "checkout_abandon";

      // ── Global suppression: checkout_abandon active → pause low-priority flows ──
      if (checkoutActive && priority >= CHECKOUT_SUPPRESS_THRESHOLD && row.flow !== "checkout_abandon") {
        skipped++; continue;
      }

      // ── Frequency cap: max 1/day, 2/week (checkout_abandon always bypasses) ──
      if (isRateLimited && !bypassRateLimit) { skipped++; continue; }

      // ── Only send one per user per cron run ──
      if (sentThisUser && !bypassRateLimit) { skipped++; continue; }

      // Atomic claim
      const { count } = await admin
        .from("email_automation_queue")
        .update({ status: "processing" })
        .eq("id", row.id)
        .eq("status", "pending")
        .select("id", { count: "exact", head: true });

      if (!count) { skipped++; continue; } // race — another process got it

      try {
        const ctx = await fetchUserContext(userId);
        if (!ctx) { await markStatus(row.id, "cancelled"); skipped++; continue; } // user deleted
        if (ctx.marketingUnsubscribed) { await markStatus(row.id, "cancelled"); skipped++; continue; }

        // ── Per-flow guards ──

        const PRE_PURCHASE: FlowId[] = [
          "checkout_abandon", "payment_failed", "preview_no_purchase",
          "signup_no_purchase", "missing_info", "upload_started_no_finish",
          "executive_prestige",
        ];
        if (PRE_PURCHASE.includes(row.flow) && ctx.hasPurchased) {
          await cancelFlow(userId, row.flow);
          await markStatus(row.id, "cancelled"); skipped++; continue;
        }

        // missing_info: cancel when profile is actually complete (experience + summary)
        if (row.flow === "missing_info" && ctx.hasCompleteProfile) {
          await cancelFlow(userId, "missing_info");
          await markStatus(row.id, "cancelled"); skipped++; continue;
        }

        // cv_purchased email 2 (cover letter): skip for buyers who already have it
        if (row.flow === "cv_purchased" && row.email_number === 2) {
          const plan = row.metadata?.plan as CvPlan | undefined;
          if (plan === "professional" || plan === "full") {
            await markStatus(row.id, "cancelled"); skipped++; continue;
          }
        }

        // interview_upsell: skip if user already bought interview questions
        if (row.flow === "interview_upsell" && ctx.hasInterviewPurchase) {
          await cancelFlow(userId, "interview_upsell");
          await markStatus(row.id, "cancelled"); skipped++; continue;
        }

        const emailOpts = buildEmail(row.flow, row.email_number, ctx);
        if (!emailOpts) { await markStatus(row.id, "cancelled"); skipped++; continue; }

        await sendBrevoEmail({ to: ctx.email, toName: ctx.firstName, ...emailOpts });
        await markStatus(row.id, "sent", new Date().toISOString());
        sent++;
        if (!bypassRateLimit) sentThisUser = true;

      } catch (e: any) {
        console.error(`[email-automation] row ${row.id}:`, e);
        // Reset to pending so the next cron run retries (transient errors should not permanently fail rows)
        await markStatus(row.id, "pending");
        failed++;
      }
    }
  }

  return { sent, skipped, failed };
}

// ─── Rate-limit helpers ───────────────────────────────────────────────────────

async function getSentInWindow(userId: string, hours: number): Promise<number> {
  const admin = createAdminSupabase();
  const since = new Date(Date.now() - hours * 3_600_000).toISOString();
  const { count } = await admin
    .from("email_automation_queue")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "sent")
    .gte("sent_at", since);
  return count ?? 0;
}

async function isCheckoutAbandonActive(userId: string): Promise<boolean> {
  const admin = createAdminSupabase();
  const since72h = new Date(Date.now() - 72 * 3_600_000).toISOString();

  const { count: pending } = await admin
    .from("email_automation_queue")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("flow", "checkout_abandon")
    .eq("status", "pending");

  if ((pending ?? 0) > 0) return true;

  const { count: recentlySent } = await admin
    .from("email_automation_queue")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("flow", "checkout_abandon")
    .eq("status", "sent")
    .gte("sent_at", since72h);

  return (recentlySent ?? 0) > 0;
}

async function markStatus(id: string, status: string, sentAt?: string): Promise<void> {
  const admin = createAdminSupabase();
  const update: Record<string, string> = { status };
  if (sentAt) update.sent_at = sentAt;
  await admin.from("email_automation_queue").update(update).eq("id", id);
}

// ─── User context ─────────────────────────────────────────────────────────────

/** Returns null if user not found (permanent), throws on transient DB errors so caller can retry. */
async function fetchUserContext(userId: string): Promise<UserContext | null> {
  const admin = createAdminSupabase();
  const [
    { data: { user }, error: userErr },
    { data: pi },
    { data: tokens },
    { data: profile },
    { count: expCount },
    { data: summaryRow },
  ] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("cv_personal_info").select("headline, career_category").eq("user_id", userId).maybeSingle(),
    admin.from("cv_download_tokens").select("id").eq("user_id", userId).limit(1),
    admin.from("profiles").select("interview_questions_paid_quota").eq("id", userId).maybeSingle(),
    admin.from("cv_experiences").select("id", { count: "exact", head: true }).eq("user_id", userId),
    admin.from("cv_summary").select("summary").eq("user_id", userId).maybeSingle(),
  ]);

  if (userErr) throw new Error(`fetchUserContext DB error: ${userErr.message}`);
  if (!user?.email) return null; // user deleted — caller should cancel

  const fullName = user.user_metadata?.full_name || "";
  const hasExp = (expCount ?? 0) > 0;
  const hasSummary = !!summaryRow?.summary?.trim();

  return {
    email: user.email,
    firstName: fullName.trim().split(" ")[0] || "there",
    headline: pi?.headline || "",
    careerCategory: (pi?.career_category as CareerCategory) || "junior",
    hasPurchased: (tokens?.length ?? 0) > 0,
    hasInterviewPurchase: (profile?.interview_questions_paid_quota ?? 0) > 0,
    hasCompleteProfile: hasExp && hasSummary,
    marketingUnsubscribed: !!user.user_metadata?.marketing_unsubscribed,
  };
}

// ─── Email builder router ─────────────────────────────────────────────────────

function buildEmail(flow: FlowId, n: number, ctx: UserContext) {
  switch (flow) {
    case "checkout_abandon":         return buildCheckoutAbandon(n, ctx);
    case "payment_failed":           return buildPaymentFailed(n, ctx);
    case "preview_no_purchase":      return buildPreviewEmail(n, ctx);
    case "missing_info":             return buildMissingInfoEmail(n, ctx);
    case "cv_purchased":             return buildCvPurchasedEmail(n, ctx);
    case "interview_upsell":         return buildInterviewUpsellEmail(n, ctx);
    case "signup_no_purchase":       return buildSignupEmail(n, ctx);
    case "upload_started_no_finish": return buildUploadAbandonEmail(n, ctx);
    case "executive_prestige":       return buildExecutivePrestigeEmail(n, ctx);
    case "repeat_buyer":             return buildRepeatBuyerEmail(n, ctx);
    default:                         return null;
  }
}

// ─── Flow: checkout_abandon ───────────────────────────────────────────────────

function buildCheckoutAbandon(n: number, ctx: UserContext) {
  const { firstName } = ctx;
  const e = {
    1: {
      subject: "Your upgraded CV is one step away",
      body: `You were close.\n\nYour improved CV is ready — professionally formatted, AI-optimised, watermark-free. The only thing left is completing your purchase.\n\nYou already saw the difference when you previewed it. The result is the same — it is still waiting.`,
      cta: STUDIO_URL, ctaLabel: "Complete My Download",
    },
    2: {
      subject: "Still thinking? Your improved CV is still here",
      body: `Your upgraded CV has not been deleted.\n\nIf something stopped you yesterday, it is worth finishing today.\n\nA stronger CV is not about vanity — it is about making sure your experience is read the way it deserves to be.`,
      cta: STUDIO_URL, ctaLabel: "Get My Upgraded CV",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: payment_failed ─────────────────────────────────────────────────────

function buildPaymentFailed(n: number, ctx: UserContext) {
  const { firstName } = ctx;
  const e = {
    1: {
      subject: "Your payment did not complete",
      body: `Something went wrong with your payment — but your CV is still ready.\n\nThis is usually a temporary issue with the payment gateway. Your card has not been charged.\n\nTry again when you are ready — it usually goes through on the second attempt.`,
      cta: STUDIO_URL, ctaLabel: "Try Again",
    },
    2: {
      subject: "Your upgraded CV is still ready",
      body: `Your payment did not complete yesterday, but nothing on our end has changed.\n\nYour improved CV — formatted, AI-optimised, watermark-free — is still here whenever you want to claim it.`,
      cta: STUDIO_URL, ctaLabel: "Complete My Download",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: preview_no_purchase ────────────────────────────────────────────────

function buildPreviewEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const identityLine = careerCategory === "executive"
    ? "Leaders present themselves at the level they want to be taken seriously."
    : careerCategory === "mid-senior"
    ? "Professionals at your stage are evaluated on how clearly they present results — not just what they did."
    : "A stronger first impression from your CV changes who responds to your applications.";

  const e = {
    1: {
      subject: "Your upgraded CV is ready",
      body: `You have already seen the difference.\n\nThe stronger version of your CV is ready to download — watermark-free, formatted correctly, tailored to your career level.\n\nYou were one step away. It is still there.`,
      cta: STUDIO_URL, ctaLabel: "Get My Upgraded CV",
    },
    2: {
      subject: "Don't lose opportunities with the old version",
      body: `${identityLine}\n\nEvery application you send with your old CV is an opportunity you may not get back.\n\nYour upgraded version is still available. The result is already done — you just need to claim it.`,
      cta: STUDIO_URL, ctaLabel: "Download the Stronger Version",
    },
    3: {
      subject: "Your stronger CV is still waiting",
      body: `Your upgraded CV draft is still here.\n\nYou already did the hard part — your profile is complete, your experience is there, the AI has reviewed it.\n\nThe gap between where you are and a stronger result is one decision.`,
      cta: STUDIO_URL, ctaLabel: "Claim Your Upgraded CV",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: missing_info ───────────────────────────────────────────────────────

function buildMissingInfoEmail(n: number, ctx: UserContext) {
  const { firstName } = ctx;
  const e = {
    1: {
      subject: "We found a few details that could strengthen your CV",
      body: `Your profile is set up, but some sections that typically improve CV results are still empty.\n\nWork history and a professional summary are what the AI uses to rewrite your CV more powerfully. The more detail you provide, the stronger the output.\n\nTwo minutes is enough to fill the gaps.`,
      cta: CV_BUILDER_URL, ctaLabel: "Strengthen My Profile",
    },
    2: {
      subject: "Two minutes can improve your final result",
      body: `Your CV improvement is ready to generate — but it will be stronger with a complete profile.\n\nExperience entries and a clear professional summary give the AI what it needs to present you properly. Without them, the result will be generic.\n\nComplete your profile now.`,
      cta: CV_BUILDER_URL, ctaLabel: "Add My Details",
    },
    3: {
      subject: "Complete your profile to unlock stronger wording",
      body: `Your account is ready. Your profile just needs a few more details before we can produce the strongest version of your CV.\n\nA partial profile produces a partial result. A complete one produces something you will actually want to send.`,
      cta: CV_BUILDER_URL, ctaLabel: "Finish My Profile",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: cv_purchased ───────────────────────────────────────────────────────

function buildCvPurchasedEmail(n: number, ctx: UserContext) {
  const { firstName, headline } = ctx;
  const roleHint = headline || "your target role";
  const e = {
    2: {
      subject: "Now match your CV with a strong cover letter",
      body: `Your CV is stronger. The next step is making sure everything that gets sent reads consistently.\n\nA tailored cover letter — written for the same role, in the same tone — builds the case before anyone opens your CV.\n\nGenerate one in minutes. It uses the job description you already provided.`,
      cta: STUDIO_URL, ctaLabel: "Generate My Cover Letter",
    },
    3: {
      subject: "Interviews start after the CV — prepare now",
      body: `A stronger CV means more responses. More responses mean more interviews.\n\nMost candidates wing it. The ones who prepare are the ones who get offers.\n\nWe created role-specific interview questions for ${roleHint} with model answers based on your profile.`,
      cta: INTERVIEW_URL, ctaLabel: "Practice Interview Questions",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: interview_upsell ───────────────────────────────────────────────────

function buildInterviewUpsellEmail(n: number, ctx: UserContext) {
  const { firstName, headline, careerCategory } = ctx;
  const roleHint = headline || "your target role";

  const depthNote = careerCategory === "executive"
    ? "At the senior level, interviews test strategic thinking and leadership narrative. Preparation is what separates candidates with similar records."
    : careerCategory === "mid-senior"
    ? "At your level, interviewers probe for depth — specific results, how you lead, what you own. Practiced answers land better than improvised ones."
    : "Most interview questions follow patterns you can prepare for. Knowing them in advance removes the unpredictability.";

  const e = {
    2: {
      subject: "Now prepare for the interview too",
      body: `Your CV got stronger. The next step is walking in prepared.\n\n${depthNote}\n\nWe generated role-specific questions for ${roleHint} — with model answers built from your actual experience.`,
      cta: INTERVIEW_URL, ctaLabel: "See My Interview Questions",
    },
    3: {
      subject: "Your CV got attention — next is interview readiness",
      body: `If your stronger CV is getting responses, interviews will follow.\n\n20 questions specific to ${roleHint} are waiting for you — tailored, practiced, ready.\n\nThe gap between a good interview and a great one is usually preparation, not ability.`,
      cta: INTERVIEW_URL, ctaLabel: "Prepare for My Interview",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: signup_no_purchase (segmented by career stage) ─────────────────────

function buildSignupEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  type ED = { subject: string; body: string };
  const byStage: Record<CareerCategory, Record<number, ED>> = {
    junior: {
      1: {
        subject: "Start with the CV you already have",
        body: `Even without years of experience, you have value.\n\nProjects, coursework, internships, initiative — these matter. But only if your CV presents them in a way that reads as professional.\n\nWe improved how your profile is presented. The upgraded version is ready to preview.`,
      },
      2: {
        subject: "Strong graduates get overlooked too — here is why",
        body: `A first CV is rarely optimised. Most graduates use the same template, the same wording, the same layout.\n\nRecruiters see hundreds. Yours needs to stand out on the first read.\n\nWe rewrote the presentation of your experience to make it clearer and more compelling.`,
      },
      3: {
        subject: "Still using the draft CV?",
        body: `Every application you send is a chance. Sending one that is not optimised reduces those chances without you knowing.\n\nYour improved version is still available — cleaner, stronger, ready to send.`,
      },
      4: {
        subject: "One clear CV can open the first door",
        body: `The first role is often the hardest to land. A CV that clearly communicates your potential — not just your experience — makes a real difference.\n\nYour preview is still waiting.`,
      },
    },
    "mid-senior": {
      1: {
        subject: "Start with the CV you already have",
        body: `We reviewed your CV and found clear opportunities to improve how your experience is presented.\n\nAt your stage, recruiters look for ownership, results, and progression. Your upgraded version makes all three more visible.`,
      },
      2: {
        subject: "Your experience is there — the presentation may not be",
        body: `You have built something real over your career.\n\nBut if your CV uses generic language or buries your impact, the people reviewing applications may not see it.\n\nWe improved the presentation. The difference is in how results are framed, not in what you have done.`,
      },
      3: {
        subject: "Still applying with the old version?",
        body: `If applications are going out with your original CV, you may be reducing your response rate without realising it.\n\nYour improved version is still available.`,
      },
      4: {
        subject: "One better CV can change your year",
        body: `Sometimes one stronger application — to the right company at the right time — leads to a better salary, a better role, better momentum.\n\nYour improved preview is still here.`,
      },
    },
    executive: {
      1: {
        subject: "Start with the CV you already have",
        body: `Senior candidates are not evaluated on experience alone. Positioning matters.\n\nThe way you frame scale, impact, and leadership in writing determines how seriously you are taken before any conversation begins.\n\nWe reviewed your CV with that in mind. Your upgraded version is ready.`,
      },
      2: {
        subject: "Leadership should sound like leadership on paper",
        body: `At your level, a CV should not just list roles — it should communicate authority.\n\nStrategic scope, organisational impact, the kind of decisions you own — these need to be visible immediately.\n\nYour updated version reflects that standard.`,
      },
      3: {
        subject: "Senior candidates are judged on positioning",
        body: `Two candidates with similar experience can get very different responses based entirely on how their CV is written.\n\nPositioning — the language, the framing, the emphasis — is what separates them.\n\nYours has been improved. It is still available to preview.`,
      },
      4: {
        subject: "Your positioning draft is still waiting",
        body: `The strongest executive CVs do not just describe what someone did — they establish why that person's leadership mattered.\n\nYour draft reflects that approach. It is still here whenever you are ready.`,
      },
    },
  };

  const emails = byStage[careerCategory] ?? byStage["mid-senior"];
  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, STUDIO_URL, "Preview Your CV");
}

// ─── Flow: upload_started_no_finish ──────────────────────────────────────────

function buildUploadAbandonEmail(n: number, ctx: UserContext) {
  const { firstName } = ctx;
  const e = {
    1: {
      subject: "Finish your upload in under 2 minutes",
      body: `You started improving your CV but did not finish.\n\nYou are close. Completing the upload takes less than two minutes and unlocks the full AI review of your CV.\n\nYour progress has been saved — pick up where you left off.`,
      cta: CV_BUILDER_URL, ctaLabel: "Finish My Upload",
    },
    2: {
      subject: "Your CV improvement is waiting",
      body: `Your account is ready, but your CV upload was not completed.\n\nUntil it is, we cannot improve what you have not shared with us.\n\nFinish in two minutes and we will take it from there.`,
      cta: CV_BUILDER_URL, ctaLabel: "Complete My Upload",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: executive_prestige ─────────────────────────────────────────────────

function buildExecutivePrestigeEmail(n: number, ctx: UserContext) {
  const { firstName } = ctx;
  const e = {
    1: {
      subject: "Leadership deserves stronger presentation",
      body: `Most CVs — even strong ones — undersell seniority.\n\nThey list what people did without communicating the scale of it. The budget they owned. The teams they led. The transformation they drove.\n\nAt your level, that context is the difference between being considered and being called.\n\nYour upgraded CV makes that context visible immediately.`,
      cta: STUDIO_URL, ctaLabel: "See My Executive CV",
    },
    2: {
      subject: "Executives are judged on positioning before the interview",
      body: `A senior hiring decision starts with how someone positions themselves in writing.\n\nBoards, search firms, and C-suite hiring managers read hundreds of senior profiles. The ones that communicate strategic impact immediately stand out from the ones that describe responsibilities.\n\nYour CV has been upgraded with that standard in mind.`,
      cta: STUDIO_URL, ctaLabel: "Preview My Upgraded CV",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: repeat_buyer ───────────────────────────────────────────────────────

function buildRepeatBuyerEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const contextLine = careerCategory === "executive"
    ? "Leaders often return before advisory roles, board positions, or senior transitions."
    : careerCategory === "mid-senior"
    ? "People at your stage come back before a promotion conversation, a new search, or a salary move."
    : "Many people return when a better opportunity appears — a stronger company, a step up, a fresh direction.";

  const e = {
    1: {
      subject: "Applying again soon?",
      body: `${contextLine}\n\nIf you are preparing for your next move, your profile is already here. Update it and generate a fresh version.\n\nFaster than starting over. Stronger than your last version.`,
      cta: DASHBOARD_URL, ctaLabel: "Update My CV",
    },
    2: {
      subject: "Your career changed — has your CV?",
      body: `Since you last downloaded your CV, you have likely added wins, refined your direction, or developed new skills.\n\nA CV that reflects who you are today will perform better than one from months ago.\n\nRefresh it now.`,
      cta: DASHBOARD_URL, ctaLabel: "Refresh My CV",
    },
  }[n];
  if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── HTML formatter ───────────────────────────────────────────────────────────

function fmt(
  firstName: string, subject: string, body: string, ctaHref: string, ctaLabel: string
): { subject: string; html: string; text: string } {
  const unsubBase = `${SITE_URL}/unsubscribe?email=`;
  const bodyHtml = body.split("\n\n").map(para => {
    if (para.startsWith("- ")) {
      const items = para.split("\n").map(i => i.replace(/^- /, "")).filter(Boolean);
      return `<ul style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 18px;padding-left:20px">${
        items.map(i => `<li style="margin-bottom:6px">${i}</li>`).join("")
      }</ul>`;
    }
    return `<p style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 18px">${para.replace(/\n/g, "<br>")}</p>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="border-radius:12px 12px 0 0;background:#ffffff;border:1px solid #e2e8f0;border-bottom:none;padding:20px 32px 16px;text-align:center">
  <img src="${SITE_URL}/fusecv-logo.png" alt="FuseCV" width="120" height="37" style="display:block;margin:0 auto;max-width:120px;height:auto" />
</td></tr>
<tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
  <p style="color:#1e293b;font-size:15px;line-height:1.75;margin:0 0 18px">Hi ${firstName},</p>
  ${bodyHtml}
  <table cellpadding="0" cellspacing="0" style="margin-top:8px">
    <tr><td style="border-radius:10px;background:#ff751f;text-align:center">
      <a href="${ctaHref}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px">${ctaLabel} &rarr;</a>
    </td></tr>
  </table>
  <p style="color:#1e293b;font-size:15px;line-height:1.75;margin:28px 0 0">— FuseCV</p>
</td></tr>
<tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center">
  <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.6">
    <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:underline">fusecv.com</a>
    &nbsp;&bull;&nbsp;
    <a href="${unsubBase}" style="color:#94a3b8;text-decoration:underline">Unsubscribe</a>
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  const text = `Hi ${firstName},\n\n${body}\n\n${ctaLabel}: ${ctaHref}\n\n— FuseCV\n${SITE_URL}\n\nUnsubscribe: ${unsubBase}`;
  return { subject, html, text };
}

// ─── Brevo sender ─────────────────────────────────────────────────────────────

async function sendBrevoEmail(opts: { to: string; toName: string; subject: string; html: string; text: string }) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not set");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: opts.to, name: opts.toName }],
      subject: opts.subject,
      headers: { "X-Entity-Ref-ID": `auto-${opts.to}` },
      htmlContent: opts.html,
      textContent: opts.text,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo: ${JSON.stringify(err)}`);
  }
}
