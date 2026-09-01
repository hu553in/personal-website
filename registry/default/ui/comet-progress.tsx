"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Five compact rows fit the complete grid into a 20px-high track.
const rowCount = 5;
const cellStep = 4;
const cellSize = 3;
const cellRadius = 0.75;
const gridHeight = rowCount * cellStep;
// Cap the tail so its transition stays consistent at any container width.
const maxFrontLengthInCells = 64;
const frontSparkReachInCells = 2.5;
const frontSparkThresholdBase = 0.78;
const frontSparkThresholdGrowth = 0.2;
// Random shimmer may vary below this envelope, but cannot flash opaque at the dissolving tip.
const frontTipOpacityCeiling = 0.12;
// Keep only the very end of the diffuse tip away from the bar edges, then fade those rows in.
const outerRowFrontInset = 0.06;
// Independent short-lived row tips keep the front moving like several narrow flame tongues.
const minRowTipOffsetInCells = -5;
const maxRowTipOffsetInCells = 1.5;
const rowTipRetargetMinMs = 120;
const rowTipRetargetRangeMs = 420;
const rowTipResponse = 8;
// Short randomized intervals with eased motion keep cells irregular without frame-to-frame noise.
const shimmerRetargetMinMs = 160;
const shimmerRetargetRangeMs = 560;
const shimmerResponse = 7;
const settledOpacityFloor = 0.5;
const frontShimmerExponent = 3;
const minimumVisibleOpacity = 0.025;
// 60 cells per second stays smooth at high refresh rates; the frame cap prevents visible skips.
const headCellsPerSecond = 60;
const maxHeadAdvancePerFrame = 1;
// Limit background-tab time jumps so the front remains visible when animation resumes.
const maxFrameElapsedSeconds = 1 / 15;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const defaultMin = 0;
const defaultMax = 100;

interface ShimmerCell {
  current: number;
  nextTargetAt: number;
  target: number;
}

interface RowTip {
  currentOffset: number;
  nextTargetAt: number;
  targetOffset: number;
}

type AccessibleNameProps =
  | Readonly<{ "aria-label": string; "aria-labelledby"?: string }>
  | Readonly<{ "aria-label"?: string; "aria-labelledby": string }>;

type CometProgressProps = Omit<
  ComponentProps<"div">,
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "aria-valuetext"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "dangerouslySetInnerHTML"
  | "role"
> &
  AccessibleNameProps & {
    getValueText?: (value: number, min: number, max: number) => string;
    max?: number;
    min?: number;
    onAnimationComplete?: () => void;
    value: number;
  };

const getDefaultValueText = (value: number, min: number, max: number) =>
  `${String(Math.round(((value - min) / (max - min)) * 100))}%`;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isValidRange = (min: number, max: number) =>
  max > min && Number.isFinite(max - min);

const resolveRange = (minProp: number, maxProp: number) => {
  const min = isFiniteNumber(minProp) ? minProp : defaultMin;

  if (isFiniteNumber(maxProp) && isValidRange(min, maxProp)) {
    return [min, maxProp] as const;
  }

  const fallbackMax = min + defaultMax;

  return isValidRange(min, fallbackMax)
    ? ([min, fallbackMax] as const)
    : ([defaultMin, defaultMax] as const);
};

const subscribeToReducedMotion = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(reducedMotionQuery);

  mediaQuery.addEventListener("change", onChange);

  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
};

const getReducedMotionSnapshot = () =>
  window.matchMedia(reducedMotionQuery).matches;

const getServerReducedMotionSnapshot = () => false;

// Registry consumers may server-render on React 18, where useLayoutEffect warns.
const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const getFrontLength = (columnCount: number) =>
  Math.min(columnCount, maxFrontLengthInCells);

const getExitDistance = (columnCount: number) =>
  getFrontLength(columnCount) - minRowTipOffsetInCells;

