export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generateTrackingDisplay = (trackingNumber: string): string => {
  if (!trackingNumber) return "";
  const parts = trackingNumber.split("-");
  if (parts.length === 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return trackingNumber;
};

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 8) return "****";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!domain) return "****@****";
  const maskedLocal =
    localPart.length <= 2
      ? "**"
      : localPart[0] + "***" + localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
};

export const getInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const randomId = (length: number = 10): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
