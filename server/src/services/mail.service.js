import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    logger.warn("SMTP settings are incomplete. Mailer service will run in log-only console fallback mode.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || "noreply@prepmasterai.com";

  if (!transporter) {
    logger.info(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
    logger.info(`[EMAIL HTML CONTENT]:\n${html}\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"PrepMaster AI" <${fromEmail}>`,
      to,
      subject,
      html
    });
    logger.info(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error("Error sending email: ", error);
    return false;
  }
};

export const sendOTPEmail = async (email, fullName, otpCode) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #0f172a; color: #f8fafc;">
      <h2 style="color: #06b6d4; text-align: center;">PrepMaster AI</h2>
      <hr style="border-color: #1e293b;" />
      <p>Hello ${fullName},</p>
      <p>You have requested a verification code/one-time password (OTP) for your account authentication or password reset.</p>
      <div style="background-color: #1e293b; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #8b5cf6;">${otpCode}</span>
      </div>
      <p>This code will expire in 10 minutes. If you did not request this email, you can safely ignore it.</p>
      <p>Best regards,<br />The PrepMaster Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Your PrepMaster AI OTP: ${otpCode}`,
    html: htmlContent
  });
};
