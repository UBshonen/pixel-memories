# 개발 환경 셋팅

> 새 컴퓨터에서 이 프로젝트를 처음 열 때 보는 문서.
> 이미 돌아가고 있다면 [STATUS.md](STATUS.md) 로 간다.

---

# 0. 지금 개발 중인 환경 (2026-08-21 기준)

**다른 컴퓨터에 같은 환경을 만들 때 이 값들을 맞추면 된다.**
버전이 조금 달라도 대체로 동작하지만, **Node 만은 22 이상이어야 한다.**

```text
OS        Windows 11
Node      v22.17.1
npm       10.9.2
Git       2.55.0
셸        PowerShell (Git Bash 도 함께 씀)
에디터     VS Code + Claude Code
```

## Git 설정

```bash
git config --global user.name  "ub"
git config --global user.email "theurain1@gmail.com"
git config --global core.autocrlf true
```

`core.autocrlf true` 는 Windows 에서 흔한 설정이다.
저장소에는 LF 로 저장하고 작업 폴더에는 CRLF 로 꺼내온다.
`npm run` 할 때 나오는 줄바꿈 경고가 이것 때문인데 **문제는 없다.**

## 전역 설치

**따로 없다.** 프로젝트에 필요한 것은 전부 `npm install` 로 들어간다.

```text
전역으로 깔 필요 없는 것들
  next, phaser, typescript, eslint  →  전부 프로젝트 의존성
```

`npx` 가 프로젝트 안의 것을 찾아 쓰므로 `npx tsc`, `npx next` 로 실행하면 된다.

---

# 1. 필요한 것

```text
Node.js   22 이상   ← Next.js 16 이 요구한다. 아래 버전이면 빌드가 실패한다
Git
에디터     VS Code 권장 (필수는 아님)
```

버전 요구사항은 `package.json` 의 `engines` 와 `.nvmrc` 에도 적어뒀다.
버전이 낮으면 `npm install` 이 경고를 띄운다.

## 설치 확인

```bash
node --version    # v22.x 이상이어야 한다
npm --version
git --version
```

## Node 설치

기존에 다른 버전이 깔려 있고 프로젝트마다 버전이 다르다면
**버전 관리 도구**를 쓰는 편이 낫다.

```text
Windows   nvm-windows  또는  https://nodejs.org 에서 LTS 설치
macOS     nvm, fnm, 또는 brew install node@22
```

`.nvmrc` 가 있으므로 nvm 을 쓴다면 프로젝트 폴더에서 `nvm use` 만 하면 된다.

---

# 2. 프로젝트 받기

```bash
git clone https://github.com/UBshonen/pixel-memories.git
cd pixel-memories
npm install
```

**`npm` 을 쓴다.** `package-lock.json` 이 기준이다.
yarn 이나 pnpm 을 섞으면 lockfile 이 둘이 되어 버전이 어긋난다.

## install 과 ci

```text
npm install   package.json 기준. 버전 범위 안에서 최신을 가져올 수 있다
              → 새 패키지를 추가할 때

npm ci        lockfile 기준. 기록된 정확한 버전 그대로
              node_modules 를 지우고 새로 만든다
              → 환경이 꼬였을 때 되돌리는 용도
```

**의존성이 이상해지면 `npm ci` 로 통째로 복원하면 된다.**

---

# 3. 실행

```bash
npm run dev        # localhost:3000
```

시작 화면이 뜨고 **[입장하기]** 를 누르면 마을이 나와야 정상이다.

## 확인 명령

```bash
npx tsc --noEmit   # 타입 검사
npm run lint
npm run build      # out/ 폴더가 생기면 정상
```

**화면 확인은 사람이 한다.** 위 셋은 코드가 깨졌는지만 알려준다.

---

# 4. 폰에서 보기

모바일 우선으로 만든 서비스라 **폰에서 봐야 진짜 확인**이다.

같은 와이파이에 있는 폰에서 `http://<PC의 Wi-Fi 주소>:3000` 으로 접속한다.

## 주소 확인

**`npm run dev` 가 출력하는 "Network" 주소를 믿지 말 것.**
WSL 같은 가상 어댑터 주소를 고를 때가 있고, 그 주소는 폰에서 닿지 않는다.

```bash
# Windows
powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi').IPAddress"

# macOS
ipconfig getifaddr en0
```

공유기가 IP 를 다시 배정하므로 **접속이 안 되면 주소부터 다시 확인**한다.

