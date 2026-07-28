import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "dark" | "light";
type AccentColor = "green" | "gold" | "red";

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (color: AccentColor) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  accent: "green",
  setMode: () => {},
  setAccent: () => {},
  toggleMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState<AccentColor>("green");

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
  }, [accent]);

  const toggleMode = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;