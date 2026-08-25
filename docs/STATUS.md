# STATUS

> **이 파일만 읽으면 바로 이어서 작업할 수 있어야 한다.**
> 세션이 끝날 때마다 갱신한다. 길어지면 잘라낸다.
> 지나간 이야기는 `git log`, 미룬 것은 [BACKLOG.md](BACKLOG.md)에.

**갱신일** 2026-08-21 (배포 완료) · **브랜치** main · 작업 트리 깨끗, 전부 push 완료

---

# 다른 컴퓨터에서 이어서 하기

```bash
git clone https://github.com/UBshonen/pixel-memories.git
cd pixel-memories
npm install
npm run dev
```

이미 클론돼 있으면 `git pull` 부터.

**Node 22 이상이 필요하다.** 설치·확인·폰 테스트·Windows 특이사항·자주 겪는 문제는
[SETUP.md](SETUP.md) 에 정리해뒀다. 환경이 처음이면 그것부터 본다.

---

# 지금 상태

## 한 줄 요약

**배포 완료.** https://pixel-memories.theurain1.workers.dev

기능은 전부 동작한다. 남은 건 그림과 실제 내용이다.

그래픽은 전부 **코드로 그린 임시 그림**이고, 내용은 **예시 데이터**다.

## 배포 — 끝났다

```text
주소   https://pixel-memories.theurain1.workers.dev
호스팅  Cloudflare Workers (무료 플랜, 카드 미등록)
자동   main 에 push 하면 자동 재배포된다
```

**검증 완료** — 페이지 200, OG 이미지가 image/png 로 내려옴(_headers 적용),
og:image 가 절대 주소로 박힘(NEXT_PUBLIC_SITE_URL 적용), 사진·약도 SVG 정상.

## 다음 작업 — 배포 후 남은 확인

```text
[ ] 폰에서 열어 복사·공유 버튼이 실제로 동작하는지   ← https 라 이제 될 것
[ ] 카카오톡으로 링크 보내서 미리보기 카드 확인
[ ] 폰에서 스크린샷 찍어 README 에 추가
```

그다음은 아래 "배포 다음 — 큰 덩어리 셋".

**Cloudflare Pages 가 아니라 Workers 다.** Pages 는 유지보수 모드라
신규 프로젝트는 Workers 를 쓰라고 Cloudflare 가 안내한다. 정적 자산 기능은 동등하다.

**Vercel 은 접었다.** 구글로 가입한 계정을 지운 뒤 재가입이 막혔다(알려진 문제,
지원팀 문의 2~3일). 경위와 대안 비교는 [INTERVIEW.md](INTERVIEW.md) §11-8.

---

# 동작하는 것

```text
시작 화면 [입장하기] → 누르면 그때 게임이 만들어진다
        [결혼식 정보 바로 보기] → 마을에 안 들어가도 정보만 볼 수 있다

512 x 768 픽셀 마을 (32 x 48 타일), 화면에 7.5 x 13.3 칸 (3배 확대)
액자 4 + 주민 2 + 예식장 1 + 표지판 1
길잡이 고양이 1마리 + 나비 7마리

조작 — 화면에 버튼이 하나도 없다
  아무 곳이나 탭     길을 찾아 그 자리로 걸어감
  오브젝트 탭        그 앞까지 걸어간 뒤 자동으로 열림
  방향키 / WASD     걷기 (PC에서만). 누르면 자동 이동은 취소된다
  스페이스 / 엔터    가까운 오브젝트 열기

결혼식 정보 창
  혼주 · 날짜 · 장소 · 픽셀 약도 · 오시는 길
  카카오맵 / 네이버지도 길찾기 (API 키 없이 지도 앱을 연다)
  전화 · 마음 전하실 곳(접힘, 복사) · 청첩장 공유

카카오톡 미리보기
  app/opengraph-image.tsx 가 1200x630 PNG를 코드로 그린다
```

## 복사 · 공유는 배포해야 제대로 된다

`navigator.clipboard` 와 `navigator.share` 는 **https 또는 localhost 에서만** 동작한다.
폰에서 `http://172.24.x.x:3000` 으로 테스트하면 둘 다 없는 값이 된다.

`lib/clipboard.ts` 에 대비책이 있어 복사는 되지만, **공유는 "링크가 복사됐어요"로만
동작한다.** 배포하면 공유창이 열린다. 배포 후 폰에서 확인할 것.

## 조정하기 쉬운 값

```text
game/scenes/WorldScene.ts 상단
  CAMERA_ZOOM     3     확대 배율. 정수로 두어야 픽셀이 안 뭉개진다
  WALK_SPEED      85    초당 픽셀. 16px가 한 칸
  INTERACT_RANGE  24    이 거리 안이면 상호작용 가능
  IDLE_BOB_PIXELS 1     오브젝트가 흔들리는 폭
  HINT_DELAY      900   입장 후 손가락 안내까지 (밀리초)

game/objects/GuideCat.ts 상단
  고양이 따라오는 거리 · 속도 · 안내 시작까지 기다리는 시간
```

---

# 구조 — 세 가지만 알면 된다

## Phaser ↔ React 연결

```text
WorldScene.interactWith()
  → this.game.events.emit(GAME_EVENT.OPEN_MEMORY, id)
      → GameCanvas 의 game.events.on(...)
          → findMemory(id) → setState → <MemoryModal>
```

Scene 은 **무엇을 보여줄지 모른다.** id 만 던진다. 화면은 React 가 정한다.
접점은 `components/game/GameCanvas.tsx` 하나뿐이다.

