# PIXEL MEMORIES — MASTER DOCUMENT

> **문서 목적**
>
> 이 문서는 Pixel Memories 프로젝트의 **기획·설계·개발 방향을 유지하기 위한 기준 문서이자 개발 인수인계 문서**다.
>
> 문서는 크게 두 부분으로 나눈다.
>
> **PART A — PROJECT BLUEPRINT**
> - 프로젝트의 정체성
> - 기획
> - 기능
> - 구조
> - 기술 방향
> - MVP 로드맵
>
> **PART B — DEVELOPMENT HANDOFF**
> - 현재 실제 구현 상태
> - 개발환경
> - 최근 작업
> - 다음 작업
> - 주의사항
>
> 개발을 이어갈 때 **PART A는 큰 방향이 변경되지 않는 한 유지**하고,  
> **PART B만 현재 개발 상태에 맞게 지속적으로 갱신한다.**

---

# PART A. PROJECT BLUEPRINT

# 1. 프로젝트 개요

## 프로젝트명

**Pixel Memories**

## 한 줄 정의

> **추억을 탐험하는 픽셀 RPG형 모바일 청첩장**

기존 모바일 청첩장처럼 사진과 텍스트를 위에서 아래로 읽는 것이 아니라, 하객이 작은 픽셀 공간을 직접 돌아다니며 신랑·신부의 추억과 결혼식 정보를 발견하는 서비스다.

---

# 2. 프로젝트가 해결하려는 문제

현재 모바일 청첩장은 대부분 비슷한 구조를 가진다.

```text
메인 사진
↓
인사말
↓
신랑 / 신부 소개
↓
사진
↓
예식 정보
↓
지도
↓
계좌번호
```

디자인은 달라도 사용자 경험은 대부분 **스크롤해서 정보를 읽는 것**에 머문다.

Pixel Memories는 이를:

```text
읽는 청첩장

→

탐험하는 청첩장
```

으로 바꾸는 것을 목표로 한다.

---

# 3. 핵심 경험

하객은 청첩장을 단순히 읽는 것이 아니라 **작은 추억의 공간에 초대된다.**

예:

```text
              [결혼식장]
                   │
        [사진관] ─ 광장 ─ [카페]
                   │
              [추억의 집]
                   │
                [정원]
```

하객 캐릭터가 공간을 돌아다닌다.

각 장소에는 신랑·신부의 기억이 배치된다.

예:

```text
사진 액자
→ 실제 사진 보기

NPC
→ 해당 시기의 이야기

게시판
→ 방명록

앨범
→ 사진 모음

결혼식장
→ 날짜 / 시간 / 장소

버스 정류장
→ 오시는 길

우체통
→ 축하 메시지
```

따라서 핵심 경험은:

> **이동 → 발견 → 상호작용 → 추억 확인**

이다.

---

# 4. 핵심 디자인 원칙

## 4.1 게임이 아니라 경험형 웹이다

Pixel Memories는 본격적인 RPG를 만드는 프로젝트가 아니다.

게임 요소는 **콘텐츠를 탐색하기 위한 인터페이스**다.

따라서 복잡한:

- 전투
- 레벨
- 아이템 파밍
- 퀘스트 시스템

등은 핵심 범위가 아니다.

핵심은:

```text
걷는다
↓
발견한다
↓
누른다
↓
추억을 본다
```

이다.

---

## 4.2 모바일 우선

최종 사용자인 하객은 대부분 카카오톡 등의 링크를 통해 스마트폰으로 접속할 가능성이 높다.

따라서:

> **Mobile Web First**

를 기본 원칙으로 한다.

앱 설치를 요구하지 않는다.

```text
카카오톡 링크
↓
브라우저
↓
Pixel Memories 입장
```

이 이상적인 흐름이다.

---

## 4.3 진입 장벽은 매우 낮아야 한다

게임에 익숙하지 않은 사용자도 사용할 수 있어야 한다.

따라서 복잡한 조작법을 요구하지 않는다.

예:

```text
화면 터치
→ 캐릭터 해당 위치로 이동

또는

가상 조이스틱
→ 캐릭터 이동
```

최종 조작 방식은 모바일 UX 테스트 후 결정한다.

---

# 5. 사용자 유형

크게 두 종류의 사용자가 존재한다.

## 5.1 제작자

주로:

```text
신랑
신부
```

이다.

제작자는 자신의 Pixel Memories 공간을 만든다.

향후 서비스화할 경우 제작 과정은 가능한 한 쉽게 만들어야 한다.

예:

