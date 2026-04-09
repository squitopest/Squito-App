import { Resend } from "resend";

// Lazy init — don't crash the build if key is missing
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Supabase Storage public URLs for email images
const SUPABASE_STORAGE =
  "https://gsbakbeoaurgzoodqpgt.supabase.co/storage/v1/object/public/email-assets";
const LOGO_URL = `${SUPABASE_STORAGE}/squito_logo_v2.png`;
const FAMILY_URL = `${SUPABASE_STORAGE}/family_yard.png`;

const WEBSITE = "https://www.squitopestcontrol.com";

interface WelcomeEmailParams {
  to: string;
  displayName: string;
}

export async function sendWelcomeEmail({ to, displayName }: WelcomeEmailParams) {
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set — skipping welcome email.");
    return { success: false, error: "No API key" };
  }

  const firstName = displayName.split(" ")[0] || "Friend";

  const { data, error } = await resend.emails.send({
    from: "Squito Pest Control <welcome@squitopestcontrol.com>",
    to: [to],
    subject: `Welcome to the Squito Family, ${firstName}!`,
    html: buildWelcomeHTML(firstName),
  });

  if (error) {
    console.error("[Email] Welcome email failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}

function buildWelcomeHTML(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Squito</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Logo Header -->
          <tr>
            <td style="background-color:#111111;padding:28px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Squito" width="160" style="display:block;margin:0 auto;" />
              <p style="margin:10px 0 0;color:#6b9e11;font-size:11px;font-weight:700;letter-spacing:2px;">
                SMART. SAFE. PEST CONTROL.
              </p>
            </td>
          </tr>

          <!-- Family Image -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${FAMILY_URL}" alt="Family enjoying their yard" width="560" style="display:block;width:100%;height:auto;" />
            </td>
          </tr>

          <!-- Welcome Copy -->
          <tr>
            <td style="padding:36px 36px 20px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#111;line-height:1.3;">
                Hey ${firstName}, Welcome to the Family!
              </h1>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#444;">
                Thanks for creating your Squito account. We protect homes across
                Long Island with smart, safe, pet-friendly pest control — and now
                yours is next.
              </p>
              <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#444;">
                We also added <strong style="color:#6b9e11;">50 PestPoints</strong> to
                your account as a welcome gift. Use them toward future services
                and rewards.
              </p>
            </td>
          </tr>

          <!-- Single CTA -->
          <tr>
            <td style="padding:8px 36px 32px;text-align:center;">
              <a href="${WEBSITE}/plans"
                style="display:inline-block;background-color:#6b9e11;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;">
                Browse Protection Plans
              </a>
            </td>
          </tr>

          <!-- Quick Contact -->
          <tr>
            <td style="padding:0 36px 28px;">
              <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">
                Questions? Call us at
                <a href="tel:6312031000" style="color:#6b9e11;text-decoration:none;font-weight:600;">(631) 203-1000</a>
                or email
                <a href="mailto:service@getsquito.com" style="color:#6b9e11;text-decoration:none;font-weight:600;">service@getsquito.com</a>.
                We're here to help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 36px;border-top:1px solid #eee;">
              <p style="margin:0;font-size:11px;color:#999;line-height:1.6;">
                Squito Pest Control · Long Island, New York<br/>
                <a href="${WEBSITE}" style="color:#6b9e11;text-decoration:none;">squitopestcontrol.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}
