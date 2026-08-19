# STATUS

> **이 파일만 읽으면 바로 이어서 작업할 수 있어야 한다.**
> 세션이 끝날 때마다 갱신한다. 길어지면 잘라낸다. 목표는 100줄 이내.
> 지나간 이야기는 여기 쌓지 않는다 — `git log`에 있다.

**갱신일** 2026-08-19 · **브랜치** main

---

## 한 줄 요약

**마을을 돌아다니며 추억을 발견할 수 있다.** 액자를 누르면 사진 창이, NPC를 누르면
대화창이 뜬다. 청첩장의 뼈대가 완성됐다.

다음은 결혼식 정보(예식 날짜·장소·지도).

## 지금 동작하는 것

```text
npm run dev  →  localhost:3000

512 x 768 픽셀 마을, 캐릭터 걷기, 충돌, 카메라 추적
액자 4개 + 주민 2명
가까이 가면 ▼ 표시 → 스페이스/엔터 또는 오브젝트 터치 → 창이 열림
창이 열리는 동안 게임은 멈춤(pause), 닫으면 재개
```

그래픽은 전부 **코드로 그린 임시 그림**이고, 사진은 `public/memories/`의 SVG다.

## Phaser ↔ React 연결 (이번에 만든 핵심)

```text
WorldScene.interactWith()
  → this.game.events.emit(GAME_EVENT.OPEN_MEMORY, id)
      → GameCanvas의 game.events.on(...)
          → findMemory(id) → setState → <MemoryModal>
```

Scene은 **무엇을 보여줄지 모른다.** id만 던진다. 화면은 React가 정한다.
이벤트 이름은 `game/events.ts`에 상수로 있다 (오타 나면 조용히 실패하므로).

새 상호작용을 추가하려면: `types/index.ts`에 종류 추가 → `data/`에 내용 →
`villageObjects.ts`에 배치 → `events.ts`에 이벤트 → React 컴포넌트.

## 다음 작업 — PHASE 9 · Wedding Information

```text
1. data/wedding.ts        날짜 / 시간 / 장소 / 연락처
2. 결혼식장 오브젝트 배치  맵 위쪽 울타리 구역(rows 18-21, cols 5-9)
3. WeddingInfo 컴포넌트    기존 모달과 같은 방식
4. 지도 / 오시는 길        방법 미정 (아래 참고)
```

건물 부지는 이미 잡혀 있다. 울타리 네 구역에 문이 하나씩 나 있다.

## 미결정 사항

- **지도를 어떻게 넣을지.** 카카오맵/네이버 지도 API는 키 발급과 도메인 등록이
  필요하다. 정적 이미지 + 외부 링크로 시작하는 것이 간단하다.
- **진짜 픽셀 아트 교체 시점.** 교체는 `game/tiles.ts` 와
  `game/textures/placeholderTextures.ts` 만 바꾸면 된다.
- **모바일 조작 최종안.** 현재 "누른 곳으로 걸어감". 가상 조이스틱과 비교 필요 (PHASE 10).

## 알려진 문제

- 개발 모드에서 `Cannot suspend a closed AudioContext` 경고가 뜬다.
  React가 컴포넌트를 두 번 실행하며 게임을 만들었다 부수는 과정에서 나온다.
  동작에는 영향 없음. 소리를 넣을 때 다시 볼 것.

## 확인 못 한 것

- **육안 확인.** tsc / lint / next build / 개발서버 컴파일까지는 통과했지만
  화면을 직접 본 적은 없다. 특히 아래를 봐 주면 좋다.
  - ▼ 표시가 오브젝트 머리 위에 제대로 붙는지
  - 모달을 닫은 뒤 캐릭터가 멋대로 걷지 않는지
  - 액자·주민 그림 크기가 타일과 어울리는지

## 파일 지도

```text
app/page.tsx                         GameCanvas 렌더링
components/game/GameCanvas.tsx       React ↔ Phaser 접점 + 창 띄우기
components/memory/MemoryModal.tsx    사진 창
components/dialogue/DialogueBox.tsx  대화창
types/index.ts                       공용 타입 (Phaser/React 양쪽에서 씀)
data/memories.ts, data/dialogues.ts  내용. 실제 청첩장은 여기만 바꾸면 됨
game/events.ts                       Phaser ↔ React 이벤트 이름
game/config/gameConfig.ts            Phaser.Game 설정
game/tiles.ts                        타일 정의 (색·모양·충돌)
game/maps/villageMap.ts              맵. 글자 그림이라 눈으로 보고 고칠 수 있다
game/maps/villageObjects.ts          오브젝트 배치
game/textures/placeholderTextures.ts 임시 그래픽 생성
game/scenes/BootScene.ts             텍스처 준비 후 WorldScene 시작
game/scenes/WorldScene.ts            맵 + 플레이어 + 오브젝트 + 조작 + 카메라
```

WorldScene이 400줄에 가까워졌다. 다음에 커지면 `game/player/`로 분리할 것.

## 디버깅 팁

`gameConfig.ts`의 `physics.arcade.debug`가 현재 `true`다. 충돌 범위가 초록 상자로 보인다.
배포 전에 `false`로 되돌릴 것.

## 로드맵 위치

```text
0 환경 ✓  1 Phaser ✓  2 Canvas ✓  3 Map ✓  4 Player ✓  5 Movement ✓
6 Camera ✓  7 Interaction ✓  8 Memory Modal ✓
9 Wedding Info ←   10 Mobile UX
이후: Guestbook / Photo Upload / Creator / Backend / Deployment
```

전체 로드맵과 각 단계의 의도는 [BLUEPRINT.md](BLUEPRINT.md) §12.
