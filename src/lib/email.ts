import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

export interface NewsletterEmailData {
  to: string;
  name: string;
  title: string;
  semester?: string | null;
  chapterUpdates?: string | null;
  brotherAchievements?: string | null;
  alumniSpotlights?: string | null;
  upcomingEvents?: string | null;
  photosLinks?: string | null;
  unsubscribeUrl: string;
}

function buildNewsletterHtml(data: NewsletterEmailData): string {
  const sections = [];

  if (data.chapterUpdates) {
    sections.push(`
      <div style="margin-bottom:24px">
        <h2 style="color:#1e3a5f;font-size:18px;border-bottom:2px solid #c9a84c;padding-bottom:8px">Chapter Updates</h2>
        <p style="color:#374151;line-height:1.6">${data.chapterUpdates.replace(/\n/g, "<br>")}</p>
      </div>`);
  }

  if (data.brotherAchievements) {
    sections.push(`
      <div style="margin-bottom:24px">
        <h2 style="color:#1e3a5f;font-size:18px;border-bottom:2px solid #c9a84c;padding-bottom:8px">Brother Achievements</h2>
        <p style="color:#374151;line-height:1.6">${data.brotherAchievements.replace(/\n/g, "<br>")}</p>
      </div>`);
  }

  if (data.alumniSpotlights) {
    sections.push(`
      <div style="margin-bottom:24px">
        <h2 style="color:#1e3a5f;font-size:18px;border-bottom:2px solid #c9a84c;padding-bottom:8px">Alumni Spotlights</h2>
        <p style="color:#374151;line-height:1.6">${data.alumniSpotlights.replace(/\n/g, "<br>")}</p>
      </div>`);
  }

  if (data.upcomingEvents) {
    sections.push(`
      <div style="margin-bottom:24px">
        <h2 style="color:#1e3a5f;font-size:18px;border-bottom:2px solid #c9a84c;padding-bottom:8px">Upcoming Events</h2>
        <p style="color:#374151;line-height:1.6">${data.upcomingEvents.replace(/\n/g, "<br>")}</p>
      </div>`);
  }

  if (data.photosLinks) {
    sections.push(`
      <div style="margin-bottom:24px">
        <h2 style="color:#1e3a5f;font-size:18px;border-bottom:2px solid #c9a84c;padding-bottom:8px">Photos & Links</h2>
        <p style="color:#374151;line-height:1.6">${data.photosLinks.replace(/\n/g, "<br>")}</p>
      </div>`);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:0 auto;background:#fff">
        <div style="background:#1e3a5f;padding:32px;text-align:center">
          <h1 style="color:#c9a84c;margin:0;font-size:14px;letter-spacing:2px;text-transform:uppercase">Alpha Kappa Psi • Omega Theta • UMD</h1>
          <h2 style="color:#fff;margin:8px 0 0;font-size:24px">${data.title}</h2>
          ${data.semester ? `<p style="color:#94a3b8;margin:4px 0 0">${data.semester}</p>` : ""}
        </div>
        <div style="padding:32px">
          <p style="color:#374151">Hi ${data.name || "Alumni"},</p>
          <p style="color:#374151">Here's the latest from AKPsi Omega Theta at UMD.</p>
          ${sections.join("")}
        </div>
        <div style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="color:#6b7280;font-size:12px;margin:0">
            Alpha Kappa Psi • Omega Theta Chapter • University of Maryland
          </p>
          <p style="color:#6b7280;font-size:12px;margin:8px 0 0">
            <a href="${data.unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>`;
}

export async function sendNewsletterEmail(data: NewsletterEmailData) {
  const html = buildNewsletterHtml(data);
  const resend = getResendClient();
  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "AKPsi Omega Theta <noreply@example.com>",
    to: data.to,
    subject: `${data.title}${data.semester ? ` — ${data.semester}` : ""}`,
    html,
  });
}