const getTargetHead = (progress: number, columnCount: number) =>
  progress >= 1
    ? columnCount + getExitDistance(columnCount)
    : progress * columnCount;

const createShimmerCell = (time: number): ShimmerCell => ({
  current: Math.random(),
  nextTargetAt:
    time + shimmerRetargetMinMs + Math.random() * shimmerRetargetRangeMs,
  target: Math.random(),
});

const resizeShimmerCells = (
  cells: ShimmerCell[],
  previousColumnCount: number,
  nextColumnCount: number,
  time: number
) => {
  const resizedCells: ShimmerCell[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < nextColumnCount; column += 1) {
      resizedCells.push(
        (column < previousColumnCount
          ? cells[row * previousColumnCount + column]
          : undefined) ?? createShimmerCell(time)
      );
    }
  }

  return resizedCells;
};

const getRandomRowTipOffset = () =>
  minRowTipOffsetInCells +
  Math.random() * (maxRowTipOffsetInCells - minRowTipOffsetInCells);

const createRowTips = (time: number): RowTip[] =>
  Array.from({ length: rowCount }, () => ({
    currentOffset: getRandomRowTipOffset(),
    nextTargetAt:
      time + rowTipRetargetMinMs + Math.random() * rowTipRetargetRangeMs,
    targetOffset: getRandomRowTipOffset(),
  }));

const updateShimmer = (
  cell: ShimmerCell,
  time: number,
  easingFactor: number,
  animate: boolean
) => {
  if (!animate) {
    return cell.current;
  }

  if (time >= cell.nextTargetAt) {
    cell.target = Math.random();
    cell.nextTargetAt =
      time + shimmerRetargetMinMs + Math.random() * shimmerRetargetRangeMs;
  }

  cell.current += (cell.target - cell.current) * easingFactor;

  return cell.current;
};

const updateRowTip = (
  tip: RowTip,
  time: number,
  easingFactor: number,
  maxAdvance: number,
  animate: boolean
) => {
  if (!animate) {
    return tip.currentOffset;
  }

  if (time >= tip.nextTargetAt) {
    tip.targetOffset = getRandomRowTipOffset();
    tip.nextTargetAt =
      time + rowTipRetargetMinMs + Math.random() * rowTipRetargetRangeMs;
  }

  const nextOffset =
    tip.currentOffset + (tip.targetOffset - tip.currentOffset) * easingFactor;

  tip.currentOffset = Math.min(nextOffset, tip.currentOffset + maxAdvance);

  return tip.currentOffset;
};

