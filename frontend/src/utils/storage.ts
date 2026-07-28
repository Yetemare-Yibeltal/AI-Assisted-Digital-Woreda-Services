export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch {
      const item = localStorage.getItem(key);
      return (item as unknown as T) ?? defaultValue ?? null;
    }
  },

  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      localStorage.setItem(key, String(value));
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem("accessToken", token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem("refreshToken", token);
  },

  getUser: <T>(): T | null => {
    return storage.get<T>("user");
  },

  setUser: (user: unknown): void => {
    storage.set("user", user);
  },

  getLanguage: (): "en" | "am" => {
    return (localStorage.getItem("language") as "en" | "am") || "en";
  },

  setLanguage: (lang: "en" | "am"): void => {
    localStorage.setItem("language", lang);
  },

  clearAuth: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};
