# Phaser 4 메모

> 이 프로젝트는 **Phaser 4.2.1**을 쓴다. 인터넷 예제와 AI 답변 대부분은 **Phaser 3** 기준이다.
> 코드를 쓰기 전에 이 문서를 먼저 보고, 부족하면 아래 번들 문서를 본다.

---

## 공식 문서가 패키지 안에 들어 있다

검색하지 말고 여기를 먼저 볼 것.

```text
node_modules/phaser/skills/     주제별 가이드 28개
node_modules/phaser/docs/       픽셀 아트 / 렌더링 심화
node_modules/phaser/types/      TypeScript 타입 정의
```

이 프로젝트에서 쓸 순서:

| 시점 | 문서 |
|---|---|
| 완료 | `skills/game-setup-and-config/` · `skills/scenes/` · `skills/scale-and-responsive/` |
| PHASE 3 | `skills/tilemaps/` · `skills/loading-assets/` |
| PHASE 4 | `skills/sprites-and-images/` · `skills/animations/` |
| PHASE 5 | `skills/input-keyboard-mouse-touch/` · `skills/physics-arcade/` |
| PHASE 6 | `skills/cameras/` |
| 상시 | `docs/Phaser 4 Pixel Art Guide/` · `skills/v3-to-v4-migration/` |

---

## v3 → v4 주요 변경점

```text
Pipeline          → RenderNode (렌더러 전면 재작성)
FX / Mask         → Filter 로 통합
setTintFill()     → setTint() + setTintMode()
Geom.Point        → Math.Vector2
Math.PI2          → Math.TAU
Math.TAU          → 값이 바뀜! (PI/2 → PI*2), 기존 TAU는 Math.PI_OVER_2
Mesh / Plane      → 제거
Canvas 렌더러     → deprecated (WebGL 권장)
기본 해상도       → 1024 x 768 (v3는 800 x 600)
```

**증상**: 예제 코드가 조용히 동작하지 않거나 타입 에러가 난다면 v3 코드를 쓴 것이다.

---

## 현재 게임 설정

`game/config/gameConfig.ts`

```text
type          Phaser.AUTO      WebGL 우선, 실패 시 Canvas
width/height  360 x 640        세로형 모바일 기준
pixelArt      true             확대해도 픽셀이 뭉개지지 않음
scale.mode    FIT              비율 유지하며 부모 크기에 맞춤
autoCenter    CENTER_BOTH
scene         [BootScene]
```

### width/height는 화면 크기가 아니다

**게임 내부 좌표계**의 크기다.

Phaser는 항상 360 x 640으로 그린 뒤, 그 결과를 화면 크기에 맞게 통째로 확대한다.
따라서 기기가 무엇이든 게임 안의 좌표는 동일하다.

```text
gameSize     설정한 크기. 월드/카메라 계산의 기준. (360 x 640)
baseSize     실제 canvas 요소의 width/height 속성
displaySize  CSS로 늘린 최종 표시 크기 (예: 405 x 720)
```

### pixelArt: true 가 하는 일

```text
antialias   false
roundPixels true
canvas CSS  image-rendering: pixelated
```

확대·회전·줌을 많이 쓸 계획이면 `smoothPixelArt`(WebGL 전용)를 대신 검토한다.

---

## Scene 생명주기

```text
init(data)     초기화. 다른 Scene에서 넘긴 데이터를 받음
preload()      에셋 로딩          ← PHASE 3부터 사용
create(data)   게임 오브젝트 배치  ← 현재 여기만 사용
update(t, dt)  매 프레임 실행     ← PHASE 5부터 사용
```

주의할 점:

- **상태 초기화는 `constructor`가 아니라 `init()`에서.** constructor는 한 번만 실행되므로 Scene을 재시작하면 초기화되지 않는다.
- `this.scene.start()` 같은 명령은 **즉시 실행되지 않고 다음 프레임에 처리**된다.
- `pause()`는 update만 멈추고 렌더링은 계속된다. 둘 다 멈추려면 `sleep()`.

---

## 자주 쓸 것

```ts
this.scale.width / this.scale.height   // 게임 내부 좌표계 크기
this.add.graphics()                    // 선·도형 직접 그리기
this.add.rectangle(x, y, w, h, color)  // 사각형 오브젝트
this.add.text(x, y, str, style)        // 텍스트
this.tweens.add({ targets, ..., yoyo, repeat: -1 })  // 애니메이션
Phaser.VERSION                         // 버전 문자열
```