```text
테마 선택
↓
신랑 / 신부 정보 입력
↓
결혼식 정보 입력
↓
사진 업로드
↓
사진별 설명 작성
↓
배치할 장소 선택
↓
미리보기
↓
청첩장 링크 생성
```

---

## 5.2 방문자

주로:

```text
하객
친구
가족
지인
```

이다.

별도 회원가입 없이 링크로 접근하는 것을 기본 방향으로 한다.

```text
청첩장 링크
↓
공간 입장
↓
캐릭터 탐험
↓
추억 발견
↓
결혼식 정보 확인
↓
방명록 / 사진 남기기
```

---

# 6. 방문자 시나리오 예시

카카오톡으로 링크를 받는다.

```text
"저희 결혼합니다 💍"
[Pixel Memories 입장하기]
```

링크를 누르면 시작 화면이 나타난다.

```text
┌────────────────────────┐
│                        │
│     MINA ♥ JUNHO       │
│                        │
│   우리의 추억 마을에    │
│     초대합니다.         │
│                        │
│       [입장하기]        │
│                        │
└────────────────────────┘
```

입장하면 픽셀 공간이 나타난다.

캐릭터를 움직여 사진 액자로 이동한다.

```text
캐릭터
  ↓
[사진 액자]
```

상호작용하면 React UI가 열린다.

```text
┌─────────────────────────┐
│                         │
│        실제 사진         │
│                         │
│   "처음 제주 여행을      │
│    갔던 날"             │
│                         │
│        2022.05           │
│                         │
└─────────────────────────┘
```

다시 맵으로 돌아가 다른 추억을 탐험한다.

---

# 7. 주요 콘텐츠 유형

Pixel Memories의 공간에는 다양한 인터랙션 오브젝트가 존재할 수 있다.

## 사진

```text
액자
앨범
사진관
폴라로이드
```

상호작용하면 실제 사진과 설명을 보여준다.

---

## NPC

특정 시기의 신랑·신부 또는 주변 인물을 표현할 수 있다.

NPC와 상호작용하면 말풍선이나 스토리가 나온다.

---

## 게시판

방명록 또는 축하 메시지 기능.

---

## 결혼식장

다음 정보를 제공한다.

```text
날짜
시간
장소
연락처
```

---

## 교통 오브젝트

예:

```text
버스 정류장
자동차
표지판
```

상호작용하면:

```text
지도
주소
대중교통
주차정보
```

등을 보여준다.

---

# 8. 실사진과 픽셀 그래픽 문제

Pixel Memories에서 중요한 디자인 이슈 중 하나다.

픽셀 공간은 감성적이지만 실제 사진을 그대로 표시하면:

```text
Pixel World
+
Real Photo
```

사이에 시각적인 이질감이 발생할 수 있다.

따라서 다음 방법을 검토한다.

## 방법 A — 픽셀 프레임

실사진 자체는 유지하되 픽셀 UI 프레임 안에서 표시.

## 방법 B — 사진 필터

색감이나 질감을 공간 테마와 맞춘다.

## 방법 C — 도트 변환

선택적으로 사진을 픽셀 아트 스타일로 변환한다.

단, 원본 사진도 볼 수 있도록 한다.

## 현재 우선 방향

MVP에서는:

> **원본 사진 + 픽셀 스타일 프레임**

부터 테스트한다.

AI 도트 변환 등은 후순위 기능으로 둔다.

---

# 9. 애니메이션

Pixel Memories의 감성을 결정하는 중요한 요소다.

정적인 화면만 존재하면 단순한 픽셀 테마 웹페이지처럼 느껴질 수 있다.

따라서 최소한:

```text
캐릭터 걷기
NPC idle animation
나무 흔들림
물결
불빛
간단한 파티클
```

등의 애니메이션을 활용한다.

다만 MVP에서는 가장 먼저:

> **플레이어 이동 애니메이션**

부터 구현한다.

---

# 10. MVP 정의

MVP의 목적은:

> **이 컨셉이 실제 모바일 웹에서 재미있는가?**

를 검증하는 것이다.

처음부터 청첩장 제작 플랫폼 전체를 만들지 않는다.

---

## MVP 1 — 탐험 가능 여부

목표:

> 브라우저에서 작은 픽셀 공간을 돌아다닐 수 있다.

필수:

```text
맵 표시
플레이어 표시
캐릭터 이동
카메라
모바일 대응
```

---

## MVP 2 — 추억 탐색

목표:

> 공간을 돌아다니면서 실제 추억을 볼 수 있다.

추가:

```text
상호작용 오브젝트
사진 모달
사진 설명
NPC 대화
```

---

## MVP 3 — 청첩장 기능

