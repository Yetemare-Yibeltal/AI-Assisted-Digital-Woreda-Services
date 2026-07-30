import fs from "fs";
import path from "path";

export const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    return false;
  }
};

export const getFileSize = (filePath: string): number => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};

export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

export const generateUniqueFilename = (originalName: string): string => {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
};

export const listFiles = (dirPath: string): string[] => {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [];
  }
};

export const moveFile = (oldPath: string, newPath: string): boolean => {
  try {
    ensureDir(path.dirname(newPath));
    fs.renameSync(oldPath, newPath);
    return true;
  } catch (error) {
    console.error(`Failed to move file from ${oldPath} to ${newPath}:`, error);
    return false;
  }
};

export const saveBase64File = (base64: string, filePath: string): void => {
  const buffer = Buffer.from(base64, "base64");
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, buffer);
};

export const readFileAsBase64 = (filePath: string): string => {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString("base64");
};

export const cleanupDirectory = (dirPath: string, maxAgeMs: number): number => {
  let deletedCount = 0;
  const files = listFiles(dirPath);
  const now = Date.now();
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    } catch {
      // skip files that can't be read
    }
  }
  return deletedCount;
};
