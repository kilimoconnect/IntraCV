/**
 * email-automation.ts
 *
 * FuseCV Email Machine — Personalized, high-converting, low-spam automation.
 *
 * Flows:
 *   signup_no_purchase   — 4 emails over 7 days to convert free users
 *   preview_no_purchase  — 3 emails after CV preview viewed, no payment (HOT INTENT)
 *   missing_info         — 3 emails when profile is incomplete after signup
 *   cv_purchased         — 2 follow-up emails (cover letter + interview upsell)
 *   interview_upsell     — 2 emails pushing interview prep for CV-only buyers
 *   social_proof         — 2 emails for hesitant signups (2d + 5d)
 *   repeat_buyer         — 2 reactivation emails at 45d + 90d after purchase
 *   dormant              — 2 reactivation emails at 30d + 60d (never purchased)
 *
 * Architecture:
 *   - email_automation_queue table holds scheduled emails
 *   - scheduleFlow() / cancelFlow() manage the queue
 *   - processQueue() is called by /api/email-automation/cron every 15 minutes
 */

import { createAdminSupabase } from "@/lib/supabase/admin";

// ─── Config ──────────────────────────────────────────────────────────────────

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL    = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME     = process.env.BREVO_FROM_NAME  || "FuseCV";
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || "https://fusecv.com";

const STUDIO_URL    = `${SITE_URL}/dashboard?tab=studio`;
const INTERVIEW_URL = `${SITE_URL}/dashboard?tab=interview`;
const DASHBOARD_URL = `${SITE_URL}/dashboard`;
const CV_BUILDER_URL = `${SITE_URL}/cv-builder`;

// ─── Types ───────────────────────────────────────────────────────────────────

export type FlowId =
  | "signup_no_purchase"
  | "preview_no_purchase"
  | "missing_info"
  | "cv_purchased"
  | "interview_upsell"
  | "social_proof"
  | "repeat_buyer"
  | "dormant";

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
  hasInterviewPurchase: boolean;
  hasCompleteProfile: boolean; // has at least 1 experience entry
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
  // HOT INTENT: user saw the preview but didn't pay — schedule fast
  preview_no_purchase: [
    { emailNumber: 1, delayMinutes: 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 3 },
  ],
  // Profile incomplete after signup
  missing_info: [
    { emailNumber: 1, delayMinutes: 60 },
    { emailNumber: 2, delayMinutes: 60 * 24 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 3 },
  ],
  // Email 1 already sent immediately by purchase-emails.ts
  cv_purchased: [
    { emailNumber: 2, delayMinutes: 60 * 24 * 2 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 5 },
  ],
  // Dedicated interview push for CV-only buyers (email 1 = purchase confirmation)
  interview_upsell: [
    { emailNumber: 2, delayMinutes: 60 * 24 * 3 },
    { emailNumber: 3, delayMinutes: 60 * 24 * 7 },
  ],
  // Social proof for hesitant signups
  social_proof: [
    { emailNumber: 1, delayMinutes: 60 * 24 * 2 },
    { emailNumber: 2, delayMinutes: 60 * 24 * 5 },
  ],
  // Re-engage past buyers who may be applying again
  repeat_buyer: [
    { emailNumber: 1, delayMinutes: 60 * 24 * 45 },
    { emailNumber: 2, delayMinutes: 60 * 24 * 90 },
  ],
  // Reactivate users who never purchased
  dormant: [
    { emailNumber: 1, delayMinutes: 60 * 24 * 30 },
    { emailNumber: 2, delayMinutes: 60 * 24 * 60 },
  ],
};

// ─── Queue management ─────────────────────────────────────────────────────────

/** Schedule all emails for a flow. Safe to call multiple times (idempotent). */
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

/** Cancel all pending emails in a flow for a user. */
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

