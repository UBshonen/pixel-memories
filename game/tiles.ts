/**
 * 타일 정의 — 이 파일 하나가 타일의 유일한 기준이다.
 *
 * 여기서 정한 순서(배열 인덱스)가 곧 타일 번호이고,
 * 타일셋 이미지도 맵 데이터도 전부 이 순서를 따른다.
 *
 * 지금은 그림 파일 없이 코드로 색 사각형을 그려 쓴다(임시 타일).
 * 나중에 진짜 픽셀 아트로 바꿀 때는 이 파일의 그리기 부분만 이미지 로딩으로 교체하면 된다.
 */

/** 타일 한 칸의 크기(픽셀). 맵의 모든 좌표 계산 기준이다. */
export const TILE_SIZE = 16;

/** 타일 번호. 맵 데이터에 들어가는 값이다. */
export const TILE = {
  GRASS: 0,
  FLOWER: 1,
  PATH: 2,
  WATER: 3,
  TREE: 4,
  FENCE: 5,
} as const;

/** 타일 위에 덧그릴 사각형 하나. [x, y, 너비, 높이, 색] */
type Detail = [number, number, number, number, number];

type TileDef = {
  /** 화면에 표시할 이름. 디버깅용. */
  name: string;
  /** 타일 전체를 채울 바탕색 */
  base: number;
  /** 바탕 위에 덧그릴 사각형들 */
  details: Detail[];
  /** true면 플레이어가 통과하지 못한다 */
  solid: boolean;
};

const GRASS_BASE = 0x4a7a3a;
const GRASS_DARK = 0x3d6830;

/**
 * 배열 순서 = 타일 번호. TILE 상수와 반드시 일치해야 한다.
 */
export const TILE_DEFS: TileDef[] = [
  {
    name: "잔디",
    base: GRASS_BASE,
    details: [
      [2, 3, 1, 2, GRASS_DARK],
      [7, 6, 1, 2, GRASS_DARK],
      [12, 10, 1, 2, GRASS_DARK],
      [5, 12, 1, 2, GRASS_DARK],
      [10, 2, 1, 2, GRASS_DARK],
    ],
    solid: false,
  },
  {
    name: "꽃밭",
    base: GRASS_BASE,
    details: [
      [3, 4, 2, 2, 0xe8556d],
      [10, 7, 2, 2, 0xf4d35e],
      [6, 11, 2, 2, 0xe8556d],
      [12, 13, 2, 2, 0xf4d35e],
      [2, 9, 1, 2, GRASS_DARK],
      [13, 3, 1, 2, GRASS_DARK],
    ],
    solid: false,
  },
  {
    name: "길",
    base: 0xb8946a,
    details: [
      [3, 2, 2, 1, 0xa37f58],
      [9, 5, 2, 1, 0xc9a87d],
      [5, 9, 2, 1, 0xa37f58],
      [12, 12, 2, 1, 0xc9a87d],
      [1, 13, 2, 1, 0xa37f58],
    ],
    solid: false,
  },
  {
    name: "물",
    base: 0x3b6ea5,
    details: [
      [2, 4, 5, 1, 0x5a8fc4],
      [9, 7, 5, 1, 0x5a8fc4],
      [4, 11, 5, 1, 0x5a8fc4],
      [10, 2, 4, 1, 0x2d5480],
      [1, 9, 4, 1, 0x2d5480],
    ],
    solid: true,
  },
  {
    name: "나무",
    base: GRASS_BASE,
    details: [
      [7, 11, 2, 4, 0x6b4a2f],
      [4, 1, 8, 2, 0x2f5c28],
      [3, 3, 10, 6, 0x2f5c28],
      [4, 9, 8, 2, 0x2f5c28],
      [5, 3, 4, 3, 0x3f7536],
    ],
    solid: true,
  },
  {
    name: "울타리",
    base: GRASS_BASE,
    details: [
      [0, 6, 16, 2, 0x8b6b45],
      [0, 10, 16, 2, 0x8b6b45],
      [2, 3, 2, 11, 0xa07d52],
      [11, 3, 2, 11, 0xa07d52],
    ],
    solid: true,
  },
];

/** 충돌하는 타일 번호 목록. Phaser의 setCollision()에 그대로 넘긴다. */
export const SOLID_TILES = TILE_DEFS.map((def, index) => ({ def, index }))
  .filter(({ def }) => def.solid)
  .map(({ index }) => index);
