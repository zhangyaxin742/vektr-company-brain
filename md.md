### Hour 3–6: Ingestion + Chunking + Embeddings

Owner: Codex Session B

Tasks:

- Implement `/api/demo/load`.
- Implement `/api/upload`.
- Normalize `.json`, `.md`, `.txt`.
- Store raw document.
- Chunk text.
- Generate embeddings.
- Store chunks in pgvector.

Deliverable:

- Demo load creates documents/chunks/embeddings.

### Supabase Schema + RLS

Build Supabase migrations for Vektr.

Tables:
- organizations
- memberships
- documents
- chunks
- skills
- health_flags
- ask_logs

Requirements:
- Enable pgvector.
- chunks.embedding vector(1024).
- Enable RLS on every table.
- Policies restrict reads/writes to users with membership in org_id.
- Create match_chunks RPC for vector similarity scoped by org_id.
- Generate TypeScript DB types if possible.
- Build server-only DAL in lib/server/db.

### Acme Demo Corpus

Create the Acme Labs demo corpus.

Files:
- customer-success-slack.json
- email-threads.json
- welcome-to-acme.md
- refund-policy.md
- nov-3-outage-postmortem.md
- security-procurement-gap.md
- pricing-exceptions.md
- dataflow-vendor-renewal.json

Scenario:
TeraCorp pays $48k/year and demands a two-month refund after a 4-hour Nov 3 outage. Marcus opens Slack thread, Priya gets pulled in, Femi pushes back, Jordan makes final call. Include contradictions across Slack/email/policy. Include enough signal to generate an Enterprise Refund Handling skill.

### Ingestion Pipeline

Build ingestion.

Implement:
- POST /api/demo/load
- POST /api/upload
- parser for json/md/txt
- document normalization
- chunking with overlap
- OpenAI embeddings
- store documents/chunks in Supabase
- queue GraphRAG job
- ingestion status response

### Session D — Ingestion Pipeline

Build ingestion.

Implement:
- POST /api/demo/load
- POST /api/upload
- parser for json/md/txt
- document normalization
- chunking with overlap
- OpenAI embeddings
- store documents/chunks in Supabase
- queue GraphRAG job
- ingestion status response


