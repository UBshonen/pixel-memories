"use client";

import { useCallback, useEffect, useState } from "react";

import type { Dialogue } from "@/types";

/**
 * NPC와 이야기할 때 화면 아래에 뜨는 대화창.
 *
 * 한 번 누를 때마다 다음 줄로 넘어가고, 마지막 줄에서 누르면 닫힌다.
 */
export default function DialogueBox({
  dialogue,
  onClose,
}: {
  dialogue: Dialogue;
  onClose: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);

  const isLastLine = lineIndex >= dialogue.lines.length - 1;

  const advance = useCallback(() => {
    if (isLastLine) {
      onClose();
    } else {
      setLineIndex((index) => index + 1);
    }
  }, [isLastLine, onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        advance();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, onClose]);

  return (
    <div
      className="absolute inset-0 z-10 flex items-end justify-center p-3"
      onClick={advance}
      role="presentation"
    >
      <div
        className="w-full max-w-sm border-4 border-[#8b6b45] bg-[#1a1c2c]/95 p-4 font-mono shadow-[0_0_0_4px_#0f0f1b]"
        role="dialog"
        aria-modal="true"
        aria-label={`${dialogue.speaker}와의 대화`}
      >
        <p className="mb-2 text-xs tracking-widest text-[#f4b41b]">{dialogue.speaker}</p>

        <p className="min-h-[3rem] text-sm leading-relaxed text-white">
          {dialogue.lines[lineIndex]}
        </p>

        <p className="mt-3 text-right text-xs text-[#7b82a8]">
          {isLastLine ? "눌러서 닫기" : `눌러서 계속 (${lineIndex + 1}/${dialogue.lines.length})`}
        </p>
      </div>
    </div>
  );
}
