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
export const VENUE_KEY = "venue";
export const SIGNPOST_KEY = "signpost";
export const CAT_KEY = "cat";
export const BUTTERFLY_KEY = "butterfly";
export const FINGER_KEY = "finger";

/** 사람 스프라이트 한 프레임의 크기 */
export const PERSON_WIDTH = 12;
export const PERSON_HEIGHT = 16;

/** 액자 스프라이트 크기 */
export const FRAME_WIDTH = 14;
export const FRAME_HEIGHT = 16;

/** 예식장 스프라이트 크기. 타일 두 칸쯤 되는 건물이다. */
export const VENUE_WIDTH = 34;
export const VENUE_HEIGHT = 34;

/** 표지판 */
export const SIGNPOST_WIDTH = 14;
export const SIGNPOST_HEIGHT = 18;

/** 길잡이 고양이. 옆모습만 그리고 좌우로 뒤집어 쓴다. */
export const CAT_WIDTH = 12;
export const CAT_HEIGHT = 10;

/** 나비. 배경을 채우는 장식이다. */
export const BUTTERFLY_WIDTH = 6;
export const BUTTERFLY_HEIGHT = 6;

/** 처음 한 번만 나오는 조작 안내용 손가락 */
export const FINGER_WIDTH = 10;
export const FINGER_HEIGHT = 12;

/** 0: 서 있기, 1: 왼발, 2: 오른발 */
const WALK_FRAME_COUNT = 3;

/** 고양이도 같은 3프레임 구성 */
export const CAT_FRAME_COUNT = 3;

/** 나비는 날개 편 것과 접은 것 두 장 */
export const BUTTERFLY_FRAME_COUNT = 2;

/** 주민 외형 가짓수. WorldObject.variant가 이 범위 안이어야 한다. */
export const VILLAGER_VARIANTS = 2;

export function createPlaceholderTextures(scene: Phaser.Scene) {
  createTilesetTexture(scene);
  createPlayerTexture(scene);
  createVillagerTexture(scene);
  createFrameTexture(scene);
  createVenueTexture(scene);
  createSignpostTexture(scene);
  createCatTexture(scene);
  createButterflyTexture(scene);
  createFingerTexture(scene);
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

// ────────────────────────────────────────────────────────────
// 예식장
// ────────────────────────────────────────────────────────────

/** 지붕과 문이 있는 작은 예식장 건물 */
function createVenueTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const rect = (x: number, y: number, w: number, h: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);
  };

  rect(4, 14, 26, 20, 0xf2e6d0); // 건물 벽
  rect(4, 14, 26, 2, 0xe0d0b4); // 벽 위 그림자
  rect(2, 8, 30, 6, 0xb5544a); // 지붕 아래
  rect(6, 4, 22, 4, 0xc9635a); // 지붕 위
  rect(10, 0, 14, 4, 0xc9635a); // 지붕 꼭대기
  rect(16, 1, 2, 8, 0xf4b41b); // 첨탑 기둥
  rect(13, 3, 8, 2, 0xf4b41b); // 첨탑 가로
  rect(13, 20, 8, 14, 0x8b6b45); // 문
  rect(15, 22, 4, 6, 0x7fa9c9); // 문 위 창
  rect(19, 27, 2, 2, 0xf4b41b); // 손잡이
  rect(6, 20, 5, 6, 0x7fa9c9); // 왼쪽 창
  rect(23, 20, 5, 6, 0x7fa9c9); // 오른쪽 창
  rect(8, 20, 1, 6, 0xf2e6d0); // 창틀
  rect(25, 20, 1, 6, 0xf2e6d0); // 창틀

  g.generateTexture(VENUE_KEY, VENUE_WIDTH, VENUE_HEIGHT);
  g.destroy();
}

// ────────────────────────────────────────────────────────────
// 표지판
// ────────────────────────────────────────────────────────────

/** 기둥에 방향 팻말 두 개가 엇갈려 달린 모양 */
function createSignpostTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const POST = 0x6b4a2f;
  const BOARD = 0xb8946a;
  const BOARD_EDGE = 0x8b6b45;
  const TEXT = 0x5a4630;

  const rect = (x: number, y: number, w: number, h: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);
  };

  rect(6, 4, 2, 14, POST); // 기둥

  rect(1, 5, 10, 4, BOARD_EDGE); // 위쪽 팻말
  rect(2, 6, 8, 2, BOARD);
  rect(3, 7, 5, 1, TEXT); // 글씨처럼 보이는 선

  rect(3, 11, 10, 4, BOARD_EDGE); // 아래쪽 팻말 (반대 방향)
  rect(4, 12, 8, 2, BOARD);
  rect(6, 13, 5, 1, TEXT);

  g.generateTexture(SIGNPOST_KEY, SIGNPOST_WIDTH, SIGNPOST_HEIGHT);
  g.destroy();
}

// ────────────────────────────────────────────────────────────
// 길잡이 고양이
// ────────────────────────────────────────────────────────────

