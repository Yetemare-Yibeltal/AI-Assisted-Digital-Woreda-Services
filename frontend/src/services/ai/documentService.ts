import aiClient from "./aiClient";
import { readFileAsBase64 } from "@/utils/file";

export async function scanDocument(file: File) {
  const base64 = await readFileAsBase64(file);
  const response = await aiClient.scanDocument(base64, file.name, file.type);
  return response?.data || null;
}

export async function verifyDocument(file: File) {
  const base64 = await readFileAsBase64(file);
  const response = await aiClient.verifyDocument(base64, file.name, file.type);
  return response?.data || null;
}

export default { scanDocument, verifyDocument };
