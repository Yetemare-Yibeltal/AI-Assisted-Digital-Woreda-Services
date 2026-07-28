export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const slugify = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const deslugify = (slug: string): string => {
  if (!slug) return "";
  return slug
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const generateTrackingDisplay = (trackingNumber: string): string => {
  if (!trackingNumber) return "";
  const parts = trackingNumber.split("-");
  if (parts.length === 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return trackingNumber;
};

export const formatTrackingNumber = (trackingNumber: string): string => {
  if (!trackingNumber) return "";
  return trackingNumber.toUpperCase().trim();
};

export const maskPhoneNumber = (
  phone: string,
  visibleStart: number = 4,
  visibleEnd: number = 2,
): string => {
  if (!phone || phone.length < visibleStart + visibleEnd) return "****";
  const start = phone.slice(0, visibleStart);
  const end = phone.slice(-visibleEnd);
  const maskedLength = phone.length - visibleStart - visibleEnd;
  return start + "*".repeat(Math.max(maskedLength, 4)) + end;
};

export const maskEmail = (email: string): string => {
  if (!email || !email.includes("@")) return "****@****";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `**@${domain}`;
  }
  const maskedLocal = localPart[0] + "***" + localPart[localPart.length - 1];
  const domainParts = domain.split(".");
  const maskedDomain =
    domainParts.length > 1
      ? domainParts[0][0] + "***" + "." + domainParts.slice(1).join(".")
      : domain;
  return `${maskedLocal}@${maskedDomain}`;
};

export const maskIdNumber = (
  idNumber: string,
  visibleChars: number = 4,
): string => {
  if (!idNumber || idNumber.length <= visibleChars) return "****";
  return (
    "*".repeat(idNumber.length - visibleChars) + idNumber.slice(-visibleChars)
  );
};

export const getInitials = (fullName: string, maxChars: number = 2): string => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, maxChars).toUpperCase();
  return parts
    .slice(0, maxChars)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    "#009A44",
    "#00C853",
    "#1B5E20",
    "#4CAF50",
    "#FEDD00",
    "#FF8F00",
    "#EF6C00",
    "#EF3340",
    "#C62828",
    "#E53935",
    "#1565C0",
    "#0277BD",
    "#0288D1",
    "#6A1B9A",
    "#8E24AA",
    "#7B1FA2",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "?").length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

export const randomId = (length: number = 10): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

export const generatePassword = (length: number = 12): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@$!%*?&#";
  const all = uppercase + lowercase + numbers + special;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = "";
  password += uppercase[array[0] % uppercase.length];
  password += lowercase[array[1] % lowercase.length];
  password += numbers[array[2] % numbers.length];
  password += special[array[3] % special.length];

  for (let i = 4; i < length; i++) {
    password += all[array[i] % all.length];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

export const truncateText = (
  text: string,
  maxLength: number = 100,
  suffix: string = "...",
): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

export const truncateMiddle = (
  text: string,
  startChars: number = 6,
  endChars: number = 4,
): string => {
  if (!text || text.length <= startChars + endChars + 3) return text;
  return text.slice(0, startChars) + "..." + text.slice(-endChars);
};

export const stripHtml = (html: string): string => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

export const pluralize = (
  count: number,
  singular: string,
  plural?: string,
): string => {
  return count === 1 ? singular : plural || singular + "s";
};

export const formatList = (items: string[], maxDisplay: number = 3): string => {
  if (!items || items.length === 0) return "";
  if (items.length <= maxDisplay) return items.join(", ");
  const displayed = items.slice(0, maxDisplay).join(", ");
  return `${displayed} and ${items.length - maxDisplay} more`;
};

export const formatEnumValue = (value: string): string => {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

export const normalizeSearch = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s\u1200-\u137F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const highlightMatch = (text: string, query: string): string => {
  if (!query || !text) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  return text.replace(regex, "<mark>$1</mark>");
};

export const containsAmharic = (text: string): boolean => {
  if (!text) return false;
  return /[\u1200-\u137F]/.test(text);
};

export const getTextDirection = (text: string): "ltr" | "rtl" => {
  if (!text) return "ltr";
  const amharicChars = (text.match(/[\u1200-\u137F]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  if (totalChars === 0) return "ltr";
  return amharicChars / totalChars > 0.3 ? "ltr" : "ltr";
};
