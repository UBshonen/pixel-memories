"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * 화면 아래에 뜨는 상하좌우 버튼.
 *
 * Phaser가 아니라 HTML로 만든다. 그래야 터치 영역 크기를 CSS 픽셀로
 * 제대로 잡을 수 있다. 게임 화면은 기기에 맞춰 늘어나기 때문에
 * Canvas 안에 그리면 폰마다 버튼 크기가 달라진다.
 *
 * 누른 방향을 onChange로 알리고, GameCanvas가 그것을 Phaser에 전달한다.
 * 지금까지 신호는 Phaser → React 한 방향이었는데 이것만 반대다.
 *
 * PHASE 10에서 조작 방식을 비교하기 위한 것이다.
 * `game/controls.ts`의 SHOW_DIRECTION_PAD로 껐다 켤 수 있다.
 */
export default function DirectionPad({
  onChange,
}: {
  onChange: (direction: { x: number; y: number }) => void;
}) {
  /** 현재 눌려 있는 버튼들. 두 개를 같이 누르면 대각선으로 걷는다. */
  const pressed = useRef(new Set<Direction>());

  const publish = useCallback(() => {
    let x = 0;
    let y = 0;

    if (pressed.current.has("left")) x -= 1;
    if (pressed.current.has("right")) x += 1;
    if (pressed.current.has("up")) y -= 1;
    if (pressed.current.has("down")) y += 1;

    onChange({ x, y });
  }, [onChange]);

  const press = useCallback(
    (direction: Direction) => {
      pressed.current.add(direction);
      publish();
    },
    [publish],
  );

  const release = useCallback(
    (direction: Direction) => {
      pressed.current.delete(direction);
      publish();
    },
    [publish],
  );

  // 버튼 밖에서 손을 떼면 release가 오지 않아 계속 걷게 된다.
  // 창 전체에서 손을 떼는 순간 모두 놓은 것으로 처리한다.
  useEffect(() => {
    const releaseAll = () => {
      if (pressed.current.size === 0) return;

      pressed.current.clear();
      publish();
    };

    window.addEventListener("pointerup", releaseAll);
    window.addEventListener("pointercancel", releaseAll);
    window.addEventListener("blur", releaseAll);

    return () => {
      window.removeEventListener("pointerup", releaseAll);
      window.removeEventListener("pointercancel", releaseAll);
      window.removeEventListener("blur", releaseAll);
    };
  }, [publish]);

  // 버튼을 누른 채로 창이 열려 이 컴포넌트가 사라지면,
  // 게임 쪽에는 "누르고 있음"이 남아 창을 닫은 뒤 혼자 걸어간다.
  useEffect(() => {
    return () => onChange({ x: 0, y: 0 });
  }, [onChange]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center p-4">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        <PadCell />
        <PadButton label="▲" direction="up" onPress={press} onRelease={release} />
        <PadCell />

        <PadButton label="◀" direction="left" onPress={press} onRelease={release} />
        <PadCell />
        <PadButton label="▶" direction="right" onPress={press} onRelease={release} />

        <PadCell />
        <PadButton label="▼" direction="down" onPress={press} onRelease={release} />
        <PadCell />
      </div>
    </div>
  );
}

type Direction = "up" | "down" | "left" | "right";

function PadCell() {
  return <div className="h-14 w-14" />;
}

function PadButton({
  label,
  direction,
  onPress,
  onRelease,
}: {
  label: string;
  direction: Direction;
  onPress: (direction: Direction) => void;
  onRelease: (direction: Direction) => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction}
      className="pointer-events-auto h-14 w-14 touch-none select-none border-2 border-[#8b6b45] bg-[#1a1c2c]/75 text-sm text-[#f4b41b] active:bg-[#2f3450]"
      onPointerDown={(event) => {
        // 버튼 밖으로 손가락이 나가도 이 버튼이 계속 이벤트를 받게 한다.
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(direction);
      }}
      onPointerUp={() => onRelease(direction)}
      onPointerCancel={() => onRelease(direction)}
      // 길게 눌렀을 때 뜨는 브라우저 기본 메뉴를 막는다.
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );
}
