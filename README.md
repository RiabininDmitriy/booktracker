# Booktracker

Monorepo for a book tracking app:

- `apps/api` - NestJS + TypeORM + PostgreSQL API
- `apps/web` - Next.js frontend
- `db` - local PostgreSQL init scripts and seed

## Requirements

- Node.js `>=18`
- `pnpm` (recommended: latest)
- Docker Desktop (or Docker Engine + Compose)

## 1) Clone and open project

```bash
git clone --branch feature/db-and-nest git@github.com:DmytroRiabinin/booktracker.git
cd booktracker
```

## 2) Install dependencies

```bash
pnpm install
```

## 3) Setup API environment variables

Create `apps/api/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/booktracker
JWT_SECRET=dev_jwt_secret_test
```

Tip: you can copy from `apps/api/.env.example` and add `JWT_SECRET`.

## 4) Start PostgreSQL

```bash
docker compose up -d
```

Check status:

```bash
docker compose ps
```

Stop DB when needed:

```bash
docker compose down
```

Stop and remove DB volume (full reset):

```bash
docker compose down -v
```

## 5) Run apps

Run API:

```bash
pnpm run dev:api
```

Run Web:

```bash
pnpm run dev:web
```

Run both in parallel:

```bash
pnpm run dev
```

## 6) Useful checks

From repo root:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

API-only:

```bash
pnpm --filter api test:e2e
pnpm --filter api migration:run
```

## 7) Common issues

### `Error: ENOENT ... uv_cwd`

This happens when terminal current directory was deleted.

Fix:

```bash
cd "/Users/dmytro/Documents/Work/Projects/pdpProject"
pnpm run dev:api
```

### `Config validation error: "DATABASE_URL" is required. "JWT_SECRET" is required`

Create/update `apps/api/.env` with both values (see step 3).

### API cannot connect to DB

- Ensure Docker is running.
- Ensure container is up: `docker compose ps`
- Ensure `DATABASE_URL` uses port `5433`.
