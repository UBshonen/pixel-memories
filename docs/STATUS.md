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

512 x 768 픽셀 마을 (32 x 48 타일), 화면에 7.5 x 13.3 칸 (3배 확대)
캐릭터 걷기 · 충돌 · 카메라 추적
액자 4 + 주민 2 + 예식장 1

조작
  아무 곳이나 탭        길을 찾아 그 자리로 걸어감
  오브젝트 탭           그 앞까지 걸어간 뒤 자동으로 열림
  화면 방향 버튼        누르는 동안 그 방향으로 (켜고 끌 수 있음)
  방향키 / WASD        걷기
  스페이스 / 엔터       가까운 오브젝트 열기

  직접 조작(키보드·방향버튼)을 하면 자동 이동은 즉시 취소된다.
```

## PHASE 10 — 지금 비교 중인 것

화면 방향 버튼을 켜고 끄는 스위치가 있다. **폰에서 두 방식을 비교해보고 정한다.**

```text
game/controls.ts  →  SHOW_DIRECTION_PAD = true / false
```

`false`로 두면 화면에 아무 UI도 없이 탭 이동만 남는다.
방향 버튼은 화면 아래를 차지하고 "게임"이라는 인상을 주므로,
기획서의 "진입 장벽은 매우 낮아야 한다"와는 탭 이동 쪽이 더 맞는다.

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

## 다음 작업 — 단계 1 · 확정

**그림 작업을 막고 있는 결정들.** 전부 폰에서 만져봐야 정해진다.
여기서 나오는 결론이 곧 그림 발주서가 된다.

```text
[ ] 조작 방식      탭 이동만 vs 방향 버튼 병행     ← 지금 둘 다 켜져 있음
[x] 카메라 배율     3배로 결정
[ ] 타일 크기      현재 16px. 3배 확대와 함께 판단
[ ] 캐릭터 방향 수  정면 1방향(현재) vs 4방향 → 그림 양 4배 차이
[ ] 화면 비율 대응  기기별 세로 길이 차이
```

캐릭터는 지금 정면 그림 하나를 좌우로만 뒤집어 쓴다. 위로 걸어도 얼굴이 보인다.

**남은 전체 계획은 [BLUEPRINT.md](BLUEPRINT.md) §12에 단계별로 정리돼 있다.**
단계 3에 카카오톡 공유 미리보기·계좌번호 등 아직 없는 청첩장 필수 요소가 있다.

폰 접속이 안 되면 [notes/mobile-testing.md](notes/mobile-testing.md).

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
