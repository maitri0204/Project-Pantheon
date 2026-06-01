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
  purpose: "signup" | "login" | "registration";
}): Promise<void> => {
  const transporter = getTransporter();

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`[OTP:${purpose}] ${email} => ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: `"Assessment Centre" <${process.env.SMTP_USER}>`,
    to: email,
    subject:
      purpose === "signup"
        ? "Verify your Assessment Centre account"
        : purpose === "registration"
          ? "Verify your organization registration email"
          : "Your Assessment Centre login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="margin: 0 0 8px; color: #0f172a;">Assessment Centre</h2>
        <p style="margin: 0 0 16px; color: #475569;">Hello ${firstName},</p>
        <p style="margin: 0 0 16px; color: #334155;">Use the OTP below to ${
          purpose === "signup"
            ? "verify your signup"
            : purpose === "registration"
              ? "verify your organization registration"
              : "continue your login"
        }.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb; text-align: center; background: white; border: 1px dashed #60a5fa; border-radius: 12px; padding: 20px;">
          ${otp}
        </div>
        <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">This OTP expires in 10 minutes.</p>
      </div>
    `,
  });
};

export const sendRegistrationConfirmationEmail = async ({
  email,
  firstName,
  companyName,
  websiteLink,
  loginEmail,
}: {
  email: string;
  firstName: string;
  companyName: string;
  websiteLink: string;
  loginEmail: string;
}): Promise<void> => {
  const transporter = getTransporter();

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`[REGISTRATION_CONFIRMATION] ${email} => Portal Login: ${websiteLink}`);
    return;
  }

  await transporter.sendMail({
    from: `"Assessment Centre" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to Assessment Centre - Your ${companyName} Whitelabel Portal is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="margin: 0 0 8px; color: #2563eb; font-size: 28px;">Welcome to Assessment Centre!</h1>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">Your whitelabel portal is now live</p>
          
          <p style="margin: 0 0 24px; color: #334155; font-size: 15px;">Hello <strong>${firstName}</strong>,</p>
          
          <p style="margin: 0 0 20px; color: #334155; font-size: 15px;">Congratulations! Your organization <strong>${companyName}</strong> has been successfully registered on Assessment Centre. Your whitelabel portal is now ready to use.</p>
          
          <div style="background: #f0f9ff; border: 2px solid #06b6d4; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px; color: #0369a1; font-size: 16px;">Your Portal Details</h3>
            
            <div style="margin: 0 0 12px;">
              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Portal Website</p>
              <a href="${websiteLink}" style="display: inline-block; color: #2563eb; font-size: 15px; font-weight: 600; text-decoration: none; word-break: break-all;">${websiteLink}</a>
            </div>
            
            <div style="margin: 0 0 12px;">
              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Login Email</p>
              <p style="margin: 0; color: #334155; font-size: 15px;">${loginEmail}</p>
            </div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Next Steps:</strong> Use the portal website link above to log in. Only users from your registered organization can access this whitelabel portal.
            </p>
          </div>
          
          <p style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">
            If you didn't create this account or have any questions, please contact our support team.
          </p>
          
          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">Best regards,<br>The Assessment Centre Team</p>
        </div>
      </div>
    `,
  });
};

export const sendAssessmentReportToStudent = async ({
  email,
  firstName,
  assessmentName,
  pdfBuffer,
  fileName,
}: {
  email: string;
  firstName: string;
  assessmentName: string;
  pdfBuffer: Buffer;
  fileName: string;
}): Promise<void> => {
  const transporter = getTransporter();
  const safeName = firstName.replace(/[<>"]/g, "");

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`[EMAIL_REPORT] Would send report "${fileName}" to ${email}`);
    return;
  }

  await transporter.sendMail({
    from: `"Assessment Centre" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your ${assessmentName} Report`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 8px; color: #2563eb;">Your Report is Ready!</h2>
          <p style="margin: 0 0 16px; color: #334155;">Hi <strong>${safeName}</strong>, congratulations on completing the <strong>${assessmentName}</strong>!</p>
          <p style="margin: 0 0 16px; color: #475569; font-size: 14px;">Your detailed report has been attached to this email as a PDF. Please find it below.</p>
          <p style="margin: 24px 0 0; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">This is an automated email from Assessment Centre. Please do not reply.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};

export const sendAQReportEmail = async ({
  email,
  firstName,
  lastName,
  aqScore,
  aqLevel,
  htmlReport,
}: {
  email: string;
  firstName: string;
  lastName: string;
  aqScore: number;
  aqLevel: string;
  htmlReport: string;
}): Promise<void> => {
  const transporter = getTransporter();
  const safeName = firstName.replace(/[<>"]/g, "");

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(
      `[EMAIL_AQ_REPORT] Would send AQ report to ${email}: AQ=${aqScore}, Level=${aqLevel}`
    );
    return;
  }

  await transporter.sendMail({
    from: `"Assessment Centre" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Adversity Quotient (AQ) Assessment Report - ${aqLevel} Resilience`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="margin: 0 0 8px; color: #2563eb; font-size: 28px;">Adversity Quotient Assessment</h1>
          <p style="margin: 0 0 24px; color: #334155;">Hi <strong>${safeName}</strong>, here's your detailed assessment report:</p>
          
          <!-- AQ Score Summary -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <div style="font-size: 48px; font-weight: bold; margin: 0 0 8px;">${aqScore}</div>
            <div style="font-size: 18px; margin: 0;">AQ Score</div>
            <div style="font-size: 14px; margin-top: 12px; opacity: 0.9;">Level: <strong>${aqLevel}</strong></div>
          </div>
          
          <!-- Detailed Report -->
          <div style="margin: 24px 0; padding: 20px; background: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 4px;">
            ${htmlReport}
          </div>
          
          <p style="margin: 24px 0 0; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">This is an automated email from Assessment Centre. Please do not reply.</p>
        </div>
      </div>
    `,
  });
};

