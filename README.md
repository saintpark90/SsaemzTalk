# SsaemzTalk

회사 소속 선생님들이 수업 계획·아이디어·수강생 반응을 카테고리별로 공유하는 플랫폼 MVP입니다.

## 스택

- Next.js 15 (App Router) + TypeScript
- Prisma + SQLite (로컬 기본) / PostgreSQL용 `docker-compose.yml` 포함
- NextAuth (이메일 로그인, 소셜 로그인은 UI 자리만)

## 시작하기

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

### 데모 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 담당자(ADMIN) | admin@ssaemz.com | password123 |
| 선생님 | teacher@ssaemz.com | password123 |

시드 회사: `샘즈에듀`, `미래교육`

## 주요 기능 (MVP)

- 이메일 회원가입/로그인
- 회사 검색 후 가입 신청 → 담당자 승인
- 카테고리별 게시글 CRUD, 검색/필터
- 사진·첨부파일 업로드
- JANDI 감성의 사이드바형 UI

## PostgreSQL로 전환 (선택)

1. Docker Desktop 실행 후 `docker compose up -d`
2. `prisma/schema.prisma` 의 `provider` 를 `postgresql` 로 변경
3. `.env` 의 `DATABASE_URL` 을 Postgres 연결 문자열로 변경
4. `npx prisma db push && npm run db:seed`

## 이후 확장

- 카카오 / 구글 / 네이버 OAuth
- 회사 규모별 구독·라이선스 (`Company.planTier`)
- Capacitor/Expo 모바일 클라이언트 (`/api/v1` 재사용)
