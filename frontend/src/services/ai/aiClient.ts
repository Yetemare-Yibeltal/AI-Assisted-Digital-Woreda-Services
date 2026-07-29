import api from "@/utils/api";
import { storage } from "@/utils/storage";

interface AIClientOptions {
  timeout?: number;
  retries?: number;
}

const defaultOptions: AIClientOptions = {
  timeout: 15000,
  retries: 2,
};

export class AIClient {
  private options: AIClientOptions;

  constructor(options: AIClientOptions = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  private async request<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: any,
    retryCount = 0,
  ): Promise<T> {
    try {
      const config: any = {
        timeout: this.options.timeout,
      };
      let response;
      if (method === "get" || method === "delete") {
        response = await api[method](url, config);
      } else {
        response = await api[method](url, data, config);
      }
      return response.data;
    } catch (error: any) {
      if (retryCount < (this.options.retries || 0) && error?.status !== 401) {
        return this.request<T>(method, url, data, retryCount + 1);
      }
      throw error;
    }
  }

  async chat(message: string, sessionId?: string, language?: string) {
    return this.request<any>("post", "/ai/chat/message", {
      message,
      sessionId,
      language: language || storage.getLanguage(),
    });
  }

  async getRecommendations(query: string, maxResults = 5, language?: string) {
    return this.request<any>("post", "/ai/recommendations", {
      query,
      maxResults,
      language: language || storage.getLanguage(),
    });
  }

  async translate(text: string, sourceLang: string, targetLang: string) {
    return this.request<any>("post", "/ai/translations/translate", {
      text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
  }

  async scanDocument(fileBase64: string, fileName: string, fileType: string) {
    return this.request<any>("post", "/ai/documents/scan", {
      file: fileBase64,
      fileName,
      fileType,
    });
  }

  async verifyDocument(fileBase64: string, fileName: string, fileType: string) {
    return this.request<any>("post", "/ai/documents/verify", {
      file: fileBase64,
      fileName,
      fileType,
    });
  }

  async getFormAssist(
    fieldName: string,
    fieldLabel: string,
    currentValue: string,
    serviceName: string,
    language?: string,
  ) {
    return this.request<any>("post", "/ai/form/assist", {
      fieldName,
      fieldLabel,
      currentValue,
      serviceName,
      language: language || storage.getLanguage(),
    });
  }

  async getAIStatus() {
    return this.request<any>("get", "/ai/status");
  }
}

export const aiClient = new AIClient();
export default aiClient;
