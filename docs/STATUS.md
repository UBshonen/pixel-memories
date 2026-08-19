# STATUS

> **이 파일만 읽으면 바로 이어서 작업할 수 있어야 한다.**
> 세션이 끝날 때마다 갱신한다. 길어지면 잘라낸다. 목표는 100줄 이내.
> 지나간 이야기는 여기 쌓지 않는다 — `git log`에 있다.
> 미루기로 한 것도 여기 쌓지 않는다 — [BACKLOG.md](BACKLOG.md)에 이유와 함께 적는다.

**갱신일** 2026-08-19 · **브랜치** main

---

## 한 줄 요약

**청첩장으로서 필요한 것이 전부 들어갔다.** 남은 건 그림과 실제 내용, 그리고 배포다.

## 지금 동작하는 것

```text
npm run dev  →  localhost:3000

시작 화면 [입장하기] → 누르면 그때 게임이 만들어진다

512 x 768 픽셀 마을 (32 x 48 타일), 화면에 7.5 x 13.3 칸 (3배 확대)
액자 4 + 주민 2 + 예식장 1 + 표지판 1
길잡이 고양이 1마리 + 나비 7마리

조작 — 화면에 버튼이 하나도 없다
  아무 곳이나 탭        길을 찾아 그 자리로 걸어감
  오브젝트 탭           그 앞까지 걸어간 뒤 자동으로 열림
  방향키 / WASD        걷기 (PC에서만)
  스페이스 / 엔터       가까운 오브젝트 열기

  키보드를 쓰면 자동 이동은 즉시 취소된다.

결혼식 정보 창
  혼주 · 날짜 · 장소 · 픽셀 약도 · 오시는 길
  카카오맵 / 네이버지도 길찾기 (API 키 없이 지도 앱을 연다)
  전화 걸기 · 마음 전하실 곳(접힘, 복사 버튼) · 청첩장 공유하기

카카오톡 미리보기
  app/opengraph-image.tsx 가 1200x630 PNG를 코드로 그린다
  data/wedding.ts를 고치면 이미지도 같이 바뀐다
```

그래픽은 전부 **코드로 그린 임시 그림**이고, 사진과 약도는 `public/`의 SVG다.

## 조정하기 쉬운 값 (전부 WorldScene.ts 상단)

```text
CAMERA_ZOOM     3     확대 배율. 정수로 두어야 픽셀이 안 뭉개진다
WALK_SPEED      85    초당 픽셀. 16px가 한 칸
INTERACT_RANGE  24    이 거리 안이면 ▼가 뜨고 상호작용 가능
```

## 복사 · 공유는 배포 후에야 제대로 된다

`navigator.clipboard`와 `navigator.share`는 **https 또는 localhost에서만** 동작한다.
폰에서 `http://172.24.x.x:3000` 으로 테스트하면 둘 다 없는 값이 된다.

`lib/clipboard.ts`에 옛날 방식(execCommand) 대비책을 넣어 두어 복사는 되지만,
**공유 버튼은 폰 테스트에서 "링크가 복사됐어요"로만 동작한다.** 배포하면 공유창이 열린다.

## Phaser ↔ React 연결

```text
WorldScene.interactWith()
  → this.game.events.emit(GAME_EVENT.OPEN_MEMORY, id)
      → GameCanvas의 game.events.on(...)
          → findMemory(id) → setState → <MemoryModal>
```

Scene은 **무엇을 보여줄지 모른다.** id만 던진다. 화면은 React가 정한다.
이벤트 이름은 `game/events.ts`에 상수로 있다 (오타 나면 조용히 실패하므로).

## 길 안내는 UI가 아니라 고양이가 한다

3배 확대라 화면에 맵의 5%만 보인다. 그래서 길을 잃기 쉬운데,
화살표나 미니맵 대신 **마을에 사는 생명체**로 풀었다.

```text
평소        플레이어가 지나온 자취를 밟아 따라온다 (길찾기 안 씀)
2.2초 멈추면  아직 안 본 곳으로 3칸 앞서가서 돌아본다 (길찾기 씀)
다시 움직이면 안내를 접고 따라오기로 돌아간다
전부 봤으면   안내하지 않고 따라만 다닌다
```

