// lib/server/email.ts
//
// Real email delivery via Resend's REST API (plain fetch — no SDK
// dependency needed). If RESEND_API_KEY is configured, this actually
// sends. If it isn't:
//   - In development (NODE_ENV !== "production"): logs the message to
//     the server console so local testing of the reset flow works
//     without an email account. This is a DEV CONVENIENCE ONLY and is
//     explicitly not production behavior.
//   - In production: logs a loud error and does NOT pretend to have sent
//     anything. Callers still return a generic success to the client
//     (to avoid leaking whether an account exists), so a missing key
//     shows up in server logs, not as a silently-"working" reset flow.

export async function sendEmail(opts: { to: string; subject: string; text: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS ?? "OMV <noreply@example.com>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV EMAIL — not actually sent] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}`);
      return true;
    }
    console.error("RESEND_API_KEY is not configured — email NOT sent:", opts.subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: opts.text }),
    });
    if (!res.ok) {
      console.error("Resend rejected the email:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email provider unreachable:", err);
    return false;
  }
}