const drawProgress = (
  context: CanvasRenderingContext2D,
  head: number,
  columnCount: number,
  scale: number,
  activeColor: string,
  shimmerCells: ShimmerCell[],
  rowTips: RowTip[],
  time: number,
  elapsed: number,
  maxRowTipAdvance: number,
  animate: boolean
) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  if (head <= 0) {
    return;
  }

  context.fillStyle = activeColor;
  const frontLength = getFrontLength(columnCount);
  const rowTipEasingFactor = animate
    ? 1 - Math.exp(-elapsed * rowTipResponse)
    : 0;
  const shimmerEasingFactor = animate
    ? 1 - Math.exp(-elapsed * shimmerResponse)
    : 0;

  for (let row = 0; row < rowCount; row += 1) {
    const rowTip = rowTips[row];
    const isOuterRow = row === 0 || row === rowCount - 1;

    if (!rowTip) {
      continue;
    }

    const rowHead =
      head +
      updateRowTip(rowTip, time, rowTipEasingFactor, maxRowTipAdvance, animate);
    const candidateColumnCount = clamp(
      Math.ceil(rowHead + frontSparkReachInCells),
      0,
      columnCount
    );

    for (let column = 0; column < candidateColumnCount; column += 1) {
      const shimmerCell = shimmerCells[row * columnCount + column];

      if (!shimmerCell) {
        continue;
      }

      const shimmer = updateShimmer(
        shimmerCell,
        time,
        shimmerEasingFactor,
        animate
      );
      const cellCenter = column + 0.5;
      const distanceFromHead = rowHead - cellCenter;
      let opacity: number;

      if (distanceFromHead < 0) {
        if (isOuterRow) {
          continue;
        }

        const distanceAhead = -distanceFromHead;
        const sparkThreshold =
          frontSparkThresholdBase +
          (distanceAhead / frontSparkReachInCells) * frontSparkThresholdGrowth;

        if (
          distanceAhead > frontSparkReachInCells ||
          shimmer <= sparkThreshold
        ) {
          continue;
        }

        const sparkOpacity = (shimmer - sparkThreshold) / (1 - sparkThreshold);
        const sparkOpacityCeiling =
          frontTipOpacityCeiling * (1 - distanceAhead / frontSparkReachInCells);

        opacity = Math.min(sparkOpacity, sparkOpacityCeiling);
      } else {
        const settledOpacity =
          settledOpacityFloor + shimmer * (1 - settledOpacityFloor);

        if (distanceFromHead > frontLength) {
          opacity = settledOpacity;
        } else {
          const rawFrontProgress = distanceFromHead / frontLength;
          const frontInset = isOuterRow ? outerRowFrontInset : 0;

          if (rawFrontProgress <= frontInset) {
            continue;
          }

          const frontProgress =
            (rawFrontProgress - frontInset) / (1 - frontInset);
          const easedFrontProgress =
            frontProgress * frontProgress * (3 - 2 * frontProgress);
          const frontOpacity = shimmer ** frontShimmerExponent;
          const blendedOpacity =
            frontOpacity + (settledOpacity - frontOpacity) * easedFrontProgress;
          const tipOpacityCeiling = isOuterRow ? 0 : frontTipOpacityCeiling;
          const opacityCeiling =
            tipOpacityCeiling + (1 - tipOpacityCeiling) * easedFrontProgress;

          opacity = Math.min(blendedOpacity, opacityCeiling);
        }
      }

      if (opacity < minimumVisibleOpacity) {
        continue;
      }

      context.globalAlpha = opacity;
      context.beginPath();
      context.roundRect(
        (column * cellStep + 0.5) * scale,
        (row * cellStep + 0.5) * scale,
        cellSize * scale,
        cellSize * scale,
        cellRadius * scale
      );
      context.fill();
    }
  }

  context.globalAlpha = 1;
};

