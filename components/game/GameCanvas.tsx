"use client";

import type { Game } from "phaser";
import { useCallback, useEffect, useRef, useState } from "react";

import DialogueBox from "@/components/dialogue/DialogueBox";
import MemoryModal from "@/components/memory/MemoryModal";
import SignpostPanel from "@/components/signpost/SignpostPanel";
import StartScreen from "@/components/start/StartScreen";
import WeddingInfo from "@/components/wedding/WeddingInfo";
import { findDialogue } from "@/data/dialogues";
import { findMemory } from "@/data/memories";
import { findSignpost } from "@/data/signposts";
import { GAME_EVENT } from "@/game/events";
import type { Dialogue, Memory, Signpost } from "@/types";

/**
 * React와 Phaser를 잇는 유일한 지점.
 *
 * 세 가지 일을 한다.
 *   1. 시작 화면을 보여주고, 입장할 때 게임을 만든다.
 *   2. 빈 <div>를 만들고 그 안에 Phaser가 <canvas>를 채우게 한다.
 *   3. Phaser가 보낸 신호를 받아 위에 HTML 창을 띄운다.
 */
export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);

  const [memory, setMemory] = useState<Memory | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [signpost, setSignpost] = useState<Signpost | null>(null);
  const [weddingOpen, setWeddingOpen] = useState(false);

  useEffect(() => {
    // 입장하기를 누르기 전에는 게임을 만들지 않는다.
    if (!entered) return;

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

      game.events.on(GAME_EVENT.OPEN_SIGNPOST, (id: string) => {
        const found = findSignpost(id);
        if (found) openOverlay(() => setSignpost(found));
      });

      game.events.on(GAME_EVENT.OPEN_WEDDING, () => {
        openOverlay(() => setWeddingOpen(true));
      });

      setReady(true);
    })();

    /** 창을 띄우는 동안에는 게임을 멈춰 둔다. */
    function openOverlay(show: () => void) {
      game?.scene.pause("WorldScene");
      show();
    }

    return () => {
      cancelled = true;
      gameRef.current = null;
      setReady(false);
      game?.destroy(true);
    };
  }, [entered]);

  const closeOverlay = useCallback(() => {
    setMemory(null);
    setDialogue(null);
    setSignpost(null);
    setWeddingOpen(false);
    gameRef.current?.scene.resume("WorldScene");
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {(!entered || !ready) && (
        <StartScreen onEnter={() => setEntered(true)} loading={entered} />
      )}

      {memory && <MemoryModal memory={memory} onClose={closeOverlay} />}
      {dialogue && <DialogueBox dialogue={dialogue} onClose={closeOverlay} />}
      {signpost && <SignpostPanel signpost={signpost} onClose={closeOverlay} />}
      {weddingOpen && <WeddingInfo onClose={closeOverlay} />}
    </div>
  );
}
