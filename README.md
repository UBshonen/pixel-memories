# Pixel Memories

> **추억을 탐험하는 픽셀 RPG형 모바일 청첩장**

스크롤로 읽는 청첩장이 아니라, 하객이 작은 마을을 직접 걸어다니며
신랑·신부의 추억과 결혼식 정보를 발견하는 모바일 웹입니다.

**[👉 데모 보기](https://pixel-memories.theurain1.workers.dev)**

<!-- 스크린샷은 폰에서 찍어 추가할 것
![스크린샷](docs/screenshot.png)
-->

---

## 무엇을 할 수 있나

```text
탭하면 걸어간다        길찾기로 벽을 피해 이동
액자를 누르면          사진과 그날의 이야기
주민에게 다가가면      먼저 말을 걸어온다
예식장에 가면          날짜 · 장소 · 약도 · 길찾기 · 계좌
```

화면에는 **조작용 버튼이 하나도 없습니다.** 길잡이 고양이가 안내하고,
상호작용할 수 있는 것은 스스로 움직여서 알립니다.

## 이 서비스가 지키는 네 가지

| | |
|---|---|
| **신기함** | "청첩장을 이렇게도 만드는구나" |
| **귀여움** | 따라다니는 고양이, 꽃밭의 나비 |
| **편의성** | 어르신이 학습 없이 쓸 수 있는가 |
| **전달성** | 날짜·장소·계좌가 확실히 닿는가 |

특히 뒤의 둘은 **어르신 기준**입니다. 하객의 절반이 게임을 해본 적 없는 분들이라,
"눌러야 한다는 걸 알아내야 하는" 장치를 줄이고 **가만히 있어도 알려주는** 쪽으로 만들었습니다.

탐험이 부담스러운 분을 위해 시작 화면에 **[결혼식 정보 바로 보기]** 지름길을 두었습니다.

---

## 기술 스택

```text
Frontend    Next.js 16 (App Router) · React 19 · TypeScript 5.9 · Tailwind CSS 4
Game        Phaser 4
Runtime     Node.js 22
```

## 구조 — React와 Phaser의 경계

성격이 다른 두 렌더링 시스템을 한 화면에서 씁니다.

```text
React    가끔 바뀌는 화면을 DOM으로 그린다   모달 · 결혼식 정보 · 대화창
Phaser   매 프레임 바뀌는 화면을 Canvas에    맵 · 캐릭터 · 이동 · 카메라
```

둘은 서로를 모릅니다. 게임은 **id만 던지고**, 무엇을 어떻게 보여줄지는 React가 정합니다.

```text
WorldScene.interactWith()
      ↓  game.events.emit(OPEN_MEMORY, "memory-jeju")
GameCanvas (React)
      ↓  findMemory(id) → setState
MemoryModal (DOM)
```

접점은 `components/game/GameCanvas.tsx` 파일 하나뿐입니다.

## 폴더 구조

```text
app/              라우팅 · 메타데이터 · OG 이미지 생성
components/       React UI
  game/           ← React와 Phaser의 유일한 접점
game/             Phaser
  scenes/         화면 단위 (Boot, World)
  objects/        길잡이 고양이, 나비
  maps/           맵 데이터 · 오브젝트 배치 · A* 길찾기
  textures/       코드로 그리는 임시 그래픽
data/             내용. 실제 청첩장은 여기만 바꾸면 됨
docs/             기획 · 진행상황 · 개념 정리
```

---

## 구현하면서 신경 쓴 것

**번들 크기** — Phaser는 압축해도 1.3MB입니다. 모바일 청첩장에서 가볍지 않아
시작 화면에서 [입장하기]를 눌러야 로드되도록 분리했습니다.

```text
첫 화면      173 KB (gzip)
게임 진입 후  352 KB (gzip)
```

**카카오톡 공유 미리보기** — 청첩장은 링크로 전달되므로 미리보기 카드가 첫인상입니다.
크롤러는 자바스크립트를 실행하지 않으니 서버가 만든 HTML에 메타 태그가 있어야 합니다.
`next/og`로 미리보기 이미지를 코드로 생성해, 데이터 파일만 고치면 이미지도 함께 바뀝니다.

**데이터 검증 자동화** — 맵을 눈으로 만들었더니 울타리로 막힌 칸이 8개 있었습니다.
BFS 도달성 검사 스크립트로 찾아냈습니다.

**그래픽 의존성 제거** — 그림을 기다리면 개발이 멈추므로,
임시 그래픽을 코드로 그리고 교체 지점을 파일 두 개로 좁혔습니다.

---

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000

```bash
npx tsc --noEmit   # 타입 검사
npm run lint
npm run build
```

## 문서

```text
docs/STATUS.md      현재 상태와 다음 작업
docs/BLUEPRINT.md   기획 · 아키텍처 · 로드맵
docs/BACKLOG.md     미룬 것과 그 이유
docs/notes/         개념 정리
```

미룬 항목마다 **왜 미뤘고 언제 다시 볼지**를 함께 적어두었습니다.

---

## 현재 상태

기능 골격은 완성됐습니다. 그래픽은 아직 **코드로 그린 임시 그림**이고,
내용은 예시 데이터입니다.

```text
✓ 맵 · 이동 · 충돌 · 카메라 · 길찾기
✓ 추억 · NPC 대화 · 결혼식 정보 · 계좌 · 공유
✓ 카카오톡 미리보기
✓ 모바일 조작
✓ 배포 (Cloudflare Workers)
□ 픽셀 아트 교체
□ 방명록 (서버)
```
