"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Divider, MetaLine, monoMetaClassName, Section } from "../primitives";

const coverImageSize = {
  height: 396,
  width: 1584,
} as const;

// Export geometry stays in pixels regardless of the browser's base font size.
const coverPaddingClassName = "pl-[330px]";
const coverGroupGapClassName = "gap-[24px]";
const coverHeadingGapClassName = "gap-[6px]";
const coverDetailsGapClassName = "gap-[7px]";

const exportScales = [1, 2] as const;
type ExportScale = (typeof exportScales)[number];
const coverImageDimensions = `${String(coverImageSize.width)} × ${String(coverImageSize.height)} px`;
const coverImageAriaDimensions = `${String(coverImageSize.width)} by ${String(coverImageSize.height)} pixels`;
const overflowExportStatus =
  "Shorten the text marked as too long, then try again.";

const initialCopy = {
  expertise:
    "Product Engineering // Distributed Systems // Developer Platforms",
  role: "Senior Software Engineer",
  specialty: "Product & Platform",
  stack: "TypeScript, Go, React, Next.js",
  website: "hu553in.su",
} as const;

type CoverImageCopy = Record<keyof typeof initialCopy, string>;

const fields: readonly {
  inputMode?: React.ComponentProps<"input">["inputMode"];
  key: keyof CoverImageCopy;
  label: string;
}[] = [
  { key: "role", label: "Role" },
  { key: "specialty", label: "Specialty" },
  { key: "expertise", label: "Expertise" },
  { key: "stack", label: "Stack" },
  { inputMode: "url", key: "website", label: "Website" },
];

const getOverflowingFields = (coverImage: HTMLElement) =>
  fields.flatMap(({ key }) => {
    const line = coverImage.querySelector<HTMLElement>(
      `[data-cover-field="${key}"]`
    );

    return line && line.scrollWidth > line.clientWidth ? [key] : [];
  });

const fonts = [
  {
    family: "Exposure",
    url: "/fonts/Exposure-205TF-VAR.woff2",
    weight: "100 900",
  },
  {
    family: "OpenRunde",
    url: "/fonts/OpenRunde-Regular.woff2",
    weight: "400",
  },
  {
    family: "OpenRunde",
    url: "/fonts/OpenRunde-Medium.woff2",
    weight: "500",
  },
] as const;

let exportFontCss: string | undefined;

const loadDomToPng = async () => {
  const { domToPng } = await import("modern-screenshot");

  return domToPng;
};

const blobToDataUrl = (blob: Blob) =>
  // oxlint-disable-next-line promise/avoid-new -- FileReader exposes only callbacks.
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Could not read a font for PNG export."));
      },
      { once: true }
    );
    reader.addEventListener(
      "error",
      () =>
        reject(
          reader.error ?? new Error("Could not read a font for PNG export.")
        ),
      { once: true }
    );
    reader.readAsDataURL(blob);
  });

const loadExportFontCss = async () => {
  const rules = await Promise.all(
    fonts.map(async ({ family, url, weight }) => {
      const response = await fetch(url, { cache: "force-cache" });

      if (!response.ok) {
        throw new Error(`Could not load ${family} for PNG export.`);
      }

      const dataUrl = await blobToDataUrl(await response.blob());

      return `@font-face { font-family: "${family}"; src: url("${dataUrl}") format("woff2"); font-style: normal; font-weight: ${weight}; font-display: block; }`;
    })
  );

  return rules.join("\n");
};

const getExportFontCss = async () => {
  exportFontCss ??= await loadExportFontCss();

  return exportFontCss;
};

const downloadDataUrl = (dataUrl: string, scale: ExportScale) => {
  const link = document.createElement("a");

  link.download = `ruslan-khasanshin-linkedin-cover-image${scale === 2 ? "-2x" : ""}.png`;
  link.href = dataUrl;
  document.body.append(link);
  link.click();
  link.remove();
};

