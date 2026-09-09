"use client";

import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getSnapshot = () => window.matchMedia(reducedMotionQuery).matches;

// Default to static content during SSR and hydration until the preference is known.
const useReducedMotion = (serverSnapshot = true) =>
  useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

export { useReducedMotion };
