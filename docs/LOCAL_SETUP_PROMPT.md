# 다른 로컬 환경용 Cursor 셋업 프롬프트

아래 내용을 새 PC/환경의 Cursor 채팅에 그대로 붙여넣으면 됩니다.

---

```text
SsaemzTalk 저장소를 이 로컬 환경에서 바로 개발할 수 있게 셋업해줘.

## 저장소
- GitHub: https://github.com/saintpark90/SsaemzTalk
- 아직 clone 안 했으면 적당한 폴더에 clone 후 그 경로에서 작업해줘.
- 이미 폴더가 열려 있으면 그 워크스페이스 기준으로 진행해줘.

## 필수 환경
- Node.js 18.18+ (가능하면 20 LTS 권장)
- npm
- Git
- Supabase 프로젝트 Connection string (DATABASE_URL + DIRECT_URL)
  - 없으면 사용자에게 Supabase Dashboard → Project Settings → Database 에서
    Transaction pooler(6543)와 Direct/Session(5432) 문자열을 받아달라고 안내

## 해야 할 일
1. `git status`로 저장소 상태 확인
2. `npm install`
3. `.env.example`을 복사해 `.env` 생성. 다음을 채운다:
   - DATABASE_URL — Supabase Transaction pooler (port 6543, ?pgbouncer=true)
   - DIRECT_URL — Supabase Direct/Session (port 5432)
   - NEXTAUTH_URL="http://localhost:3000"
   - NEXTAUTH_SECRET="ssaemztalk-dev-secret-change-in-production"
   - UPLOAD_DIR="public/uploads"
   - 연결 문자열이 아직 없으면 사용자에게 요청하고, 플레이스홀더로는 db push/seed를 진행하지 말 것
4. `npx prisma generate`
5. 스키마가 아직 없으면 `npx prisma db push` (이미 공유 DB에 반영돼 있으면 생략)
6. 시드가 필요하면 `npm run db:seed` (이미 데모 데이터가 있으면 생략)
7. `public/uploads` 폴더가 없으면 생성 (`.gitkeep` 유지)
8. `npm run dev`로 개발 서버 실행 후 http://localhost:3000 접속 가능한지 확인
9. README의 데모 계정으로 로그인되는지까지 짧게 검증

## 데모 계정
- ADMIN: admin@ssaemz.com / password123
- TEACHER: teacher@ssaemz.com / password123

## 주의
- `.env`, `public/uploads/**` 실제 파일은 커밋하지 말 것 (Supabase 비밀번호 포함)
- Prisma 버전은 저장소 그대로 유지
- 기본 DB는 Supabase Postgres. 오프라인만 필요할 때 docker-compose.yml 로컬 Postgres 사용

셋업이 끝나면 실행 중인 포트, 성공/실패 단계, 남은 이슈만 짧게 보고해줘.
```
