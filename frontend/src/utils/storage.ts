const PREFIX = "dangila_";

const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key);
      if (item === null || item === "undefined") return defaultValue ?? null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return defaultValue ?? null;
    }
  },

  set(key: string, value: unknown): void {
    try {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(PREFIX + key, serialized);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.error("LocalStorage quota exceeded. Clearing old data...");
        this.clearAll();
        try {
          localStorage.setItem(PREFIX + key, JSON.stringify(value));
        } catch {
          console.error("Storage still full after cleanup");
        }
      } else {
        console.error(`Storage set error for key "${key}":`, error);
      }
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
    }
  },

  has(key: string): boolean {
    return localStorage.getItem(PREFIX + key) !== null;
  },

  clearAll(): void {
    const keysToKeep = ["language"];
    const allKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith(PREFIX),
    );
    allKeys.forEach((key) => {
      const shortKey = key.replace(PREFIX, "");
      if (!keysToKeep.includes(shortKey)) {
        localStorage.removeItem(key);
      }
    });
  },

  clearAuth(): void {
    this.remove("accessToken");
    this.remove("refreshToken");
    this.remove("user");
    this.remove("permissions");
  },

  getAccessToken(): string | null {
    return localStorage.getItem(PREFIX + "accessToken");
  },

  setAccessToken(token: string): void {
    if (!token) {
      this.remove("accessToken");
      return;
    }
    localStorage.setItem(PREFIX + "accessToken", token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(PREFIX + "refreshToken");
  },

  setRefreshToken(token: string): void {
    if (!token) {
      this.remove("refreshToken");
      return;
    }
    localStorage.setItem(PREFIX + "refreshToken", token);
  },

  getUser<T>(): T | null {
    return this.get<T>("user");
  },

  setUser(user: unknown): void {
    this.set("user", user);
  },

  getPermissions(): string[] {
    return this.get<string[]>("permissions") || [];
  },

  setPermissions(permissions: string[]): void {
    this.set("permissions", permissions);
  },

  getLanguage(): "en" | "am" {
    const lang = localStorage.getItem(PREFIX + "language");
    if (lang === "am") return "am";
    return "en";
  },

  setLanguage(lang: "en" | "am"): void {
    localStorage.setItem(PREFIX + "language", lang);
  },

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  getTokenPayload(): Record<string, unknown> | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  },
};

export { storage };
export default storage;
