import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Meridian favicon — teal arc + conversation node on deep ink. */
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
          background: "#042f2e",
          borderRadius: 7,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M6 22c4.5-9 15.5-9 20 0"
            stroke="#5eead4"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="16" cy="13" r="3.2" fill="#ecfeff" />
          <path
            d="M11 19.5c1.4 1.6 3.1 2.4 5 2.4s3.6-.8 5-2.4"
            stroke="#ecfeff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
