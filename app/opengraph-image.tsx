import { ImageResponse } from "next/og";

import { WEDDING } from "@/data/wedding";

/**
 * 카카오톡·문자로 링크를 보냈을 때 뜨는 미리보기 이미지.
 *
 * 그림 파일을 따로 두지 않고 코드로 그린다.
 * data/wedding.ts만 고치면 이 이미지도 같이 바뀐다.
 *
 * 주의 — 이 파일은 브라우저가 아니라 서버에서 그려진다.
 * flexbox만 쓸 수 있고, 자식이 둘 이상인 요소에는 display: flex를 꼭 적어야 한다.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${WEDDING.groom} ♥ ${WEDDING.bride} 결혼합니다`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1c2c",
          fontFamily: "monospace",
          color: "#ffffff",
        }}
      >
        {/* 픽셀 액자처럼 보이게 하는 이중 테두리 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "56px 88px",
            border: "10px solid #8b6b45",
            outline: "10px solid #0f0f1b",
            background: "#1a1c2c",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 14, color: "#7b82a8" }}>
            PIXEL MEMORIES
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginTop: 36,
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: 6,
            }}
          >
            <span>{WEDDING.groom}</span>
            <span style={{ color: "#e8556d" }}>♥</span>
            <span>{WEDDING.bride}</span>
          </div>

          <div style={{ display: "flex", marginTop: 34, fontSize: 30, color: "#f4b41b" }}>
            {WEDDING.date} {WEDDING.time}
          </div>

          <div style={{ display: "flex", marginTop: 12, fontSize: 26, color: "#b8bdd6" }}>
            {WEDDING.venue} {WEDDING.hall}
          </div>

          <div style={{ display: "flex", marginTop: 40, fontSize: 24, color: "#7b82a8" }}>
            우리의 추억 마을에 초대합니다
          </div>
        </div>
      </div>
    ),
    size,
  );
}