안 되면 [notes/mobile-testing.md](notes/mobile-testing.md) 에 원인별 확인 순서가 있다.

## 폰에서는 안 되는 기능이 있다

`http` 로 접속하기 때문에 **복사와 공유 기능이 제대로 동작하지 않는다.**
브라우저가 https 에서만 허용하는 기능이라 그렇다. 배포하면 정상이 된다.

---

# 5. Windows 에서 겪는 것들

## npm 을 실행하는 위치

`npm install` 은 현재 폴더에 `package.json` 이 없으면 **상위로 거슬러 올라가며 찾는다.**

실제로 `node_modules` 안쪽에서 실행하는 바람에
**next 패키지 내부에 다른 패키지가 설치된 적이 있다.**

```bash
pwd    # 실행 전에 위치 확인. 프로젝트 루트여야 한다
```

꼬였으면 `npm ci` 로 복원한다.

## 줄바꿈 경고

```text
warning: LF will be replaced by CRLF
```

Windows 와 Git 의 줄바꿈 처리 차이 때문에 나온다. **무시해도 된다.**

## PowerShell 에서 여러 줄 문자열

커밋 메시지처럼 여러 줄을 넘길 때 따옴표가 섞이면 파싱이 깨진다.
파일로 넘기는 편이 안전하다.

```bash
git commit -F 메시지파일.txt
```

---

# 6. 에디터 설정 (선택)

VS Code 를 쓴다면 이 확장들이 도움이 된다.

```text
ESLint                        저장할 때 문제를 표시
Tailwind CSS IntelliSense     클래스 이름 자동완성
```

특별한 설정 파일은 없다. 없어도 개발에 지장은 없다.

---

# 7. AI 로 개발할 때

이 프로젝트는 AI 페어 프로그래밍으로 만들고 있다. 알아둘 것이 있다.

## 자동으로 읽히는 문서

```text
CLAUDE.md     세션 시작 시 자동으로 읽힌다. 규약과 판단 기준이 들어 있다
AGENTS.md     next dev 가 스스로 만들고 갱신한다. 지우면 다시 생긴다
```

**AGENTS.md 는 손대지 않는다.** 수정해도 `next dev` 가 되돌린다.

## 버전 함정 — 가장 자주 깨지는 지점

```text
Phaser 4      인터넷 예제와 학습 데이터 대부분이 3.x 다. 그대로 쓰면 조용히 안 된다
Next.js 16    App Router 이후 API 가 많이 바뀌었다
```

**기억이 아니라 설치된 것을 확인한다.** 두 패키지 모두 공식 문서를 안에 담고 있다.

```text
node_modules/phaser/skills/      주제별 가이드 28개
node_modules/phaser/docs/        픽셀 아트 · 렌더링 심화
node_modules/next/dist/docs/     Next.js 문서
```

## 검증 습관

AI 가 쓴 것은 **검증할 수 있는 형태로 확인**한다.

```text
코드      tsc / lint / build 로 거른다
데이터    검증 스크립트를 따로 짠다 (맵 도달성 검사로 갈 수 없는 칸 8개를 찾았다)
화면      사람이 직접 본다
```

---

# 8. 자주 겪는 문제

## 빌드가 실패한다

```text
Node 버전을 먼저 확인한다     node --version → 22 이상
그다음 npm ci 로 복원
```

## 화면이 하얗게 뜬다

브라우저 개발자 도구 콘솔을 본다. **오래된 에러 로그에 속지 않도록 시각을 확인**한다.
파일을 여러 개 고치는 중간 상태의 에러가 남아 있을 수 있다.

확실히 하려면 `npm run build` 를 돌려본다. **로컬 빌드가 되면 코드는 멀쩡하다.**

## 폰에서 접속이 안 된다

```text
1. 주소가 진짜 Wi-Fi IP 인가        → §4
2. 화면이 깨져 보이는가             → next.config.ts 의 allowedDevOrigins
3. 연결 자체가 안 되는가            → 공용 와이파이의 기기 간 차단. 핫스팟을 쓴다
```

자세한 것은 [notes/mobile-testing.md](notes/mobile-testing.md).

## 의존성이 꼬였다

```bash
npm ci
```

`node_modules` 를 통째로 지우고 lockfile 기준으로 다시 만든다.

---

# 다음

환경이 준비됐으면 [STATUS.md](STATUS.md) 에서 현재 상태와 다음 작업을 본다.
배포한다면 [DEPLOY.md](DEPLOY.md).