const LinkedInCoverImageEditor = () => {
  const [copy, setCopy] = useState<CoverImageCopy>(initialCopy);
  const [exportStatus, setExportStatus] = useState("");
  const [overflowingFields, setOverflowingFields] = useState<
    readonly (keyof CoverImageCopy)[]
  >([]);
  const [renderingScale, setRenderingScale] = useState<ExportScale | null>(
    null
  );
  const coverImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCurrent = true;
    const detectOverflow = () => {
      const coverImage = coverImageRef.current;

      if (!coverImage || !isCurrent) {
        return;
      }

      setOverflowingFields(getOverflowingFields(coverImage));
    };
    const detectOverflowAfterFontsLoad = async () => {
      await document.fonts.ready;
      detectOverflow();
    };

    detectOverflow();
    void detectOverflowAfterFontsLoad();

    return () => {
      isCurrent = false;
    };
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- Copy changes the measured DOM text.
  }, [copy]);

  const updateCopy = (key: keyof CoverImageCopy, value: string) => {
    setExportStatus("");
    setCopy((currentCopy) => ({ ...currentCopy, [key]: value }));
  };

  const downloadPng = async (scale: ExportScale) => {
    const coverImage = coverImageRef.current;

    if (!coverImage || renderingScale !== null) {
      return;
    }

    if (overflowingFields.length > 0) {
      setExportStatus(overflowExportStatus);
      return;
    }

    setRenderingScale(scale);
    setExportStatus(`Preparing ${String(scale)}x PNG…`);

    try {
      await document.fonts.ready;
      const currentOverflowingFields = getOverflowingFields(coverImage);

      setOverflowingFields(currentOverflowingFields);

      if (currentOverflowingFields.length > 0) {
        setExportStatus(overflowExportStatus);
      } else {
        const [domToPng, fontCss] = await Promise.all([
          loadDomToPng(),
          getExportFontCss(),
        ]);
        const dataUrl = await domToPng(coverImage, {
          backgroundColor: "#080808",
          font: {
            cssText: fontCss,
          },
          height: coverImageSize.height,
          scale,
          style: {
            transform: "none",
            transformOrigin: "top left",
          },
          width: coverImageSize.width,
        });

        downloadDataUrl(dataUrl, scale);
        setExportStatus(`Downloaded ${String(scale)}x PNG.`);
      }
    } catch (error) {
      console.error("Unable to export PNG:", error);
      setExportStatus("Unable to download PNG. Try again.");
    }

    setRenderingScale(null);
  };

  return (
    <>
      <Section title="Preview">
        <figure
          aria-label={`LinkedIn cover image preview at ${coverImageAriaDimensions}`}
          className="w-full overflow-hidden ring-1 ring-black/10 ring-inset dark:ring-white/10"
          style={{
            aspectRatio: `${coverImageSize.width} / ${coverImageSize.height}`,
          }}
        >
          <svg
            aria-hidden="true"
            className="block size-full"
            preserveAspectRatio="xMinYMin meet"
            viewBox={`0 0 ${String(coverImageSize.width)} ${String(coverImageSize.height)}`}
          >
            <foreignObject
              height={coverImageSize.height}
              width={coverImageSize.width}
            >
              <div
                ref={coverImageRef}
                className={cn(
                  "relative isolate flex overflow-hidden bg-[#080808] text-[#fafaf8] antialiased",
                  coverPaddingClassName
                )}
                style={{
                  background:
                    "linear-gradient(61deg, #171717 0%, #171717 31%, transparent 31.08%), linear-gradient(112deg, #141414 0%, #0a0a0a 46%, #050505 100%)",
                  height: coverImageSize.height,
                  width: coverImageSize.width,
                }}
              >
                <div
                  className={cn(
                    "z-20 mx-auto my-auto flex w-fit max-w-full min-w-0 flex-col",
                    coverGroupGapClassName
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col text-[#fafaf8]",
                      coverHeadingGapClassName
                    )}
                  >
                    <p
                      className="max-w-full font-[Exposure,'Arial_Narrow',Arial,sans-serif] text-[70px] leading-[0.96] font-medium tracking-[-0.028em] text-balance whitespace-nowrap [font-optical-sizing:auto] [font-variation-settings:'EXPO'_-10]"
                      data-cover-field="role"
                    >
                      {copy.role}
                    </p>

                    <p
                      className="max-w-full font-[Exposure,'Arial_Narrow',Arial,sans-serif] text-[59px] leading-[0.98] font-medium tracking-[-0.026em] text-balance whitespace-nowrap [font-optical-sizing:auto] [font-variation-settings:'EXPO'_-10]"
                      data-cover-field="specialty"
                    >
                      {copy.specialty}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex flex-col text-[#d4d4d1]",
                      coverDetailsGapClassName
                    )}
                  >
                    <p
                      className="max-w-full text-[24px] leading-[1.2] font-medium whitespace-nowrap"
                      data-cover-field="expertise"
                    >
                      {copy.expertise}
                    </p>
                    <p
                      className="max-w-full text-[24px] leading-[1.2] font-medium whitespace-nowrap"
                      data-cover-field="stack"
                    >
                      {copy.stack}
                    </p>
                  </div>

                  <p
                    className="max-w-full text-[24px] leading-[1.2] font-medium whitespace-nowrap text-[#fafaf8]"
                    data-cover-field="website"
                  >
                    {copy.website}
                  </p>
                </div>
              </div>
            </foreignObject>
          </svg>
        </figure>

        <div className="flex flex-col items-start gap-1 min-[24rem]:flex-row min-[24rem]:items-baseline min-[24rem]:gap-2">
          <span className={monoMetaClassName}>{coverImageDimensions}</span>
          <span
            aria-hidden="true"
            className={cn("hidden min-[24rem]:inline", monoMetaClassName)}
          >
            ·
          </span>
          <MetaLine
            items={exportScales.map((scale) => ({
              disabled: renderingScale !== null,
              label: `download ${String(scale)}x`,
              onClick: () => downloadPng(scale),
            }))}
          />
        </div>

        <output
          aria-live="polite"
          className={cn(
            monoMetaClassName,
            exportStatus ? undefined : "sr-only"
          )}
        >
          {exportStatus}
        </output>
      </Section>

      <Divider />

      <Section title="Text">
        <fieldset className="flex min-w-0 flex-col gap-4">
          <legend className="sr-only">LinkedIn cover image text</legend>
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className={monoMetaClassName} htmlFor={field.key}>
                {field.label}
              </label>
              <input
                aria-describedby={
                  overflowingFields.includes(field.key)
                    ? `${field.key}-error`
                    : undefined
                }
                aria-invalid={
                  overflowingFields.includes(field.key) || undefined
                }
                autoComplete="off"
                className="border-muted-foreground/80 bg-background text-foreground focus-visible:outline-ring dark:border-muted-foreground/60 h-9 w-full rounded-sm border px-2.5 text-base focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50 sm:text-[15px]"
                disabled={renderingScale !== null}
                id={field.key}
                inputMode={field.inputMode}
                name={field.key}
                onChange={(event) => updateCopy(field.key, event.target.value)}
                type="text"
                value={copy[field.key]}
              />
              {overflowingFields.includes(field.key) ? (
                <span
                  className={cn(monoMetaClassName, "text-foreground")}
                  id={`${field.key}-error`}
                  role="alert"
                >
                  Shorten this text to fit the cover.
                </span>
              ) : null}
            </div>
          ))}
        </fieldset>
      </Section>
    </>
  );
};

export { LinkedInCoverImageEditor };
