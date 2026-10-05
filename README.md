# SsaemzTalk

회사 소속 선생님들이 수업 기록·교구재·스케줄을 함께 쓰는 공유 기록장 플랫폼입니다.

## 스택

- Next.js 15 (App Router) + TypeScript
- Prisma + Supabase (PostgreSQL)
- NextAuth (이메일 로그인, 소셜 로그인은 UI 자리만)
- TipTap 리치 에디터

## 로컬 환경 요구사항

| 항목 | 권장 |
|------|------|
| Node.js | 18.18+ (20 LTS 권장) |
| 패키지 매니저 | npm |
| Git | 필요 |
| Supabase 프로젝트 | 필요 (공유 DB) |
| Docker | 선택 (로컬 Postgres만 쓸 때) |

## 시작하기

1. [Supabase](https://supabase.com)에서 프로젝트를 만들고 Database 비밀번호를 저장합니다.
2. **Project Settings → Database → Connection string** 에서 연결 문자열을 복사합니다.
   - **Transaction** (pooler, port `6543`) → `DATABASE_URL`
   - **Session** 또는 **Direct** (port `5432`) → `DIRECT_URL`
3. 아래 명령으로 로컬을 구성합니다.

```bash
git clone https://github.com/saintpark90/SsaemzTalk.git
cd SsaemzTalk
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

`.env`에 Supabase 연결 문자열을 넣고 `[PASSWORD]`, `[PROJECT-REF]`를 실제 값으로 바꿉니다.

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ssaemztalk-dev-secret-change-in-production"
UPLOAD_DIR="public/uploads"
```

연결 문자열의 호스트·리전은 Supabase 대시보드에 표시된 값을 그대로 쓰세요. (프로젝트가 다른 리전이면 `aws-0-...` 부분이 다릅니다.)

```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

> 이미 팀에서 쓰는 Supabase DB가 있고 스키마·시드가 반영돼 있다면 `db push` / `db:seed`는 건너뛰어도 됩니다.

### Free 플랜 일시정지 (Paused)

Supabase Free 프로젝트는 **약 7일 동안 DB 활동이 없으면 자동 정지**됩니다. 로그인/조회 시 `tenant/user ... not found` 같은 오류가 나면 보통 이 경우입니다.

1. [프로젝트 대시보드](https://supabase.com/dashboard/project/mggbvmnuoygedsjusiji) 에서 **Resume project** 클릭
2. 복구가 끝날 때까지 1~2분 대기
3. 개발 서버를 재시작한 뒤 다시 로그인

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
Supabase `DATABASE_URL` / `DIRECT_URL`만 `.env`에 넣으면 Docker 없이 바로 개발할 수 있습니다.

## 로컬 Postgres (선택)

오프라인·단독 개발이 필요할 때만 사용합니다.

1. Docker Desktop 실행 후 `docker compose up -d`
2. `.env`의 `DATABASE_URL` / `DIRECT_URL`을 localhost 연결 문자열로 변경 (`.env.example` 주석 참고)
3. `npx prisma db push && npm run db:seed`

## 커밋하지 않는 로컬 파일

- `.env` (Supabase 비밀번호 포함)
- `public/uploads/**` (업로드된 실제 파일)

## 이후 확장

- 카카오 / 구글 / 네이버 OAuth
- 회사 규모별 구독·라이선스 (`Company.planTier`)
- Capacitor/Expo 모바일 클라이언트 (`/api/v1` 재사용)
