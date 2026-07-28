import nodemailer from "nodemailer";
import config from "../config/index";
import logger from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string;
    contentType?: string;
  }>;
}

interface ApplicationStatusEmailData {
  applicantName: string;
  trackingNumber: string;
  serviceName: string;
  oldStatus: string;
  newStatus: string;
  notes: string;
  language: "en" | "am";
}

const createTransporter = () => {
  if (config.server.isDevelopment) {
    logger.info("Email service running in development mode - emails will be logged to console");
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      logger.info("DEV EMAIL:", {
        to: options.to,
        subject: options.subject,
        htmlPreview: options.html.substring(0, 200),
      });
      return true;
    }

    const mailOptions = {
      from: `"Dangila Woreda Services" <${config.email.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${options.to}`);
    return true;
  } catch (error) {
    logger.error("Email sending failed:", error);
    return false;
  }
};

const sendApplicationStatusEmail = async (
  email: string,
  data: ApplicationStatusEmailData
): Promise<boolean> => {
  const isAmharic = data.language === "am";

  const subject = isAmharic
    ? `የማመልከቻ ሁኔታ ዝማኝነት - ${data.trackingNumber}`
    : `Application Status Update - ${data.trackingNumber}`;

  const statusLabels: Record<string, { en: string; am: string }> = {
    pending: { en: "Pending", am: "በመጠባበቅ ላይ" },
    under_review: { en: "Under Review", am: "በግምገማ ላይ" },
    documents_requested: { en: "Documents Requested", am: "ሰነዶች ተጠይቀዋል" },
    approved: { en: "Approved", am: "ጸድቋል" },
    rejected: { en: "Rejected", am: "ውድቅ ተደርጓል" },
    completed: { en: "Completed", am: "ተጠናቋል" },
  };

  const oldStatusLabel = statusLabels[data.oldStatus]?.[data.language] || data.oldStatus;
  const newStatusLabel = statusLabels[data.newStatus]?.[data.language] || data.newStatus;

  const html = isAmharic
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5632;">የዳንግላ ወረዳ አገልግሎቶች</h2>
      <p>ውድ <strong>${data.applicantName}</strong>,</p>
      <p>የማመልከቻዎ ሁኔታ ተቀይሯል።</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>የመከታተያ ቁጥር:</strong></td><td>${data.trackingNumber}</td></tr>
        <tr><td><strong>አገልግሎት:</strong></td><td>${data.serviceName}</td></tr>
        <tr><td><strong>የቀድሞ ሁኔታ:</strong></td><td>${oldStatusLabel}</td></tr>
        <tr><td><strong>አዲስ ሁኔታ:</strong></td><td style="color: #2563eb; font-weight: bold;">${newStatusLabel}</td></tr>
        <tr><td><strong>ማስታወሻ:</strong></td><td>${data.notes}</td></tr>
      </table>
      <p>ይህን ማመልከቻ ለመከታተል ድረ-ገጻችንን ይጎብኙ።</p>
      <p style="color: #666;">ይህ አውቶማቲክ መልዕክት ነው። እባክዎ መልስ አይስጡ።</p>
    </div>
  `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5632;">Dangila Woreda Services</h2>
      <p>Dear <strong>${data.applicantName}</strong>,</p>
      <p>Your application status has been updated.</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Tracking Number:</strong></td><td>${data.trackingNumber}</td></tr>
        <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
        <tr><td><strong>Previous Status:</strong></td><td>${oldStatusLabel}</td></tr>
        <tr><td><strong>New Status:</strong></td><td style="color: #2563eb; font-weight: bold;">${newStatusLabel}</td></tr>
        <tr><td><strong>Notes:</strong></td><td>${data.notes}</td></tr>
      </table>
      <p>Visit our website to track your application.</p>
      <p style="color: #666;">This is an automated message. Please do not reply.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${config.urls.frontend}/admin/reset-password?token=${resetToken}`;

  const subject = "Password Reset Request - Dangila Woreda Services";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5632;">Dangila Woreda Services</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #1a5632; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

const sendDocumentRequestEmail = async (
  email: string,
  applicantName: string,
  trackingNumber: string,
  documents: string[],
  language: "en" | "am"
): Promise<boolean> => {
  const isAmharic = language === "am";

  const subject = isAmharic
    ? `ተጨማሪ ሰነዶች ያስፈልጋሉ - ${trackingNumber}`
    : `Additional Documents Required - ${trackingNumber}`;

  const documentsList = documents.map((doc) => `<li>${doc}</li>`).join("");

  const html = isAmharic
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5632;">የዳንግላ ወረዳ አገልግሎቶች</h2>
      <p>ውድ <strong>${applicantName}</strong>,</p>
      <p>ለማመልከቻዎ (${trackingNumber}) የሚከተሉት ተጨማሪ ሰነዶች ያስፈልጋሉ:</p>
      <ul>${documentsList}</ul>
      <p>እባክዎ እነዚህን ሰነዶች በተቻለ ፍጥነት ያቅርቡ።</p>
    </div>
  `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5632;">Dangila Woreda Services</h2>
      <p>Dear <strong>${applicantName}</strong>,</p>
      <p>The following additional documents are required for your application (${trackingNumber}):</p>
      <ul>${documentsList}</ul>
      <p>Please provide these documents as soon as possible.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

const sendWelcomeEmail = async (
  email: string,
  fullName: string,
  role: string,
  temporaryPassword: string
): Promise<boolean> => {
  const subject = "Welcome to Dangila Woreda Services";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a5632;">Welcome to Dangila Woreda Services</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Your admin account has been created with the role: <strong>${role}</strong>.</p>
      <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
      <p>Please login and change your password immediately.</p>
      <a href="${config.urls.frontend}/admin/login" style="display: inline-block; background-color: #1a5632; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login Now</a>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

export {
  sendEmail,
  sendApplicationStatusEmail,
  sendPasswordResetEmail,
  sendDocumentRequestEmail,
  sendWelcomeEmail,
};

export default {
  sendEmail,
  sendApplicationStatusEmail,
  sendPasswordResetEmail,
  sendDocumentRequestEmail,
  sendWelcomeEmail,
};
