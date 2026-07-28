import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const generateUUID = (): string => {
  return uuidv4();
};

const generateShortId = (length: number = 10): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
};

const generateNumericId = (length: number = 8): string => {
  const chars = "0123456789";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
};

const generateApplicationId = (sequence: number): string => {
  const paddedSeq = String(sequence).padStart(6, "0");
  return `APP-${paddedSeq}`;
};

const generateTrackingNumber = (sequence: number): string => {
  const paddedSeq = String(sequence).padStart(8, "0");
  return `DNG-${paddedSeq}`;
};

const generateEmployeeId = (department: string, sequence: number): string => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const paddedSeq = String(sequence).padStart(4, "0");
  return `EMP-${deptCode}-${paddedSeq}`;
};

const generateReferenceNumber = (prefix: string, date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomPart = generateShortId(5).toUpperCase();
  return `${prefix}-${year}${month}${day}-${randomPart}`;
};

const generateOTP = (length: number = 6): string => {
  return generateNumericId(length);
};

const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export {
  generateUUID,
  generateShortId,
  generateNumericId,
  generateApplicationId,
  generateTrackingNumber,
  generateEmployeeId,
  generateReferenceNumber,
  generateOTP,
  generateToken,
  generateSlug,
};

export default {
  generateUUID,
  generateShortId,
  generateNumericId,
  generateApplicationId,
  generateTrackingNumber,
  generateEmployeeId,
  generateReferenceNumber,
  generateOTP,
  generateToken,
  generateSlug,
};
