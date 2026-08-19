/**
 * 프로젝트 공용 타입.
 *
 * 이 파일은 Phaser도 React도 import하지 않는다.
 * 그래야 게임 쪽과 UI 쪽 양쪽에서 안전하게 쓸 수 있다.
 */

/** 액자에 담긴 추억 하나 */
export type Memory = {
  id: string;
  title: string;
  description: string;
  /** public/ 기준 경로. 지금은 임시 그림이다. */
  imageUrl: string;
  /** 화면에 그대로 표시할 문자열. 예: "2022.05" */
  date: string;
};

/** NPC와의 대화 하나 */
export type Dialogue = {
  id: string;
  /** 말하는 사람 이름 */
  speaker: string;
  /** 한 줄씩 순서대로 보여준다 */
  lines: string[];
};

/** 오시는 길 안내 한 줄 */
export type Direction = {
  /** "지하철", "버스", "주차" 등 */
  label: string;
  text: string;
};

/** 결혼식 정보 */
export type Wedding = {
  groom: string;
  bride: string;
  /** 화면에 그대로 표시할 문자열 */
  date: string;
  time: string;
  venue: string;
  hall: string;
  address: string;
  tel: string;
  /** 길찾기 링크에 쓰인다. 나중에 지도 API를 붙일 때도 그대로 쓴다. */
  latitude: number;
  longitude: number;
  directions: Direction[];
};

/** 맵에 놓이는 상호작용 오브젝트의 종류 */
export type WorldObjectKind = "frame" | "villager" | "venue";

/** 맵 위에 배치된 오브젝트 하나 */
export type WorldObject = {
  id: string;
  kind: WorldObjectKind;
  /** 타일 단위 좌표 (픽셀 아님) */
  tileX: number;
  tileY: number;
  /** kind가 frame이면 Memory의 id, villager면 Dialogue의 id */
  targetId: string;
  /** villager의 외형 번호 */
  variant?: number;
};
