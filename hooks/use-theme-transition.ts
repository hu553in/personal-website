"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const useThemeTransition = () => {
  const themeApi = useTheme();
  const { setTheme } = themeApi;
  const requestedThemeRef = useRef(themeApi.theme ?? "system");
  const transitionRequestRef = useRef(0);

  useEffect(() => {
    requestedThemeRef.current = themeApi.theme ?? "system";
  }, [themeApi.theme]);

  const setThemeWithTransition = useCallback(
    (nextTheme: Parameters<typeof setTheme>[0]) => {
      const requestedTheme =
        typeof nextTheme === "function"
          ? nextTheme(requestedThemeRef.current)
          : nextTheme;

      requestedThemeRef.current = requestedTheme;
      transitionRequestRef.current += 1;
      const transitionRequest = transitionRequestRef.current;
      const shouldReduceMotion = window.matchMedia(reducedMotionQuery).matches;

      if (shouldReduceMotion || !document.startViewTransition) {
        setTheme(requestedTheme);
        return;
      }

      const transition = document.startViewTransition(() => {
        if (transitionRequest === transitionRequestRef.current) {
          setTheme(requestedTheme);
        }
      });

      // A newer transition skips the old animation, but its theme update still runs.
      /* oxlint-disable-next-line promise/prefer-await-to-callbacks, promise/prefer-await-to-then -- ViewTransition.ready is the API's failure signal. */
      void transition.ready.catch(() => null);
    },
    [setTheme]
  );

  return { ...themeApi, setTheme: setThemeWithTransition };
};

export { useThemeTransition };
