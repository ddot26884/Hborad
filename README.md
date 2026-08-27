# Gridaboard Vercel Starter

## 배포

1. 이 폴더를 GitHub 저장소에 올립니다.
2. Vercel에서 해당 저장소를 Import합니다.
3. Framework는 Next.js가 자동 인식됩니다.
4. Deploy를 누릅니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## 현재 기능

- 표 형태의 보드
- 항목 추가/삭제
- 체크박스
- 항목/메모 직접 수정
- 제목 수정
- 브라우저 저장(localStorage)
- 현재 URL 공유 링크 복사

## 중요

현재 버전은 데이터베이스가 없는 "1차 배포용"입니다.
따라서 다른 사람이 링크에 접속해 수정한 내용이 모든 사람에게 공유되는 구조는 아닙니다.

진짜 Gridaboard처럼 `/b/0826`별 데이터를 서버에 저장하려면 Vercel Functions + DB를 추가해야 합니다.