const CometProgress = ({
  className,
  getValueText = getDefaultValueText,
  max: maxProp = 100,
  min: minProp = 0,
  onAnimationComplete,
  value: valueProp,
  ...props
}: CometProgressProps) => {
  const shouldReduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternId = useId().replaceAll(":", "");
  const redrawStaticProgressRef = useRef<((progress: number) => void) | null>(
    null
  );
  const resetProgressRef = useRef<(() => void) | null>(null);
  const resumeAnimationRef = useRef<(() => void) | null>(null);
  const animationCompletedRef = useRef(false);
  const [min, max] = resolveRange(minProp, maxProp);
  const value = isFiniteNumber(valueProp) ? clamp(valueProp, min, max) : min;
  const progress = (value - min) / (max - min);
  const valueText = getValueText(value, min, max);
  const progressRef = useRef(progress);
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  useClientLayoutEffect(() => {
    const progressChanged = progressRef.current !== progress;

    progressRef.current = progress;
    onAnimationCompleteRef.current = onAnimationComplete;

    if (progress <= 0) {
      resetProgressRef.current?.();
      animationCompletedRef.current = false;
    } else if (progress < 1) {
      animationCompletedRef.current = false;
    }

    if (progressChanged && progress > 0) {
      resumeAnimationRef.current?.();
    }
  }, [onAnimationComplete, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let activeColor = getComputedStyle(canvas).color;
    let scale = window.devicePixelRatio || 1;
    let columnCount = 0;
    let isMeasurable = false;
    let shimmerCells: ShimmerCell[] = [];
    const rowTips = createRowTips(performance.now());
    let displayedHead: number | null = null;
    let lastDrawnStaticProgress: number | null = null;
    const drawStaticProgress = (staticProgress?: number) => {
      if (!shouldReduceMotion || columnCount === 0) {
        return;
      }

      const currentProgress = staticProgress ?? progressRef.current;

      drawProgress(
        context,
        getTargetHead(currentProgress, columnCount),
        columnCount,
        scale,
        activeColor,
        shimmerCells,
        rowTips,
        0,
        0,
        0,
        false
      );
      lastDrawnStaticProgress = currentProgress;
    };
    const redrawStaticProgress = (staticProgress: number) => {
      if (staticProgress !== lastDrawnStaticProgress) {
        drawStaticProgress(staticProgress);
      }
    };

    redrawStaticProgressRef.current = shouldReduceMotion
      ? redrawStaticProgress
      : null;
    const resizeCanvas = () => {
      const cssWidth = canvas.getBoundingClientRect().width;

      if (cssWidth <= 0) {
        isMeasurable = false;
        return;
      }

      isMeasurable = true;
      const nextScale = window.devicePixelRatio || 1;
      const nextColumnCount = Math.max(1, Math.ceil(cssWidth / cellStep));

      canvas.width = Math.max(1, Math.round(cssWidth * nextScale));
      canvas.height = gridHeight * nextScale;
      scale = nextScale;

      if (nextColumnCount !== columnCount) {
        if (displayedHead !== null && columnCount > 0) {
          if (displayedHead <= columnCount) {
            displayedHead = (displayedHead / columnCount) * nextColumnCount;
          } else {
            const previousExitDistance = getExitDistance(columnCount);
            const nextExitDistance = getExitDistance(nextColumnCount);
            const exitProgress =
              (displayedHead - columnCount) / previousExitDistance;

            displayedHead = nextColumnCount + exitProgress * nextExitDistance;
          }
        }

        shimmerCells = resizeShimmerCells(
          shimmerCells,
          columnCount,
          nextColumnCount,
          performance.now()
        );
        columnCount = nextColumnCount;
      }

      if (displayedHead === null) {
        displayedHead = progressRef.current * columnCount;
      }
      drawStaticProgress();

      if (progressRef.current > 0) {
        resumeAnimationRef.current?.();
      }
    };
    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(canvas);
    // ResizeObserver tracks layout; window resize also catches pixel-ratio changes.
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const refreshActiveColor = () => {
      const nextColor = getComputedStyle(canvas).color;

      if (nextColor === activeColor) {
        return;
      }

      activeColor = nextColor;
      drawStaticProgress();
    };
    const colorObserver = new MutationObserver(refreshActiveColor);

    for (
      let ancestor = canvas.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      colorObserver.observe(ancestor, {
        attributeFilter: ["class", "data-theme", "style"],
        attributes: true,
      });
    }

    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    colorScheme.addEventListener("change", refreshActiveColor);
    let animationFrame: number | undefined;
    let previousTime: number | null = null;
    const stopAnimation = () => {
      if (animationFrame === undefined) {
        return;
      }

      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      previousTime = null;
    };
    const resetProgress = () => {
      displayedHead = 0;
      stopAnimation();
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    };

    resetProgressRef.current = resetProgress;
    const loop = (time: number) => {
      const targetProgress = progressRef.current;

      if (
        targetProgress <= 0 &&
        (displayedHead === null || displayedHead <= 0)
      ) {
        stopAnimation();
        return;
      }

      if (!isMeasurable || columnCount === 0 || displayedHead === null) {
        stopAnimation();
        return;
      }

      const elapsed =
        previousTime === null
          ? 0
          : Math.min((time - previousTime) / 1000, maxFrameElapsedSeconds);
      const targetHead = getTargetHead(targetProgress, columnCount);
      const previousHead = displayedHead;
      const headAdvance = Math.min(
        headCellsPerSecond * elapsed,
        maxHeadAdvancePerFrame
      );

      displayedHead += Math.min(targetHead - displayedHead, headAdvance);

      const remainingRowTipAdvance = Math.max(
        0,
        maxHeadAdvancePerFrame - Math.max(0, displayedHead - previousHead)
      );

      drawProgress(
        context,
        displayedHead,
        columnCount,
        scale,
        activeColor,
        shimmerCells,
        rowTips,
        time,
        elapsed,
        remainingRowTipAdvance,
        true
      );

      if (targetHead <= 0 && displayedHead <= 0) {
        stopAnimation();
        return;
      }

      if (
        targetProgress >= 1 &&
        displayedHead >= targetHead &&
        !animationCompletedRef.current
      ) {
        animationCompletedRef.current = true;
        onAnimationCompleteRef.current?.();
      }

      previousTime = time;
      animationFrame = requestAnimationFrame(loop);
    };
    const startAnimation = () => {
      if (animationFrame !== undefined) {
        return;
      }

      previousTime = null;
      animationFrame = requestAnimationFrame(loop);
    };
    let isVisible = false;
    const resumeAnimation = () => {
      if (isVisible) {
        startAnimation();
      }
    };

    resumeAnimationRef.current = resumeAnimation;
    const visibilityObserver = shouldReduceMotion
      ? null
      : new IntersectionObserver(([entry]) => {
          if (!entry) {
            return;
          }

          isVisible = entry.isIntersecting;

          if (entry.isIntersecting) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });

    visibilityObserver?.observe(canvas);

    return () => {
      stopAnimation();

      if (redrawStaticProgressRef.current === redrawStaticProgress) {
        redrawStaticProgressRef.current = null;
      }
      if (resetProgressRef.current === resetProgress) {
        resetProgressRef.current = null;
      }
      if (resumeAnimationRef.current === resumeAnimation) {
        resumeAnimationRef.current = null;
      }

      colorObserver.disconnect();
      colorScheme.removeEventListener("change", refreshActiveColor);
      visibilityObserver?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) {
      redrawStaticProgressRef.current?.(progress);

      if (progress >= 1 && !animationCompletedRef.current) {
        animationCompletedRef.current = true;
        onAnimationCompleteRef.current?.();
      }
    }
  }, [progress, shouldReduceMotion]);

  // A native progress element cannot contain the SVG and canvas grid.
  /* oxlint-disable jsx-a11y/prefer-tag-over-role -- This custom rendering still exposes the complete progressbar contract. */
  return (
    <div
      {...props}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className={cn(
        "bg-muted ring-foreground/10 w-full rounded-lg p-1 ring-1 ring-inset",
        className
      )}
      data-slot="comet-progress"
      role="progressbar"
    >
      <div className="relative h-5 w-full overflow-hidden rounded-sm">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full"
          focusable="false"
        >
          <defs>
            <pattern
              height={cellStep}
              id={`${patternId}-empty`}
              patternUnits="userSpaceOnUse"
              width={cellStep}
            >
              <rect
                fill="var(--comet-progress-empty, color-mix(in oklab, var(--muted-foreground) 10%, transparent))"
                height={cellSize}
                rx={cellRadius}
                width={cellSize}
                x={0.5}
                y={0.5}
              />
            </pattern>
          </defs>
          <rect fill={`url(#${patternId}-empty)`} height="100%" width="100%" />
        </svg>
        <canvas
          aria-hidden="true"
          className="absolute inset-0 size-full"
          height={gridHeight}
          ref={canvasRef}
          style={{
            color:
              "var(--comet-progress-active, color-mix(in oklab, var(--primary) 72%, var(--muted)))",
            imageRendering: "pixelated",
          }}
          width={0}
        />
      </div>
    </div>
  );
  /* oxlint-enable jsx-a11y/prefer-tag-over-role */
};

export { CometProgress, type CometProgressProps };
