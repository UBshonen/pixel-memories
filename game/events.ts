/**
 * Phaser와 React가 주고받는 신호의 이름.
 *
 * 이 파일은 Phaser를 import하지 않는다. 문자열 상수만 있다.
 * 그래서 게임 쪽에서도, React 쪽에서도 그냥 불러 쓸 수 있다.
 *
 * 신호를 실제로 주고받는 통로는 Phaser.Game의 events다.
 *
 *   게임 쪽:  this.game.events.emit(GAME_EVENT.OPEN_MEMORY, id)
 *   React 쪽: game.events.on(GAME_EVENT.OPEN_MEMORY, handler)
 *
 * 문자열을 직접 쓰지 않고 상수로 두는 이유는, 오타가 나면
 * 아무 일도 일어나지 않고 조용히 실패하기 때문이다.
 */
export const GAME_EVENT = {
  /** 액자와 상호작용했다. payload: memory id */
  OPEN_MEMORY: "pm:open-memory",
  /** NPC와 상호작용했다. payload: dialogue id */
  OPEN_DIALOGUE: "pm:open-dialogue",
  /** 예식장과 상호작용했다. payload 없음 */
  OPEN_WEDDING: "pm:open-wedding",
} as const;
