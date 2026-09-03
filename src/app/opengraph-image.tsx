import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0a",
          color: "#f3efe6",
          padding: 64,
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#c4a46a" }}>
          From red tag to green light
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, lineHeight: 0.9 }}>Get it moving again.</div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#b7b1a6" }}>
            JLS Development Enterprises · ROC #167786
          </div>
        </div>
      </div>
    ),
    size,
  );
}
