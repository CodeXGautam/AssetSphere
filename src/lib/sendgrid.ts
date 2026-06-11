import sgMail from "@sendgrid/mail";

// Read env lazily inside functions — not at module load time
// This prevents issues with Next.js hot-reload and Edge/Node env timing

function getConfig() {
  return {
    apiKey:    process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL ?? "noreply@assetsphere.app",
    appUrl:    process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    superadminEmail: process.env.SUPERADMIN_EMAIL,
  };
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const { apiKey, fromEmail } = getConfig();
  if (!apiKey) {
    console.info("[email skipped — no SENDGRID_API_KEY]", { to, subject });
    return;
  }
  sgMail.setApiKey(apiKey);
  await sgMail.send({ to, from: fromEmail, subject, html });
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return send(to, subject, html);
}

/* ------------------------------------------------------------------
   Typed email templates
------------------------------------------------------------------ */

/** Notify superadmin that a new org is pending approval */
export async function sendOrgPendingEmail({
  orgName, orgEmail, founderName, founderEmail,
}: { orgName: string; orgEmail: string; founderName: string; founderEmail: string; }) {
  const { superadminEmail, appUrl } = getConfig();
  if (!superadminEmail) {
    console.warn("[sendOrgPendingEmail] SUPERADMIN_EMAIL is not set — skipping notification");
    return;
  }
  await send(
    superadminEmail,
    `[AssetSphere] New organisation pending approval: ${orgName}`,
    `<h2>New Organisation Request</h2>
    <p>A new organisation has requested access to AssetSphere and needs your approval.</p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px;color:#6b7280">Org name</td><td style="padding:6px 12px;font-weight:600">${orgName}</td></tr>
      <tr><td style="padding:6px 12px;color:#6b7280">Org email</td><td style="padding:6px 12px">${orgEmail}</td></tr>
      <tr><td style="padding:6px 12px;color:#6b7280">Founder</td><td style="padding:6px 12px">${founderName}</td></tr>
      <tr><td style="padding:6px 12px;color:#6b7280">Founder email</td><td style="padding:6px 12px">${founderEmail}</td></tr>
    </table>
    <p style="margin-top:24px">
      <a href="${appUrl}/superadmin/orgs" style="background:#5b5ef4;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        Review in dashboard
      </a>
    </p>`
  );
}

/** Notify org founder their application was approved */
export async function sendOrgApprovedEmail({ to, orgName }: { to: string; orgName: string; }) {
  const { appUrl } = getConfig();
  await send(
    to,
    `[AssetSphere] Your organisation "${orgName}" has been approved`,
    `<h2>Welcome to AssetSphere!</h2>
    <p>Great news — your organisation <strong>${orgName}</strong> has been approved.</p>
    <p style="margin-top:24px">
      <a href="${appUrl}/login" style="background:#5b5ef4;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Sign in now</a>
    </p>`
  );
}

/** Notify org founder their application was rejected */
export async function sendOrgRejectedEmail({ to, orgName, reason }: { to: string; orgName: string; reason?: string; }) {
  await send(
    to,
    `[AssetSphere] Update on your organisation application: ${orgName}`,
    `<h2>Application Update</h2>
    <p>Unfortunately, your application for <strong>${orgName}</strong> was not approved at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
    <p>Please contact us if you have questions.</p>`
  );
}

/** Send an invite email to a new member */
export async function sendInviteEmail({ to, orgName, inviterName, token }: {
  to: string; orgName: string; inviterName: string; token: string;
}) {
  const { appUrl } = getConfig();
  const link = `${appUrl}/invite/${token}`;
  await send(
    to,
    `${inviterName} invited you to join ${orgName} on AssetSphere`,
    `<h2>You have been invited!</h2>
    <p><strong>${inviterName}</strong> invited you to join <strong>${orgName}</strong> on AssetSphere.</p>
    <p style="margin-top:24px">
      <a href="${link}" style="background:#5b5ef4;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accept Invitation</a>
    </p>
    <p style="margin-top:16px;font-size:12px;color:#6b7280">Or copy: ${link}</p>`
  );
}
