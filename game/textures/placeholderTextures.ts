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
export const VILLAGER_KEY = "villager";
export const FRAME_KEY = "frame";

/** 사람 스프라이트 한 프레임의 크기 */
export const PERSON_WIDTH = 12;
export const PERSON_HEIGHT = 16;

/** 액자 스프라이트 크기 */
export const FRAME_WIDTH = 14;
export const FRAME_HEIGHT = 16;

/** 0: 서 있기, 1: 왼발, 2: 오른발 */
const WALK_FRAME_COUNT = 3;

/** 주민 외형 가짓수. WorldObject.variant가 이 범위 안이어야 한다. */
export const VILLAGER_VARIANTS = 2;

export function createPlaceholderTextures(scene: Phaser.Scene) {
  createTilesetTexture(scene);
  createPlayerTexture(scene);
  createVillagerTexture(scene);
  createFrameTexture(scene);
}

// ────────────────────────────────────────────────────────────
// 타일셋
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// 사람 (플레이어 / 주민)
// ────────────────────────────────────────────────────────────

type PersonColors = {
  hair: number;
  skin: number;
  shirt: number;
  pants: number;
};

const PLAYER_COLORS: PersonColors = {
  hair: 0x3b2a1f,
  skin: 0xf0c8a0,
  shirt: 0xd9564f,
  pants: 0x2f3450,
};

const VILLAGER_COLORS: PersonColors[] = [
  { hair: 0x2b2b3d, skin: 0xf0c8a0, shirt: 0x4a8fb5, pants: 0x3a3f52 },
  { hair: 0x6b5340, skin: 0xecc39a, shirt: 0x8a6bb0, pants: 0x40384f },
];

/** 프레임별 다리 모양. [x, y, 너비, 높이] 두 개씩. */
const LEGS_BY_FRAME: [number, number, number, number][][] = [
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

/** 사람 한 명을 originX 위치에 그린다. */
function drawPerson(
  g: Phaser.GameObjects.Graphics,
  originX: number,
  colors: PersonColors,
  legFrame: number,
) {
  const rect = (x: number, y: number, w: number, h: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillRect(originX + x, y, w, h);
  };

  rect(2, 0, 8, 3, colors.hair); // 머리카락
  rect(3, 3, 6, 3, colors.skin); // 얼굴
  rect(2, 6, 8, 5, colors.shirt); // 몸통
  rect(1, 7, 1, 3, colors.skin); // 왼팔
  rect(10, 7, 1, 3, colors.skin); // 오른팔

  LEGS_BY_FRAME[legFrame].forEach(([x, y, w, h]) => rect(x, y, w, h, colors.pants));
}

/**
 * generateTexture()는 그림 한 장을 만들 뿐이라, 어디부터 어디까지가
 * 한 프레임인지 Phaser에게 따로 알려줘야 한다. 그게 texture.add()다.
 */
function sliceIntoFrames(
  scene: Phaser.Scene,
  key: string,
  frameCount: number,
  frameWidth: number,
  frameHeight: number,
) {
  const texture = scene.textures.get(key);

  for (let frame = 0; frame < frameCount; frame++) {
    texture.add(frame, 0, frame * frameWidth, 0, frameWidth, frameHeight);
  }
}

function createPlayerTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  for (let frame = 0; frame < WALK_FRAME_COUNT; frame++) {
    drawPerson(g, frame * PERSON_WIDTH, PLAYER_COLORS, frame);
  }

  g.generateTexture(PLAYER_KEY, WALK_FRAME_COUNT * PERSON_WIDTH, PERSON_HEIGHT);
  g.destroy();

  sliceIntoFrames(scene, PLAYER_KEY, WALK_FRAME_COUNT, PERSON_WIDTH, PERSON_HEIGHT);
}

/**
 * 주민은 서 있기 자세만 필요하다. 외형 종류만큼 프레임을 만든다.
 * 프레임 번호가 곧 WorldObject.variant 값이다.
 */
function createVillagerTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  VILLAGER_COLORS.forEach((colors, index) => {
    drawPerson(g, index * PERSON_WIDTH, colors, 0);
  });

  g.generateTexture(VILLAGER_KEY, VILLAGER_VARIANTS * PERSON_WIDTH, PERSON_HEIGHT);
  g.destroy();

  sliceIntoFrames(scene, VILLAGER_KEY, VILLAGER_VARIANTS, PERSON_WIDTH, PERSON_HEIGHT);
}

// ────────────────────────────────────────────────────────────
// 액자
// ────────────────────────────────────────────────────────────

/** 이젤에 올린 액자 한 개 */
function createFrameTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const rect = (x: number, y: number, w: number, h: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);
  };

  rect(4, 12, 2, 4, 0x6b4a2f); // 왼쪽 다리
  rect(8, 12, 2, 4, 0x6b4a2f); // 오른쪽 다리
  rect(1, 1, 12, 12, 0x8b6b45); // 액자 테두리
  rect(3, 3, 8, 8, 0xf2e6d0); // 사진 바탕
  rect(4, 7, 6, 3, 0x7fa9c9); // 사진 속 하늘/바다
  rect(5, 5, 2, 2, 0xe8a33d); // 사진 속 해

  g.generateTexture(FRAME_KEY, FRAME_WIDTH, FRAME_HEIGHT);
  g.destroy();
}
