import { ImageResponse } from "next/og";

export const size = { width: 1024, height: 1024 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1e3a8a 0%, #0c1a5e 55%, #060d2e 100%)",
          borderRadius: 230,
          position: "relative",
        }}
      >
        {/* Top-left highlight for depth */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 520,
            borderRadius: "230px 230px 0 0",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
            display: "flex",
          }}
        />
        {/* Cyan inner border glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 230,
            border: "6px solid rgba(34,211,238,0.25)",
            display: "flex",
          }}
        />
        {/* F letter */}
        <span
          style={{
            color: "#22d3ee",
            fontSize: 676,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1,
            marginTop: 64,
            letterSpacing: -16,
          }}
        >
          F
        </span>
      </div>
    ),
    { ...size }
  );
}
