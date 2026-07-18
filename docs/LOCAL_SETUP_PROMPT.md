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
- (선택) Docker Desktop — PostgreSQL 쓸 때만

## 해야 할 일
1. `git status`로 저장소 상태 확인
2. `npm install`
3. `.env.example`을 복사해 `.env` 생성. 값이 없으면 아래 기본값 사용:
   - DATABASE_URL="file:./dev.db"
   - NEXTAUTH_URL="http://localhost:3000"
   - NEXTAUTH_SECRET="ssaemztalk-dev-secret-change-in-production"
   - UPLOAD_DIR="public/uploads"
4. `npx prisma generate`
5. `npx prisma db push`
6. `npm run db:seed`
7. `public/uploads` 폴더가 없으면 생성 (`.gitkeep` 유지)
8. `npm run dev`로 개발 서버 실행 후 http://localhost:3000 접속 가능한지 확인
9. README의 데모 계정으로 로그인되는지까지 짧게 검증

## 데모 계정
- ADMIN: admin@ssaemz.com / password123
- TEACHER: teacher@ssaemz.com / password123

## 주의
- `.env`, `prisma/dev.db`, `public/uploads/**` 실제 파일은 커밋하지 말 것
- Prisma 7은 Node 버전에 막힐 수 있으니, 패키지 버전은 저장소 그대로 유지
- Docker가 없어도 SQLite로 로컬 개발 가능. Postgres가 필요하면 docker-compose.yml과 README의 전환 절차를 따를 것

셋업이 끝나면 실행 중인 포트, 성공/실패 단계, 남은 이슈만 짧게 보고해줘.
```
