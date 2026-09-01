"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// Keep success visible long enough to register without delaying the next action.
const copiedStateDurationMs = 2000;

interface CodeBlockCopyButtonProperties {
  className?: string;
  code: string;
}

type CopyState = "copied" | "error" | "idle";

const copyFeedback = {
  copied: { announcement: "Code copied", label: "Copied" },
  error: { announcement: "Copy failed", label: "Copy failed, retry" },
  idle: { announcement: "", label: "Copy code" },
} as const satisfies Record<CopyState, { announcement: string; label: string }>;

const CodeBlockCopyButton = ({
  className,
  code,
}: CodeBlockCopyButtonProperties) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyAttempt = useRef(0);
  const copiedTimeout = useRef<number | null>(null);
  const copied = copyState === "copied";
  const { announcement, label } = copyFeedback[copyState];

  useEffect(
    () => () => {
      copyAttempt.current += 1;

      if (copiedTimeout.current !== null) {
        clearTimeout(copiedTimeout.current);
      }
    },
    []
  );

  const clearFeedbackTimeout = () => {
    if (copiedTimeout.current !== null) {
      clearTimeout(copiedTimeout.current);
      copiedTimeout.current = null;
    }
  };

  const copy = async () => {
    const attempt = copyAttempt.current + 1;

    copyAttempt.current = attempt;
    clearFeedbackTimeout();

    try {
      await navigator.clipboard.writeText(code);

      if (copyAttempt.current !== attempt) {
        return;
      }

      setCopyState("copied");
      copiedTimeout.current = window.setTimeout(() => {
        copiedTimeout.current = null;

        if (copyAttempt.current === attempt) {
          setCopyState("idle");
        }
      }, copiedStateDurationMs);
    } catch {
      if (copyAttempt.current !== attempt) {
        return;
      }

      setCopyState("error");
    }
  };

  return (
    <>
      <button
        aria-label={label}
        className={cn(
          "bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-ring flex size-6 items-center justify-center rounded-md shadow-[0_0_0_1px_var(--border)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
          className
        )}
        title={label}
        type="button"
        onClick={copy}
      >
        {copied ? (
          <Check
            aria-hidden="true"
            className="size-3 text-emerald-600 dark:text-emerald-400"
          />
        ) : (
          <Copy aria-hidden="true" className="size-3" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
};

export { CodeBlockCopyButton };
