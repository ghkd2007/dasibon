# 배포 체크리스트 (Vercel)

## 1. 코드 푸시 (GitHub)

- 로컬 변경사항 커밋 후 `origin`에 푸시해 두기.
- Vercel은 GitHub 저장소를 연결해서 배포합니다.

## 2. Vercel에서 프로젝트 생성

1. [vercel.com](https://vercel.com) 로그인 → **Add New** → **Project**
2. **Import Git Repository**에서 이 프로젝트 저장소 선택 후 **Import**
3. **Environment Variables**에 아래 변수 추가 (Production, Preview 둘 다 넣어두면 편함):

| Name | Value | 비고 |
|------|--------|------|
| `DATABASE_URL` | Supabase Connection string (URI, Transaction pooler 6543) | `.env`와 동일 |
| `DIRECT_URL` | Supabase Connection string (Session pooler 5432) | `.env`와 동일 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fzeyijtddqrfjfzzsnpq.supabase.co` | `.env`와 동일 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | `.env`와 동일 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (비공개) | `.env`와 동일 |

4. **Build Command** (선택): `npm run vercel-build`  
   - 이렇게 하면 배포 시 `prisma generate` + `prisma migrate deploy` + `next build` 실행됨.
5. **Deploy** 클릭.

## 3. 배포 후 확인

- 메인: `https://[프로젝트명].vercel.app`
- 관리자: `https://[프로젝트명].vercel.app/admin/login`

Supabase Storage에 `uploads` 버킷이 없다면 DEPLOY.md 5번처럼 만들어 두기.
