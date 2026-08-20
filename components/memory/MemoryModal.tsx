"use client";

import { useEffect } from "react";

import type { Memory } from "@/types";

/**
 * 액자를 눌렀을 때 열리는 사진 창.
 *
 * 이건 Phaser가 아니라 평범한 HTML이다.
 * 픽셀 공간과 어울리도록 각진 테두리와 고정폭 글꼴을 쓴다.
 */
export default function MemoryModal({
  memory,
  onClose,
}: {
  memory: Memory;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-30 flex justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="my-auto h-fit w-full max-w-sm border-4 border-[#8b6b45] bg-[#1a1c2c] shadow-[0_0_0_4px_#0f0f1b]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={memory.title}
      >
        <div className="border-b-4 border-[#8b6b45] bg-[#f2e6d0] p-2">
          {/* 임시 그림이라 최적화가 필요 없다. 실제 사진으로 바꿀 때 next/image를 검토한다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        <div className="space-y-2 p-4 font-mono">
          <p className="text-xs tracking-widest text-[#f4b41b]">{memory.date}</p>
          <h2 className="text-base font-bold text-white">{memory.title}</h2>
          <p className="text-sm leading-relaxed text-[#b8bdd6]">{memory.description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full border-t-4 border-[#8b6b45] bg-[#2f3450] py-3 font-mono text-sm text-white active:bg-[#3d4468]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