추가:

```text
신랑 / 신부 소개
예식 날짜
예식 장소
지도
연락처
```

이 단계가 되면:

> **실제로 사용할 수 있는 RPG형 모바일 청첩장**

이 된다.

---

## MVP 4 — 참여 기능

추가:

```text
방명록
축하 메시지
하객 사진 업로드
```

---

# 11. MVP 이후 확장 아이디어

청첩장을 첫 번째 사용 사례로 삼되 구조적으로는 더 확장할 수 있다.

```text
Pixel Memories
      │
      ├─ Wedding
      │
      ├─ Couple Memory
      │
      ├─ Birthday
      │
      ├─ Travel Memory
      │
      └─ Personal Minihome
```

장기적으로는:

> **나만의 2D 추억 공간**

이라는 방향으로 확장 가능하다.

과거 미니홈피의 감성과 공간형 인터페이스를 결합한 형태도 고려한다.

단, 현재 개발에서는 이 확장을 구현하지 않는다.

---

# 12. 전체 시스템 구조 초안

현재 생각하는 대략적인 구조는 다음과 같다.

```text
                        ┌─────────────────────┐
                        │       Browser       │
                        │    Mobile / Web     │
                        └──────────┬──────────┘
                                   │
                          Next.js Application
                                   │
                ┌──────────────────┴──────────────────┐
                │                                     │
           React UI Layer                       Phaser Game
                │                                     │
       ┌────────┼────────┐                  ┌─────────┼─────────┐
       │        │        │                  │         │         │
     Modal   Wedding   Guestbook           Map      Player   Objects
       │      Info       UI                 │         │         │
       │                                      NPC / Interaction
       │
       └──────────────────┬───────────────────────────┘
                          │
                       Data Layer
                          │
              ┌───────────┼───────────┐
              │           │           │
            Memory      Wedding    Guestbook
              │
                          │
                    Backend / API
                   (MVP 진행 후 결정)
                          │
                       Database
```

현재 핵심 분리는:

```text
Next.js / React
=
웹 UI와 서비스 화면

Phaser
=
픽셀 공간과 캐릭터 상호작용
```

이다.

---

# 13. React와 Phaser의 역할

둘의 역할을 명확히 구분한다.

## Phaser

게임 공간 담당.

```text
맵
캐릭터
이동
충돌
NPC
오브젝트
카메라
애니메이션
```

## React / Next.js

일반 웹 UI 담당.

```text
사진 모달
결혼식 정보
방명록
설정
제작 화면
로그인
폼
```

예:

```text
Phaser

캐릭터가 액자에 접근
        ↓
상호작용 발생
        ↓
React에게 이벤트 전달
        ↓
React

사진 모달 표시
```

모든 UI를 Phaser 안에서 구현하지 않는다.

---

# 14. 프론트엔드 구조 초안

향후 실제 구현 과정에서 변경될 수 있다.

```text
src 또는 프로젝트 루트
│
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  └─ ...
│
├─ components/
│  ├─ game/
│  │  └─ GameCanvas.tsx
│  │
│  ├─ memory/
│  │  └─ MemoryModal.tsx
│  │
│  ├─ wedding/
│  │  └─ WeddingInfo.tsx
│  │
│  └─ guestbook/
│
├─ game/
│  ├─ config/
│  ├─ scenes/
│  ├─ objects/
│  ├─ player/
│  └─ maps/
│
├─ data/
│
├─ types/
│
└─ public/
   ├─ sprites/
   ├─ maps/
   ├─ images/
   └─ audio/
```

아직 이 구조를 실제로 만들지는 않았다.

필요해지는 시점에 점진적으로 만든다.

---

# 15. Phaser 내부 구조 예상

초기에는 복잡하게 나누지 않는다.

첫 구조는:

```text
Phaser Game
│
├─ BootScene
│
└─ MainScene
    │
    ├─ Map
    ├─ Player
    ├─ Camera
    └─ Interaction
```

정도로 시작한다.

프로젝트가 커지면:

```text
BootScene
PreloadScene
WorldScene
WeddingScene
```

등으로 분리할 수 있다.

---

# 16. 데이터 모델 초안

아직 DB를 만들지 않는다.

다만 어떤 데이터가 필요한지는 미리 생각한다.

## Wedding

```text
Wedding
- id
- coupleName
- weddingDate
- venue
- address
- latitude
- longitude
```

## Memory

```text
Memory
- id
- title
- description
- imageUrl
- date
- objectId
- position
```

## Map Object

```text
MapObject
- id
- type
- x
- y
- interactionType
- targetId
```

