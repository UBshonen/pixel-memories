# STATUS

> **이 파일만 읽으면 바로 이어서 작업할 수 있어야 한다.**
> 세션이 끝날 때마다 갱신한다. 길어지면 잘라낸다. 목표는 100줄 이내.
> 지나간 이야기는 여기 쌓지 않는다 — `git log`에 있다.
> 미루기로 한 것도 여기 쌓지 않는다 — [BACKLOG.md](BACKLOG.md)에 이유와 함께 적는다.

**갱신일** 2026-08-19 · **브랜치** main

---

## 한 줄 요약

**보낼 수 있는 청첩장이 됐다.** 마을을 돌아다니며 추억을 보고, 예식장에서 날짜·장소·
오시는 길을 확인하고, 길찾기 버튼으로 지도 앱을 열 수 있다. MVP 3 달성.

다음은 모바일 UX 다듬기.

## 지금 동작하는 것

```text
npm run dev  →  localhost:3000

512 x 768 픽셀 마을 (32 x 48 타일), 화면에 11 x 20 칸 (2배 확대)
캐릭터 걷기 · 충돌 · 카메라 추적
액자 4 + 주민 2 + 예식장 1

조작
  방향키 / WASD        걷기 (항상 최우선)
  화면 누르고 있기      그 방향으로 걷기
  오브젝트 클릭         길을 찾아 그쪽으로 걸어간 뒤 자동으로 열림
  스페이스 / 엔터       가까운 오브젝트 열기
```

그래픽은 전부 **코드로 그린 임시 그림**이고, 사진과 약도는 `public/`의 SVG다.

## 조정하기 쉬운 값 (전부 WorldScene.ts 상단)

```text
CAMERA_ZOOM     2     확대 배율. 정수로 두어야 픽셀이 안 뭉개진다
WALK_SPEED      85    초당 픽셀. 16px가 한 칸
INTERACT_RANGE  24    이 거리 안이면 ▼가 뜨고 상호작용 가능
```

## Phaser ↔ React 연결

```text
WorldScene.interactWith()
  → this.game.events.emit(GAME_EVENT.OPEN_MEMORY, id)
      → GameCanvas의 game.events.on(...)
          → findMemory(id) → setState → <MemoryModal>
```

Scene은 **무엇을 보여줄지 모른다.** id만 던진다. 화면은 React가 정한다.
이벤트 이름은 `game/events.ts`에 상수로 있다 (오타 나면 조용히 실패하므로).

## 길찾기

`game/maps/pathfinding.ts` — A*, 4방향, 대각선 없음.
오브젝트를 클릭하면 벽을 피해 경로를 찾아 걸어간다.
모서리에 끼면 1.5초 뒤 자동으로 포기한다(`STUCK_TIMEOUT`).

지금은 오브젝트 클릭에만 쓰지만, 빈 땅을 눌러 그리로 걸어가게 만들 수도 있다.

## 다음 작업 — PHASE 10 · Mobile UX

```text
1. 실제 폰에서 조작 확인      가장 먼저. 나머지는 이걸 봐야 정해진다
2. 조작 방식 결정             현재 "누른 곳 방향으로" vs 가상 조이스틱
3. 화면 비율 대응             기기별 세로 길이 차이
4. 시작 화면                  "입장하기" (BLUEPRINT §6)
```

## 확인 못 한 것

- **육안 확인.** tsc / lint / next build / 개발서버 컴파일은 통과했지만
  화면을 직접 본 적은 없다. 특히 이번에 봐 주면 좋은 것:
  - 2배 확대가 적당한지 (3배도 시도해볼 만하다)
  - 오브젝트를 클릭했을 때 캐릭터가 자연스럽게 걸어가는지, 끼지 않는지
  - 예식장 건물(34x34)이 길 끝을 잘 막고 있는지
  - 결혼식 정보 창이 세로로 길어서 스크롤이 필요한데 답답하지 않은지

## 파일 지도

```text
app/page.tsx                         GameCanvas 렌더링
components/game/GameCanvas.tsx       React ↔ Phaser 접점 + 창 띄우기
components/memory/MemoryModal.tsx    사진 창
components/dialogue/DialogueBox.tsx  대화창
components/wedding/WeddingInfo.tsx   결혼식 정보 + 약도 + 길찾기
types/index.ts                       공용 타입 (Phaser/React 양쪽에서 씀)
data/                                내용. 실제 청첩장은 여기만 바꾸면 됨
  memories.ts  dialogues.ts  wedding.ts
game/events.ts                       Phaser ↔ React 이벤트 이름
game/config/gameConfig.ts            Phaser.Game 설정
game/tiles.ts                        타일 정의 (색·모양·충돌)
game/maps/villageMap.ts              맵. 글자 그림이라 눈으로 보고 고칠 수 있다
game/maps/villageObjects.ts          오브젝트 배치
game/maps/pathfinding.ts             A* 길찾기
game/textures/placeholderTextures.ts 임시 그래픽 생성
game/scenes/BootScene.ts             텍스처 준비 후 WorldScene 시작
game/scenes/WorldScene.ts            맵 + 플레이어 + 오브젝트 + 조작 + 카메라
```

WorldScene이 450줄을 넘었다. 다음에 손대면 `game/player/`로 분리할 것.

## 디버깅 팁

`gameConfig.ts`의 `physics.arcade.debug`가 현재 `true`다. 충돌 범위가 초록 상자로 보인다.
배포 전 `false`로 되돌릴 것 ([BACKLOG.md](BACKLOG.md) 체크리스트).

## 로드맵 위치

```text
0 환경 ✓  1 Phaser ✓  2 Canvas ✓  3 Map ✓  4 Player ✓  5 Movement ✓
6 Camera ✓  7 Interaction ✓  8 Memory Modal ✓  9 Wedding Info ✓
10 Mobile UX ←
이후: Guestbook / Photo Upload / Creator / Backend / Deployment
```

전체 로드맵은 [BLUEPRINT.md](BLUEPRINT.md) §12, 미룬 것은 [BACKLOG.md](BACKLOG.md).
