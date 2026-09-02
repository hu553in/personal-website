import { readFileSync } from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { socialImage } from "@/app/site-data";

const fontsPath = path.join(process.cwd(), "app/_og/fonts");
const imageOptions = {
  fonts: [
    {
      data: readFileSync(path.join(fontsPath, "exposure.woff")),
      name: "Exposure",
      style: "normal" as const,
      weight: 500 as const,
    },
    {
      data: readFileSync(path.join(fontsPath, "open-runde.woff")),
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