예:

```text
액자 #3
↓
interactionType = MEMORY
targetId = memory_003
```

## Guestbook

```text
Guestbook
- id
- author
- message
- createdAt
```

실제 구현 시 요구사항에 맞게 수정한다.

---

# 17. 기술 스택

## 현재 확정

```text
Next.js
React
TypeScript
Tailwind CSS
Git
GitHub
```

Phaser 4 (2026-08-18 도입 완료)

## 다음 도입 예정

```text
Tiled (맵 에디터) — PHASE 3에서 검토
```

## 향후 검토

```text
Backend
Database
Image Storage
Authentication
Deployment
```

Spring Boot 사용 가능성은 있으나 현재 확정하지 않는다.

MVP에서 실제로 필요한 시점에 결정한다.

---

# 18. 개발 원칙

## 원칙 1 — 작동하는 작은 결과부터 만든다

처음부터:

```text
회원가입
관리자
DB
방명록
업로드
게임
청첩장
```

전부 만들지 않는다.

가장 먼저:

> **캐릭터 하나가 움직이는 웹페이지**

를 만든다.

---

## 원칙 2 — 기능 단위로 완성한다

예:

```text
Canvas 표시
↓
commit

Player 표시
↓
commit

Player 이동
↓
commit

Map 표시
↓
commit

Interaction
↓
commit
```

---

## 원칙 3 — AI가 코딩하더라도 구조를 이해한다

사용자는 React / Next.js / Phaser / Git을 처음 사용한다.

따라서 AI가 코드를 작성하더라도 최소한 다음은 이해하면서 진행한다.

```text
이 파일은 왜 존재하는가?

브라우저에서 무엇이 실행되는가?

Next.js는 무엇을 담당하는가?

React는 무엇을 담당하는가?

Phaser는 무엇을 담당하는가?

npm 명령은 무엇을 실행하는가?

Git은 지금 무엇을 기록하는가?
```

---

## 원칙 4 — 과도한 선행학습을 하지 않는다

React 전체 강의를 끝내고 개발을 시작하는 방식이 아니다.

```text
필요한 기능 등장
↓
관련 개념 학습
↓
직접 구현
↓
다음 기능
```

방식으로 진행한다.

---

# 19. 개발 로드맵

현재 예상 순서:

```text
PHASE 0
프로젝트 환경 구축
✓ Next.js
✓ Git
✓ GitHub

        ↓

PHASE 1
Phaser 연결

        ↓

PHASE 2
Canvas 표시

        ↓

PHASE 3
Map

        ↓

PHASE 4
Player

        ↓

PHASE 5
Movement

        ↓

PHASE 6
Camera

        ↓

PHASE 7
Object Interaction

        ↓

PHASE 8
Memory Modal

        ↓

PHASE 9
Wedding Information

        ↓

PHASE 10
Mobile UX

        ↓

FIRST PLAYABLE MVP
```

이후:

```text
Guestbook
Photo Upload
Creator
Backend
DB
Deployment
```

등으로 확장한다.

---

# PART B. DEVELOPMENT HANDOFF

> **이 부분은 개발 진행에 따라 계속 갱신한다.**
>
> 새 채팅으로 이동하거나 다른 AI/개발 환경에서 이어갈 경우 이 섹션을 가장 먼저 확인한다.

---

# 20. 현재 개발 상태

## 기준일

**2026-08-18**

## 현재 단계

```text
PHASE 0 — 프로젝트 환경 구축     완료
PHASE 1 — Phaser 도입           완료
PHASE 2 — Canvas 표시           완료

다음:
PHASE 3 — Map
```

브라우저에서 Phaser Canvas가 실제로 렌더링되는 것까지 확인했다.

아직 맵·플레이어·이동은 없다.

---

# 21. 로컬 프로젝트

Windows 환경.

프로젝트 위치:

```text
C:\dev\pixel-memories
```

프로젝트 생성 명령:

```powershell
npx create-next-app@latest pixel-memories
```

생성 성공 확인 완료.

---

# 22. 현재 프로젝트 구성

현재 주요 파일:

```text
pixel-memories/
├─ app/
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx          메타데이터를 Pixel Memories로 변경
│  └─ page.tsx            GameCanvas를 렌더링
│
├─ components/
│  └─ game/
│     └─ GameCanvas.tsx   React ↔ Phaser 연결 지점
│
├─ game/
│  ├─ config/
│  │  └─ gameConfig.ts    Phaser.Game 생성 및 설정
│  └─ scenes/
│     └─ BootScene.ts     첫 Scene (격자 + 타이틀)
│
├─ blueprint/
│  └─ PIXEL_MEMORIES_MASTER.md
│
├─ .claude/
│  └─ launch.json         개발 서버 실행 설정
│
├─ public/
├─ node_modules/
├─ .next/
├─ .git/
├─ .gitignore
├─ AGENTS.md
├─ CLAUDE.md
├─ README.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ package-lock.json
├─ postcss.config.mjs
└─ tsconfig.json
```

