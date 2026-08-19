import { SOLID_TILES } from "../tiles";

export type TilePoint = { x: number; y: number };

/**
 * 맵 데이터에서 "걸을 수 있는 칸" 표를 만든다.
 *
 * true면 지나갈 수 있는 칸이다.
 */
export function buildWalkableGrid(tiles: number[][]): boolean[][] {
  const solid = new Set(SOLID_TILES);

  return tiles.map((row) => row.map((tile) => !solid.has(tile)));
}

/**
 * A* 길찾기.
 *
 * 출발 칸에서 도착 칸까지, 벽을 피해 지나갈 칸들을 순서대로 돌려준다.
 * 갈 수 없으면 null.
 *
 * 원리는 단순하다. 갈 수 있는 칸을 하나씩 넓혀 가되, 아무 칸이나 보지 않고
 * "여기까지 온 비용 + 목적지까지 남은 예상 거리"가 가장 작은 칸부터 살펴본다.
 * 예상 거리를 쓰기 때문에 목적지 방향으로 먼저 뻗어나가고, 그래서 빠르다.
 *
 * 대각선 이동은 허용하지 않는다. 벽 모서리를 비스듬히 통과해버리는 문제를
 * 신경 쓰지 않아도 되고, 결과도 타일 격자에 자연스럽게 맞는다.
 */
export function findPath(
  walkable: boolean[][],
  start: TilePoint,
  goal: TilePoint,
): TilePoint[] | null {
  const height = walkable.length;
  const width = walkable[0]?.length ?? 0;

  const isOpen = (x: number, y: number) =>
    y >= 0 && y < height && x >= 0 && x < width && walkable[y][x];

  if (!isOpen(start.x, start.y) || !isOpen(goal.x, goal.y)) {
    return null;
  }

  if (start.x === goal.x && start.y === goal.y) {
    return [];
  }

  /** 칸 하나를 숫자 하나로 표현한다. Map의 키로 쓰기 위해서다. */
  const idOf = (x: number, y: number) => y * width + x;

  /** 목적지까지 남은 거리의 어림값. 벽을 무시한 최단 거리다. */
  const estimate = (x: number, y: number) =>
    Math.abs(x - goal.x) + Math.abs(y - goal.y);

  const startId = idOf(start.x, start.y);
  const goalId = idOf(goal.x, goal.y);

  const costFromStart = new Map<number, number>([[startId, 0]]);
  const estimatedTotal = new Map<number, number>([
    [startId, estimate(start.x, start.y)],
  ]);
  const previous = new Map<number, number>();

  /** 아직 살펴보지 않은 칸들 */
  const frontier = new Set<number>([startId]);

  while (frontier.size > 0) {
    // 예상 총비용이 가장 작은 칸을 고른다.
    // 맵이 1,536칸이라 매번 훑어도 충분히 빠르다.
    let current = -1;
    let bestScore = Infinity;

    for (const id of frontier) {
      const score = estimatedTotal.get(id) ?? Infinity;

      if (score < bestScore) {
        bestScore = score;
        current = id;
      }
    }

    if (current === goalId) {
      return rebuildPath(previous, current, width);
    }

    frontier.delete(current);

    const currentX = current % width;
    const currentY = Math.floor(current / width);
    const currentCost = costFromStart.get(current) ?? Infinity;

    for (const [dx, dy] of NEIGHBOURS) {
      const nextX = currentX + dx;
      const nextY = currentY + dy;

      if (!isOpen(nextX, nextY)) continue;

      const nextId = idOf(nextX, nextY);
      const nextCost = currentCost + 1;

      if (nextCost >= (costFromStart.get(nextId) ?? Infinity)) continue;

      previous.set(nextId, current);
      costFromStart.set(nextId, nextCost);
      estimatedTotal.set(nextId, nextCost + estimate(nextX, nextY));
      frontier.add(nextId);
    }
  }

  return null;
}

const NEIGHBOURS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** 도착 칸에서 거꾸로 따라가며 경로를 복원한다. 출발 칸은 넣지 않는다. */
function rebuildPath(
  previous: Map<number, number>,
  goalId: number,
  width: number,
): TilePoint[] {
  const path: TilePoint[] = [];

  let id: number | undefined = goalId;

  while (id !== undefined) {
    path.push({ x: id % width, y: Math.floor(id / width) });
    id = previous.get(id);
  }

  path.pop(); // 출발 칸 제거
  path.reverse();

  return path;
}
