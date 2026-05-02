# TEI + Qwen Local Embeddings Setup

This project now targets a locally hosted embeddings service instead of OpenAI for ingestion embeddings.

## Why this stack

- Serving layer: Hugging Face Text Embeddings Inference (TEI)
- Model: `Qwen/Qwen3-Embedding-0.6B`
- Vector size: `1024`

This is a better fit than the prior `1536`-dimension OpenAI-specific setup because:

- TEI is purpose-built for embedding serving and supports dynamic batching, Prometheus metrics, and OpenTelemetry.
- Qwen3-Embedding-0.6B is a strong retrieval model with a `1024`-dimension output and `32K` context length.
- Lower vector dimensionality reduces storage and index size compared to `1536`-dimension embeddings.

## Sources

- TEI docs: https://huggingface.co/docs/text-embeddings-inference
- TEI quick tour: https://huggingface.co/docs/text-embeddings-inference/en/quick_tour
- TEI supported models: https://huggingface.co/docs/text-embeddings-inference/supported_models
- Qwen model card: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- OpenAI embeddings guide: https://platform.openai.com/docs/guides/embeddings
- OpenAI embedding model update benchmarks: https://openai.com/blog/new-embedding-models-and-api-updates

## What changed in the repo

- `chunks.embedding` is now expected to be `vector(1024)`.
- `match_chunks` now accepts a `vector(1024)` query embedding.
- The worker now calls a local embeddings API at `EMBEDDINGS_BASE_URL`, defaulting to `http://127.0.0.1:8080/v1`.
- The worker expects the TEI OpenAI-compatible model name `text-embeddings-inference` by default, while TEI itself is launched with `Qwen/Qwen3-Embedding-0.6B`.

## 1. Apply the database migration

Apply the new migration that changes the vector dimension:

- [20260501143000_tei_qwen_embeddings.sql](/C:/Users/user/Desktop/vektr-company-brain/supabase/migrations/20260501143000_tei_qwen_embeddings.sql)

Important:

- Existing `1536`-dimension embeddings are not compatible with the new schema.
- If you already have chunk rows with embeddings, re-embed the corpus after migrating.

## 2. Run TEI locally

### CPU

```bash
docker run -p 8080:80 \
  -v $PWD/models:/data \
  ghcr.io/huggingface/text-embeddings-inference:cpu-1.9 \
  --model-id Qwen/Qwen3-Embedding-0.6B
```

### GPU

```bash
docker run --gpus all -p 8080:80 \
  -v $PWD/models:/data \
  ghcr.io/huggingface/text-embeddings-inference:cuda-1.9 \
  --model-id Qwen/Qwen3-Embedding-0.6B
```

Notes:

- Mounting a local volume avoids re-downloading weights on every start.
- TEI supports CPU and multiple GPU-targeted images; use the image variant that matches your hardware.

## 3. Verify TEI is serving embeddings

TEI exposes an OpenAI-compatible embeddings endpoint.

```bash
curl http://127.0.0.1:8080/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "input": "What is a refund approval exception?",
    "model": "text-embeddings-inference"
  }'
```

Expected result:

- JSON response with `data[0].embedding`
- embedding length of `1024`

## 4. Configure the worker

Update `worker/.env`:

```dotenv
EMBEDDINGS_BASE_URL=http://127.0.0.1:8080/v1
EMBEDDINGS_MODEL=text-embeddings-inference
SUPABASE_STORAGE_BUCKET=documents
WORKER_SHARED_SECRET=replace-with-the-same-secret-as-the-web-app
INGEST_MAX_UPLOAD_BYTES=10485760
INGEST_ALLOWED_EXTENSIONS=.json,.md,.txt
```

The worker will send batched requests to:

```text
{EMBEDDINGS_BASE_URL}/embeddings
```

With the default config, that becomes:

```text
http://127.0.0.1:8080/v1/embeddings
```

And the request body uses:

```text
model = text-embeddings-inference
```

That matches TEI's documented OpenAI-compatible API behavior, even though the server itself is launched with `Qwen/Qwen3-Embedding-0.6B`.

## 5. Start the worker and web app

Worker:

```powershell
cd worker
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Web:

```powershell
npm.cmd run dev
```

## 6. Expected performance and tradeoffs

### Retrieval quality

Dimension count alone does not determine quality.

Current published benchmark references suggest:

- OpenAI `text-embedding-3-small`
  - default dimension: `1536`
  - MTEB average: `62.3`
- OpenAI `text-embedding-3-large`
  - default dimension: `3072`
  - MTEB average: `64.6`
- `Qwen/Qwen3-Embedding-0.6B`
  - dimension: `1024`
  - MTEB average: `64.33`

Interpretation:

- Moving from `1536` dimensions to `1024` dimensions does not imply worse retrieval.
- Based on published benchmarks, Qwen3-Embedding-0.6B should be competitive with or better than OpenAI `text-embedding-3-small` on average retrieval/classification-style text embedding tasks.
- It is slightly below OpenAI `text-embedding-3-large` on the published MTEB averages above, but much smaller operationally.

### Storage and index size

For raw float vectors:

- `1536` dims = 1536 floats
- `1024` dims = 1024 floats

That is about a `33%` reduction in vector width.

Practical implications:

- smaller chunk table footprint
- smaller vector index footprint
- somewhat faster similarity math and cheaper re-embedding storage

### Latency expectations

Expect latency to depend mostly on:

- CPU vs GPU
- batch size
- input token length
- host hardware

General expectations:

- CPU TEI is viable for local dev and small demo ingestion.
- GPU TEI is the better choice for larger corpora or repeated re-indexing.
- TEI’s dynamic batching should outperform naive per-request Python model loading.

## 7. Operational guidance

- Keep one embedding model per index. If you change models, re-embed all chunks.
- Keep query embeddings and chunk embeddings on the same model and dimension.
- Validate returned embedding length in the worker before writing to Postgres.
- Treat TEI as infrastructure: health checks, logs, restart policy, and persistent model cache matter.

## 8. What this does not replace

This removes OpenAI from the embeddings step only.

It does not answer later questions like:

- whether the Ask pipeline should use a generative LLM for answer synthesis
- whether skills/health extraction should use GraphRAG, a strict JSON extractor, or a hosted model

Those are separate layers. Embeddings are retrieval infrastructure, not answer generation.
