# npm / Git 메모

---

# npm

## npm install vs npm ci

```text
npm install
  package.json을 보고 설치
  버전 범위(^4.2.1) 안에서 최신 버전을 가져올 수 있음
  package.json / package-lock.json을 수정함
  → 새 패키지를 추가할 때 쓴다

npm ci
  package-lock.json만 보고 설치
  기록된 정확한 버전을 그대로 설치
  기존 node_modules를 통째로 지우고 새로 만듦
  package.json을 수정하지 않음
  → 환경을 그대로 복원할 때 쓴다 (ci = Clean Install)
```

## 겪은 사고 — 잘못된 위치에서 install

터미널 위치가 `node_modules/next/dist/docs`인 상태에서 `npm install phaser`를 실행했다.

npm은 현재 위치에 package.json이 없으면 **상위 폴더로 거슬러 올라가며 찾는다.**
그 결과 `node_modules/next/package.json`을 발견해 **next 패키지 안에 phaser를 설치**했다.

```text
node_modules/next/package.json
  dependencies:
    phaser: ^4.2.1              ← 있으면 안 되는 것

node_modules/next/node_modules/phaser/   ← 잘못된 위치
```

**해결** — `node_modules`는 git이 추적하지 않고 lockfile로 완전히 재현 가능하므로 통째로 다시 만들었다.

```powershell
npm ci
npm install phaser
```

**교훈** — npm 명령 전에 현재 위치를 확인한다.

```powershell
pwd
```

## 증상으로 알아채기

`npm install`이 끝났는데 패키지 수가 이상하게 적으면(예: Next.js 프로젝트인데 "audited 25 packages") 엉뚱한 곳에 설치된 것이다. 정상이라면 300개 이상이다.

---

# Git

## 기본 개념

```text
Repository  변경 이력을 관리하는 프로젝트 공간
Commit      프로젝트의 세이브 포인트
Branch      개발 이력이 뻗어나가는 작업 줄기 (현재: main)
Staging     다음 commit에 포함할 변경사항을 준비하는 단계 (git add)
Remote      내 PC가 아닌 외부 repository (현재: origin = GitHub)
Push        Local → GitHub
Pull        GitHub → Local
```

## 기본 사이클

```text
코드 수정 → git status → git add . → git commit -m "..." → git push
```

`git add .`을 습관적으로 쓰기보다 `git status`로 **어떤 파일이 staging되는지 확인**하는 습관을 들인다.

## 이 프로젝트의 커밋 메시지 규칙

```text
YYMMDD_작업내용

예) 260813_PROJECT_SETUP
    260818_PHASER_INTEGRATION
```

## 연결 정보

```text
GitHub 사용자   UBshonen
Repository      pixel-memories (Public)
Remote          origin → https://github.com/UBshonen/pixel-memories.git
Tracking        local main ↔ origin/main  (설정 완료, 이후 git push 만으로 충분)
```

## 커밋 해시는 문서에 적지 않는다

`git log`에 이미 있다. 문서에 적으면 "해시를 적기 위한 커밋"이 또 필요해진다.

```bash
git log --oneline -5
```
