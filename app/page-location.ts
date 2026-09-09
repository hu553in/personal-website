type SectionPosition = Readonly<{ id: string; top: number }>;

// In the last viewport, move the reading line down so short trailing sections
// have distinct activation intervals without adding blank space after the page.
const readingGeometry = (viewport: number, maxScroll: number) => {
  const base = viewport * 0.25;
  const tailLength = Math.min(viewport, maxScroll);
  return {
    base,
    slope: tailLength > 0 ? (viewport - base - 1) / tailLength : 0,
    tailStart: maxScroll - tailLength,
  };
};

const readingPosition = (
  scrollY: number,
  viewport: number,
  maxScroll: number
) => {
  const y = Math.max(0, Math.min(scrollY, maxScroll));
  const { base, slope, tailStart } = readingGeometry(viewport, maxScroll);
  return y + base + Math.max(0, y - tailStart) * slope;
};

const getPageLocation = (
  sections: readonly SectionPosition[],
  scrollY: number,
  viewport: number,
  maxScroll: number
) => {
  if (scrollY <= 0) {
    return null;
  }
  const position = readingPosition(scrollY, viewport, maxScroll);
  return sections.findLast((section) => section.top <= position)?.id ?? null;
};

const getSectionScrollTarget = (
  sections: readonly SectionPosition[],
  id: string,
  viewport: number,
  maxScroll: number,
  scrollMargin: number
) => {
  const index = sections.findIndex((section) => section.id === id);
  const section = sections[index];
  if (!section) {
    return null;
  }
  const boundary = (top: number) => {
    const { base, slope, tailStart } = readingGeometry(viewport, maxScroll);
    const position =
      top <= tailStart + base
        ? top - base
        : (top - base + tailStart * slope) / (1 + slope);
    return Math.max(0, Math.min(position, maxScroll));
  };
  const start = boundary(section.top);
  const next = sections[index + 1];
  const end = next ? boundary(next.top) : maxScroll;
  // Prefer normal anchor alignment; keep short end sections inside their interval.
  return Math.max(
    start + Math.min(1, (end - start) / 2),
    Math.min(
      section.top - scrollMargin,
      next ? end - Math.min(1, (end - start) / 2) : end
    )
  );
};

export { getPageLocation, getSectionScrollTarget };
