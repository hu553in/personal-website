"use client";

import { useEffect, useState } from "react";

import { CometProgress } from "@/registry/default/ui/comet-progress";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const CometProgressPreview = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    let interval: ReturnType<typeof setInterval> | undefined;
    const restart = () => {
      clearInterval(interval);
      setValue(mediaQuery.matches ? 100 : 0);

      if (!mediaQuery.matches) {
        // Reach 100% in four seconds; keep each endpoint visible for one 200ms tick.
        interval = setInterval(() => {
          setValue((current) => (current >= 100 ? 0 : current + 5));
        }, 200);
      }
    };

    restart();
    mediaQuery.addEventListener("change", restart);

    return () => {
      clearInterval(interval);
      mediaQuery.removeEventListener("change", restart);
    };
  }, []);

  return <CometProgress aria-label="Comet progress demo" value={value} />;
};

export { CometProgressPreview };