`data/`, `types/` 는 아직 필요하지 않아 만들지 않았다.

---

# 23. Next.js 실행 상태

실행:

```powershell
npm run dev
```

정상 동작 확인 완료.

브라우저:

```text
http://localhost:3000
```

Next.js 기본 화면 표시 확인 완료.

## 참고

`npm run dev`는 로컬 Next.js 개발 서버를 실행한다.

터미널에서:

```text
Ctrl + C
```

를 누르면 서버가 종료된다.

---

# 24. Git 상태

Git 초기화 완료.

```powershell
git init
```

기본 브랜치는:

```text
main
```

으로 변경했다.

사용 명령:

```powershell
git branch -M main
```

---

# 25. 최초 Commit

Staging:

```powershell
git add .
```

최초 commit:

```powershell
git commit -m "260813_PROJECT_SETUP"
```

결과:

```text
[main (root-commit) de96b45] 260813_PROJECT_SETUP
```

최초 commit ID 앞부분:

```text
de96b45
```

현재 프로젝트의 최초 세이브 포인트다.

---

# 26. GitHub

GitHub 사용자명:

```text
UBshonen
```

Repository:

```text
pixel-memories
```

공개 범위:

```text
Public
```

GitHub Repository 생성 완료.

---

# 27. Remote 설정

등록된 remote:

```text
origin
```

연결 대상:

```text
UBshonen/pixel-memories
```

등록 명령:

```powershell
git remote add origin https://github.com/UBshonen/pixel-memories.git
```

확인:

```powershell
git remote -v
```

정상 연결 확인 완료.

---

# 28. 최초 Push

실행:

```powershell
git push -u origin main
```

정상 성공.

결과:

```text
[new branch] main -> main
branch 'main' set up to track 'origin/main'.
```

따라서 현재:

```text
Local main
     ↕
origin/main
```

추적 관계가 설정되어 있다.

앞으로 일반적인 push는:

```powershell
git push
```

만 사용하면 된다.

---

# 29. 현재 Git 개념 학습 상태

현재까지 이해한 개념:

## Repository

Git이 변경 이력을 관리하는 프로젝트 공간.

## Commit

프로젝트의 세이브 포인트.

## Branch

개발 이력이 뻗어나가는 작업 줄기.

현재 기본 브랜치:

```text
main
```

## Staging

다음 commit에 포함할 변경사항을 준비하는 단계.

```text
git add
```

사용.

## Remote

내 PC가 아닌 외부 Git repository.

현재:

```text
origin = GitHub pixel-memories
```

## Push

```text
Local → GitHub
```

## Pull

```text
GitHub → Local
```

---

# 30. 앞으로 사용할 기본 Git 사이클

개발 중 기본적으로:

```text
코드 수정
   ↓
git status
   ↓
git add .
   ↓
git commit -m "변경내용"
   ↓
git push
```

를 반복한다.

단, 무조건 `git add .`을 사용하기보다는 Git에 익숙해지면서 어떤 파일을 staging하는지도 확인하는 습관을 만든다.

---

# 31. 현재 완료 목록

- [x] Pixel Memories 기본 컨셉 수립
- [x] 모바일 웹 방향 결정
- [x] Next.js 선택
- [x] React 프로젝트 생성
- [x] TypeScript 환경 생성
- [x] Tailwind CSS 환경 생성
- [x] Next.js 개발 서버 실행
- [x] localhost 접속 확인
- [x] Git 설치 및 동작 확인
- [x] Git repository 초기화
- [x] Git 기본 개념 학습
- [x] main branch 설정
- [x] 최초 staging
- [x] Git 사용자 정보 설정
- [x] 최초 commit
- [x] GitHub repository 생성
- [x] remote origin 연결
- [x] GitHub 인증
- [x] 최초 push
- [x] local main ↔ origin/main tracking 설정
- [x] Phaser 설치 (v4.2.1)
- [x] Next.js + Phaser 연결 (GameCanvas)
- [x] Phaser Canvas 표시
- [ ] Map 구현
- [ ] Player 구현
- [ ] Player Movement 구현
- [ ] Camera 구현
- [ ] Object Interaction 구현

---

# 32. 바로 다음 작업

