"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type PageNavigationItem = Readonly<{
  id: string;
  title: string;
}>;

type PageNavigationProps = Readonly<{
  items: readonly PageNavigationItem[];
  titlePosition?: "after-home-link" | "page-start";
}>;

type PageNavigationListProps = Readonly<{
  activeId: string;
  className?: string;
  id?: string;
  items: readonly PageNavigationItem[];
  onNavigate: (id: string) => void;
}>;

const activeLinePercent = 25;
const observerBandHeightPercent = 1;
const activeLine = activeLinePercent / 100;
const observerRootMargin = `-${String(activeLinePercent - observerBandHeightPercent)}% 0px -${String(100 - activeLinePercent)}% 0px`;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const scrollKeys = new Set([
  " ",
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);
const mobileNavigationId = "mobile-page-navigation";
const isMobileNavigationOpen = () =>
  document.querySelector(`#${mobileNavigationId}`) !== null;
const getSection = (id: string) =>
  document.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
const revealNavigationLink = (root: ParentNode, id: string) => {
  const link = [
    ...root.querySelectorAll<HTMLElement>("[data-page-navigation-item]"),
  ].find(
    (item) => item.dataset["pageNavigationItem"] === id && item.offsetParent
  );
  const list = link?.closest("ul");

  if (!link || !list) {
    return;
  }

  const linkBounds = link.getBoundingClientRect();
  const listBounds = list.getBoundingClientRect();

  if (linkBounds.top < listBounds.top) {
    list.scrollTop -= listBounds.top - linkBounds.top;
  } else if (linkBounds.bottom > listBounds.bottom) {
    list.scrollTop += linkBounds.bottom - listBounds.bottom;
  }
};
// Lift the small mono label above the title line box so their visible cap tops align.
const titleTopClassNames = {
  "after-home-link": "top-38",
  "page-start": "top-30",
} as const;

const PageNavigationList = ({
  activeId,
  className,
  id,
  items,
  onNavigate,
}: PageNavigationListProps) => (
  <ul className={className} id={id}>
    {items.map((item) => {
      const isActive = item.id === activeId;

      return (
        <li key={item.id}>
          <a
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "focus-visible:outline-ring grid min-h-10 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1 rounded-sm px-0.5 font-mono text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-page-navigation-item={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey
              ) {
                return;
              }

              event.preventDefault();
              onNavigate(item.id);
            }}
          >
            <span aria-hidden="true">{isActive ? "→" : ""}</span>
            <span className="min-w-0 wrap-break-word">{item.title}</span>
          </a>
        </li>
      );
    })}
  </ul>
);

