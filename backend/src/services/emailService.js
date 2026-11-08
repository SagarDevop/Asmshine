const nodemailer = require('nodemailer');

/**
 * Creates email transport based on SMTP environment variables (legacy fallback)
 */
const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Sends transactional email directly via Brevo (formerly Sendinblue) REST API v3
 * Uses native Node fetch - works seamlessly across all hosting providers without port blocking.
 */
const sendViaBrevo = async ({ to, name, subject, htmlContent, textContent }) => {
  const apiKey = (process.env.BREVO_API_KEY || process.env.BRAVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = (
    process.env.BREVO_SENDER_EMAIL ||
    process.env.EMAIL_FROM_ADDRESS ||
    'contact@asmshine.com'
  ).trim();

  const senderName = (
    process.env.BREVO_SENDER_NAME ||
    process.env.EMAIL_FROM_NAME ||
    'ASM Shine'
  ).trim();

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: to,
        name: name || 'Valued Customer'
      }
    ],
    subject,
    htmlContent,
    textContent: textContent || subject
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Brevo API HTTP ${response.status}`;
    console.error('[BREVO API ERROR]', errorMsg, data);
    throw new Error(`Brevo email delivery failed: ${errorMsg}`);
  }

  return {
    success: true,
    provider: 'brevo',
    messageId: data.messageId || 'brevo-sent'
  };
};

/**
 * Sends a 6-digit OTP email for Registration, Login, or Password Reset
 */
exports.sendOtpEmail = async ({ to, name, otp, purpose = 'SIGNUP' }) => {
  const isLogin = purpose === 'LOGIN';
  const isReset = purpose === 'RESET';

  const title = isLogin
    ? 'Login Verification Code'
    : isReset
    ? 'Password Reset Code'
    : 'Welcome to ASM Shine';

  const subtitle = isLogin
    ? 'Sign in to your ASM Shine account'
    : isReset
    ? 'Reset your ASM Shine account password'
    : 'Activate your clean home hygiene account';

  const introText = isLogin
    ? `Use the 6-digit verification code below to log in to your ASM Shine account.`
    : isReset
    ? `We received a request to reset your password. Use the verification code below to proceed:`
    : `Thank you for registering with ASM Shine. Use the verification code below to verify your email address and activate your account:`;

  const subject = isLogin
    ? `Your ASM Shine Login Code: ${otp}`
    : isReset
    ? `Your ASM Shine Password Reset Code: ${otp}`
    : `Your ASM Shine Verification Code: ${otp}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 500px; background-color: #FFFFFF; border-radius: 14px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
              
              <!-- Brand Header Strip -->
              <tr>
                <td style="background: linear-gradient(135deg, #1C8E8F 0%, #0D6E6F 100%); padding: 24px 28px; text-align: center;">
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ASM SHINE</h1>
                  <p style="margin: 4px 0 0 0; color: #E0F2FE; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Pure Home Hygiene &amp; Clean Care</p>
                </td>
              </tr>

              <!-- Email Body Content -->
              <tr>
                <td style="padding: 28px 28px 20px 28px;">
                  <h2 style="margin: 0 0 8px 0; color: #0F172A; font-size: 19px; font-weight: 700;">${title}</h2>
                  <p style="margin: 0 0 16px 0; color: #64748B; font-size: 13px;">${subtitle}</p>

                  <p style="margin: 0 0 18px 0; color: #334155; font-size: 14px; line-height: 1.5;">
                    Hello <strong>${name || 'Member'}</strong>,<br/>
                    ${introText}
                  </p>

                  <!-- OTP Highlight Card -->
                  <div style="background-color: #F0FDF4; border: 2px dashed #86EFAC; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 11px; color: #166534; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 6px;">Your 6-Digit Verification Code</span>
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #15803D; font-family: monospace; display: inline-block;">${otp}</span>
                  </div>

                  <!-- Validity & Security -->
                  <div style="background-color: #F8FAFC; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 12.5px; color: #64748B; line-height: 1.4;">
                      ⏱️ This code is valid for <strong>10 minutes</strong>.<br/>
                      🔒 For your account security, never share this code with anyone.
                    </p>
                  </div>

                  <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.4;">
                    If you did not request this verification code, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="border-top: 1px solid #F1F5F9; padding: 16px 28px; background-color: #FAFAFA; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                    © 2026 ASM Shine Official Store. All rights reserved.<br/>
                    Spotless Hygiene • Certified Formulations • Express Indian Dispatch
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

  const textContent = `Hello ${name || 'Member'},\n\n${introText}\n\nYour Verification Code: ${otp}\n(Valid for 10 minutes. Do not share with anyone.)\n\n© 2026 ASM Shine`;

  // 1. Try Brevo REST API first (recommended for production & cloud deployment)
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.BRAVO_API_KEY;
  if (brevoApiKey && brevoApiKey.trim()) {
    try {
      const brevoResult = await sendViaBrevo({
        to,
        name,
        subject,
        htmlContent,
        textContent
      });
      console.log(`[EMAIL SERVICE] Email successfully delivered to ${to} via Brevo API (MessageId: ${brevoResult.messageId})`);
      return brevoResult;
    } catch (brevoErr) {
      console.error('[EMAIL SERVICE WARNING] Brevo delivery failed, attempting SMTP fallback:', brevoErr.message);
      // Fall through to SMTP if configured
    }
  }

  // 2. Try SMTP Transport fallback
  const transporter = getSmtpTransporter();
  if (transporter) {
    const fromEmail = process.env.EMAIL_FROM || '"ASM Shine Hygiene" <no-reply@asmshine.com>';
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });
      console.log(`[EMAIL SERVICE] Email sent via SMTP to ${to} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'smtp', messageId: info.messageId, simulated: false };
    } catch (smtpErr) {
      console.error('[EMAIL SERVICE ERROR] SMTP delivery failed:', smtpErr.message);
      throw new Error(`Email delivery failed: ${smtpErr.message}`);
    }
  }

  // 3. Development Mode Simulation (when neither Brevo nor SMTP is set yet)
  console.log('\n=============================================================');
  console.log('[DEV EMAIL SERVICE NOTICE] Brevo API Key not configured in .env');
  console.log(`[DEV OTP DELIVERY] Code for ${to} (${purpose}): ${otp} (Valid for 10m)`);
  console.log('To send real emails to customer inboxes:');
  console.log('Set BREVO_API_KEY and BREVO_SENDER_EMAIL in backend/.env');
  console.log('=============================================================\n');

  return {
    success: true,
    provider: 'simulated',
    simulated: true,
    otp // Provided in response only when unconfigured in local dev mode
  };
};
