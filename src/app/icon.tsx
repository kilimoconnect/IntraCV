import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "linear-gradient(135deg, #1a2f6e 0%, #0a1540 100%)",
          borderRadius: 100,
        }}
      >
        <span
          style={{
            color: "#3de8ff",
            fontSize: 320,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1,
            marginTop: 40,
          }}
        >
          F
        </span>
      </div>
    ),
    { ...size }
  );
}
