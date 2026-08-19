import type { Signpost } from "@/types";

/**
 * 갈림길에 세워둔 표지판.
 *
 * 길잡이 고양이가 안내를 맡고 있지만, 고양이는 "지금 가까운 한 곳"만 알려준다.
 * 표지판은 마을 전체가 어떻게 생겼는지를 한 번에 보여준다.
 */
export const SIGNPOSTS: Signpost[] = [
  {
    id: "signpost-plaza",
    title: "추억 마을 광장",
    directions: [
      { arrow: "↑", label: "결혼식장" },
      { arrow: "←", label: "제주 바다" },
      { arrow: "→", label: "우리 집" },
      { arrow: "↓", label: "연못과 정원" },
    ],
  },
];

export function findSignpost(id: string): Signpost | undefined {
  return SIGNPOSTS.find((signpost) => signpost.id === id);
}
