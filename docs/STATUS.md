# STATUS

> **이 파일만 읽으면 바로 이어서 작업할 수 있어야 한다.**
> 세션이 끝날 때마다 갱신한다. 길어지면 잘라낸다. 목표는 100줄 이내.
> 지나간 이야기는 여기 쌓지 않는다 — `git log`에 있다.

**갱신일** 2026-08-18 · **브랜치** main

---

## 한 줄 요약

**추억 마을을 걸어다닐 수 있다.** 맵·플레이어·이동·충돌·카메라 완성. MVP 1 달성.

다음은 오브젝트 상호작용(액자를 누르면 사진이 뜨는 것).

## 지금 동작하는 것

```text
npm run dev  →  localhost:3000

512 x 768 픽셀 마을 (32 x 48 타일)
캐릭터 걷기 + 걷기 애니메이션
물 / 나무 / 울타리 충돌
카메라가 부드럽게 따라옴
조작: 방향키 · WASD · 화면 누르고 있기(모바일)
```

타일 그래픽은 전부 **코드로 그린 임시 그림**이다. 파일이 없다.

## 다음 작업 — PHASE 7 · Object Interaction

```text
1. 상호작용 오브젝트 배치 (액자 / NPC / 게시판)
2. 근접 감지 + "누르세요" 표시
3. Phaser → React 이벤트 전달
4. React에서 사진 모달 표시   ← PHASE 8
```

핵심 난관은 3번이다. 방법은 `docs/notes/react-phaser.md` 맨 아래 참고.

건물 부지는 맵에 이미 잡아뒀다. 울타리로 둘러싸인 네 구역(위=결혼식장,
좌=사진관, 우=카페, 아래=추억의 집)에 문이 하나씩 나 있다.

## 미결정 사항

- **진짜 픽셀 아트로 언제 교체할지.** 임시 타일로 계속 기능을 쌓을지,
  지금 그래픽을 입힐지. 교체는 `game/tiles.ts`와
  `game/textures/placeholderTextures.ts`만 바꾸면 된다.
- **모바일 조작 최종안.** 현재는 "누른 곳으로 걸어감". 가상 조이스틱과
  비교 테스트 필요 (PHASE 10).

## 확인 못 한 것

- **육안 확인 전체.** 타입검사·lint·프로덕션 빌드·런타임 콘솔(에러 없음)까지는
  검증했지만 화면을 직접 본 적은 없다. `npm run dev` 로 한 번 볼 것.
- 특히 임시 타일 그림의 색 조합과 캐릭터 크기(12x16)가 어색하지 않은지.

## 파일 지도

```text
app/page.tsx                        GameCanvas 렌더링
components/game/GameCanvas.tsx      React ↔ Phaser 유일한 접점
game/config/gameConfig.ts           Phaser.Game 설정 (360x640, FIT, arcade)
game/tiles.ts                       타일 정의 — 색·모양·충돌의 유일한 기준
game/maps/villageMap.ts             맵. 글자 그림이라 눈으로 보고 고칠 수 있다
game/textures/placeholderTextures.ts 임시 그래픽을 코드로 그려 텍스처로 굽는다
game/scenes/BootScene.ts            텍스처 준비 후 WorldScene 시작
game/scenes/WorldScene.ts           맵 + 플레이어 + 조작 + 카메라
```

WorldScene이 커지면 `game/player/`로 분리한다. 아직은 한 파일이 읽기 쉽다.

## 디버깅 팁

`gameConfig.ts`의 `physics.arcade.debug`를 `true`로 바꾸면
충돌 범위가 초록 상자로 보인다.

## 로드맵 위치

```text
0 환경 ✓  1 Phaser ✓  2 Canvas ✓  3 Map ✓  4 Player ✓  5 Movement ✓  6 Camera ✓
7 Interaction ←   8 Memory Modal   9 Wedding Info   10 Mobile UX
```

전체 로드맵과 각 단계의 의도는 [BLUEPRINT.md](BLUEPRINT.md) §12.
