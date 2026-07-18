# SsaemzTalk

회사 소속 선생님들이 수업 기록·교구재·스케줄을 함께 쓰는 공유 기록장 플랫폼입니다.

## 스택

- Next.js 15 (App Router) + TypeScript
- Prisma + SQLite (로컬 기본) / PostgreSQL용 `docker-compose.yml` 포함
- NextAuth (이메일 로그인, 소셜 로그인은 UI 자리만)
- TipTap 리치 에디터

## 로컬 환경 요구사항

| 항목 | 권장 |
|------|------|
| Node.js | 18.18+ (20 LTS 권장) |
| 패키지 매니저 | npm |
| Git | 필요 |
| Docker | 선택 (PostgreSQL 사용 시) |

## 시작하기

```bash
git clone https://github.com/saintpark90/SsaemzTalk.git
cd SsaemzTalk
npm install
cp .env.example .env   # Windows: copy .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

`.env` 기본값:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ssaemztalk-dev-secret-change-in-production"
UPLOAD_DIR="public/uploads"
```

### 데모 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 담당자(ADMIN) | admin@ssaemz.com | password123 |
| 선생님 | teacher@ssaemz.com | password123 |

시드 회사: `샘즈에듀`, `미래교육`

## 주요 기능

- 키즈노트형 메인 로그인 화면
- 회사 검색 후 가입 신청 → 담당자 승인
- 수업 기록장 (교재/호수/차시/날짜, TipTap, 이미지 첨부, 검색)
- 교구재 관리 (잔여·대여·반납)
- 스케줄 달력 (매주 반복, 관리자 배정·페이 합계)

## 다른 PC에서 Cursor로 셋업하기

[`docs/LOCAL_SETUP_PROMPT.md`](docs/LOCAL_SETUP_PROMPT.md) 의 프롬프트를 새 환경 Cursor에 붙여넣으면 됩니다.

## PostgreSQL로 전환 (선택)

1. Docker Desktop 실행 후 `docker compose up -d`
2. `prisma/schema.prisma` 의 `provider` 를 `postgresql` 로 변경
3. `.env` 의 `DATABASE_URL` 을 Postgres 연결 문자열로 변경
4. `npx prisma db push && npm run db:seed`

## 커밋하지 않는 로컬 파일

- `.env`
- `prisma/dev.db`
- `public/uploads/**` (업로드된 실제 파일)

## 이후 확장

- 카카오 / 구글 / 네이버 OAuth
- 회사 규모별 구독·라이선스 (`Company.planTier`)
- Capacitor/Expo 모바일 클라이언트 (`/api/v1` 재사용)
