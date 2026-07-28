export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

export const validateFile = (
  file: File | null | undefined,
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    required?: boolean;
  } = {},
): FileValidationResult => {
  const {
    allowedTypes = ALLOWED_DOCUMENT_TYPES,
    maxSize = MAX_FILE_SIZE,
    required = false,
  } = options;

  if (!file) {
    if (required) {
      return { valid: false, error: "File is required", code: "FILE_REQUIRED" };
    }
    return { valid: true };
  }

  if (!file.name || file.size === 0) {
    return { valid: false, error: "File is empty", code: "FILE_EMPTY" };
  }

  if (!allowedTypes.includes(file.type)) {
    const typesList = allowedTypes
      .map((t) => t.split("/")[1]?.toUpperCase() || t)
      .join(", ");
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not allowed. Accepted: ${typesList}`,
      code: "FILE_TYPE_INVALID",
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum of ${maxSizeMB}MB`,
      code: "FILE_SIZE_EXCEEDED",
    };
  }

  return { valid: true };
};

export const validateMultipleFiles = (
  files: File[],
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    maxFiles?: number;
  } = {},
): FileValidationResult => {
  const { maxFiles = 5 } = options;

  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} files allowed. You selected ${files.length}.`,
      code: "MAX_FILES_EXCEEDED",
    };
  }

  for (const file of files) {
    const result = validateFile(file, options);
    if (!result.valid) return result;
  }

  return { valid: true };
};

export const getFileExtension = (filename: string): string => {
  if (!filename || !filename.includes(".")) return "";
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const getFileNameWithoutExtension = (filename: string): string => {
  if (!filename) return "";
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return filename;
  return filename.substring(0, lastDot);
};

export const generateFileName = (
  originalName: string,
  prefix: string = "doc",
): string => {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);
  return `${prefix}_${safeName}_${timestamp}_${random}.${ext}`;
};

export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.onabort = () => {
      reject(new Error("File reading was aborted"));
    };
    reader.readAsDataURL(file);
  });
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
};

export const createFileFromBase64 = (
  base64: string,
  filename: string,
  mimeType: string = "application/pdf",
): File => {
  const byteCharacters = atob(base64.split(",")[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

export const openFileInNewTab = (url: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getFileTypeIcon = (mimeType: string): string => {
  if (mimeType === "application/pdf") return "FileText";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Music";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "FileEdit";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "Table";
  return "File";
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export const isPDFFile = (file: File): boolean => {
  return file.type === "application/pdf";
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error("File is not an image"));
      return;
    }
    readFileAsBase64(file).then(resolve).catch(reject);
  });
};

export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
};
