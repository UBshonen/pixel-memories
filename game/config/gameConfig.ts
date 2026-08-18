import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";

/**
 * 게임의 기준 해상도.
 *
 * 실제 화면 크기가 아니라 "게임 내부 좌표계"의 크기다.
 * Phaser는 이 크기로 그림을 그린 뒤, 화면에 맞게 통째로 확대/축소한다.
 * 세로형 모바일(9:16)을 기준으로 잡았다.
 */
export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;

/**
 * Phaser.Game 인스턴스를 만든다.
 *
 * 이 파일은 반드시 브라우저에서만 import 되어야 한다.
 * Phaser가 모듈을 읽는 순간 window / document를 참조하기 때문에
 * Next.js 서버 렌더링 단계에서 실행되면 에러가 난다.
 */
export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO, // WebGL 우선, 안 되면 Canvas로 자동 대체
    parent, // 이 DOM 요소 안에 <canvas>를 넣는다
    backgroundColor: "#1a1c2c",
    pixelArt: true, // 확대해도 픽셀이 뭉개지지 않게 한다
    scale: {
      mode: Phaser.Scale.FIT, // 비율을 유지한 채 부모 크기에 맞춘다
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene],
  });
}