• Proposed Plan


  # Hour 3–6 Plan: Production-Grade Ingestion, Chunking, and Embeddings

  ## Summary

  - Build a real ingestion pipeline around the current shell so POST /api/demo/load and POST /api/upload create persisted
    documents, chunk rows, embeddings, and a queued follow-on GraphRAG job.
  - Keep the current read-side auth/RLS foundation as-is. It is solid enough to build on:
      - supabase/migrations/20260430130000_init_auth_rls.sql already gives the right core tables, vector(1024), RLS, and
        match_chunks.
      - apps/web/src/lib/server/db/shared.ts, orgs.ts, documents.ts, chunks.ts, skills.ts, health.ts are good read-side
        DAL scaffolding.
      - Next.js/worker health and env scaffolding compile cleanly and do not need redesign.
  - Main gaps today:
      - No ingestion routes exist in Next.js beyond /api/health.
      - worker/app/main.py ingestion endpoints are stubs.
      - No parser, no normalization, no chunker, no embeddings client, no storage path, no queue, no ingestion status
        model.
      - apps/web/src/lib/clients/worker.ts fakes demo load.
      - .env.example files lack OpenAI, Redis/queue, storage, and worker-auth settings.
      - UI remains mock-backed; apps/web/src/lib/mock-data.ts diverges from md.md and the seeded corpus, so later phases
        should stop treating mock data as truth.
  - Research defaults to bake in:
      - Use TEI with Qwen/Qwen3-Embedding-0.6B so embeddings stay 1024-dimensional and match the current schema/RPC:
        https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
      - Batch embedding requests and add retry with exponential backoff for rate-limit resilience:
        https://platform.openai.com/docs/guides/rate-limits/retrying-with-exponential-backoff
      - Use Supabase Storage standard uploads only for small files; keep a hard small-file cap now and leave TUS/resumab
        le for later: https://supabase.com/docs/guides/storage/uploads/standard-uploads
      - Shape chunk/document outputs so they map cleanly into GraphRAG’s later document and text-unit flow:
        https://microsoft.github.io/graphrag/index/default_dataflow/

  ## Key Changes

  ### 1. Data model, config, and dependencies

  - Add one minimal reusable job table, pipeline_jobs, instead of hiding status in documents.metadata.
  - pipeline_jobs fields:
      - id, org_id, job_type, status, triggered_by_user_id, source, payload, result, error_message, dedupe_key,
        parent_job_id, created_at, started_at, completed_at, updated_at
      - enums/checks:
          - job_type: demo_load, upload_ingest, graphrag_index
          - status: queued, running, completed, failed, partial
  - Add indexes on (org_id, created_at desc), (status, created_at), and unique nullable dedupe_key.
  - Create a private Supabase Storage bucket for raw source artifacts, e.g. documents, with service-role writes only for
    this phase.
  - Keep using existing documents and chunks tables; store operational details in metadata rather than widening those
    tables now.
  - Regenerate apps/web/src/lib/supabase/database.types.ts.
  - Add env/settings:
      - web: WORKER_SHARED_SECRET
      - worker: EMBEDDINGS_BASE_URL, EMBEDDINGS_MODEL=text-embeddings-inference, REDIS_URL or Upstash equivalent,
        SUPABASE_STORAGE_BUCKET=documents, WORKER_SHARED_SECRET, INGEST_MAX_UPLOAD_BYTES, INGEST_ALLOWED_EXTENSIONS
  - Add worker dependencies:
      - TEI-backed local embeddings service
      - tiktoken
      - arq plus Redis client
      - optionally python-magic-style MIME helper only if needed; otherwise keep extension + content-type validation
        simple

  ### 2. Web app API surface

  - Add POST /api/demo/load
      - Public, but tightly scoped to the Acme demo corpus only.
      - No arbitrary input body beyond optional reset/idempotency flags.
      - Creates a pipeline_jobs row and queues a worker demo_load job.
      - Returns { jobId, status, orgSlug, source: "demo" }.
  - Add POST /api/upload
      - Authenticated and org-scoped only.
      - Accepts multipart/form-data with orgSlug and files[].
      - Enforces allowlist: .json, .md, .txt.
      - Enforces byte cap sized for standard upload mode.
      - Creates one upload_ingest job and queues worker processing.
      - Returns { jobId, status, acceptedFiles, rejectedFiles }.
  - Add GET /api/ingestion/[jobId]
      - Authenticated for org members; demo-job reads allowed for the public demo org if the job source is demo.
      - Returns normalized status payload with counts:
          - documents created
          - chunks created
          - embeddings created
          - next job queued
          - failures/warnings
  - Replace createWorkerClient().loadDemo() stub with real internal worker calls plus response validation.
  - Protect web-to-worker calls with a shared secret header so worker routes are not effectively public.

  ### 3. Worker-owned ingestion pipeline

  - Split worker/app/main.py into route handlers plus dedicated ingestion modules.
  - Add worker request schemas for:
      - DemoLoadRequest
      - UploadIngestRequest
      - PipelineJobResponse
  - Implement queue-first flow:
      - Next.js route validates request and enqueues.
      - Worker job owns all writes and status transitions.
      - pipeline_jobs.status moves queued -> running -> completed|failed|partial.
  - Parser/normalizer behavior:
      - .md: preserve headings, strip frontmatter into metadata, keep section structure in normalized text.
      - .txt: normalize newlines/BOM/whitespace, preserve literal text.
      - .json: detect source shape.
          - Slack corpus: render transcript blocks with channel/title, timestamps, speaker, role, and message body.
          - Email corpus: render thread transcript with subject, participants, per-message metadata, and body.
          - Unknown JSON: fall back to stable pretty-printed text plus top-level key metadata, but reject if effectively
            empty.
  - Each normalized document output should include:
      - title
      - source_type
      - source_date
      - raw_text used for chunking/retrieval
      - metadata including original filename, content type, byte size, SHA-256 hash, parser version, normalization
        version, source-specific fields
  - Store original raw file in Supabase Storage under unique paths like org/<org_id>/<job_id>/<sha256>-<sanitized-name>.
  - Persist one documents row per uploaded/seeded artifact.
  - Chunking strategy:
      - Token-aware chunking with tiktoken
      - target: ~800 tokens
      - overlap: ~120 tokens
      - hard max per chunk: 1000 tokens
      - preserve higher-level boundaries first: markdown sections, email messages, Slack message groups; only fall back
        to sliding windows when a single section is too large
      - skip empty/near-empty chunks
  - Chunk metadata per row:
      - token_count
      - char_start, char_end
      - section_path or message/thread references
      - normalization_version
      - document_sha256
  - Embeddings:
      - Use TEI with Qwen/Qwen3-Embedding-0.6B
      - Batch multiple chunk texts per API call
      - Bound concurrency
      - Retry 429/5xx with jittered exponential backoff
      - Mark job partial if some chunks fail after retries; keep successful chunks persisted
  - GraphRAG handoff:
      - Do not run GraphRAG in hours 3–6.
      - On successful ingestion completion, enqueue exactly one follow-on graphrag_index job keyed by org/job dedupe
        rules so hours 5–9 can attach to the same queue.
      - Store the queued child job id in pipeline_jobs.result.

  ### 4. Robustness and security hardening

  - Idempotency:
      - For demo load, use a deterministic dedupe key like demo:<org_slug>:acme-seed:v1.
      - For uploads, dedupe on (org_id, sha256) within active/recent jobs to avoid duplicate document creation on
        retries.
  - Failure handling:
      - invalid file type -> request-level rejection
      - parse failure on one file -> continue remaining files, job becomes partial
      - embedding failure -> retry, then record failed chunk count and partial status
      - storage write failure -> do not create document row for that file
  - Security:
      - uploads authenticated and org-authorized before queueing
      - demo load only allowed on the demo org path, never arbitrary org ids from the client
      - strict size/type allowlist
      - worker routes require shared-secret auth from Next.js
      - OpenAI key and Supabase service role remain server-only
      - treat document text as untrusted input; never execute instructions from uploaded content
  - Observability:
      - structured logs keyed by job_id, org_id, document_id
      - no raw secrets in logs
      - sanitize stored error text
      - include counts/timestamps in pipeline_jobs.result for the demo dashboard and later debugging

  ### 5. What stays as-is vs what needs work

  - Good enough as-is for this phase:
      - core Supabase schema/RLS and match_chunks
      - server-only Supabase auth setup
      - read-side DAL patterns
      - env validation pattern and connector health endpoints
      - current page/layout shell and org routing
  - Needs implementation or hardening now:
      - worker/app/main.py and new worker ingestion modules
      - worker/app/config.py for strict ingestion settings
      - apps/web/src/lib/clients/worker.ts
      - new Next.js route handlers for demo load, upload, and ingestion status
      - apps/web/src/lib/types.ts to define ingestion/job contracts
      - apps/web/src/app/(product)/demo/page.tsx so the button reflects real job state instead of static mock metrics
      - migration/types/env examples for pipeline_jobs, storage bucket, and new secrets
  - Out of scope for hours 3–6 but should not be forgotten:
      - Ask/Graph/Skills/Health still depend on mock data and will need to pivot to real persisted data in later hours
      - current mock narrative names/content should stop drifting from md.md once real ingestion is wired

  ## Test Plan

  - Parser tests:
      - Slack JSON seed normalizes into transcript text with expected people/events.
      - Email JSON seed preserves subject/participants/order.
      - Markdown headings preserved.
      - Plain text normalization removes BOM and stabilizes newlines.
  - Chunker tests:
      - respects target token size and overlap
      - preserves section/message boundaries where possible
      - no empty chunks
      - stable chunk count for fixed input
  - Embedding tests:
      - successful batched embeddings write 1024-length vectors
      - retry path on synthetic 429/5xx
      - partial failure marks job partial
  - API/integration tests:
      - POST /api/demo/load creates documents, chunks, embeddings, and a queued graphrag_index child job
      - POST /api/upload rejects disallowed type and oversize file
      - duplicate upload does not create duplicate documents/chunks
      - non-member cannot query another org’s ingestion status
      - demo job status is readable through the demo surface only
  - Acceptance criteria for hours 3–6:
      - one-click demo load creates rows in documents and chunks
      - each chunk has an embedding
      - job status endpoint shows accurate counts and completion state
      - a follow-on GraphRAG job is queued, not executed
      - web build and worker import/compile still pass

  ## Assumptions

  - Use a real async queue now, not synchronous inline ingestion.
  - POST /api/demo/load is public for the demo corpus only; POST /api/upload is authenticated only.
  - For this phase, “production-ready” means robust single-org demo and authenticated upload workflows with idempotency,
