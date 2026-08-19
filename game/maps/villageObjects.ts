import type { WorldObject } from "@/types";

/**
 * 맵 위에 놓이는 상호작용 오브젝트들.
 *
 * 좌표는 타일 단위다. villageMap.ts의 글자 그림에서
 * 왼쪽부터 tileX번째, 위에서부터 tileY번째 칸을 뜻한다.
 *
 * 전부 길 옆 잔디 위에 놓아 플레이어가 다가갈 수 있게 했다.
 * 오브젝트 자체는 통과할 수 없으므로 옆에 서서 상호작용한다.
 */
export const VILLAGE_OBJECTS: WorldObject[] = [
  {
    id: "obj-frame-first-meeting",
    kind: "frame",
    tileX: 14,
    tileY: 8,
    targetId: "memory-first-meeting",
  },
  {
    id: "obj-villager-jimin",
    kind: "villager",
    tileX: 18,
    tileY: 12,
    targetId: "dialogue-jimin",
    variant: 0,
  },
  {
    id: "obj-frame-jeju",
    kind: "frame",
    tileX: 8,
    tileY: 23,
    targetId: "memory-jeju",
  },
  {
    id: "obj-frame-home",
    kind: "frame",
    tileX: 22,
    tileY: 26,
    targetId: "memory-home",
  },
  {
    id: "obj-villager-mother",
    kind: "villager",
    tileX: 13,
    tileY: 30,
    targetId: "dialogue-mother",
    variant: 1,
  },
  {
    id: "obj-frame-proposal",
    kind: "frame",
    tileX: 17,
    tileY: 35,
    targetId: "memory-proposal",
  },
];
