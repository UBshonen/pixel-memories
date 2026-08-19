# 폰에서 개발 서버 접속하기

> 같은 와이파이에 있는 폰으로 `localhost:3000`을 보는 방법.
> 막히는 지점이 세 군데라 순서대로 확인한다.

---

## 1. Next가 안내하는 "Network" 주소를 믿지 말 것

`npm run dev`는 이런 줄을 출력한다.

```text
- Network:  http://172.31.208.1:3000
```

**이 주소는 틀릴 수 있다.** Next는 루프백이 아닌 네트워크 어댑터 중 하나를 골라
보여줄 뿐인데, 이 PC에는 WSL 가상 어댑터(`172.31.208.1`)가 있어서 그쪽이 뽑히곤 한다.
가상 어댑터 주소는 폰에서 절대 닿지 않는다.

**실제 와이파이 주소를 직접 확인한다.**

```powershell
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Select-Object IPAddress
```

DHCP로 IP가 바뀌므로 접속이 안 되면 **먼저 이것부터 다시 확인**한다.
실제로 서버를 띄운 뒤 주소가 바뀌어 접속이 안 된 적이 있다.

## 2. Next.js의 교차 출처 차단

Next.js는 개발 모드에서 `/_next/*` 같은 내부 자원에 대한 **다른 출처의 요청을 기본 차단**한다.
폰에서 IP로 접속하면 HTML은 오지만 스크립트와 스타일이 403으로 막혀 화면이 깨진다.

`next.config.ts`에 사설 IP 대역을 이미 허용해 두었다.

```ts
allowedDevOrigins: ["192.168.*.*", "172.*.*.*", "10.*.*.*"]
```

와일드카드는 `.` 단위로 동작한다(`172.24.*.*` 형태). **설정을 바꾸면 서버를 재시작해야 한다.**

확인 방법 — 200이 나와야 한다.

```powershell
$lan = "192.168.0.5"   # 실제 와이파이 주소로
$html = (Invoke-WebRequest "http://$lan`:3000" -UseBasicParsing).Content
$asset = ([regex]'/_next/static/[^"'']+').Match($html).Value
Invoke-WebRequest "http://$lan`:3000$asset" -Headers @{ Origin = "http://$lan`:3000" } -UseBasicParsing
```

## 3. 공용 와이파이의 기기 간 차단

기관·카페의 **방문객(Guest) 와이파이는 대부분 기기 간 통신을 막는다**(AP isolation).
같은 와이파이에 있어도 폰에서 PC로 접속할 수 없고, **이건 우리 쪽에서 고칠 수 없다.**

1번과 2번을 다 확인했는데도 연결 자체가 안 되면 이 경우다.

### 해결 A — 폰 핫스팟 (권장)

폰의 핫스팟을 켜고 **PC를 그 핫스팟에 연결**한다. 둘이 같은 사설망에 들어가고
기기 간 차단이 없다. 로컬 접속이라 데이터도 거의 쓰지 않는다.

연결 후 와이파이 주소가 바뀌므로 1번을 다시 확인한다.

### 해결 B — 터널

외부에서 접근 가능한 임시 주소를 만든다. 네트워크 제약을 우회한다.

```bash
npx localtunnel --port 3000
```

**주의** — 개발 서버가 인터넷에 공개된다. 주소를 아는 사람은 누구나 들어올 수 있으므로
테스트가 끝나면 반드시 끈다. 터널 주소는 `allowedDevOrigins`에 추가해야 할 수 있다.

## 확인 순서 정리

```text
폰에서 접속 안 됨
   │
   ├─ 주소가 진짜 와이파이 IP인가?        → Get-NetIPAddress 로 확인
   ├─ 화면이 깨져 보이는가?               → allowedDevOrigins + 서버 재시작
   └─ 연결 자체가 안 되는가?              → 공용 와이파이 차단. 핫스팟 또는 터널
```

## 참고 — 방화벽

Windows 방화벽은 공용 네트워크에서 인바운드를 막는다. 다만 Node는 보통
설치 시 허용 규칙이 만들어져 있다. 확인만 해두면 된다.

```powershell
Get-NetFirewallRule -Direction Inbound -Enabled True |
  Where-Object DisplayName -match 'node' |
  Format-Table DisplayName, Profile, Action
```
