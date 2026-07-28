export const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

export const isYesterday = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  } catch {
    return false;
  }
};

export const isThisWeek = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return date >= weekStart && date < weekEnd;
  } catch {
    return false;
  }
};

export const isThisMonth = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  } catch {
    return false;
  }
};

export const isThisYear = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    return date.getFullYear() === new Date().getFullYear();
  } catch {
    return false;
  }
};

export const isOverdue = (dateString: string): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    return date < new Date();
  } catch {
    return false;
  }
};

export const isUpcoming = (
  dateString: string,
  withinDays: number = 7,
): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + withinDays);
    return date >= now && date <= future;
  } catch {
    return false;
  }
};

export const daysBetween = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const daysFromNow = (dateString: string): number => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const addDays = (dateString: string, days: number): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    date.setDate(date.getDate() + days);
    return date.toISOString();
  } catch {
    return dateString;
  }
};

export const subtractDays = (dateString: string, days: number): string => {
  return addDays(dateString, -days);
};

export const getCurrentDateISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const getCurrentDateTimeISO = (): string => {
  return new Date().toISOString();
};

export const formatDateForInput = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const getStartOfDay = (dateString?: string): Date => {
  const date = dateString ? new Date(dateString) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getEndOfDay = (dateString?: string): Date => {
  const date = dateString ? new Date(dateString) : new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getStartOfWeek = (): Date => {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay());
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getStartOfMonth = (): Date => {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getStartOfYear = (): Date => {
  const now = new Date();
  now.setMonth(0, 1);
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getAge = (dateOfBirth: string): number => {
  try {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
};

export const getEthiopianDate = (
  dateString?: string,
): { year: number; month: number; day: number; formatted: string } => {
  const date = dateString ? new Date(dateString) : new Date();
  const ethiopianYear = date.getFullYear() - 8;
  const ethiopianMonth = date.getMonth() + 4;
  const adjustedMonth =
    ethiopianMonth > 12 ? ethiopianMonth - 12 : ethiopianMonth;
  const adjustedYear = ethiopianMonth > 12 ? ethiopianYear + 1 : ethiopianYear;
  const day = date.getDate();

  const monthNames = [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahsas",
    "Tir",
    "Yekatit",
    "Megabit",
    "Miazia",
    "Ginbot",
    "Sene",
    "Hamle",
    "Nehase",
    "Pagume",
  ];

  return {
    year: adjustedYear,
    month: adjustedMonth,
    day,
    formatted: `${monthNames[adjustedMonth - 1] || ""} ${day}, ${adjustedYear}`,
  };
};

export const getRelativeTimeString = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  } catch {
    return dateString;
  }
};

export const formatDuration = (days: number): string => {
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""}`;
  if (days < 365)
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""}`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""}`;
};
