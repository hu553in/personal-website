"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ImageDownloadLinks,
  imageEditorInputClassName,
} from "../image-editor-primitives";
import { Divider, Link, monoMetaClassName, Section } from "../primitives";
import { identity, openGraphImage, socialImage } from "../site-data";
import { fields } from "./fields";

const OpenGraphImageEditor = () => {
  const [copy, setCopy] = useState({
    description: identity.role,
    title: identity.name,
  });
  const [previewCopy, setPreviewCopy] = useState(copy);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewCopy(copy);
    }, 300);
    return () => clearTimeout(timer);
  }, [copy]);
  const url = `${openGraphImage.href}/image.png?${new URLSearchParams(previewCopy)}`;
  const downloadUrl = `${openGraphImage.href}/image.png?${new URLSearchParams(copy)}`;

  return (
    <>
      <Section title="Preview">
        <figure
          aria-label="Open Graph image preview at 1200 by 630 pixels"
          style={{ viewTransitionName: "og-preview" }}
          className="w-full overflow-hidden border border-black/10 dark:border-white/10"
        >
          <Image
            key={url}
            unoptimized
            src={url}
            alt={`${previewCopy.title}, ${previewCopy.description}`}
            width={socialImage.width}
            height={socialImage.height}
            className="h-auto w-full"
            onError={() => setFailedUrl(url)}
            onLoad={() =>
              setFailedUrl((current) => (current === url ? null : current))
            }
          />
        </figure>
        <ImageDownloadLinks
          width={socialImage.width}
          height={socialImage.height}
          items={[
            {
              href: `${downloadUrl}&download=1`,
              label: "download PNG",
            },
          ]}
        />
        {failedUrl === url ? (
          <p role="alert" className={monoMetaClassName}>
            Unable to load the preview.{" "}
            <Link href={url}>Try opening the image</Link>.
          </p>
        ) : null}
      </Section>
      <Divider />
      <Section title="Text">
        <fieldset className="flex min-w-0 flex-col gap-4">
          <legend className="sr-only">Open Graph image text</legend>
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className={monoMetaClassName} htmlFor={`og-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`og-${field.key}`}
                name={field.key}
                type="text"
                autoComplete="off"
                maxLength={field.maxLength}
                value={copy[field.key]}
                onChange={(event) =>
                  setCopy((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className={imageEditorInputClassName}
              />
            </div>
          ))}
        </fieldset>
      </Section>
    </>
  );
};

export { OpenGraphImageEditor };
