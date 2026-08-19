import type { Memory } from "@/types";

/**
 * 액자에 담길 추억들.
 *
 * 지금은 예시 내용과 임시 그림이다.
 * 실제 청첩장을 만들 때는 이 배열만 바꾸면 된다.
 */
export const MEMORIES: Memory[] = [
  {
    id: "memory-first-meeting",
    title: "우리가 처음 만난 날",
    description:
      "친구 소개로 만난 작은 카페. 어색해서 커피만 두 잔 비웠는데, 헤어질 땐 다음 약속을 잡고 있었다.",
    imageUrl: "/memories/first-meeting.svg",
    date: "2021.09",
  },
  {
    id: "memory-jeju",
    title: "처음 떠난 제주 여행",
    description:
      "비가 올 거라던 예보가 빗나가서 종일 맑았던 날. 바닷가에 앉아 아무 말 없이 한참을 있었다.",
    imageUrl: "/memories/jeju.svg",
    date: "2022.05",
  },
  {
    id: "memory-home",
    title: "같이 고른 첫 집",
    description:
      "가구도 없이 텅 빈 거실에 앉아 짜장면을 시켜 먹었다. 여기서 시작하는구나 싶었다.",
    imageUrl: "/memories/home.svg",
    date: "2024.03",
  },
  {
    id: "memory-proposal",
    title: "그날 밤의 약속",
    description:
      "준비한 말은 하나도 못 하고 이름만 계속 불렀다. 그래도 대답은 들었다.",
    imageUrl: "/memories/proposal.svg",
    date: "2025.11",
  },
];

export function findMemory(id: string): Memory | undefined {
  return MEMORIES.find((memory) => memory.id === id);
}