/** 오른쪽을 보고 있는 옆모습. 왼쪽으로 갈 때는 뒤집어 쓴다. */
function createCatTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const FUR = 0xd9884f;
  const STRIPE = 0xb96f3d;
  const BELLY = 0xf2d7b8;
  const EYE = 0x2b2b3d;

  /** 프레임별 앞다리 · 뒷다리. [x, y, 너비, 높이] */
  const legsByFrame: [number, number, number, number][][] = [
    // 0 — 서 있기
    [
      [2, 8, 2, 2],
      [8, 8, 2, 2],
    ],
    // 1 — 발 교차 A
    [
      [1, 8, 3, 2],
      [8, 8, 2, 1],
    ],
    // 2 — 발 교차 B
    [
      [3, 8, 2, 1],
      [8, 8, 3, 2],
    ],
  ];

  for (let frame = 0; frame < CAT_FRAME_COUNT; frame++) {
    const originX = frame * CAT_WIDTH;

    const rect = (x: number, y: number, w: number, h: number, color: number) => {
      g.fillStyle(color, 1);
      g.fillRect(originX + x, y, w, h);
    };

    rect(0, 2, 2, 1, FUR); // 꼬리 끝
    rect(0, 3, 1, 3, FUR); // 꼬리
    rect(1, 5, 10, 3, FUR); // 몸통
    rect(1, 7, 10, 1, BELLY); // 배
    rect(3, 5, 1, 2, STRIPE); // 줄무늬
    rect(5, 5, 1, 2, STRIPE);
    rect(7, 2, 5, 3, FUR); // 머리
    rect(7, 1, 1, 1, FUR); // 왼쪽 귀
    rect(10, 1, 1, 1, FUR); // 오른쪽 귀
    rect(9, 4, 3, 1, BELLY); // 주둥이
    rect(10, 3, 1, 1, EYE); // 눈

    legsByFrame[frame].forEach(([x, y, w, h]) => rect(x, y, w, h, FUR));
  }

  g.generateTexture(CAT_KEY, CAT_FRAME_COUNT * CAT_WIDTH, CAT_HEIGHT);
  g.destroy();

  sliceIntoFrames(scene, CAT_KEY, CAT_FRAME_COUNT, CAT_WIDTH, CAT_HEIGHT);
}

// ────────────────────────────────────────────────────────────
// 나비
// ────────────────────────────────────────────────────────────

/** 날개를 폈다 접는 두 프레임 */
function createButterflyTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const WING = 0xf7e08a;
  const WING_EDGE = 0xe8a33d;
  const BODY = 0x6b4a2f;

  const wingsByFrame: [number, number, number, number, number][][] = [
    // 0 — 펼침
    [
      [0, 1, 2, 3, WING],
      [4, 1, 2, 3, WING],
      [0, 3, 2, 1, WING_EDGE],
      [4, 3, 2, 1, WING_EDGE],
    ],
    // 1 — 접음
    [
      [1, 0, 1, 4, WING],
      [4, 0, 1, 4, WING],
      [1, 3, 1, 1, WING_EDGE],
      [4, 3, 1, 1, WING_EDGE],
    ],
  ];

  for (let frame = 0; frame < BUTTERFLY_FRAME_COUNT; frame++) {
    const originX = frame * BUTTERFLY_WIDTH;

    wingsByFrame[frame].forEach(([x, y, w, h, color]) => {
      g.fillStyle(color, 1);
      g.fillRect(originX + x, y, w, h);
    });

    g.fillStyle(BODY, 1);
    g.fillRect(originX + 2, 1, 2, 4);
  }

  g.generateTexture(
    BUTTERFLY_KEY,
    BUTTERFLY_FRAME_COUNT * BUTTERFLY_WIDTH,
    BUTTERFLY_HEIGHT,
  );
  g.destroy();

  sliceIntoFrames(
    scene,
    BUTTERFLY_KEY,
    BUTTERFLY_FRAME_COUNT,
    BUTTERFLY_WIDTH,
    BUTTERFLY_HEIGHT,
  );
}

// ────────────────────────────────────────────────────────────
// 조작 안내 손가락
// ────────────────────────────────────────────────────────────

/**
 * 처음 입장했을 때 딱 한 번 보여주는 손가락.
 *
 * "화면을 눌러 이동하세요"라는 문장 대신 한 번 눌러 보인다.
 * 글을 읽지 않아도 되므로 어르신에게 부담이 적다.
 */
function createFingerTexture(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  const SKIN = 0xf0c8a0;
  const LINE = 0x8b6b45;

  const rect = (x: number, y: number, w: number, h: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillRect(x, y, w, h);
  };

  rect(4, 0, 2, 5, LINE); // 검지 윤곽
  rect(4, 1, 2, 4, SKIN); // 검지
  rect(2, 4, 6, 8, LINE); // 주먹 윤곽
  rect(3, 5, 4, 6, SKIN); // 주먹

  g.generateTexture(FINGER_KEY, FINGER_WIDTH, FINGER_HEIGHT);
  g.destroy();
}
