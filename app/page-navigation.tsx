"use client";

import {
  autoUpdate,
  flip,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { ChevronDown } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { usePageLocation } from "./use-page-location";

type PageNavigationItem = Readonly<{
  id: string;
  title: string;
}>;

type PageNavigationProps = Readonly<{
  items: readonly PageNavigationItem[];
  titlePosition?: "after-home-link" | "page-start";
}>;

type PageNavigationPanelProps = React.ComponentProps<"div"> &
  Readonly<{
    activeId: string | null;
    items: readonly PageNavigationItem[];
    onNavigate: (id: string) => void;
    onBackToTop: () => void;
  }>;

const mobileNavigationId = "mobile-page-navigation";
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
// Align labels with titles; reduce the offset when less than 16rem remains below it.
const titleTopClassNames = {
  "after-home-link": "[--sidebar-top:clamp(1rem,100dvh-16rem,9.5rem)]",
  "page-start": "[--sidebar-top:clamp(1rem,100dvh-16rem,7.5rem)]",
} as const;

const navigationRowClassName =
  "focus-visible:outline-ring grid min-h-10 grid-cols-[1rem_minmax(0,1fr)] items-center gap-1 rounded-sm px-0.5 font-mono text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2";

const BackToTop = ({ onClick }: { onClick: () => void }) => (
  <button
    className={cn(
      navigationRowClassName,
      "text-muted-foreground hover:text-foreground w-full cursor-pointer text-left"
    )}
    data-cuelume-toggle="tick"
    onClick={onClick}
    type="button"
  >
    <span aria-hidden="true">↑</span>
    <span>Back to top</span>
  </button>
);

const PageNavigationPanel = ({
  activeId,
  className,
  items,
  onNavigate,
  onBackToTop,
  ...props
}: PageNavigationPanelProps) => (
  <div {...props} className={cn("flex flex-col", className)}>
    <ul className="min-h-0 overflow-y-auto overscroll-contain py-1">
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <li key={item.id}>
            <a
              aria-current={isActive ? "location" : undefined}
              className={cn(
                navigationRowClassName,
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-page-navigation-item={item.id}
              data-cuelume-toggle="tick"
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
              <span aria-hidden="true">
                {isActive ? (
                  <span className="inline-block rotate-90">↑</span>
                ) : null}
              </span>
              <span className="min-w-0 wrap-break-word">{item.title}</span>
            </a>
          </li>
        );
      })}
    </ul>
    {activeId !== null && (
      <div className="shrink-0 border-t border-black/10 py-1 dark:border-white/10">
        <BackToTop onClick={onBackToTop} />
      </div>
    )}
  </div>
);

const PageNavigation = ({
  items,
  titlePosition = "page-start",
}: PageNavigationProps) => {
  const { activeId, navigate } = usePageLocation(items);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const desktopNavigation = useRef<HTMLElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);
  const closeMobileNavigation = useCallback((restoreFocus = false) => {
    setIsMobileOpen(false);
    if (restoreFocus) {
      mobileToggle.current?.focus({ preventScroll: true });
    }
  }, []);
  const navigateTo = (id: string | null) => {
    if (isMobileOpen) {
      closeMobileNavigation(true);
    } else if (id === null) {
      const main = document.querySelector("main");
      if (main) {
        const previous = main.getAttribute("tabindex");
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
        if (previous === null) {
          main.removeAttribute("tabindex");
        } else {
          main.setAttribute("tabindex", previous);
        }
      }
    }
    navigate(id);
  };
  const backToTop = () => navigateTo(null);

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    placement,
    context,
    elements,
  } = useFloating({
    middleware: [
      flip(),
      size({
        apply({ availableHeight, rects, elements: positioned }) {
          Object.assign(positioned.floating.style, {
            maxHeight: `min(50dvh, ${Math.max(0, availableHeight)}px)`,
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    onOpenChange: (open, _event, reason) => {
      if (open) {
        setIsMobileOpen(true);
      } else {
        closeMobileNavigation(
          reason === "escape-key" ||
            Boolean(elements.floating?.contains(document.activeElement))
        );
      }
    },
    open: isMobileOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  useLayoutEffect(() => {
    const syncLayout = () => {
      if (isMobileOpen && mobileToggle.current?.offsetParent === null) {
        closeMobileNavigation();
      }
      if (activeId !== null) {
        revealNavigationLink(document, activeId);
      }
    };
    const observer = new ResizeObserver(syncLayout);
    for (const root of [
      desktopNavigation.current,
      mobileToggle.current,
      elements.floating,
    ]) {
      if (root) {
        observer.observe(root);
        for (const list of root.querySelectorAll("ul")) {
          observer.observe(list);
        }
      }
    }
    syncLayout();
    return () => observer.disconnect();
  }, [activeId, isMobileOpen, elements.floating, closeMobileNavigation]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <nav
        ref={desktopNavigation}
        aria-label="Page sections"
        className="sidebar:block absolute inset-y-0 right-[calc(100%+2rem)] hidden w-44"
      >
        <PageNavigationPanel
          activeId={activeId}
          className={cn(
            "sticky top-(--sidebar-top) max-h-[calc(100dvh-var(--sidebar-top)-2rem)]",
            titleTopClassNames[titlePosition]
          )}
          items={items}
          onNavigate={navigateTo}
          onBackToTop={backToTop}
        />
      </nav>

      <nav
        aria-label="Page sections"
        ref={setReference}
        className="bg-background sidebar:hidden sticky top-0 z-20 border-t border-black/10 py-2 dark:border-white/10"
      >
        <div className="relative">
          <button
            {...getReferenceProps()}
            aria-controls={mobileNavigationId}
            aria-expanded={isMobileOpen}
            data-cuelume-toggle="toggle"
            className="focus-visible:outline-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-sm px-0.5 font-mono text-[13px] focus-visible:outline-2 focus-visible:-outline-offset-2"
            onClick={() => setIsMobileOpen((isOpen) => !isOpen)}
            ref={mobileToggle}
            type="button"
          >
            <span className="text-muted-foreground shrink-0">On this page</span>
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
            <PageNavigationPanel
              {...getFloatingProps()}
              ref={setFloating}
              style={floatingStyles}
              activeId={activeId}
              className={cn(
                "bg-background overflow-y-auto border-t border-black/10 dark:border-white/10",
                placement.startsWith("bottom") ? "border-b" : undefined
              )}
              id={mobileNavigationId}
              items={items}
              onNavigate={navigateTo}
              onBackToTop={backToTop}
            />
          ) : null}
        </div>
      </nav>
    </>
  );
};

export { PageNavigation };
