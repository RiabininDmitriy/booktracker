# Neon Postgres Setup (Booktracker)

This document describes how to use Neon Postgres with this project.

## 1) Create a Neon project

1. Create a new project in Neon.
2. Create (or use) a database for Booktracker.
3. Copy the connection string from Neon dashboard.

Use a URL in this format:

```txt
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

## 2) Configure local API environment

Update `apps/api/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=<your_secret>
```

## 3) Initialize schema (first time only)

If this Neon database is empty, apply base SQL first:

```bash
psql "$DATABASE_URL" -f db/init/01_schema.sql
```

Then run TypeORM migrations:

```bash
pnpm --filter api migration:run
```

## 4) Verify connection

Run API:

```bash
pnpm dev:api
```

Run migration status check:

```bash
pnpm --filter api migration:show
```

## 5) Production deployment with SST

For deployed environments, store `DATABASE_URL` in SST secrets (do not commit DB credentials):

```bash
sst secret set DATABASE_URL "<your_neon_url>" --stage prod
sst secret set JWT_SECRET "<your_jwt_secret>" --stage prod
```

Deploy:

```bash
AWS_PROFILE=booktracker-deploy pnpm sst:deploy
```

## 6) Notes

- You do not need local Docker Postgres if you use Neon for development.
- Keep `sslmode=require` in the URL for Neon.
- Never commit `.env` with real credentials.
