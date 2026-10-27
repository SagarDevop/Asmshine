const nodemailer = require('nodemailer');

/**
 * Creates email transport based on environment variables
 */
const getTransporter = () => {
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
      auth: {
        user,
        pass
      }
    });
  }

  return null;
};

/**
 * Sends a 6-digit registration OTP to the specified user email
 */
exports.sendOtpEmail = async ({ to, name, otp }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || '"ASM Shine Hygiene" <no-reply@asmshine.com>';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2874F0; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ASM SHINE</h2>
        <span style="font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 1px;">HOME HYGIENE &amp; CLEANING</span>
      </div>
      <p style="font-size: 15px; color: #1E293B; line-height: 1.5;">Hello <strong>${name || 'Member'}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">Thank you for registering with ASM Shine. Please use the verification code below to activate your clean home account:</p>
      
      <div style="background: #F1F5F9; border: 1.5px dashed #CBD5E1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2874F0; display: inline-block;">${otp}</span>
      </div>

      <p style="font-size: 13px; color: #64748B; line-height: 1.4;">This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94A3B8; text-align: center; margin: 0;">© 2026 ASM Shine. All rights reserved. Clean Home Rewards Circle.</p>
    </div>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject: `Your ASM Shine Verification Code: ${otp}`,
        text: `Your ASM Shine registration verification code is: ${otp}. It expires in 10 minutes.`,
        html: htmlContent
      });
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err) {
      console.error('[EMAIL SERVICE ERROR] Failed to send email via SMTP transport:', err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  } else {
    // Development fallback when SMTP is not configured
    console.log('\n=============================================================');
    console.log('[DEV EMAIL SERVICE NOTICE] SMTP credentials not configured.');
    console.log(`[DEV OTP DELIVERY] Code for ${to}: ${otp} (Valid for 10m)`);
    console.log('To send real emails, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env');
    console.log('=============================================================\n');
    return {
      success: true,
      simulated: true,
      otp // Provided in response only when unconfigured in dev mode
    };
  }
};
