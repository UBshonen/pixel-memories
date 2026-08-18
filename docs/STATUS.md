# STATUS

> **이 파일만 읽으면 바로 이어서 작업할 수 있어야 한다.**
> 세션이 끝날 때마다 갱신한다. 길어지면 잘라낸다. 목표는 100줄 이내.
> 지나간 이야기는 여기 쌓지 않는다 — `git log`에 있다.

**갱신일** 2026-08-18 · **브랜치** main

*(무슨 일이 있었는지는 `git log --oneline` 참고)*

---

## 한 줄 요약

Next.js + Phaser 연결 완료. 브라우저에 픽셀 격자와 타이틀이 뜬다. **맵·플레이어·이동은 아직 없다.**

## 지금 동작하는 것

```text
npm run dev  →  localhost:3000
             →  360 x 640 Canvas (Phaser 4.2.1 / WebGL / pixelArt)
             →  16px 격자 + "PIXEL MEMORIES" + 움직이는 사각형
```

## 다음 작업 — PHASE 3 · Map

```text
1. 맵 제작 방식 결정        ← 아래 미결정 사항
2. 타일 이미지 준비 → public/
3. BootScene.preload()로 로딩
4. 작은 맵 화면에 표시
```

목표: BootScene의 격자 대신 **실제 타일로 만든 작은 공간**이 보이는 것.

맵이 보이면 그 위에 PHASE 4의 Player를 올린다.

## 미결정 사항

**맵 제작 방식**

```text
A. 코드로 타일 배열 직접 작성   도구 학습 불필요 / 커지면 관리 어려움
B. Tiled 에디터 + JSON 내보내기  표준 방식, 확장 유리 / 새 도구 학습
```

→ MVP 규모가 작으므로 **A로 시작해 원리를 이해한 뒤 필요하면 B** 권장.

**타일 이미지** — 직접 제작 vs 무료 에셋. 미정.

## 확인 못 한 것

- BootScene의 tween 애니메이션이 실제로 움직이는 모습 (육안 미확인)
  - 게임 루프 동작은 검증됨 (약 51 FPS, 렌더 픽셀 28,540개)
  - `npm run dev` 띄우고 한 번 봐 두면 끝

## 파일 지도

```text
app/page.tsx                     GameCanvas 렌더링
app/layout.tsx                   메타데이터
components/game/GameCanvas.tsx   React ↔ Phaser 유일한 접점
game/config/gameConfig.ts        Phaser.Game 설정 (360x640, FIT, pixelArt)
game/scenes/BootScene.ts         첫 Scene
```

아직 없음: `game/objects/`, `game/player/`, `game/maps/`, `data/`, `types/`

## 로드맵 위치

```text
0 환경 ✓   1 Phaser ✓   2 Canvas ✓   3 Map ←   4 Player   5 Movement
6 Camera   7 Interaction   8 Memory Modal   9 Wedding Info   10 Mobile UX
```

전체 로드맵과 각 단계의 의도는 [BLUEPRINT.md](BLUEPRINT.md) §12.
