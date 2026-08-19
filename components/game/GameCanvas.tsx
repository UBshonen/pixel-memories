"use client";

import type { Game } from "phaser";
import { useCallback, useEffect, useRef, useState } from "react";

import DialogueBox from "@/components/dialogue/DialogueBox";
import MemoryModal from "@/components/memory/MemoryModal";
import { findDialogue } from "@/data/dialogues";
import { findMemory } from "@/data/memories";
import { GAME_EVENT } from "@/game/events";
import type { Dialogue, Memory } from "@/types";

/**
 * React와 Phaser를 잇는 유일한 지점.
 *
 * 두 가지 일을 한다.
 *   1. 빈 <div>를 만들고 그 안에 Phaser가 <canvas>를 채우게 한다.
 *   2. Phaser가 보낸 신호를 받아 위에 HTML 창을 띄운다.
 */
export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);

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
      gameRef.current = game;

      // 게임 쪽에서 보낸 신호를 여기서 받는다.
      // 넘어오는 것은 id 하나뿐이고, 실제 내용은 React가 찾아온다.
      game.events.on(GAME_EVENT.OPEN_MEMORY, (id: string) => {
        const found = findMemory(id);
        if (found) openOverlay(() => setMemory(found));
      });

      game.events.on(GAME_EVENT.OPEN_DIALOGUE, (id: string) => {
        const found = findDialogue(id);
        if (found) openOverlay(() => setDialogue(found));
      });
    })();

    /** 창을 띄우는 동안에는 게임을 멈춰 둔다. */
    function openOverlay(show: () => void) {
      game?.scene.pause("WorldScene");
      show();
    }

    return () => {
      cancelled = true;
      gameRef.current = null;
      game?.destroy(true);
    };
  }, []);

  const closeOverlay = useCallback(() => {
    setMemory(null);
    setDialogue(null);
    gameRef.current?.scene.resume("WorldScene");
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {memory && <MemoryModal memory={memory} onClose={closeOverlay} />}
      {dialogue && <DialogueBox dialogue={dialogue} onClose={closeOverlay} />}
    </div>
  );
}