다음 작업은:

> **PHASE 3 — 맵을 표시한다.**

진행 순서:

```text
1. 타일맵 개념 (타일 / 타일셋 / 레이어)
2. 타일 이미지 준비 방법 결정
   - 직접 제작
   - 무료 에셋 사용
   - Tiled 에디터 도입 여부
3. public/ 에 에셋 배치
4. Scene.preload() 로 이미지 로딩
5. 작은 맵 하나 화면에 표시
6. commit / push
```

기술적 목표:

> **BootScene의 격자 대신, 실제 타일 이미지로 만든 작은 공간이 보이는 것**

이다.

맵이 보이면 그 위에 PHASE 4의 Player를 올린다.

## 결정이 필요한 사항

맵 제작 방식을 아직 정하지 않았다.

```text
방법 A — 코드로 타일 배열 직접 작성
         장점: 도구 학습 불필요, 바로 시작 가능
         단점: 맵이 커지면 관리 어려움

방법 B — Tiled 에디터로 맵을 만들고 JSON 내보내기
         장점: 실제 게임 개발 표준 방식, 확장에 유리
         단점: 새 도구 학습 필요
```

MVP 규모가 작으므로 **방법 A로 시작해 원리를 이해한 뒤**, 맵이 커지면 방법 B로 넘어가는 순서를 권장한다.

---

# 33. 다음 작업에서 설명해야 할 핵심 개념

## 이미 설명 완료 (PHASE 1–2)

```text
Browser
   │
Next.js
   │
React Component
   │
GameCanvas
   │
Phaser.Game
   │
Scene
   │
Canvas
```

- React가 있는데 왜 Phaser가 필요한가
- Phaser가 Canvas를 만든다는 것의 의미
- React Component 안에서 Phaser를 실행하는 방법
- 서버 렌더링과 `window` 문제

## 다음에 설명할 개념 (PHASE 3)

```text
타일 / 타일셋 / 타일맵
Scene.preload() 와 에셋 로딩
텍스처와 키(key)
게임 내부 좌표계와 화면 좌표계의 차이
```

---

# 34. AI 작업 지침

이 프로젝트를 이어받은 AI는 다음 원칙을 지킨다.

사용자는 기존 개발 경험은 있지만:

```text
React
Next.js
Phaser
Git
```

은 처음 사용한다.

따라서 명령어 또는 코드를 바로 던지는 방식으로 진행하지 않는다.

새 개념이 등장하면:

```text
① 무엇인가
② 왜 필요한가
③ 기존 기술과 비교하면 무엇인가
④ Pixel Memories에서 무슨 역할인가
⑤ 실제 구현
```

순서로 설명한다.

예를 들어:

```powershell
npm install phaser
```

를 제시하기 전에 최소한:

```text
npm이 무엇을 하는지
package.json과 어떤 관계인지
node_modules에는 무엇이 들어가는지
phaser 패키지를 설치한다는 것이 실제로 무슨 의미인지
```

를 필요한 수준에서 설명한다.

단, 모든 내부 구현을 과도하게 파고들지는 않는다.

목표는:

> **AI 없이 모든 코드를 작성하는 것**

이 아니라:

> **AI가 작성한 코드라도 사용자가 전체 구조와 실행 원리를 이해하는 것**

이다.

---

# 35. 문서 유지 규칙

이 문서는 프로젝트가 끝날 때까지 유지한다.

## PART A 수정 시점

다음과 같은 경우에만 수정한다.

```text
프로젝트 방향 변경
핵심 기능 변경
아키텍처 변경
기술 스택 변경
MVP 범위 변경
```

즉 PART A는 **프로젝트의 기준점**이다.

## PART B 수정 시점

개발 세션이 끝날 때마다 갱신한다.

특히:

```text
현재 구현 상태
마지막 commit
현재 branch
새로 추가된 파일
새로 배운 개념
해결하지 못한 문제
다음 작업
```

을 업데이트한다.

---

# 36. 새 채팅 시작 방법

새 채팅에 이 문서를 제공한 후 다음과 같이 시작하면 된다.

> **Pixel Memories 개발 이어서 하자. MASTER 문서 기준으로 현재 DEVELOPMENT HANDOFF부터 확인하고, 다음 작업부터 진행하자. 새로운 기술이나 명령어가 나오면 원리를 설명하면서 한 단계씩 진행해줘.**

그러면 현재 기준 다음 작업은:

> **PHASE 3 — Map**

부터 시작한다.

---

# 37. PHASE 1–2 작업 내용 (2026-08-18)

## 설치한 것

```powershell
npm install phaser
```

