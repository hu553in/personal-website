"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

import { site } from "./data";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme, systemTheme } = useTheme();

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

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    // When the choice matches the system theme, drop the override entirely so
    // the site keeps following the OS instead of pinning a stale preference.
    const apply = () => {
      setTheme(next === systemTheme ? "system" : next);
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !document.startViewTransition) {
      apply();
      return;
    }

    document.startViewTransition(apply);
  };

  return (
    <button
      aria-label="Toggle theme"
      type="button"
      onClick={toggle}
      className="fixed top-2 right-2 flex size-8 items-center justify-center text-muted transition-colors hover:text-(--ink)"
    >
      <FaMoon aria-hidden="true" className="size-4 shrink-0 dark:hidden" />
      <FaSun aria-hidden="true" className="hidden size-4 shrink-0 dark:block" />
    </button>
  );
};

export { ThemeToggle };