/** Cancel all pending emails across all flows. Use on unsubscribe. */
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
  if (!rows?.length) return { sent: 0, skipped: 0, failed: 0 };

  for (const row of rows as QueueRow[]) {
    // Claim the row atomically to prevent double-send on overlapping cron runs
    const { count } = await admin
      .from("email_automation_queue")
      .update({ status: "processing" })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id", { count: "exact", head: true });

    if (!count) { skipped++; continue; } // another process claimed it

    try {
      const ctx = await fetchUserContext(row.user_id);
      if (!ctx) { await markStatus(row.id, "failed"); failed++; continue; }
      if (ctx.marketingUnsubscribed) { await markStatus(row.id, "cancelled"); skipped++; continue; }

      // ── Flow-specific guards ──

      // Pre-purchase flows: cancel if user has since purchased
      if (
        (row.flow === "signup_no_purchase" ||
         row.flow === "preview_no_purchase" ||
         row.flow === "social_proof" ||
         row.flow === "dormant") &&
        ctx.hasPurchased
      ) {
        await cancelFlow(row.user_id, row.flow);
        await markStatus(row.id, "cancelled");
        skipped++; continue;
      }

      // Missing info: cancel if profile is now complete
      if (row.flow === "missing_info" && ctx.hasCompleteProfile) {
        await cancelFlow(row.user_id, "missing_info");
        await markStatus(row.id, "cancelled");
        skipped++; continue;
      }

      // cv_purchased email 2 (cover letter upsell): skip for professional/full buyers
      if (row.flow === "cv_purchased" && row.email_number === 2) {
        const plan = row.metadata?.plan as CvPlan | undefined;
        if (plan === "professional" || plan === "full") {
          await markStatus(row.id, "cancelled"); skipped++; continue;
        }
      }

      // interview_upsell: skip if user already bought interview questions
      if (row.flow === "interview_upsell" && ctx.hasInterviewPurchase) {
        await cancelFlow(row.user_id, "interview_upsell");
        await markStatus(row.id, "cancelled"); skipped++; continue;
      }

      const emailOpts = buildEmail(row.flow, row.email_number, ctx);
      if (!emailOpts) { await markStatus(row.id, "cancelled"); skipped++; continue; }

      await sendBrevoEmail({ to: ctx.email, toName: ctx.firstName, ...emailOpts });
      await markStatus(row.id, "sent", new Date().toISOString());
      sent++;
    } catch (e) {
      console.error(`[email-automation] row ${row.id} error:`, e);
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

    const [
      { data: { user } },
      { data: pi },
      { data: tokens },
      { data: profile },
      { count: expCount },
    ] = await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("cv_personal_info").select("headline, career_category").eq("user_id", userId).maybeSingle(),
      admin.from("cv_download_tokens").select("id").eq("user_id", userId).limit(1),
      admin.from("profiles").select("interview_questions_paid_quota").eq("id", userId).maybeSingle(),
      admin.from("cv_experiences").select("id", { count: "exact", head: true }).eq("user_id", userId),
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
      hasInterviewPurchase: (profile?.interview_questions_paid_quota ?? 0) > 0,
      hasCompleteProfile: (expCount ?? 0) > 0,
      marketingUnsubscribed: !!user.user_metadata?.marketing_unsubscribed,
    };
  } catch (e) {
    console.error("[email-automation] fetchUserContext error:", e);
    return null;
  }
}

// ─── Email builder router ─────────────────────────────────────────────────────

function buildEmail(
  flow: FlowId,
  n: number,
  ctx: UserContext
): { subject: string; html: string; text: string } | null {
  switch (flow) {
    case "signup_no_purchase":   return buildSignupEmail(n, ctx);
    case "preview_no_purchase":  return buildPreviewEmail(n, ctx);
    case "missing_info":         return buildMissingInfoEmail(n, ctx);
    case "cv_purchased":         return buildCvPurchasedEmail(n, ctx);
    case "interview_upsell":     return buildInterviewUpsellEmail(n, ctx);
    case "social_proof":         return buildSocialProofEmail(n, ctx);
    case "repeat_buyer":         return buildRepeatBuyerEmail(n, ctx);
    case "dormant":              return buildDormantEmail(n, ctx);
    default:                     return null;
  }
}

// ─── Flow: signup_no_purchase ─────────────────────────────────────────────────