## 길 안내는 UI 가 아니라 고양이가 한다

3배 확대라 화면에 맵의 5% 만 보인다. 화살표나 미니맵 대신 생명체로 풀었다.

```text
평소          플레이어가 지나온 자취를 밟아 따라온다 (길찾기 안 씀)
2초쯤 멈추면   아직 안 본 곳으로 3칸 앞서가서 돌아본다 (길찾기 씀)
다시 움직이면  안내를 접는다.  전부 봤으면 따라만 다닌다
```

**안내 장치는 이것 하나뿐이다.** 표지판·화살표·미니맵을 함께 두면
하객이 뭘 봐야 할지 몰라 오히려 헷갈린다. **늘리지 말 것.**

## 길찾기

`game/maps/pathfinding.ts` — A*, 4방향, 대각선 없음.
모서리에 끼면 1.5초 뒤 자동으로 포기한다.

---

# 파일 지도

```text
app/page.tsx                          GameCanvas 렌더링
app/opengraph-image.tsx               카카오톡 미리보기 이미지 생성
components/game/GameCanvas.tsx        React ↔ Phaser 접점 + 창 띄우기
components/start/StartScreen.tsx      입장 화면
components/memory/MemoryModal.tsx     사진 창
components/dialogue/DialogueBox.tsx   대화창
components/signpost/SignpostPanel.tsx 표지판 안내
components/wedding/WeddingInfo.tsx    결혼식 정보 + 약도 + 길찾기 + 공유
components/wedding/AccountList.tsx    마음 전하실 곳
lib/clipboard.ts                      복사 · 공유 (보안 컨텍스트 대비책)
types/index.ts                        공용 타입 (Phaser/React 양쪽)
data/                                 내용. 실제 청첩장은 여기만 고치면 됨
  memories.ts  dialogues.ts  wedding.ts  signposts.ts
game/events.ts                        Phaser ↔ React 이벤트 이름
game/config/gameConfig.ts             Phaser.Game 설정
game/tiles.ts                         타일 정의 (색·모양·충돌)
game/maps/villageMap.ts               맵. 글자 그림이라 눈으로 고칠 수 있다
game/maps/villageObjects.ts           오브젝트 배치
game/maps/pathfinding.ts              A* 길찾기
game/objects/GuideCat.ts              길잡이 고양이
game/objects/Butterflies.ts           나비 (장식 전용)
game/textures/placeholderTextures.ts  임시 그래픽 생성
game/scenes/BootScene.ts              텍스처 준비 후 WorldScene 시작
game/scenes/WorldScene.ts             맵 + 플레이어 + 오브젝트 + 조작 + 카메라
```

WorldScene 이 450줄을 넘었다. 다음에 크게 손대면 `game/player/` 로 분리할 것.

---

# 남은 판단과 문제

## 아직 판단하지 않은 것

- **표지판을 남길지.** 고양이·주민 인사·손가락 안내가 다 들어간 지금도
  필요한지 확인이 필요하다. 뺀다면 `villageObjects.ts` 의
  `obj-signpost-plaza` 한 항목만 지우면 된다.
- **입장 직후 연출이 몰리지 않는지.** 손가락 → 자동 이동 → 고양이 안내가
  연달아 일어난다. `HINT_DELAY` 와 `IDLE_BEFORE_FIRST_GUIDE` 로 벌린다.

## 알려진 문제

**손가락 안내가 눈에 안 띈다.** 10x12 임시 그림이라 그렇다.
살구색이라 잔디 위에서 묻힌다. 그림 단계에서 크기·색·움직임을 함께 조정한다.

---

# 배포 다음 — 큰 덩어리 셋

전체는 [BLUEPRINT.md](BLUEPRINT.md) §12. **포트폴리오 관점의 우선순위도 거기 있다.**

## 그래픽

결정이 먼저다. **직접 그릴지, Kenney(CC0)를 쓸지.**
라이선스 조사 결과는 [BACKLOG.md](BACKLOG.md) 에 있다.

```text
타일 6종     16x16   잔디 · 꽃밭 · 길 · 물 · 나무 · 울타리
플레이어     12x16   앞·뒤·옆 3벌 x 3프레임 = 9장 (왼쪽은 뒤집어 씀)
주민 2종     12x16   서 있기만
고양이       12x10   3프레임
나비          6x6    2프레임
액자 14x16 · 예식장 34x34 · 표지판 14x18
약도 · 사진 4장       public/ 의 SVG
```

**4방향 코드는 이미 끝났다.** 진짜 그림이 오면
`placeholderTextures.ts` 의 `drawPerson` 만 이미지 로딩으로 바꾸면 된다.

## 실제 내용

`data/` 폴더만 고치면 된다. 게임 코드는 손대지 않는다.

## 방명록 (서버)

**처음으로 서버·DB 가 필요해지는 지점이다.**
넣으면 `next.config.ts` 의 `output: "export"` 를 지워야 한다.

포트폴리오 관점에서는 이게 중요하다. 지금은 전부 프론트엔드라
"서버는 안 해봤나" 소리를 들을 수 있다.

---

# 로드맵 위치

```text
PHASE 0~10 전부 완료

단계 1 확정        ✓  조작 · 배율 · 타일 크기 · 4방향 결정
단계 2 그래픽         ← 배포 후
단계 3 청첩장 필수  ✓  카카오톡 미리보기 · 계좌 · 혼주 · 공유 · 시작 화면
단계 4 실제 내용
단계 5 참여 기능 (선택, 서버 필요)
단계 6 배포           ← 지금 여기
```
