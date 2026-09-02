"use client";

import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FaMoon, FaSun } from "react-icons/fa6";

import { useThemeTransition } from "@/hooks/use-theme-transition";

import { site } from "./site-data";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme, systemTheme } = useThemeTransition();

  // The viewport meta tags are media-based; keep their content in sync with
  // the resolved theme so the browser chrome follows manual switches too.
  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }

    const color =
      resolvedTheme === "dark" ? site.themeColor.dark : site.themeColor.light;

    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute("content", color);
    }
  }, [resolvedTheme]);

  const getActiveTheme = (theme: string) =>
    theme === "system" ? (systemTheme ?? resolvedTheme) : theme;
  const toggle = () => {
    setTheme((currentTheme) => {
      const activeTheme = getActiveTheme(currentTheme);
      const nextTheme = activeTheme === "dark" ? "light" : "dark";

      // Keep following the OS when the next explicit choice already matches it.
      return nextTheme === systemTheme ? "system" : nextTheme;
    });
  };

  useHotkeys(
    "d",
    () => {
      setTheme((currentTheme) => {
        const activeTheme = getActiveTheme(currentTheme);

        return activeTheme === "dark" ? "light" : "dark";
      });
    },
    {
      ignoreEventWhen: (event) =>
        event.defaultPrevented || event.repeat || event.isComposing,
      preventDefault: true,
    },
    [resolvedTheme, setTheme, systemTheme]
  );

  return (
    <button
      aria-keyshortcuts="d"
      aria-label="Toggle theme"
      type="button"
      onClick={toggle}
      className="text-muted-foreground hover:text-foreground absolute top-2 right-2 z-30 flex size-8 items-center justify-center transition-colors"
    >
      <FaMoon aria-hidden="true" className="size-4 shrink-0 dark:hidden" />
      <FaSun aria-hidden="true" className="hidden size-4 shrink-0 dark:block" />
    </button>
  );
};

export { ThemeToggle };
