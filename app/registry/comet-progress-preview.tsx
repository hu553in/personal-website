"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { CometProgress } from "@/registry/default/ui/comet-progress";

const AnimatedCometProgressPreview = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Reach 100% in four seconds; keep each endpoint visible for one 200ms tick.
    const interval = setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : current + 5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return <CometProgress aria-label="Comet progress demo" value={value} />;
};

const CometProgressPreview = () => {
  const reducedMotion = useReducedMotion(false);
  return reducedMotion ? (
    <CometProgress aria-label="Comet progress demo" value={100} />
  ) : (
    <AnimatedCometProgressPreview />
  );
};

export { CometProgressPreview };
