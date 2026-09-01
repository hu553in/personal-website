"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CometProgress } from "@/registry/default/ui/comet-progress";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const CometProgressPreview = () => {
  const replayFrame = useRef<number | null>(null);
  const [value, setValue] = useState(0);
  const replay = useCallback(() => {
    if (window.matchMedia(reducedMotionQuery).matches) {
      return;
    }

    setValue(0);
    replayFrame.current = requestAnimationFrame(() => {
      replayFrame.current = null;
      setValue(100);
    });
  }, []);

  useEffect(() => {
    replayFrame.current = requestAnimationFrame(() => {
      replayFrame.current = null;
      setValue(100);
    });

    return () => {
      if (replayFrame.current !== null) {
        cancelAnimationFrame(replayFrame.current);
      }
    };
  }, []);

  return (
    <CometProgress
      aria-label="Comet progress demo"
      onAnimationComplete={replay}
      value={value}
    />
  );
};

export { CometProgressPreview };
