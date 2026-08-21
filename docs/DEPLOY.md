# 배포 절차서 — Cloudflare Pages

> **혼자 따라 할 수 있게 적었다.** 위에서부터 순서대로 하면 된다.
> 원리가 궁금하면 [INTERVIEW.md](INTERVIEW.md) §11.

**작성일** 2026-08-21 · **상태** 코드 준비 완료, 계정 연결부터 하면 됨

---

# 0. 이미 끝난 것 (건드릴 필요 없음)

```text
[x] 정적 내보내기 설정        next.config.ts 의 output: "export"
[x] OG 라우트 빌드 대응       force-static
[x] 응답 헤더 설정 파일        public/_headers
[x] README 정비
[x] physics.arcade.debug     false
[x] 로컬 빌드 통과 확인
```

빌드하면 `out/` 폴더에 파일만 나온다. 서버에서 도는 코드가 없다.

---

# 1. Cloudflare 가입

https://dash.cloudflare.com/sign-up

이메일과 비밀번호만 받는다. **카드도 전화번호도 안 물어본다.**

> Vercel은 계정 문제로 접었다. 삭제한 계정과 같은 이메일로는 재가입이 막힌다.
> 지원팀 문의는 2~3일 걸린다.

---

# 2. 저장소 연결

**① 왼쪽 메뉴 `Compute (Workers)` → `Pages` 탭 → `Connect to Git`**

**② GitHub 연결 → `pixel-memories` 선택**

권한 범위를 물으면 **`Only select repositories`로 이 저장소만** 고른다.
다른 저장소까지 권한을 줄 이유가 없다.

---

# 3. 빌드 설정 — 여기가 핵심

Cloudflare가 Next.js를 감지하면 **서버 실행용 설정을 제안할 수 있다.**
우리는 정적이라 다르다. 아래 값으로 맞춘다.

```text
Project name         pixel-memories
Framework preset     None   (또는 Next.js Static Export)
Build command        npm run build
Build output         out
```

**`Build output`이 `out`인 것이 가장 중요하다.**
기본값이 `.next` 나 빈칸이면 반드시 바꾼다.

## 환경변수 두 개

`Environment variables` 를 펼치고 추가한다.

```text
NEXT_PUBLIC_SITE_URL   https://pixel-memories.pages.dev
NODE_VERSION           22
```

**`NEXT_PUBLIC_SITE_URL`** — 카카오톡 미리보기 이미지의 절대 경로를 만드는 데 쓰인다.
빌드할 때 코드에 박히므로 **나중에 바꾸려면 다시 빌드해야 한다.**

**`NODE_VERSION`** — 안 넣으면 오래된 Node로 빌드하다 실패할 수 있다.

> **프로젝트 이름이 이미 쓰이고 있으면** `pixel-memories-1` 등을 제안한다.
> 그 경우 `NEXT_PUBLIC_SITE_URL` 도 그 주소로 맞춰야 한다. 안 맞으면
> 카카오톡 미리보기 이미지가 깨진다.

**`Save and Deploy`** — 2~3분 걸린다.

---

# 4. 배포 후 확인

## 브라우저에서

```text
[ ] 주소 접속 → 시작 화면이 뜨는가
[ ] [입장하기] → 마을이 보이는가
[ ] 탭해서 걸어지는가
[ ] 액자 · 주민 · 예식장이 열리는가
```

## 폰에서 (이게 진짜 확인이다)

```text
[ ] 화면이 잘리지 않는가
[ ] 계좌 복사 버튼이 동작하는가      ← https 라 이제 될 것
[ ] 청첩장 공유하기가 동작하는가     ← https 라 이제 공유창이 뜰 것
```

로컬 테스트에서 반쪽만 되던 두 기능이 **여기서 처음 제대로 동작한다.**
클립보드와 공유 API는 https 에서만 허용되기 때문이다.

## 카카오톡 미리보기

**나에게 카톡으로 링크를 보내본다.** 제목·설명·이미지가 있는 카드가 떠야 한다.

안 뜨면 아래 순서로 본다.

```text
1. 주소 뒤에 /opengraph-image 를 붙여 접속 → 이미지가 보이는가
2. 안 보이면 public/_headers 가 배포에 포함됐는지 확인
3. 이미지는 보이는데 카드가 안 뜨면 NEXT_PUBLIC_SITE_URL 오타 확인
```

> 카카오는 미리보기를 캐시한다. 고친 뒤에도 예전 카드가 뜨면
> 주소 뒤에 `?v=2` 같은 것을 붙여 다시 보내본다.

---

# 5. 문제가 생기면

## 빌드 실패

Cloudflare 대시보드에서 빌드 로그를 본다.

```text
Node 버전 관련 에러     NODE_VERSION=22 환경변수 확인
out 폴더가 없다는 에러   Build output 이 out 인지 확인
그 외                   로컬에서 npm run build 가 되는지 먼저 확인
```

**로컬에서 되면 원인은 설정이지 코드가 아니다.**

## 페이지는 뜨는데 이미지가 깨짐

`out/memories/*.svg` 가 배포에 포함됐는지 본다.
주소 뒤에 `/memories/jeju.svg` 를 붙여 직접 접속해보면 바로 안다.

## 배포는 됐는데 옛날 내용

브라우저 캐시다. 시크릿 창으로 열어본다.

---

# 6. 배포가 끝나면 할 것

```text
[ ] README.md 상단 주석을 풀고 데모 링크 채우기
[ ] docs/INTERVIEW.md §12 링크에 배포 주소 채우기
[ ] docs/STATUS.md 갱신
[ ] 폰에서 스크린샷 찍어 README 에 추가
```

스크린샷은 **폰에서 찍는 것이 가장 좋다.** 모바일 우선으로 만든 서비스라
데스크탑 화면보다 실제 모습에 가깝다.

---

# 7. 그다음

배포가 끝나면 남은 큰 덩어리는 셋이다.
자세한 것은 [BLUEPRINT.md](BLUEPRINT.md) §12.

```text
그림       임시 그래픽을 진짜 픽셀 아트로. 9종
           직접 그릴지 Kenney(CC0) 를 쓸지 결정이 먼저
실제 내용   data/ 폴더만 고치면 된다
방명록      서버·DB 가 처음으로 필요해지는 지점
           넣으면 output: "export" 를 지워야 한다
```

**포트폴리오 관점에서는 방명록이 중요하다.**
지금은 전부 프론트엔드라 "서버는 안 해봤나" 소리를 들을 수 있다.
