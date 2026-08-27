# hborad 배포 가이드

이 폴더를 이미 `hborad.vercel.app`에 연결된 GitHub 저장소에 그대로 올리면 됩니다.
Vercel이 GitHub 저장소를 감시하고 있으므로, push만 하면 자동으로 재배포됩니다.

## 폴더 구성
```
index.html              메인 앱 (로그인 게이트 + 기록/계획/달력 + CSV 내보내기)
api/auth.js              로그인 (비밀번호 검증 → 세션 쿠키 발급)
api/check.js             로그인 상태 확인
api/logout.js            로그아웃
api/data.js              기록 데이터 조회/저장 (GitHub 저장소에 JSON 커밋)
api/_lib/auth.js          공통 인증 로직
package.json
.env.example             필요한 환경변수 목록 (실제 값은 Vercel에서 등록)
```

## 1. 이 폴더를 저장소에 반영하기
기존 `hborad.vercel.app`에 연결된 GitHub 저장소를 로컬에 clone한 뒤,
이 폴더의 파일들을 그대로 덮어써서 커밋 + push 하세요.

```bash
git add -A
git commit -m "hborad: 로그인 게이트, 서버 저장, CSV 내보내기, 날짜 연동 추가"
git push
```

push하면 Vercel이 자동으로 새 배포를 시작합니다.

## 2. GitHub Personal Access Token 발급 (데이터 저장용)
기록 데이터를 저장소에 커밋하려면, 저장소에 쓰기 권한이 있는 토큰이 필요합니다.

1. GitHub → 우측 상단 프로필 → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. **Generate new token** 클릭
3. **Repository access**: 이 프로젝트가 있는 저장소만 선택
4. **Permissions → Repository permissions → Contents**: `Read and write` 로 설정
5. 생성된 토큰 값을 복사해두기 (한 번만 보여줍니다)

> 데이터를 별도 저장소로 분리하고 싶다면(기록이 코드 커밋 이력과 섞이는 게 싫다면),
> 데이터 전용의 작은 **private** 저장소를 하나 더 만들고 그 저장소 이름을 `GITHUB_REPO`에 지정해도 됩니다.
> 이 경우 토큰도 그 저장소에 대해서만 권한을 주면 됩니다.

## 3. Vercel 환경변수 등록
Vercel 대시보드 → 해당 프로젝트 → **Settings → Environment Variables** 에서 아래 값을 등록하세요.
(`.env.example` 파일에도 동일한 목록이 있습니다.)

| 변수명 | 설명 | 예시 |
|---|---|---|
| `SITE_PASSWORD` | 메인 페이지 진입용 비밀번호 | `MyStrongPassword123!` |
| `GITHUB_OWNER` | 저장소 소유자(계정명) | `myusername` |
| `GITHUB_REPO` | 데이터를 저장할 저장소 이름 | `hborad` |
| `GITHUB_BRANCH` | 커밋할 브랜치 (기본 main) | `main` |
| `GITHUB_DATA_PATH` | 저장소 내 데이터 파일 경로 (없으면 자동 생성) | `data/hboard-data.json` |
| `GITHUB_TOKEN` | 2번에서 발급한 토큰 | `github_pat_...` |

등록 후 **Redeploy** (또는 다시 push) 해야 값이 적용됩니다.
`GITHUB_TOKEN`은 서버(API 함수)에서만 사용되며 브라우저로는 절대 노출되지 않습니다.

## 4. 접속 및 사용
- `hborad.vercel.app` 접속 → 비밀번호 입력 화면이 먼저 뜹니다.
- `SITE_PASSWORD`로 로그인하면 30일간 세션이 유지됩니다 (쿠키 기반).
- 이후부터는 어느 기기/브라우저에서 접속하든 같은 비밀번호로 로그인하면 **동일한 기록 데이터**를 볼 수 있습니다.
  (데이터는 브라우저가 아니라 지정한 GitHub 저장소의 `GITHUB_DATA_PATH` 파일에 저장되기 때문입니다.)
- 기록 화면 상단의 **⬇ CSV** 버튼을 누르면 지금까지의 모든 날짜 기록을 CSV 파일로 내려받을 수 있습니다.
- 기록(로그) / 계획 / 달력 화면의 날짜는 서로 연동됩니다 — 한 화면에서 날짜를 옮기면 다른 화면도 같은 날짜/주/월/년 기준으로 맞춰집니다.

## 5. 로컬에서 테스트하고 싶다면
Vercel CLI가 설치되어 있다면:
```bash
npm i -g vercel
vercel dev
```
루트에 `.env` 파일을 만들고 `.env.example`의 값들을 채워 넣으면 로컬에서도 로그인/저장이 동작합니다.

## 참고 / 주의사항
- 저장 방식이 "GitHub 저장소에 커밋"이라, 기록을 수정할 때마다 새 커밋이 쌓입니다. 개인 기록용이므로 큰 문제는 없지만,
  커밋 이력이 너무 지저분해 보이면 나중에 `git rebase`로 정리하거나 데이터 전용 저장소를 분리하는 것을 추천합니다.
- 여러 기기에서 거의 동시에 저장하면 마지막 저장이 이전 저장을 덮어쓸 수 있습니다(개인용 앱이라 문제될 가능성은 낮습니다).
- 비밀번호는 하나만 지원합니다(가족 등 여러 명이 각자 계정을 갖는 구조가 아닙니다). 필요하면 알려주시면 확장해드릴 수 있습니다.