function buildSignupEmail(n: number, ctx: UserContext) {
  const { firstName, headline, careerCategory } = ctx;

  const stageLine = careerCategory === "executive"
    ? "At your level, recruiters scan for strategic impact and leadership at scale. Generic CVs lose that signal immediately."
    : careerCategory === "mid-senior"
    ? "At your stage, recruiters look for ownership, results, and clear progression. A strong CV makes all three visible."
    : "Even early in your career, you have real value — projects, coursework, initiative. A clear CV makes that visible.";

  const industryHint = headline ? ` in ${headline.split(" ").slice(-2).join(" ")}` : "";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Your stronger CV version is ready",
      body: `We reviewed your CV and found clear opportunities to improve how your experience is presented.\n\nYour upgraded version is ready to preview.`,
      cta: STUDIO_URL, ctaLabel: "Preview Your CV",
    },
    2: {
      subject: `${firstName}, strong experience can look weak on paper`,
      body: `You have built valuable experience${industryHint}.\n\nBut if your CV uses generic wording or hides results, recruiters may never see it.\n\n${stageLine}\n\nWe improved that for you.`,
      cta: STUDIO_URL, ctaLabel: "Preview here",
    },
    3: {
      subject: "Still applying with the old version?",
      body: `If applications are going out with your old CV, you may be reducing your odds without realizing it.\n\nYour improved version is still available.`,
      cta: STUDIO_URL, ctaLabel: "View Your Improved CV",
    },
    4: {
      subject: "One better CV can change a year",
      body: `Sometimes one stronger application leads to:\n\n- A better salary\n- A better role\n- Better momentum\n\nYour preview is still waiting.`,
      cta: STUDIO_URL, ctaLabel: "See the Difference",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: preview_no_purchase (HOT INTENT) ───────────────────────────────────

function buildPreviewEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const identityLine = careerCategory === "executive"
    ? "Leaders present themselves at the level they want to reach."
    : careerCategory === "mid-senior"
    ? "Professionals at your stage are judged on how they present their results — not just what they did."
    : "A stronger first impression from your CV changes who responds to you.";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Your upgraded CV is ready",
      body: `You have already seen the difference.\n\nThe stronger version of your CV is ready to download — watermark-free, formatted, tailored.\n\nYou were one step away.`,
      cta: STUDIO_URL, ctaLabel: "Get My Upgraded CV",
    },
    2: {
      subject: "You are one step away from a stronger CV",
      body: `${identityLine}\n\nYour upgraded CV is still waiting. You have already done the hard part — your profile is ready, your experience is there.\n\nThe gap between your old CV and a stronger one is one decision.`,
      cta: STUDIO_URL, ctaLabel: "Download the Stronger Version",
    },
    3: {
      subject: "Do not leave your improved CV behind",
      body: `Your upgraded CV draft is still available.\n\nEvery week applying with a weaker version of your CV is a week of reduced odds.\n\nThe result is already prepared. You just need to claim it.`,
      cta: STUDIO_URL, ctaLabel: "Claim Your Upgraded CV",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: missing_info ───────────────────────────────────────────────────────

function buildMissingInfoEmail(n: number, ctx: UserContext) {
  const { firstName } = ctx;

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "We found details missing from your CV",
      body: `Your profile is set up, but some sections look incomplete.\n\nA complete profile lets our AI produce a much stronger result — the difference between a generic output and something that feels personally written.\n\nIt takes about two minutes to fill in the gaps.`,
      cta: CV_BUILDER_URL, ctaLabel: "Complete My Profile",
    },
    2: {
      subject: "Complete your profile for a stronger result",
      body: `Your CV improvement is waiting — but it needs your full profile to work properly.\n\nThe more detail you give, the better the result. Work history, skills, achievements — each one strengthens your output.\n\nFinish in two minutes.`,
      cta: CV_BUILDER_URL, ctaLabel: "Add My Details",
    },
    3: {
      subject: "Two minutes could improve your CV significantly",
      body: `Your account is ready. Your profile just needs a few more details.\n\nWe cannot generate a strong, personalized CV from a partial profile.\n\nFill in the remaining sections and we will do the rest.`,
      cta: CV_BUILDER_URL, ctaLabel: "Finish My Profile",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: cv_purchased (cover letter + generic interview nudge) ──────────────

function buildCvPurchasedEmail(n: number, ctx: UserContext) {
  const { firstName, headline } = ctx;
  const roleHint = headline || "your target role";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    2: {
      subject: "Need a matching cover letter?",
      body: `A strong CV gets attention.\n\nA tailored cover letter builds the case for why you are the right fit — in the employer's language, for their specific role.\n\nGenerate one in minutes using the job description you already provided.`,
      cta: STUDIO_URL, ctaLabel: "Generate My Cover Letter",
    },
    3: {
      subject: "Prepare before interviews arrive",
      body: `Many people improve their CV first, then need interview prep fast when calls start coming.\n\nWe created role-specific questions for ${roleHint} with model answers based on your profile.\n\nBetter to practice now than scramble later.`,
      cta: INTERVIEW_URL, ctaLabel: "Practice Interview Questions",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: interview_upsell (dedicated push for CV-only buyers) ───────────────

function buildInterviewUpsellEmail(n: number, ctx: UserContext) {
  const { firstName, headline, careerCategory } = ctx;
  const roleHint = headline || "your target role";

  const stageNote = careerCategory === "executive"
    ? "At the senior level, interviews are about strategic fit and leadership narrative — not just competence. Preparation makes the difference between offer and rejection."
    : careerCategory === "mid-senior"
    ? "At your level, interviewers probe for depth — specific results, how you handle conflict, what you own. Practiced answers land better than improvised ones."
    : "Interviews feel unpredictable until you have practiced the common patterns. Most questions follow a structure you can prepare for.";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    2: {
      subject: "Now prepare for the interview too",
      body: `Your CV got stronger. The next step is walking in prepared.\n\n${stageNote}\n\nWe generated role-specific interview questions for ${roleHint} — with model answers based on your actual experience.`,
      cta: INTERVIEW_URL, ctaLabel: "See My Interview Questions",
    },
    3: {
      subject: "Your CV got attention — next is interview readiness",
      body: `If your stronger CV is getting responses, interviews will follow.\n\nMost candidates wing it. The ones who prepare are the ones who get offers.\n\nYour tailored interview questions are waiting — 20 questions specific to ${roleHint}.`,
      cta: INTERVIEW_URL, ctaLabel: "Prepare for My Interview",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: social_proof ───────────────────────────────────────────────────────

function buildSocialProofEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const audienceNote = careerCategory === "executive"
    ? "Senior professionals who update their CV positioning before a move report significantly better reception from headhunters and boards."
    : "Candidates who tailor their CV to each role are three times more likely to get an interview call.";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Why professionals upgrade before applying",
      body: `${audienceNote}\n\nThe difference is rarely experience — it is presentation.\n\nMost CVs describe what people did. Strong CVs show the impact of what they did.\n\nYour upgraded version already reflects that difference.`,
      cta: STUDIO_URL, ctaLabel: "See My Upgraded CV",
    },
    2: {
      subject: "What stronger presentation can change",
      body: `One application to the right company, with a CV that clearly communicates your value, can change the trajectory of your year.\n\nWe did not change your experience. We changed how it reads.\n\nYour improved version is still available.`,
      cta: STUDIO_URL, ctaLabel: "View My Improved CV",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: repeat_buyer ───────────────────────────────────────────────────────

function buildRepeatBuyerEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const contextLine = careerCategory === "executive"
    ? "Leaders often return to FuseCV before advisory roles, board positions, or senior transitions."
    : careerCategory === "mid-senior"
    ? "People at your stage often revisit their CV before a promotion conversation, a new search, or a market change."
    : "Many people return when a new opportunity appears — a better company, a step up, or a fresh start.";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Applying again soon?",
      body: `${contextLine}\n\nIf you are preparing for your next move, your profile is already here — you just need to update it and generate a fresh version.\n\nIt takes minutes, not hours.`,
      cta: DASHBOARD_URL, ctaLabel: "Update My CV",
    },
    2: {
      subject: "Your career changed — has your CV?",
      body: `Since you last downloaded your CV, you have likely added wins, refined your direction, or developed new skills.\n\nA CV that reflects who you are today will perform better than one from months ago.\n\nRefresh it now.`,
      cta: DASHBOARD_URL, ctaLabel: "Refresh My CV",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── Flow: dormant ────────────────────────────────────────────────────────────

function buildDormantEmail(n: number, ctx: UserContext) {
  const { firstName, careerCategory } = ctx;

  const stageBody = careerCategory === "executive"
    ? "Leaders update their positioning when new opportunities arise — board roles, advisory positions, senior moves.\n\nIf something is on the horizon, your CV should be ready."
    : careerCategory === "mid-senior"
    ? "People at your stage usually revisit their CV before a promotion, a salary conversation, or a move to a stronger company.\n\nIf any of those are on your mind, now is a good time."
    : "People revisit their CV before promotions, salary moves, job switches, or new goals.\n\nIf now is your moment, we are ready.";

  const emails: Record<number, { subject: string; body: string; cta: string; ctaLabel: string }> = {
    1: {
      subject: "Ready for your next move?",
      body: stageBody,
      cta: DASHBOARD_URL, ctaLabel: "Update My CV",
    },
    2: {
      subject: "Your experience has grown. Has your CV?",
      body: `You may have more wins, stronger skills, and better results than when you last updated your CV.\n\nLet us reflect that properly. It takes less time than you think.`,
      cta: DASHBOARD_URL, ctaLabel: "Refresh My CV",
    },
  };

  const e = emails[n]; if (!e) return null;
  return fmt(firstName, e.subject, e.body, e.cta, e.ctaLabel);
}

// ─── HTML formatter ───────────────────────────────────────────────────────────

function fmt(
  firstName: string,
  subject: string,
  body: string,
  ctaHref: string,
  ctaLabel: string
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
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

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

</table>
</td></tr>
</table>
</body></html>`;

  const text = `Hi ${firstName},\n\n${body}\n\n${ctaLabel}: ${ctaHref}\n\n— FuseCV\n${SITE_URL}\n\nUnsubscribe: ${unsubBase}`;

  return { subject, html, text };
}

// ─── Brevo sender ─────────────────────────────────────────────────────────────

async function sendBrevoEmail(opts: {
  to: string; toName: string; subject: string; html: string; text: string;
}): Promise<void> {
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
    throw new Error(`Brevo error: ${JSON.stringify(err)}`);
  }
}
