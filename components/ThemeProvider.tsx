"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store";

export function ThemeProvider() {
  const theme = useDashboardStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Handle system theme changes listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Only react if we are in system mode (although the first effect handles the 'theme' dependency, 
      // this handles external system changes while keeping 'system' mode active)
      if (useDashboardStore.getState().theme === "system") {
         const root = window.document.documentElement;
         root.classList.remove("light", "dark");
         root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return null;
}
