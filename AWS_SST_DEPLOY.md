# AWS + SST Deployment (What We Did)

This is a short summary of the production deployment flow we completed for Booktracker.

## 1) AWS setup

- Created a dedicated IAM deploy user (`booktracker-deploy`).
- Configured local AWS credentials with this user (`aws configure`).
- Enabled billing safety controls:
  - Billing alerts (CloudWatch)
  - AWS Budget alerts
  - Budget actions / restrictions

## 2) App configuration for SST

- Deployed with stage `prod`.
- Stored secrets in SST:
  - `DATABASE_URL` (Neon Postgres)
  - `JWT_SECRET`
- Updated `sst.config.ts` so:
  - API is deployed as Lambda Function URL
  - Web is deployed as Next.js (CloudFront)
  - `NEXT_PUBLIC_API_URL` points to deployed API URL

## 3) Backend fixes required for stable prod runtime

- Fixed Lambda packaging/runtime issues for NestJS.
- Fixed CORS conflict by disabling Function URL CORS and handling CORS in Nest only.
- Updated auth cookies for cross-site production usage (`SameSite=None`, `Secure`).
- Switched from `bcrypt` to `bcryptjs` to avoid native binary runtime issues in Lambda.
- Added explicit TypeORM column types where needed to avoid metadata/runtime issues.

## 4) Frontend auth/session flow fixes

- Added client-side auth guard for protected routes.
- Persisted app-side `access_token` cookie after login/register for protected route access.
- Cleared the app-side cookie on logout.

## 5) Commands used

```bash
pnpm build
AWS_PROFILE=booktracker-deploy pnpm sst:deploy
```

## 6) Outputs (current)

- Web: `https://d3ufd2iszli4n3.cloudfront.net`
- API: `https://oezencyknpqdmcty7k4hjjalma0etkry.lambda-url.us-east-1.on.aws/`

## 7) Quick verify

- `GET /health` returns 200.
- `POST /auth/register` and `POST /auth/login` work from the deployed web app.
- Successful sign-in redirects to protected pages (dashboard).
