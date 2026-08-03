import { readFileSync } from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { identity } from "@/app/data";

const exposure = readFileSync(
  path.join(process.cwd(), "app/og.png/fonts/exposure.ttf")
);
const openRunde = readFileSync(
  path.join(process.cwd(), "app/og.png/fonts/open-runde.ttf")
);

export const GET = () =>
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
        {identity.name}
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
        {identity.role}
      </div>
    </div>,
    {
      fonts: [
        {
          data: exposure,
          name: "Exposure",
          style: "normal",
          weight: 500,
        },
        {
          data: openRunde,
          name: "OpenRunde",
          style: "normal",
          weight: 500,
        },
      ],
      height: 630,
      width: 1200,
    }
  );
