"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RegistryNavigationItem = Readonly<{
  id: string;
  title: string;
}>;

type RegistryNavigationProps = Readonly<{
  items: readonly RegistryNavigationItem[];
}>;

const activeLinePercent = 25;
const observerBandHeightPercent = 1;
const activeLine = activeLinePercent / 100;
const observerRootMargin = `-${String(activeLinePercent - observerBandHeightPercent)}% 0px -${String(100 - activeLinePercent)}% 0px`;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const getSection = (id: string) =>
  document.querySelector<HTMLElement>(`#${CSS.escape(id)}`);

const RegistryNavigation = ({ items }: RegistryNavigationProps) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const shouldSyncUrlDuringScroll = useRef(false);
  const navigateTo = (id: string) => {
    const section = getSection(id);

    if (!section) {
      return;
    }

    const behavior = window.matchMedia(reducedMotionQuery).matches
      ? "auto"
      : "smooth";

    shouldSyncUrlDuringScroll.current = false;
    setActiveId(id);

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
      shouldSyncUrlDuringScroll.current = false;
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
      syncEdgeSection(shouldSyncUrlDuringScroll.current);
    };
    const enableScrollUrlSync = () => {
      shouldSyncUrlDuringScroll.current = true;
    };

    syncEdgeSection();
    syncHash();
    window.addEventListener("hashchange", handleHistoryNavigation);
    window.addEventListener("keydown", enableScrollUrlSync);
    window.addEventListener("pointerdown", enableScrollUrlSync, {
      passive: true,
    });
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", enableScrollUrlSync, {
      passive: true,
    });
    window.addEventListener("wheel", enableScrollUrlSync, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (syncEdgeSection(hasScrolled && shouldSyncUrlDuringScroll.current)) {
          return;
        }

        const [activeEntry] = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted(
            (first, second) =>
              Math.abs(
                first.boundingClientRect.top - window.innerHeight * activeLine
              ) -
              Math.abs(
                second.boundingClientRect.top - window.innerHeight * activeLine
              )
          );

        if (activeEntry) {
          syncActiveSection(
            activeEntry.target.id,
            hasScrolled && shouldSyncUrlDuringScroll.current
          );
        }
      },
      { rootMargin: observerRootMargin }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHistoryNavigation);
      window.removeEventListener("keydown", enableScrollUrlSync);
      window.removeEventListener("pointerdown", enableScrollUrlSync);
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", enableScrollUrlSync);
      window.removeEventListener("wheel", enableScrollUrlSync);
    };
  }, [items]);

  useEffect(() => {
    const activeLink = document.querySelector<HTMLElement>(
      `[data-registry-navigation-item="${activeId}"]`
    );

    if (activeLink?.offsetParent) {
      activeLink.scrollIntoView({ block: "nearest" });
    }
  }, [activeId]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Registry components"
        className="absolute inset-y-0 right-[calc(100%+2rem)] hidden w-44 min-[69rem]:block"
      >
        {/* Align the fonts by x-height; their ascenders and line boxes differ. */}
        <ul className="sticky top-38 flex max-h-[calc(100dvh-12rem)] flex-col gap-1 overflow-y-auto overscroll-contain py-1">
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <li key={item.id}>
                <a
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "focus-visible:outline-ring grid min-h-10 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1 rounded-sm font-mono text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-registry-navigation-item={item.id}
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
                    navigateTo(item.id);
                  }}
                >
                  <span aria-hidden="true">{isActive ? "→" : ""}</span>
                  <span className="min-w-0 wrap-break-word">{item.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Registry components"
        className="bg-background sticky top-0 z-20 py-2 min-[69rem]:hidden"
      >
        <label className="sr-only" htmlFor="registry-component">
          Registry component
        </label>
        <div className="relative">
          <select
            className="text-foreground focus-visible:outline-ring h-9 w-full appearance-none rounded-sm bg-transparent pe-6 font-mono text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            id="registry-component"
            onChange={(event) => {
              navigateTo(event.currentTarget.value);
            }}
            value={activeId}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute inset-e-0 top-1/2 size-3.5 -translate-y-1/2"
            strokeWidth={1.5}
          />
        </div>
      </nav>
    </>
  );
};

export { RegistryNavigation };
