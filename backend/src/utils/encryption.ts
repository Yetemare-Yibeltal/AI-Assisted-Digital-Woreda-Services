import crypto from "crypto";
import config from "../config/index";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = crypto.scryptSync(config.jwt.secret, "dangila-woreda-salt", 32);

const encrypt = (text: string): string => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
};

const decrypt = (encryptedText: string): string => {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
};

const hashValue = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

const hashWithSalt = (value: string, salt?: string): { hash: string; salt: string } => {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(value, usedSalt, 10000, 64, "sha512").toString("hex");
  return { hash, salt: usedSalt };
};

const verifyHash = (value: string, hash: string, salt: string): boolean => {
  const { hash: newHash } = hashWithSalt(value, salt);
  return crypto.timingSafeEqual(Buffer.from(newHash), Buffer.from(hash));
};

const generateResetToken = (): { token: string; hashedToken: string } => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashedToken };
};

const generateHMAC = (data: string): string => {
  return crypto.createHmac("sha256", config.jwt.secret).update(data).digest("hex");
};

const verifyHMAC = (data: string, signature: string): boolean => {
  try {
    const expectedSignature = generateHMAC(data);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
};

const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) return "*".repeat(data.length);
  const maskedLength = data.length - visibleChars;
  return "*".repeat(maskedLength) + data.slice(-visibleChars);
};

const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 8) return "*".repeat(phone.length);
  return phone.slice(0, 4) + "****" + phone.slice(-2);
};

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!domain) return "****@****";
  const maskedLocal =
    localPart.length <= 2 ? "**" : localPart[0] + "***" + localPart[localPart.length - 1];
  const domainParts = domain.split(".");
  const maskedDomain = domainParts[0][0] + "***" + domainParts.slice(1).join(".");
  return `${maskedLocal}@${maskedDomain}`;
};

export {
  encrypt,
  decrypt,
  hashValue,
  hashWithSalt,
  verifyHash,
  generateResetToken,
  generateHMAC,
  verifyHMAC,
  maskSensitiveData,
  maskPhoneNumber,
  maskEmail,
};

export default {
  encrypt,
  decrypt,
  hashValue,
  hashWithSalt,
  verifyHash,
  generateResetToken,
  generateHMAC,
  verifyHMAC,
  maskSensitiveData,
  maskPhoneNumber,
  maskEmail,
};
