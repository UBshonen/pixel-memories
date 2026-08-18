"use client";

import type { Game } from "phaser";
import { useEffect, useRef } from "react";

/**
 * React와 Phaser를 잇는 유일한 지점.
 *
 * React는 빈 <div> 하나만 그리고, 그 안을 Phaser가 <canvas>로 채운다.
 * 이 <div> 내부는 React가 관리하지 않으므로 리렌더링에 영향을 받지 않는다.
 */
export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let game: Game | undefined;
    let cancelled = false;

    // Phaser는 window가 있어야 동작하므로 useEffect 안에서 동적으로 불러온다.
    // useEffect는 브라우저에서만 실행되기 때문에 서버 렌더링 시에는 이 import 자체가 일어나지 않는다.
    void (async () => {
      const { createGame } = await import("@/game/config/gameConfig");

      // import가 끝나기 전에 컴포넌트가 사라졌다면 게임을 만들지 않는다.
      if (cancelled) return;

      game = createGame(container);
    })();

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
