import { describe, expect, test } from "vitest";

import { getPageLocation, getSectionScrollTarget } from "./page-location";

const sections = [
  { id: "about", top: 612 },
  { id: "work", top: 969 },
  { id: "writing", top: 3544 },
  { id: "interests", top: 3898 },
  { id: "connect", top: 4352 },
  { id: "miscellany", top: 4592 },
];

describe("page location", () => {
  test("leaves the header at exactly the first section boundary", () => {
    expect(getPageLocation(sections, 361, 1000, 3954)).toBeNull();
    expect(getPageLocation(sections, 362, 1000, 3954)).toBe("about");
    expect(getPageLocation(sections, 0, 1000, 3954)).toBeNull();
  });

  test("visits every section, including the short tail", () => {
    const locations = Array.from({ length: 3955 }, (_, y) =>
      getPageLocation(sections, y, 1000, 3954)
    );
    expect([...new Set(locations)]).toStrictEqual([
      null,
      ...sections.map((s) => s.id),
    ]);
  });

  test.each([0, 52])(
    "anchor targets agree with the active location (margin %s)",
    (margin) => {
      for (const { id } of sections) {
        const target = getSectionScrollTarget(sections, id, 1000, 3954, margin);
        expect(target).not.toBeNull();
        expect(
          getPageLocation(sections, Math.round(target ?? -1), 1000, 3954)
        ).toBe(id);
      }
    }
  );

  test("handles empty and unscrollable pages", () => {
    expect(getPageLocation([], 100, 800, 200)).toBeNull();
    expect(getPageLocation(sections, 0, 800, 0)).toBeNull();
    expect(getSectionScrollTarget([], "missing", 800, 0, 0)).toBeNull();
    expect(getSectionScrollTarget(sections, "about", 800, 0, 0)).toBe(0);
  });
});
