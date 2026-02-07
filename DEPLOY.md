# 다시본교회 주보 – 배포 가이드 (Vercel + Supabase)

**이미 사용 중인 Supabase 프로젝트**
- Project URL: `https://fzeyijtddqrfjfzzsnpq.supabase.co`
- `.env` 에 Project URL / Anon Key 는 설정돼 있음. **`DATABASE_URL` 만 DB 비밀번호로 채우면 됨.**

## 1. DB 연결 (로컬)

1. 프로젝트 루트 `.env` 열기.
2. **`DATABASE_URL`** 줄에서 **`[DB비밀번호]`** 를 **Supabase 프로젝트 생성 시 설정한 Database 비밀번호**로 바꾸기.
   - 비밀번호에 `@`, `#` 등 특수문자 있으면 URL 인코딩 (예: `@` → `%40`).
3. 터미널에서 마이그레이션 적용:

```bash
npx prisma migrate deploy
```

4. `npm run dev` 로 실행.

## 2. (참고) Supabase 새로 만들 때

1. [Supabase](https://supabase.com) → **New project** 생성.
2. **Settings → Database** → **Connection string** → **URI** 복사 후 `.env` 의 `DATABASE_URL` 에 붙여넣기.

## 3. Vercel 배포

1. [Vercel](https://vercel.com) 가입 후 **Add New Project**.
2. GitHub 저장소 연결 후 **Import**.
3. **Environment Variables** 에서 추가:
   - Name: `DATABASE_URL`
   - Value: 위에서 복사한 Supabase **Connection string (URI)** 와 동일한 값.
   - Environment: **Production** (필요하면 Preview도 동일 값으로 추가).
4. **Build Command** 를 다음으로 설정 (선택):
   - `npm run vercel-build`  
   → `prisma generate` + `prisma migrate deploy` + `next build` 로 빌드 시 스키마 반영.
5. **Deploy** 실행.

## 4. 배포 후 확인

- 메인: `https://[프로젝트명].vercel.app`
- 관리자: `https://[프로젝트명].vercel.app/admin/login`  
  (테스트 계정: `admin` / `dasibon123` – 로그인 로직은 그대로 사용)

Supabase **Table Editor** 에서 `Bulletin` 테이블에 데이터가 쌓이는지 확인하면 됩니다.

## 요약

| 항목        | 값 |
|------------|-----|
| DB         | Supabase (PostgreSQL) |
| 호스팅     | Vercel |
| 환경 변수  | `DATABASE_URL` = Supabase Connection string (URI) |
