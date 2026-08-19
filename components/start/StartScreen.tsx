"use client";

import { WEDDING } from "@/data/wedding";

/**
 * 링크를 열었을 때 가장 먼저 보이는 화면.
 *
 * 여기서 [입장하기]를 눌러야 게임이 만들어진다. 그래서
 *   - 열자마자 무거운 것이 돌아가지 않고
 *   - 나중에 소리를 넣을 때도 문제가 없다
 *     (모바일 브라우저는 사용자가 한 번 누르기 전에는 소리를 막는다)
 */
export default function StartScreen({
  onEnter,
  loading,
}: {
  onEnter: () => void;
  loading: boolean;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1a1c2c] px-6 font-mono">
      <div className="flex w-full max-w-xs flex-col items-center border-4 border-[#8b6b45] px-6 py-10 text-center shadow-[0_0_0_4px_#0f0f1b]">
        <p className="text-xs tracking-[0.3em] text-[#7b82a8]">PIXEL MEMORIES</p>

        <p className="mt-6 text-xl font-bold tracking-widest text-white">
          {WEDDING.groom} <span className="text-[#e8556d]">♥</span> {WEDDING.bride}
        </p>

        <p className="mt-6 text-sm leading-relaxed text-[#b8bdd6]">
          우리의 추억 마을에
          <br />
          초대합니다
        </p>

        <p className="mt-6 text-xs text-[#f4b41b]">{WEDDING.date}</p>
        <p className="text-xs text-[#f4b41b]">{WEDDING.time}</p>
        <p className="mt-1 text-xs text-[#7b82a8]">{WEDDING.venue}</p>

        <button
          type="button"
          onClick={onEnter}
          disabled={loading}
          className="mt-8 w-full border-2 border-[#8b6b45] bg-[#2f3450] py-3 text-sm text-white active:bg-[#3d4468] disabled:text-[#7b82a8]"
        >
          {loading ? "마을을 준비하는 중…" : "입장하기"}
        </button>
      </div>

      <p className="mt-6 text-[10px] leading-relaxed text-[#4a5080]">
        화면을 눌러 걸어다닐 수 있어요
      </p>
    </div>
  );
}
