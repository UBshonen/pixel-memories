@AGENTS.md

# Pixel Memories

추억을 탐험하는 픽셀 RPG형 모바일 청첩장. Mobile Web First.

## 이 서비스가 지켜야 할 네 가지

```text
신기함   "청첩장을 이렇게도 만드는구나"  — 첫인상. 이게 없으면 그냥 청첩장이다
귀여움   따라다니는 동물, 픽셀 캐릭터    — 계속 보게 만드는 힘
편의성   어르신이 학습 없이 쓸 수 있는가  — 배워야 하면 실패다
전달성   날짜·장소·계좌가 확실히 닿는가   — 청첩장의 본래 목적
```

**기능을 더하거나 뺄 때 이 네 가지로 판단한다.** 자세한 내용은
[docs/BLUEPRINT.md](docs/BLUEPRINT.md) §4.

특히 **편의성과 전달성은 어르신 기준**이다. 픽셀 게임 문법에 익숙한 사람에게
자연스러운 것이 어르신에게는 피로가 된다. "눌러야 한다는 걸 알아내야 하는" 장치는
줄이고, "가만히 있어도 알려주는" 쪽으로 만든다.

## 문서를 읽는 순서

```text
docs/STATUS.md      ← 항상 이것부터. 현재 상태와 다음 작업.
docs/BACKLOG.md     미룬 것과 그 이유. "이거 왜 안 했지?" 싶을 때.
docs/BLUEPRINT.md   기획·아키텍처. 방향을 다룰 때만.
docs/notes/         개념 정리. 해당 주제를 건드릴 때만.
docs/DEPLOY.md      배포 절차서. 배포할 때만.
docs/INTERVIEW.md   사람이 읽는 면접 대비 메모. AI는 읽지 않아도 된다.
```

**전부 읽지 말 것.** 기본은 STATUS.md 하나다.

무언가를 미루기로 했다면 STATUS가 아니라 BACKLOG에 **이유와 함께** 적는다.

## 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · **Phaser 4**

- Next.js: 학습 데이터와 다를 수 있다. `node_modules/next/dist/docs/` 를 볼 것.
- Phaser: **4.x다. 인터넷 예제 대부분은 3.x라 그대로 쓰면 안 된다.**
  `docs/notes/phaser4.md` 를 먼저 보고, 부족하면 `node_modules/phaser/skills/`.

## 역할 분담

```text
Phaser  맵 / 캐릭터 / 이동 / 충돌 / 카메라 / 오브젝트
React   모달 / 결혼식 정보 / 방명록 / 폼
접점    components/game/GameCanvas.tsx  (여기 하나뿐)
```

## 명령

```powershell
npm run dev        # localhost:3000
npx tsc --noEmit   # 타입 검사
npm run lint
```

명령 실행 전 `pwd`로 위치를 확인한다. (과거에 엉뚱한 곳에서 `npm install`을 한 적 있음)

## 작업 방식

사용자는 개발 경험은 있으나 **React / Next.js / Phaser / Git은 처음**이다.
새 개념이 나오면 코드를 던지기 전에 무엇인지·왜 필요한지 설명한다.
단, 모든 내부 구현을 파고들지는 않는다.

**의미 있는 덩어리 단위로 작업한다.** PHASE 하나마다 문서 갱신·커밋을 반복하면
의식이 작업보다 커진다. 눈에 보이는 결과가 나오는 단위로 묶는다.

화면 확인은 사용자가 직접 한다. AI는 `tsc` / `lint` / `build` 까지 책임진다.

## 같은 내용을 여러 곳에 쓰지 않는다

```text
"이 줄이 왜 이런가"   → 코드 주석
"지금 어디까지 왔나"  → docs/STATUS.md
"개념이 무엇인가"     → docs/notes/
"무슨 일이 있었나"    → git log     (문서에 커밋 해시를 적지 않는다)
```

## 커밋

```text
YYMMDD_작업내용     예) 260818_PHASER_INTEGRATION
```
