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
  onShowInfo,
  loading,
}: {
  onEnter: () => void;
  /** 마을에 들어가지 않고 결혼식 정보만 보는 길 */
  onShowInfo: () => void;
  loading: boolean;
}) {
  return (
    // 내용이 화면보다 길어지면 잘리지 않고 스크롤되게 한다.
    // justify-center 로 가운데 정렬하면 넘칠 때 위쪽이 화면 밖으로 밀려
    // 손이 닿지 않는다. 대신 my-auto 로 가운데에 둔다.
    <div className="absolute inset-0 z-20 flex flex-col items-center overflow-y-auto bg-[#1a1c2c] px-6 py-8 font-mono">
      {/* 카드와 안내문을 한 덩어리로 묶어야 my-auto가 둘을 함께 가운데로 보낸다. */}
      <div className="my-auto flex w-full max-w-xs shrink-0 flex-col items-center">
      <div className="flex w-full flex-col items-center border-4 border-[#8b6b45] px-6 py-8 text-center shadow-[0_0_0_4px_#0f0f1b]">
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

        {/*
          탐험이 부담스러운 분을 위한 지름길.
          이 길이 있어야 마을 쪽을 마음 놓고 재미있게 만들 수 있다.
        */}
        <button
          type="button"
          onClick={onShowInfo}
          className="mt-3 w-full py-2 text-xs text-[#7b82a8] underline underline-offset-4 active:text-white"
        >
          결혼식 정보 바로 보기
        </button>
      </div>

        <p className="mt-6 text-[10px] leading-relaxed text-[#4a5080]">
          화면을 눌러 걸어다닐 수 있어요
        </p>
      </div>
    </div>
  );
}
