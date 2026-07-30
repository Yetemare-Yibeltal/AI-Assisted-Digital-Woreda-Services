import nodemailer from "nodemailer";
import emailConfig from "../config/email";
import logger from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
});

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const emailJob = async (payload: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error("Email job failed:", error);
    throw error;
  }
};
