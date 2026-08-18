import Phaser from "phaser";

import { TILE_DEFS, TILE_SIZE } from "../tiles";

/**
 * 임시 그래픽을 코드로 그려서 텍스처로 굽는다.
 *
 * 텍스처(texture)는 Phaser가 GPU에 올려두고 재사용하는 그림 한 장이다.
 * 보통은 png 파일을 불러오지만, 여기서는 Graphics로 직접 그린 뒤
 * generateTexture()로 구워서 파일 없이 같은 결과를 만든다.
 *
 * 나중에 진짜 픽셀 아트가 준비되면 이 파일 대신
 * scene.load.image()/spritesheet() 를 쓰면 된다. 나머지 코드는 그대로다.
 */

export const TILESET_KEY = "tileset";
export const PLAYER_KEY = "player";

/** 플레이어 스프라이트 한 프레임의 크기 */
export const PLAYER_WIDTH = 12;
export const PLAYER_HEIGHT = 16;

/** 0: 서 있기, 1: 왼발, 2: 오른발 */
const PLAYER_FRAME_COUNT = 3;

export function createPlaceholderTextures(scene: Phaser.Scene) {
  createTilesetTexture(scene);
  createPlayerTexture(scene);
}

/**
 * 타일들을 가로로 한 줄에 이어 붙여 타일셋 이미지 한 장을 만든다.
 *
 * ┌────┬────┬────┬────┬────┬────┐
 * │잔디│꽃밭│ 길 │ 물 │나무│울타│   ← 이 순서가 곧 타일 번호 0,1,2...
 * └────┴────┴────┴────┴────┴────┘
 */
function createTilesetTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  TILE_DEFS.forEach((def, index) => {
    const originX = index * TILE_SIZE;

    g.fillStyle(def.base, 1);
    g.fillRect(originX, 0, TILE_SIZE, TILE_SIZE);

    def.details.forEach(([x, y, width, height, color]) => {
      g.fillStyle(color, 1);
      g.fillRect(originX + x, y, width, height);
    });
  });

  g.generateTexture(TILESET_KEY, TILE_DEFS.length * TILE_SIZE, TILE_SIZE);
  g.destroy();
}

/**
 * 플레이어 3프레임을 가로로 이어 붙인다.
 *
 * generateTexture()는 그림 한 장을 만들 뿐이라, 어디부터 어디까지가
 * 한 프레임인지 Phaser에게 따로 알려줘야 한다. 그게 texture.add()다.
 */
function createPlayerTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const HAIR = 0x3b2a1f;
  const SKIN = 0xf0c8a0;
  const SHIRT = 0xd9564f;
  const PANTS = 0x2f3450;

  /** 프레임별 다리 모양. [x, y, 너비, 높이] 두 개씩. */
  const legsByFrame: [number, number, number, number][][] = [
    // 0 — 서 있기
    [
      [3, 11, 2, 4],
      [7, 11, 2, 4],
    ],
    // 1 — 왼발 앞으로
    [
      [2, 11, 3, 4],
      [7, 11, 2, 3],
    ],
    // 2 — 오른발 앞으로
    [
      [3, 11, 2, 3],
      [7, 11, 3, 4],
    ],
  ];

  for (let frame = 0; frame < PLAYER_FRAME_COUNT; frame++) {
    const originX = frame * PLAYER_WIDTH;

    const rect = (x: number, y: number, w: number, h: number, color: number) => {
      g.fillStyle(color, 1);
      g.fillRect(originX + x, y, w, h);
    };

    rect(2, 0, 8, 3, HAIR); // 머리카락
    rect(3, 3, 6, 3, SKIN); // 얼굴
    rect(2, 6, 8, 5, SHIRT); // 몸통
    rect(1, 7, 1, 3, SKIN); // 왼팔
    rect(10, 7, 1, 3, SKIN); // 오른팔

    legsByFrame[frame].forEach(([x, y, w, h]) => rect(x, y, w, h, PANTS));
  }

  g.generateTexture(PLAYER_KEY, PLAYER_FRAME_COUNT * PLAYER_WIDTH, PLAYER_HEIGHT);
  g.destroy();

  // 구워진 그림 한 장을 3개의 프레임으로 나눠 등록한다.
  const texture = scene.textures.get(PLAYER_KEY);

  for (let frame = 0; frame < PLAYER_FRAME_COUNT; frame++) {
    texture.add(frame, 0, frame * PLAYER_WIDTH, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  }
}
