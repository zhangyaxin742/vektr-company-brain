# Vektr Company Brain

Hour `0-3` now has a runnable split scaffold plus the first authenticated Supabase slice:

- `apps/web`: Next.js 16 App Router frontend with Tailwind v4, shadcn/ui, React Flow, org-scoped Supabase SSR auth, server-only DAL modules, and `/api/health`.
- `worker`: FastAPI worker with connector health routes, PRD-aligned stub endpoints, direct Supabase Postgres checks, and Neo4j AuraDB checks.

## Repo layout

```text
apps/web   Next.js frontend
supabase   SQL migrations
worker     FastAPI worker
docs       Project memory and sprint notes
```

## Prerequisites

- Node.js `20.9+` for Next.js 16
- Python `3.11+`
- A Supabase project
- A Neo4j AuraDB instance

## Web setup

```powershell
cd apps/web
Copy-Item .env.example .env.local
npm.cmd install
cd ..\..
npm.cmd run dev
```

If you prefer to stay in the app directory, `cd apps/web && npm.cmd run dev` still works. The repo root `package.json` exists so `npm run dev` does not escape upward into an unrelated parent directory.

The web app serves at `http://127.0.0.1:3000`.

Routes:

```text
/
/auth/sign-in
/demo
/ask
/graph
/skills
/health
/org/[slug]/graph
/org/[slug]/skills
/org/[slug]/ask
/org/[slug]/health
```

Legacy `/ask`, `/graph`, `/skills`, and `/health` now redirect authenticated users to their default organization route and redirect unauthenticated users to magic-link sign-in.

Health endpoint:

```text
GET /api/health
```

## Worker setup

```powershell
cd worker
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e .
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The worker serves at `http://127.0.0.1:8000`.

Health endpoints:

```text
GET /worker/health
GET /worker/health/connectors
```

## Environment variables

### `apps/web/.env.local`

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL used by the frontend.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key for browser-safe project access.
- `NEXT_PUBLIC_APP_URL`: app origin used for Supabase magic-link callbacks.
- `SUPABASE_SERVICE_ROLE_KEY`: optional server-only key for admin routes and deeper server-side checks.
- `NEO4J_URI`: Neo4j URI. Aura normally uses `neo4j+s://...`.
- `NEO4J_USERNAME`: Neo4j username, usually `neo4j`.
- `NEO4J_PASSWORD`: Neo4j password.
- `FASTAPI_WORKER_URL`: worker base URL, default `http://127.0.0.1:8000`.

### `worker/.env`

- `SUPABASE_URL`: Supabase project URL for worker-side API checks.
- `SUPABASE_SERVICE_ROLE_KEY`: server-side Supabase API key.
- `SUPABASE_DB_URL`: direct or pooled Postgres connection string for the worker's database check.
- `NEO4J_URI`: Aura connection URI.
- `NEO4J_USERNAME`: Aura username.
- `NEO4J_PASSWORD`: Aura password.

## Connector notes

- The Next.js app uses Supabase SSR auth with `proxy.ts`, request-scoped server clients, and org-scoped routes under `/org/[slug]`.
- The service role key remains server-only and should not be used for normal user request-path reads.
- The FastAPI worker uses a direct Postgres connection string for Supabase DB verification because backend application traffic should use a proper Postgres connection instead of browser-oriented data APIs.
- Neo4j Aura should be configured with a `neo4j+s://` URI unless your instance explicitly requires another supported scheme.
- Apply the SQL migration in `supabase/migrations/20260430130000_init_auth_rls.sql` before testing the authenticated routes.

## Verification

Run these after filling in env files:

```powershell
npm.cmd run build

cd worker
.\.venv\Scripts\python.exe -m compileall app
```

Then start both services and hit:

- `http://127.0.0.1:3000/api/health`
- `http://127.0.0.1:8000/worker/health/connectors`

## Official references

- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- Tailwind + Next.js: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- shadcn CLI: https://ui.shadcn.com/docs/cli
- React Flow quick start: https://reactflow.dev/learn/getting-started/installation-and-requirements
- FastAPI first steps: https://fastapi.tiangolo.com/tutorial/first-steps/
- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Postgres connections: https://supabase.com/docs/guides/database/connecting-to-postgres
- Neo4j Aura connections: https://neo4j.com/docs/aura/connecting-applications/overview/
- Neo4j Python driver connection schemes: https://neo4j.com/docs/python-manual/current/connect-advanced/
