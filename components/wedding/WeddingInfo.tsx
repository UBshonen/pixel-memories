"use client";

import { useEffect } from "react";

import { kakaoDirectionsUrl, naverMapUrl, WEDDING } from "@/data/wedding";

/**
 * 예식장을 눌렀을 때 열리는 결혼식 정보 창.
 *
 * 지도는 실제 지도 API 대신 픽셀로 그린 약도를 쓴다.
 * 길찾기는 버튼을 누르면 하객 폰의 지도 앱이 열리는 방식이라
 * API 키도 계정도 필요하지 않다. (docs/BACKLOG.md 참고)
 */
export default function WeddingInfo({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="my-auto w-full max-w-sm border-4 border-[#8b6b45] bg-[#1a1c2c] font-mono shadow-[0_0_0_4px_#0f0f1b]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="결혼식 정보"
      >
        <div className="border-b-4 border-[#8b6b45] px-4 py-5 text-center">
          <p className="text-lg font-bold tracking-widest text-white">
            {WEDDING.groom} <span className="text-[#e8556d]">♥</span> {WEDDING.bride}
          </p>
          <p className="mt-3 text-sm text-[#f4b41b]">{WEDDING.date}</p>
          <p className="text-sm text-[#f4b41b]">{WEDDING.time}</p>
          <p className="mt-3 text-sm text-white">{WEDDING.venue}</p>
          <p className="text-xs text-[#b8bdd6]">{WEDDING.hall}</p>
        </div>

        <div className="border-b-4 border-[#8b6b45] bg-[#f2e6d0] p-2">
          {/* 픽셀로 그린 약도. 실제 지도 API는 배포 후에 검토한다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wedding/directions-map.svg"
            alt={`${WEDDING.venue} 약도`}
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        <div className="space-y-3 border-b-4 border-[#8b6b45] p-4">
          <p className="text-sm text-white">{WEDDING.address}</p>

          {WEDDING.directions.map((direction) => (
            <div key={direction.label} className="flex gap-2 text-xs">
              <span className="shrink-0 text-[#f4b41b]">{direction.label}</span>
              <span className="leading-relaxed text-[#b8bdd6]">{direction.text}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-px border-b-4 border-[#8b6b45] bg-[#8b6b45]">
          <a
            href={kakaoDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2f3450] py-3 text-center text-xs text-white active:bg-[#3d4468]"
          >
            카카오맵 길찾기
          </a>
          <a
            href={naverMapUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2f3450] py-3 text-center text-xs text-white active:bg-[#3d4468]"
          >
            네이버지도
          </a>
        </div>

        <a
          href={`tel:${WEDDING.tel}`}
          className="block border-b-4 border-[#8b6b45] bg-[#1a1c2c] py-3 text-center text-xs text-[#b8bdd6] active:bg-[#2f3450]"
        >
          예식장 {WEDDING.tel}
        </a>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#2f3450] py-3 text-sm text-white active:bg-[#3d4468]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
