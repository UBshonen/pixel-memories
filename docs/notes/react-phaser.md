# React ↔ Phaser 연결 메모

> `components/game/GameCanvas.tsx` 가 두 세계가 만나는 **유일한 지점**이다.
> 이 파일을 고칠 때 아래 네 가지 이유를 잊으면 버그가 난다.

---

## 왜 Phaser가 필요한가

React는 **DOM을 상태에 맞게 다시 그리는 도구**다. 버튼·모달·폼처럼 "변할 때만 다시 그리는" UI에 최적화돼 있다.

게임 화면은 캐릭터가 1픽셀 움직일 때마다 **초당 60번 다시 그려야** 한다. DOM으로는 감당이 안 된다.

```text
React  =  가끔 바뀌는 화면을 DOM으로 그린다
Phaser =  매 프레임 바뀌는 화면을 Canvas에 직접 그린다
```

Canvas는 DOM 요소가 아니라 **그림판 한 장**이다. 브라우저에는 `<canvas>` 태그 하나만 존재하고, 그 안은 JavaScript가 픽셀로 직접 칠한다.

---

## 구조

```text
Browser → Next.js → React Component → GameCanvas → Phaser.Game → Scene → Canvas
```

React는 빈 `<div>` 하나만 그리고, 그 안을 Phaser가 `<canvas>`로 채운다.
이 `<div>` 내부는 React가 관리하지 않으므로 React 리렌더링의 영향을 받지 않는다.

```text
┌─────────── 브라우저 화면 ───────────┐
│  ┌──────────────────────────────┐  │
│  │   <canvas>  ← Phaser         │  │
│  │   맵 / 캐릭터 / 이동 / 액자   │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   React (DOM)                │  │
│  │   사진 모달 / 결혼식 정보     │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

## 네 가지 필수 장치

### 1. `'use client'`

Next.js는 기본적으로 **서버에서 먼저 HTML을 만들어 보낸다**(서버 렌더링). 그런데 Phaser는 모듈을 읽는 순간 `window`와 `document`를 참조하고, 서버(Node.js)에는 `window`가 없다.

```text
'use client'  →  "이 컴포넌트는 브라우저에서 실행된다"
```

### 2. `useEffect` 안에서 동적 import

`'use client'`를 붙여도 Next.js는 **초기 HTML을 만들기 위해 서버에서 한 번 실행**한다.
따라서 파일 맨 위에 `import Phaser from 'phaser'`를 쓰면 여전히 서버에서 에러가 난다.

```text
파일 상단 import      → 서버에서도 실행됨      ✗
useEffect 안 import   → 브라우저에서만 실행됨   ✓
```

`useEffect`는 브라우저에만 존재하는 개념이므로 그 안의 `await import()`는 서버에서 절대 실행되지 않는다.

> 타입만 쓰는 `import type { Game } from 'phaser'`는 컴파일 시 완전히 사라지므로 상단에 둬도 안전하다.

### 3. cleanup에서 `destroy`

React는 컴포넌트가 사라질 때 `useEffect`의 반환 함수를 실행한다. 여기서 게임을 정리하지 않으면:

```text
페이지 이동
→ React 컴포넌트는 사라짐
→ 그런데 Phaser 게임 루프는 계속 돌아감
→ canvas가 화면에 남고 메모리 누수
```

개발 모드에서 React는 의도적으로 컴포넌트를 두 번 실행해 이 문제를 노출시킨다.
**정리 코드가 없으면 canvas가 2개 생긴다.** canvas 개수로 확인할 수 있다.

### 4. `cancelled` 플래그

`await import()`는 시간이 걸리고, 그 사이에 컴포넌트가 사라질 수 있다.

```text
① 컴포넌트 등장 → import 시작
② 사용자가 즉시 이동 → cleanup 실행
③ import 완료 → 게임 생성 ...하지만 정리해 줄 사람이 없음
```

`cancelled` 플래그로 ③을 막는다.

---

## 앞으로 (PHASE 7~8)

Phaser에서 일어난 일을 React에 알려야 한다.

```text
캐릭터가 액자에 접근
      ↓
Phaser가 이벤트 발생
      ↓
React가 수신 → 사진 모달(DOM) 표시
```

방법 후보: Scene의 `events.emit` 을 GameCanvas에서 구독 → React state로 올리기.
구현 시점에 결정한다.
