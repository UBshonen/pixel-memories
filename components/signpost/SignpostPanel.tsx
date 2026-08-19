"use client";

import { useEffect } from "react";

import type { Signpost } from "@/types";

/**
 * 표지판을 눌렀을 때 열리는 안내판.
 *
 * 고양이가 "지금 갈 곳 한 군데"를 알려준다면, 표지판은
 * 마을 전체가 어떻게 생겼는지를 한 번에 보여준다.
 */
export default function SignpostPanel({
  signpost,
  onClose,
}: {
  signpost: Signpost;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xs border-4 border-[#8b6b45] bg-[#b8946a] p-1 font-mono shadow-[0_0_0_4px_#0f0f1b]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={signpost.title}
      >
        <div className="border-2 border-[#8b6b45] bg-[#c9a87d] px-4 py-4">
          <p className="mb-4 text-center text-xs tracking-widest text-[#5a4630]">
            {signpost.title}
          </p>

          <ul className="space-y-3">
            {signpost.directions.map((direction) => (
              <li
                key={direction.label}
                className="flex items-center gap-3 text-sm text-[#3d2f1e]"
              >
                <span className="w-4 text-center text-base">{direction.arrow}</span>
                <span>{direction.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="py-2 text-center text-[10px] text-[#5a4630]">눌러서 닫기</p>
      </div>
    </div>
  );
}
