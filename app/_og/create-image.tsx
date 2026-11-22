import { Buffer } from "node:buffer";

import { ImageResponse } from "next/og";

import { socialImage } from "@/app/site-data";

import exposure from "./fonts/exposure.woff?inline";
import openRunde from "./fonts/open-runde.woff?inline";

const decodeFont = (dataUrl: string) =>
  Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");

const imageOptions = {
  fonts: [
    {
      data: decodeFont(exposure),
      name: "Exposure",
      style: "normal" as const,
      weight: 500 as const,
    },
    {
      data: decodeFont(openRunde),
      name: "OpenRunde",
      style: "normal" as const,
      weight: 500 as const,
    },
  ],
  height: socialImage.height,
  width: socialImage.width,
};

const createOgImage = ({
  description,
  title,
}: {
  description: string;
  title: string;
}) =>
  new ImageResponse(
    <div
      style={{
        alignItems: "flex-start",
        background: "#0e0e11",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        paddingLeft: 96,
        paddingRight: 96,
        width: "100%",
      }}
    >
      <div
        style={{
          fontFamily: "Exposure",
          fontSize: 88,
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "#9a9a9a",
          fontFamily: "OpenRunde",
          fontSize: 34,
          fontWeight: 500,
          lineHeight: 1,
          marginTop: 36,
        }}
      >
        {description}
      </div>
    </div>,
    imageOptions
  );

export { createOgImage };
