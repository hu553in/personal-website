"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getPageLocation, getSectionScrollTarget } from "./page-location";

type PageSection = Readonly<{ id: string }>;
const getSection = (id: string) =>
  document.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
const getGeometry = (items: readonly PageSection[]) => ({
  maxScroll: Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  ),
  sections: items.flatMap(({ id }) => {
    const element = getSection(id);
    return element
      ? [{ id, top: element.getBoundingClientRect().top + window.scrollY }]
      : [];
  }),
  viewport: window.innerHeight,
});

const getReadingPosition = (): unknown =>
  window.history.state?.pageNavigationScrollY;

const reloadPositionKey = "page-navigation-reload";
const getReloadPosition = (): unknown => {
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const saved = JSON.parse(
      sessionStorage.getItem(reloadPositionKey) ?? "null"
    ) as { url?: unknown; position?: unknown } | null;
    return entry?.type === "reload" && saved?.url === window.location.href
      ? saved.position
      : undefined;
  } catch {
    return undefined;
  }
};

// Next.js recreates entry state during boot, so reload needs a tab-local snapshot.
const saveReloadPosition = (position: number) => {
  try {
    sessionStorage.setItem(
      reloadPositionKey,
      JSON.stringify({ position, url: window.location.href })
    );
  } catch {
    // Browsers that deny storage retain their native scroll restoration.
  }
};

const usePageLocation = (items: readonly PageSection[]) => {
  const cancelInitialization = useRef<(() => void) | null>(null);
  const pageHistoryState = useRef<Record<string, unknown> | null>(null);
  const pendingRestoration = useRef<{ frame: number; position: number } | null>(
    null
  );
  const cancelRestoration = useCallback(() => {
    if (pendingRestoration.current) {
      cancelAnimationFrame(pendingRestoration.current.frame);
      pendingRestoration.current = null;
    }
  }, []);
  const saveReadingPosition = useCallback(() => {
    // Native fragments start with null state; retain the current page's router state.
    window.history.replaceState(
      {
        ...(window.history.state ?? pageHistoryState.current),
        // Native scrollend can arrive before the restoration frame.
        pageNavigationScrollY:
          pendingRestoration.current?.position ?? window.scrollY,
      },
      ""
    );
  }, []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollTo = useCallback(
    (id: string | null, behavior: ScrollBehavior) => {
      const { sections, viewport, maxScroll } = getGeometry(items);
      const element = id ? getSection(id) : null;
      // CSS scroll margins contain units.
      const margin = element
        ? // oxlint-disable-next-line unicorn/prefer-number-coercion -- Computed scroll margins contain px units.
          Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
        : 0;
      const top = id
        ? getSectionScrollTarget(sections, id, viewport, maxScroll, margin)
        : 0;
      if (top !== null) {
        window.scrollTo({ behavior, top });
      }
    },
    [items]
  );

  useEffect(() => {
    pageHistoryState.current = window.history.state;
    let frame = 0;
    let restoredUrl: string | null = null;
    const sync = () => {
      frame = 0;
      const { sections, viewport, maxScroll } = getGeometry(items);
      setActiveId(
        getPageLocation(sections, window.scrollY, viewport, maxScroll)
      );
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(sync);
      }
    };
    const followHash = () => {
      if (restoredUrl === window.location.href) {
        restoredUrl = null;
        schedule();
        return;
      }
      const id = window.location.hash.slice(1);
      if (items.some((item) => item.id === id)) {
        scrollTo(id, "instant");
      }
      schedule();
    };
    const onNavigate = (event: NavigateEvent) => {
      // popstate also fires for new fragment navigations, not just Back/Forward.
      // Saving state and router updates replace the entry during restoration.
      if (event.navigationType !== "replace") {
        restoredUrl =
          event.navigationType === "traverse" ? event.destination.url : null;
      }
    };
    const restorePosition = () => {
      cancelRestoration();
      const position = getReadingPosition();
      if (
        (!window.navigation || restoredUrl === window.location.href) &&
        typeof position === "number" &&
        Number.isFinite(position)
      ) {
        restoredUrl = window.location.href;
        pendingRestoration.current = {
          frame: requestAnimationFrame(() => {
            window.scrollTo({ behavior: "instant", top: position });
            pendingRestoration.current = null;
            schedule();
          }),
          position,
        };
      } else {
        if (!window.navigation) {
          restoredUrl = null;
        }
        schedule();
      }
    };
    window.navigation?.addEventListener("navigate", onNavigate);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.documentElement);
    const main = document.querySelector("main");
    if (main) {
      resizeObserver.observe(main);
    }
    for (const { id } of items) {
      const section = getSection(id);
      if (section) {
        resizeObserver.observe(section);
      }
    }
    const initialPosition = getReloadPosition() ?? getReadingPosition();
    const initialize = () => {
      if (
        typeof initialPosition === "number" &&
        Number.isFinite(initialPosition)
      ) {
        window.scrollTo({ behavior: "instant", top: initialPosition });
        schedule();
      } else {
        followHash();
      }
    };
    const initialFrame = requestAnimationFrame(initialize);
    const stopInitialization = () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("load", initialize);
    };
    cancelInitialization.current = stopInitialization;
    // Native anchor alignment may finish at load, but must never override user intent.
    const intentEvents = [
      "wheel",
      "touchstart",
      "pointerdown",
      "keydown",
      "click",
      "popstate",
      "hashchange",
    ] as const;
    for (const event of intentEvents) {
      window.addEventListener(event, stopInitialization, { passive: true });
    }
    window.addEventListener("load", initialize, { once: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scrollend", saveReadingPosition);
    const saveOnPageHide = () => {
      saveReadingPosition();
      saveReloadPosition(
        pendingRestoration.current?.position ?? window.scrollY
      );
    };
    window.addEventListener("pagehide", saveOnPageHide);
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    window.addEventListener("hashchange", followHash);
    window.addEventListener("popstate", restorePosition);
    return () => {
      cancelAnimationFrame(frame);
      cancelRestoration();
      stopInitialization();
      for (const event of intentEvents) {
        window.removeEventListener(event, stopInitialization);
      }
      window.navigation?.removeEventListener("navigate", onNavigate);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("scrollend", saveReadingPosition);
      window.removeEventListener("pagehide", saveOnPageHide);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("popstate", restorePosition);
    };
  }, [items, scrollTo, saveReadingPosition, cancelRestoration]);

  const navigate = (id: string | null) => {
    cancelInitialization.current?.();
    const url =
      window.location.pathname + window.location.search + (id ? `#${id}` : "");
    if (
      url !==
      window.location.pathname + window.location.search + window.location.hash
    ) {
      saveReadingPosition();
      window.history.pushState(
        { ...window.history.state, pageNavigationScrollY: undefined },
        "",
        url
      );
    }
    cancelRestoration();
    scrollTo(
      id,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth"
    );
  };
  return { activeId, navigate };
};

export { usePageLocation };
