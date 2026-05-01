import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
};

export const sendOtpEmail = async ({
  email,
  firstName,
  otp,
  purpose,
}: {
  email: string;
  firstName: string;
  otp: string;
  purpose: "signup" | "login";
}): Promise<void> => {
  const transporter = getTransporter();

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`[OTP:${purpose}] ${email} => ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: `"Project Pantheon" <${process.env.SMTP_USER}>`,
    to: email,
    subject: purpose === "signup" ? "Verify your Project Pantheon account" : "Your Project Pantheon login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="margin: 0 0 8px; color: #0f172a;">Project Pantheon</h2>
        <p style="margin: 0 0 16px; color: #475569;">Hello ${firstName},</p>
        <p style="margin: 0 0 16px; color: #334155;">Use the OTP below to ${purpose === "signup" ? "verify your signup" : "continue your login"}.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb; text-align: center; background: white; border: 1px dashed #60a5fa; border-radius: 12px; padding: 20px;">
          ${otp}
        </div>
        <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">This OTP expires in 10 minutes.</p>
      </div>
    `,
  });
};