**안내 장치는 이것 하나뿐이다.** 표지판·화살표·미니맵을 함께 두면
하객이 뭘 봐야 할지 몰라 오히려 헷갈린다. 늘리지 말 것.

`game/objects/GuideCat.ts` 상단 상수로 거리·속도·기다리는 시간을 조절한다.

## 길찾기

`game/maps/pathfinding.ts` — A*, 4방향, 대각선 없음.
오브젝트를 클릭하면 벽을 피해 경로를 찾아 걸어간다.
모서리에 끼면 1.5초 뒤 자동으로 포기한다(`STUCK_TIMEOUT`).

지금은 오브젝트 클릭에만 쓰지만, 빈 땅을 눌러 그리로 걸어가게 만들 수도 있다.

## 다음 작업 — 단계 2 · 그래픽

단계 1(확정)과 단계 3(청첩장 필수 요소)은 끝났다.

```text
[x] 조작 방식      탭 이동. 화면 버튼 없음
[x] 카메라 배율     3배
[x] 타일 크기      16px
[x] 캐릭터 방향 수  4방향으로 결정
[x] 화면 비율      폰에서 안 잘림. 대응 불필요
```

### 그림 발주서 (전부 임시 그림을 교체하는 작업)

```text
타일 6종        16x16    잔디 · 꽃밭 · 길 · 물 · 나무 · 울타리
플레이어        12x16    4방향 x 3프레임 = 12장
주민 2종        12x16    서 있기만 = 2장
고양이          12x10    옆모습 3프레임
나비             6x6     2프레임
액자            14x16
예식장          34x34
표지판          14x18
약도                     public/wedding/directions-map.svg
사진 4장                 public/memories/*.svg
```

**4방향은 그림만의 일이 아니다.** 지금은 좌우 뒤집기만 하면 됐지만,
캐릭터가 어느 쪽을 보는지 기억하고 걷기 애니메이션 네 벌을 갈아끼우는
코드가 `WorldScene.movePlayer` 근처에 들어가야 한다.

그다음은 단계 4(실제 내용) → 5(참여 기능, 선택) → 6(배포).
전체는 [BLUEPRINT.md](BLUEPRINT.md) §12.

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
components/start/StartScreen.tsx     입장 화면
components/memory/MemoryModal.tsx    사진 창
components/dialogue/DialogueBox.tsx  대화창
components/signpost/SignpostPanel.tsx 표지판 안내
components/wedding/WeddingInfo.tsx   결혼식 정보 + 약도 + 길찾기 + 공유
components/wedding/AccountList.tsx   마음 전하실 곳
lib/clipboard.ts                     복사 · 공유 (보안 컨텍스트 대비책 포함)
app/opengraph-image.tsx              카카오톡 미리보기 이미지 생성
types/index.ts                       공용 타입 (Phaser/React 양쪽에서 씀)
data/                                내용. 실제 청첩장은 여기만 바꾸면 됨
  memories.ts  dialogues.ts  wedding.ts  signposts.ts
game/events.ts                       Phaser ↔ React 이벤트 이름
game/config/gameConfig.ts            Phaser.Game 설정
game/tiles.ts                        타일 정의 (색·모양·충돌)
game/maps/villageMap.ts              맵. 글자 그림이라 눈으로 보고 고칠 수 있다
game/maps/villageObjects.ts          오브젝트 배치
game/maps/pathfinding.ts             A* 길찾기
game/objects/GuideCat.ts             길잡이 고양이
game/objects/Butterflies.ts          나비 (장식 전용)
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
PHASE 0~10 전부 완료

단계 1 확정        ✓
단계 2 그래픽      ← 여기
단계 3 청첩장 필수  ✓
단계 4 실제 내용
단계 5 참여 기능 (선택, 서버 필요)
단계 6 배포
```

전체 로드맵은 [BLUEPRINT.md](BLUEPRINT.md) §12, 미룬 것은 [BACKLOG.md](BACKLOG.md).
