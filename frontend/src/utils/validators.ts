export const ETHIOPIAN_PHONE_REGEX = /^(\+251|0)[9][0-9]{8}$/;
export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required";
  if (!ETHIOPIAN_PHONE_REGEX.test(phone)) {
    return "Please enter a valid Ethiopian phone number (e.g., 0912345678)";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain a lowercase letter";
  if (!/\d/.test(password)) return "Password must contain a number";
  if (!/[@$!%*?&#]/.test(password))
    return "Password must contain a special character (@$!%*?&#)";
  return null;
};

export const validateRequired = (
  value: string,
  fieldName: string,
): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  min: number,
  fieldName: string,
): string | null => {
  if (value && value.trim().length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  max: number,
  fieldName: string,
): string | null => {
  if (value && value.trim().length > max) {
    return `${fieldName} cannot exceed ${max} characters`;
  }
  return null;
};

export const validateDateOfBirth = (date: string): string | null => {
  if (!date) return "Date of birth is required";
  const dob = new Date(date);
  if (isNaN(dob.getTime())) return "Invalid date";
  if (dob > new Date()) return "Date of birth cannot be in the future";
  const age = Math.floor(
    (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365),
  );
  if (age > 120) return "Please enter a valid date of birth";
  return null;
};

export const validateFileSize = (
  file: File,
  maxSizeMB: number = 5,
): string | null => {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
};

export const validateFileType = (
  file: File,
  allowedTypes: string[],
): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed: ${allowedTypes.join(", ")}`;
  }
  return null;
};