설치된 버전:

```text
phaser 4.2.1
```

## 중요 — Phaser 4다

인터넷의 Phaser 예제 대부분은 **Phaser 3** 기준이다.

Phaser 4는 렌더러가 새로 작성된 메이저 버전이라 일부 API가 다르다.

주요 변경점:

```text
Pipeline        → RenderNode
FX / Mask       → Filter 로 통합
setTintFill()   → setTint() + setTintMode()
Geom.Point      → Math.Vector2
Math.PI2        → Math.TAU
Mesh / Plane    → 제거됨
Canvas 렌더러   → deprecated (WebGL 권장)
기본 해상도     → 1024 x 768 (v3는 800 x 600)
```

**참고 자료는 검색보다 설치된 패키지를 먼저 볼 것.**

Phaser 4는 패키지 안에 공식 문서를 포함하고 있다.

```text
node_modules/phaser/skills/     주제별 가이드 28개
node_modules/phaser/docs/       픽셀 아트 / 렌더링 심화 가이드
node_modules/phaser/types/      TypeScript 타입 정의
```

특히 다음 문서가 이 프로젝트에 직접 관련된다.

```text
skills/game-setup-and-config/   게임 설정
skills/scenes/                  Scene 생명주기
skills/scale-and-responsive/    모바일 대응
skills/tilemaps/                PHASE 3에서 사용
skills/sprites-and-images/      PHASE 4에서 사용
skills/input-keyboard-mouse-touch/  PHASE 5에서 사용
skills/cameras/                 PHASE 6에서 사용
docs/Phaser 4 Pixel Art Guide/  픽셀 아트 렌더링
```

## 만든 파일 3개

### game/config/gameConfig.ts

Phaser.Game 인스턴스를 만드는 함수.

설정 내용:

```text
type          Phaser.AUTO      WebGL 우선, 실패 시 Canvas
width/height  360 x 640        세로형 모바일 기준 해상도
pixelArt      true             확대해도 픽셀이 뭉개지지 않음
scale.mode    FIT              비율 유지하며 부모 크기에 맞춤
autoCenter    CENTER_BOTH      가운데 정렬
scene         [BootScene]      첫 Scene
```

`width/height`는 **화면 크기가 아니라 게임 내부 좌표계의 크기**다.

Phaser는 항상 360 x 640으로 그린 뒤, 그 결과를 화면 크기에 맞게 통째로 확대한다.

따라서 어떤 기기에서든 게임 안의 좌표는 동일하다.

### game/scenes/BootScene.ts

첫 Scene.

Scene은 Phaser의 화면 단위이며 다음 생명주기를 가진다.

```text
init()     초기화 (데이터 전달받음)
preload()  에셋 로딩
create()   게임 오브젝트 배치     ← 현재 여기만 사용
update()   매 프레임 실행         ← PHASE 5에서 사용
```

현재 `create()`에서 그리는 것:

```text
16px 격자
"PIXEL MEMORIES" 타이틀
상태 텍스트
위아래로 움직이는 사각형 (tween)
Phaser 버전 표시
```

움직이는 사각형은 장식이 아니라 **게임 루프가 실제로 돌고 있다는 증거**다.

### components/game/GameCanvas.tsx

React와 Phaser를 잇는 **유일한 지점**.

```tsx
'use client'

useEffect(() => {
  const { createGame } = await import('@/game/config/gameConfig')
  game = createGame(container)

  return () => game?.destroy(true)
}, [])
```

React는 빈 `<div>` 하나만 그리고, 그 안을 Phaser가 `<canvas>`로 채운다.

이 `<div>` 내부는 React가 관리하지 않으므로 React 리렌더링의 영향을 받지 않는다.

---

# 38. 이번 단계의 핵심 개념

## 왜 `'use client'`가 필요한가

Next.js는 기본적으로 **서버에서 먼저 HTML을 만들어 보낸다** (서버 렌더링).

그런데 Phaser는 모듈을 읽는 순간 `window`와 `document`를 참조한다.

서버(Node.js)에는 `window`가 없다.

```text
'use client'
→ "이 컴포넌트는 브라우저에서 실행된다"
```

## 왜 `useEffect` 안에서 동적 import를 하는가

`'use client'`를 붙여도 Next.js는 **초기 HTML을 만들기 위해 서버에서 한 번 실행**한다.

따라서 파일 맨 위에 `import Phaser from 'phaser'`를 쓰면 여전히 서버에서 에러가 난다.

```text
파일 상단 import   → 서버에서도 실행됨   ✗
useEffect 안 import → 브라우저에서만 실행됨 ✓
```

