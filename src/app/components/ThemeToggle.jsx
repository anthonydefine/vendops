"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export default function ThemeToggle() {
  const themeContext = useTheme(); // must match the name you use below

  // Avoid crashing if provider is not ready yet
  if (!themeContext || !themeContext.toggleTheme) {
    return null;
  }

  const { theme, toggleTheme } = themeContext;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="btn-icon"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
