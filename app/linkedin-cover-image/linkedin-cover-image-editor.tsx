"use client";

import { useRef, useState } from "react";

import { play } from "@/lib/sounds";
import { cn } from "@/lib/utils";

import {
  ImageDownloadLinks,
  imageEditorInputClassName,
} from "../image-editor-primitives";
import { Divider, monoMetaClassName, Section } from "../primitives";

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
const coverImageAriaDimensions = `${String(coverImageSize.width)} by ${String(coverImageSize.height)} pixels`;

const initialCopy = {
  expertise:
    "Product Engineering // Distributed Systems // Developer Platforms",
  role: "Senior Software Engineer",
  specialty: "Product & Platform",
  stack: "TypeScript, Go, React, Next.js",
  website: "hu553in.dev",
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
  const [renderingScale, setRenderingScale] = useState<ExportScale | null>(
    null
  );
  const coverImageRef = useRef<HTMLDivElement>(null);

  const updateCopy = (key: keyof CoverImageCopy, value: string) => {
    setExportStatus("");
    setCopy((currentCopy) => ({ ...currentCopy, [key]: value }));
  };

  const downloadPng = async (scale: ExportScale) => {
    const coverImage = coverImageRef.current;

    if (!coverImage || renderingScale !== null) {
      return;
    }

    setRenderingScale(scale);
    setExportStatus(`Preparing ${String(scale)}x PNG…`);

    try {
      await document.fonts.ready;
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
      play("success");
      setExportStatus(`Downloaded ${String(scale)}x PNG.`);
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
            viewTransitionName: "linkedin-preview",
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
                    <p className="max-w-full font-[Exposure,'Arial_Narrow',Arial,sans-serif] text-[70px] leading-[0.96] font-medium tracking-[-0.028em] text-balance whitespace-nowrap [font-optical-sizing:auto] [font-variation-settings:'EXPO'_-10]">
                      {copy.role}
                    </p>

                    <p className="max-w-full font-[Exposure,'Arial_Narrow',Arial,sans-serif] text-[59px] leading-[0.98] font-medium tracking-[-0.026em] text-balance whitespace-nowrap [font-optical-sizing:auto] [font-variation-settings:'EXPO'_-10]">
                      {copy.specialty}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex flex-col text-[#d4d4d1]",
                      coverDetailsGapClassName
                    )}
                  >
                    <p className="max-w-full text-[24px] leading-[1.2] font-medium whitespace-nowrap">
                      {copy.expertise}
                    </p>
                    <p className="max-w-full text-[24px] leading-[1.2] font-medium whitespace-nowrap">
                      {copy.stack}
                    </p>
                  </div>

                  <p className="max-w-full text-[24px] leading-[1.2] font-medium whitespace-nowrap text-[#fafaf8]">
                    {copy.website}
                  </p>
                </div>
              </div>
            </foreignObject>
          </svg>
        </figure>

        <ImageDownloadLinks
          width={coverImageSize.width}
          height={coverImageSize.height}
          items={exportScales.map((scale) => ({
            disabled: renderingScale !== null,
            label: `download ${String(scale)}x`,
            onClick: () => downloadPng(scale),
          }))}
        />

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
                autoComplete="off"
                className={imageEditorInputClassName}
                disabled={renderingScale !== null}
                id={field.key}
                inputMode={field.inputMode}
                name={field.key}
                onChange={(event) => updateCopy(field.key, event.target.value)}
                type="text"
                value={copy[field.key]}
              />
            </div>
          ))}
        </fieldset>
      </Section>
    </>
  );
};

export { LinkedInCoverImageEditor };
