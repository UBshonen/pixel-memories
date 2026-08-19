import type { Dialogue } from "@/types";

/**
 * NPC와의 대화.
 *
 * lines 배열의 한 줄이 말풍선 한 칸이다.
 */
export const DIALOGUES: Dialogue[] = [
  {
    id: "dialogue-jimin",
    speaker: "친구 지민",
    lines: [
      "어, 왔구나!",
      "둘이 처음 만난 자리에 내가 있었잖아.",
      "그날 둘 다 어찌나 어색해하던지…",
      "위쪽 액자에 그날 사진이 걸려 있어. 보고 가.",
    ],
  },
  {
    id: "dialogue-mother",
    speaker: "어머니",
    lines: [
      "먼 길 와줘서 고마워요.",
      "저 아래 연못가는 둘이 자주 산책하던 곳이에요.",
      "천천히 둘러보다 가요.",
    ],
  },
];

export function findDialogue(id: string): Dialogue | undefined {
  return DIALOGUES.find((dialogue) => dialogue.id === id);
}