`useEffect`는 브라우저에만 존재하는 개념이므로, 그 안의 `await import()`는 서버에서 절대 실행되지 않는다.

## 왜 cleanup에서 `destroy`가 필요한가

React는 컴포넌트가 사라질 때 `useEffect`의 반환 함수를 실행한다.

여기서 게임을 정리하지 않으면:

```text
페이지 이동
→ React 컴포넌트는 사라짐
→ 그런데 Phaser 게임 루프는 계속 돌아감
→ canvas가 화면에 남고 메모리 누수
```

개발 모드에서는 React가 의도적으로 컴포넌트를 두 번 실행해 이 문제를 노출시킨다.

정리 코드가 없으면 canvas가 2개 생긴다.

## `cancelled` 플래그는 왜 있는가

`await import()`는 시간이 걸린다.

그 사이에 컴포넌트가 사라질 수 있다.

```text
① 컴포넌트 등장 → import 시작
② 사용자가 즉시 페이지 이동 → cleanup 실행
③ import 완료 → 게임 생성 ...하지만 정리해 줄 사람이 없음
```

`cancelled` 플래그로 ③을 막는다.

---

# 39. 이번 세션에서 겪은 문제

## npm install을 잘못된 위치에서 실행

터미널의 현재 위치가 `node_modules/next/dist/docs` 였던 상태에서 `npm install phaser`를 실행했다.

npm은 현재 위치에 package.json이 없으면 **상위 폴더로 거슬러 올라가며 찾는다.**

그 결과 `node_modules/next/package.json`을 찾아, **next 패키지 안에 phaser를 설치**했다.

```text
node_modules/next/package.json
  dependencies:
    phaser: ^4.2.1        ← 있으면 안 되는 것

node_modules/next/node_modules/phaser/   ← 잘못된 위치
```

## 해결

`node_modules`는 git이 추적하지 않으며 package-lock.json으로 완전히 재현 가능하다.

따라서 전체를 지우고 다시 설치했다.

```powershell
npm ci
npm install phaser
```

## `npm install` vs `npm ci`

```text
npm install
  package.json을 보고 설치
  버전 범위(^4.2.1) 안에서 최신 버전을 가져올 수 있음
  package.json / package-lock.json을 수정함

npm ci
  package-lock.json만 보고 설치
  기록된 정확한 버전을 그대로 설치
  기존 node_modules를 통째로 지우고 새로 만듦
  package.json을 수정하지 않음
```

`ci`는 **Clean Install**이다.

새 패키지를 추가할 때는 `install`, 환경을 그대로 복원할 때는 `ci`를 쓴다.

## 교훈

```text
npm 명령을 실행하기 전에 항상 현재 위치를 확인한다.
```

```powershell
pwd
```

## 미확인 사항

브라우저 자동화 환경의 제약으로 다음은 눈으로 직접 확인하지 못했다.

```text
tween 애니메이션이 실제로 위아래로 움직이는 모습
```

다만 다음은 프로그램으로 검증 완료했다.

```text
canvas 생성           360 x 640, image-rendering: pixelated
Phaser 부팅           v4.2.1 (WebGL | Web Audio), 콘솔 에러 없음
게임 루프 동작        약 51 FPS로 프레임 갱신 중
실제 렌더링           배경 외 픽셀 28,540개
                      격자색 / 텍스트색이 화면에 존재
canvas 개수           1개 (정리 코드가 올바르게 동작)
```

다음 세션에서 `npm run dev` 후 육안으로 한 번 확인할 것.

---

# CURRENT CHECKPOINT

```text
PIXEL MEMORIES

PROJECT
├─ Planning            ✓
├─ Architecture Draft  ✓
│
DEVELOPMENT
├─ Next.js Setup       ✓
├─ Local Dev Server    ✓
├─ Git Init            ✓
├─ First Commit        ✓
├─ GitHub Repository   ✓
├─ Remote              ✓
├─ First Push          ✓
├─ Phaser Install      ✓  v4.2.1
├─ GameCanvas          ✓  React ↔ Phaser
├─ BootScene           ✓
├─ Canvas 표시         ✓  360 x 640 / WebGL
│
├─ Map                 ← NEXT
├─ Player
├─ Movement
├─ Camera
├─ Object Interaction
├─ Memory Modal
├─ Wedding Information
└─ Mobile UX
```

**Last known commit**

```text
260818_PHASER_INTEGRATION
```

**Next Objective**

```text
타일 에셋 준비
   ↓
Scene.preload()
   ↓
작은 맵 표시
   ↓
그 위에 Player
```