const PageNavigation = ({
  items,
  titlePosition = "page-start",
}: PageNavigationProps) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isProgrammaticScroll = useRef(false);
  const mobileNavigation = useRef<HTMLDivElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const closeMobileNavigation = useCallback((restoreFocus = false) => {
    if (!isMobileNavigationOpen()) {
      return;
    }

    setIsMobileOpen(false);

    if (restoreFocus) {
      mobileToggle.current?.focus({ preventScroll: true });
    }
  }, []);
  const navigateTo = (id: string) => {
    const section = getSection(id);

    if (!section) {
      return;
    }

    const behavior = window.matchMedia(reducedMotionQuery).matches
      ? "auto"
      : "smooth";

    isProgrammaticScroll.current = true;
    setActiveId(id);
    closeMobileNavigation(true);

    if (window.location.hash !== `#${id}`) {
      window.history.pushState(window.history.state, "", `#${id}`);
    }

    section.scrollIntoView({
      behavior,
      block: "start",
    });
  };

  useEffect(() => {
    const ids = new Set(items.map((item) => item.id));
    const sections = items
      .map((item) => getSection(item.id))
      .filter((section): section is HTMLElement => section !== null);
    let hasScrolled = false;
    let preserveHash = ids.has(window.location.hash.slice(1));
    const syncActiveSection = (id: string, syncUrl = false) => {
      setActiveId(id);

      if (syncUrl && window.location.hash !== `#${id}`) {
        window.history.replaceState(window.history.state, "", `#${id}`);
      }
    };
    const syncHash = () => {
      const hashId = window.location.hash.slice(1);

      if (ids.has(hashId)) {
        syncActiveSection(hashId);
      } else if (hashId === "") {
        syncActiveSection(items[0]?.id ?? "");
      }
    };
    const handleHistoryNavigation = () => {
      isProgrammaticScroll.current = true;
      preserveHash = ids.has(window.location.hash.slice(1));
      syncHash();
    };
    const syncEdgeSection = (syncUrl = false) => {
      const [firstSection] = sections;

      if (
        firstSection &&
        firstSection.getBoundingClientRect().top >=
          window.innerHeight * activeLine
      ) {
        syncActiveSection(items[0]?.id ?? "", syncUrl);

        return true;
      }

      if (
        Math.ceil(window.scrollY + window.innerHeight) >=
        document.documentElement.scrollHeight
      ) {
        syncActiveSection(items.at(-1)?.id ?? "", syncUrl);

        return true;
      }

      return false;
    };
    const handleScroll = () => {
      hasScrolled = true;

      if (!isProgrammaticScroll.current && !preserveHash) {
        syncEdgeSection(true);
      }
    };
    const interruptProgrammaticScroll = () => {
      isProgrammaticScroll.current = false;
      preserveHash = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key) && !event.defaultPrevented) {
        interruptProgrammaticScroll();
      }

      if (event.key === "Escape" && isMobileNavigationOpen()) {
        event.preventDefault();
        closeMobileNavigation(true);
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      interruptProgrammaticScroll();

      const navigation = mobileNavigation.current;

      if (
        navigation &&
        isMobileNavigationOpen() &&
        event.target instanceof Node &&
        !navigation.contains(event.target)
      ) {
        closeMobileNavigation(navigation.contains(document.activeElement));
      }
    };
    const handleScrollEnd = () => interruptProgrammaticScroll();

    syncEdgeSection();
    syncHash();
    const initialSyncFrame = window.requestAnimationFrame(() => {
      const hashId = window.location.hash.slice(1);

      if (ids.has(hashId)) {
        preserveHash = true;
        syncActiveSection(hashId);
      }
    });
    window.addEventListener("hashchange", handleHistoryNavigation);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });
    window.addEventListener("touchstart", interruptProgrammaticScroll, {
      passive: true,
    });
    window.addEventListener("wheel", interruptProgrammaticScroll, {
      passive: true,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (preserveHash || (hasScrolled && isProgrammaticScroll.current)) {
          return;
        }

        if (syncEdgeSection(hasScrolled)) {
          return;
        }

        const [activeEntry] = entries
          .filter((entry) => entry.isIntersecting)
          // oxlint-disable-next-line unicorn/no-array-sort -- The array is new, and toSorted is unavailable in supported Firefox versions.
          .sort(
            (first, second) =>
              Math.abs(
                first.boundingClientRect.top - window.innerHeight * activeLine
              ) -
              Math.abs(
                second.boundingClientRect.top - window.innerHeight * activeLine
              )
          );

        if (activeEntry) {
          syncActiveSection(activeEntry.target.id, hasScrolled);
        }
      },
      { rootMargin: observerRootMargin }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      window.cancelAnimationFrame(initialSyncFrame);
      observer.disconnect();
      window.removeEventListener("hashchange", handleHistoryNavigation);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("touchstart", interruptProgrammaticScroll);
      window.removeEventListener("wheel", interruptProgrammaticScroll);
    };
  }, [closeMobileNavigation, items]);

  useEffect(() => {
    const root = isMobileOpen ? mobileNavigation.current : document;

    if (!root) {
      return;
    }

    revealNavigationLink(root, activeId);
  }, [activeId, isMobileOpen]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Page sections"
        className="sidebar:block absolute inset-y-0 right-[calc(100%+2rem)] hidden w-44"
      >
        <PageNavigationList
          activeId={activeId}
          className={cn(
            "sticky flex max-h-[calc(100dvh-12rem)] flex-col gap-1 overflow-y-auto overscroll-contain py-1",
            titleTopClassNames[titlePosition]
          )}
          items={items}
          onNavigate={navigateTo}
        />
      </nav>

      {items.length > 1 ? (
        <nav
          aria-label="Page sections"
          className="bg-background sidebar:hidden sticky top-0 z-20 -mt-6 py-2"
        >
          <div className="relative" ref={mobileNavigation}>
            <button
              aria-controls={mobileNavigationId}
              aria-expanded={isMobileOpen}
              className="focus-visible:outline-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-sm px-0.5 font-mono text-[13px] focus-visible:outline-2 focus-visible:-outline-offset-2"
              onClick={() => setIsMobileOpen((isOpen) => !isOpen)}
              ref={mobileToggle}
              type="button"
            >
              <span className="text-muted-foreground shrink-0">
                On this page
              </span>
              <span className="min-w-0 flex-1 truncate text-right font-medium">
                {items.find((item) => item.id === activeId)?.title}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "text-muted-foreground size-3.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none",
                  isMobileOpen ? "rotate-180" : undefined
                )}
                strokeWidth={1.5}
              />
            </button>

            {isMobileOpen ? (
              <PageNavigationList
                activeId={activeId}
                className="bg-background absolute inset-x-0 top-full max-h-[50dvh] overflow-y-auto overscroll-contain border-b border-black/10 py-1 dark:border-white/10"
                id={mobileNavigationId}
                items={items}
                onNavigate={navigateTo}
              />
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
};

export { PageNavigation };
