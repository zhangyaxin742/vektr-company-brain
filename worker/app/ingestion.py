from __future__ import annotations

import asyncio
import hashlib
import json
import math
import random
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import quote

import httpx
import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from pydantic import BaseModel, ConfigDict, Field

from app.config import Settings

try:
    import tiktoken
except ImportError:  # pragma: no cover - optional runtime fallback
    tiktoken = None


EMBEDDING_DIMENSIONS = 1024
TARGET_CHUNK_TOKENS = 800
CHUNK_OVERLAP_TOKENS = 120
MAX_CHUNK_TOKENS = 1000
EMBEDDING_BATCH_SIZE = 16
EMBEDDING_MAX_ATTEMPTS = 4


class IngestValidationError(RuntimeError):
    pass


class DemoIngestRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(alias="jobId")
    org_id: str = Field(alias="orgId")
    org_slug: str = Field(alias="orgSlug")


class UploadIngestRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(alias="jobId")
    org_id: str = Field(alias="orgId")
    org_slug: str = Field(alias="orgSlug")
    triggered_by_user_id: str | None = Field(default=None, alias="triggeredByUserId")


class JobStatusPayload(BaseModel):
    childJobIds: list[str] = Field(default_factory=list)
    completedAt: str | None
    counts: dict[str, int]
    createdAt: str
    errorMessage: str | None
    jobId: str
    jobType: str
    message: str | None
    orgId: str
    orgSlug: str
    source: str
    startedAt: str | None
    status: str


@dataclass
class SourceArtifact:
    filename: str
    content_type: str
    payload: bytes
    source_name: str


@dataclass
class NormalizedDocument:
    filename: str
    source_type: str
    title: str
    raw_text: str
    metadata: dict[str, Any]
    source_date: str | None
    content_type: str
    payload: bytes
    sha256: str


def get_repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def get_seed_directory() -> Path:
    return get_repo_root() / "seed" / "acme"


def get_allowed_extensions(settings: Settings) -> set[str]:
    return {
        extension.strip().lower()
        for extension in settings.ingest_allowed_extensions.split(",")
        if extension.strip()
    }


def _get_encoder() -> Any | None:
    if tiktoken is None:
        return None

    try:
      return tiktoken.encoding_for_model("gpt-4o-mini")
    except Exception:  # pragma: no cover - encoding registry fallback
      try:
        return tiktoken.get_encoding("cl100k_base")
      except Exception:
        return None


def tokenize(text: str) -> list[str | int]:
    encoder = _get_encoder()

    if encoder is not None:
        return encoder.encode(text)

    return text.split()


def detokenize(tokens: list[str | int]) -> str:
    encoder = _get_encoder()

    if encoder is not None:
        return encoder.decode(tokens)

    return " ".join(str(token) for token in tokens)


def count_tokens(text: str) -> int:
    return len(tokenize(text))


def extract_markdown_sections(raw_text: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    current_heading = "Document"
    current_lines: list[str] = []

    for line in raw_text.splitlines():
        if line.startswith("#"):
            if current_lines:
                sections.append((current_heading, "\n".join(current_lines).strip()))
                current_lines = []

            current_heading = line.lstrip("#").strip() or current_heading

        current_lines.append(line)

    if current_lines:
        sections.append((current_heading, "\n".join(current_lines).strip()))

    return [section for section in sections if section[1]]


def extract_paragraph_blocks(raw_text: str) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []

    for match in re.finditer(r"\S[\s\S]*?(?:(?:\r?\n){2,}|$)", raw_text):
        text = match.group(0).strip()
        if not text:
            continue
        blocks.append(
            {
                "text": text,
                "start": match.start(),
                "end": match.start() + len(text),
            }
        )

    return blocks


def build_chunk_rows(
    raw_text: str,
    *,
    document_sha256: str,
    source_type: str,
    normalization_version: str,
) -> list[dict[str, Any]]:
    blocks = extract_paragraph_blocks(raw_text)

    if not blocks:
        return []

    chunks: list[dict[str, Any]] = []
    current_texts: list[str] = []
    current_start: int | None = None
    current_end: int | None = None
    overlap_seed = ""

    def flush_current() -> None:
        nonlocal current_texts, current_start, current_end, overlap_seed

        if not current_texts:
            return

        chunk_text = "\n\n".join(current_texts).strip()
        if not chunk_text:
            current_texts = []
            current_start = None
            current_end = None
            overlap_seed = ""
            return

        token_count = count_tokens(chunk_text)
        chunk_index = len(chunks)
        overlap_seed = detokenize(tokenize(chunk_text)[-CHUNK_OVERLAP_TOKENS:]).strip()
        chunks.append(
            {
                "chunk_index": chunk_index,
                "content": chunk_text,
                "metadata": {
                    "char_end": current_end,
                    "char_start": current_start,
                    "document_sha256": document_sha256,
                    "normalization_version": normalization_version,
                    "source_type": source_type,
                    "token_count": token_count,
                },
            }
        )
        current_texts = [overlap_seed] if overlap_seed else []
        current_start = None
        current_end = None

    for block in blocks:
        block_text = block["text"]
        if count_tokens(block_text) > MAX_CHUNK_TOKENS:
            flush_current()
            oversized_tokens = tokenize(block_text)
            step = max(MAX_CHUNK_TOKENS - CHUNK_OVERLAP_TOKENS, 1)

            for offset in range(0, len(oversized_tokens), step):
                slice_tokens = oversized_tokens[offset : offset + MAX_CHUNK_TOKENS]
                if not slice_tokens:
                    continue
                slice_text = detokenize(slice_tokens).strip()
                if not slice_text:
                    continue
                chunks.append(
                    {
                        "chunk_index": len(chunks),
                        "content": slice_text,
                        "metadata": {
                            "char_end": block["end"],
                            "char_start": block["start"],
                            "document_sha256": document_sha256,
                            "normalization_version": normalization_version,
                            "source_type": source_type,
                            "token_count": len(slice_tokens),
                        },
                    }
                )

            overlap_seed = detokenize(oversized_tokens[-CHUNK_OVERLAP_TOKENS:]).strip()
            current_texts = [overlap_seed] if overlap_seed else []
            current_start = None
            current_end = None
            continue

        prospective_text = "\n\n".join([*current_texts, block_text]).strip()
        if prospective_text and count_tokens(prospective_text) > TARGET_CHUNK_TOKENS:
            flush_current()

        current_texts.append(block_text)
        if current_start is None:
            current_start = block["start"]
        current_end = block["end"]

    flush_current()
    return chunks


def parse_source_date(raw_text: str, metadata: dict[str, Any]) -> str | None:
    for key in ("exported_at", "incident_date", "date", "last_updated"):
        value = metadata.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    match = re.search(
        r"(?im)^(?:Last updated|Date|Incident date):\s*([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}-\d{2})$",
        raw_text,
    )
    if match:
        return match.group(1).strip()

    return None


def normalize_slack_export(filename: str, content_type: str, payload: bytes, parsed: dict[str, Any]) -> NormalizedDocument:
    channel = parsed.get("channel", "slack-export")
    exported_at = parsed.get("exported_at")
    lines = [f"Slack Channel: {channel}"]
    if exported_at:
        lines.append(f"Exported At: {exported_at}")

    participants: set[str] = set()
    for message in parsed.get("messages", []):
        user = str(message.get("user", "Unknown")).strip()
        role = str(message.get("role", "")).strip()
        ts = str(message.get("ts", "")).strip()
        text = str(message.get("text", "")).strip()
        participants.add(user)
        speaker = f"{user} ({role})" if role else user
        lines.append(f"[{ts}] {speaker}: {text}")

    raw_text = "\n\n".join(lines).strip()
    sha256 = hashlib.sha256(payload).hexdigest()
    metadata = {
        "channel": channel,
        "exported_at": exported_at,
        "message_count": len(parsed.get("messages", [])),
        "participants": sorted(participants),
        "parser_version": "v1",
        "source_name": "slack_json",
    }
    return NormalizedDocument(
        filename=filename,
        source_type="slack_json",
        title=f"Slack: {channel}",
        raw_text=raw_text,
        metadata=metadata,
        source_date=parse_source_date(raw_text, metadata),
        content_type=content_type,
        payload=payload,
        sha256=sha256,
    )


def normalize_email_export(filename: str, content_type: str, payload: bytes, parsed: dict[str, Any]) -> NormalizedDocument:
    threads = parsed.get("threads", [])
    lines = ["Email Threads Export"]
    participants: set[str] = set()

    for thread in threads:
        subject = str(thread.get("subject", "Untitled Thread")).strip()
        lines.append(f"Subject: {subject}")
        for message in thread.get("messages", []):
            sender = str(message.get("from", "Unknown")).strip()
            sent_at = str(message.get("sent_at", "")).strip()
            body = str(message.get("body", "")).strip()
            recipients = ", ".join(
                recipient.strip()
                for recipient in message.get("to", [])
                if isinstance(recipient, str) and recipient.strip()
            )
            participants.add(sender)
            if recipients:
                lines.append(f"[{sent_at}] From: {sender} | To: {recipients}")
            else:
                lines.append(f"[{sent_at}] From: {sender}")
            lines.append(body)
        lines.append("")

    raw_text = "\n\n".join(line for line in lines if line is not None).strip()
    sha256 = hashlib.sha256(payload).hexdigest()
    metadata = {
        "exported_at": parsed.get("exported_at"),
        "parser_version": "v1",
        "source_name": "email_json",
        "thread_count": len(threads),
        "participants": sorted(participants),
    }
    return NormalizedDocument(
        filename=filename,
        source_type="email_json",
        title="Email Threads",
        raw_text=raw_text,
        metadata=metadata,
        source_date=parse_source_date(raw_text, metadata),
        content_type=content_type,
        payload=payload,
        sha256=sha256,
    )


def normalize_markdown(filename: str, content_type: str, payload: bytes, raw_text: str) -> NormalizedDocument:
    sha256 = hashlib.sha256(payload).hexdigest()
    sections = extract_markdown_sections(raw_text)
    title = sections[0][0] if sections else Path(filename).stem.replace("-", " ").title()
    metadata = {
        "heading_count": len(sections),
        "normalization_version": "v1",
        "parser_version": "v1",
        "source_name": "markdown",
    }
    return NormalizedDocument(
        filename=filename,
        source_type="markdown",
        title=title,
        raw_text=raw_text.strip(),
        metadata=metadata,
        source_date=parse_source_date(raw_text, metadata),
        content_type=content_type,
        payload=payload,
        sha256=sha256,
    )


def normalize_text_document(filename: str, content_type: str, payload: bytes, raw_text: str, *, source_name: str) -> NormalizedDocument:
    normalized = raw_text.replace("\r\n", "\n").replace("\r", "\n").strip()
    sha256 = hashlib.sha256(payload).hexdigest()
    title = Path(filename).stem.replace("-", " ").replace("_", " ").title()
    metadata = {
        "normalization_version": "v1",
        "parser_version": "v1",
        "source_name": source_name,
    }
    return NormalizedDocument(
        filename=filename,
        source_type="text",
        title=title,
        raw_text=normalized,
        metadata=metadata,
        source_date=parse_source_date(normalized, metadata),
        content_type=content_type,
        payload=payload,
        sha256=sha256,
    )


def normalize_document(artifact: SourceArtifact, *, is_demo_seed: bool) -> NormalizedDocument:
    extension = Path(artifact.filename).suffix.lower()
    content_type = artifact.content_type or "application/octet-stream"
    raw_text = artifact.payload.decode("utf-8-sig")

    if extension == ".json":
        parsed = json.loads(raw_text)
        if isinstance(parsed, dict) and isinstance(parsed.get("messages"), list):
            document = normalize_slack_export(
                artifact.filename,
                content_type,
                artifact.payload,
                parsed,
            )
        elif isinstance(parsed, dict) and isinstance(parsed.get("threads"), list):
            document = normalize_email_export(
                artifact.filename,
                content_type,
                artifact.payload,
                parsed,
            )
        else:
            pretty = json.dumps(parsed, indent=2, ensure_ascii=True)
            document = normalize_text_document(
                artifact.filename,
                content_type,
                artifact.payload,
                pretty,
                source_name="json_fallback",
            )
    elif extension == ".md":
        document = normalize_markdown(
            artifact.filename,
            content_type,
            artifact.payload,
            raw_text,
        )
    elif extension == ".txt":
        document = normalize_text_document(
            artifact.filename,
            content_type,
            artifact.payload,
            raw_text,
            source_name="text",
        )
    else:
        raise IngestValidationError(f"Unsupported file extension: {extension}")

    document.metadata.update(
        {
            "byte_size": len(artifact.payload),
            "content_type": content_type,
            "filename": artifact.filename,
            "is_demo_seed": is_demo_seed,
            "sha256": document.sha256,
        }
    )
    return document


def vector_literal(values: list[float]) -> str:
    return "[" + ",".join(f"{value:.8f}" for value in values) + "]"


def _connect(settings: Settings):
    if not settings.supabase_db_url:
        raise RuntimeError("SUPABASE_DB_URL is required for ingestion.")

    return psycopg.connect(
        settings.supabase_db_url.get_secret_value(),
        connect_timeout=10,
        row_factory=dict_row,
    )


def get_job_row(settings: Settings, job_id: str) -> dict[str, Any]:
    with _connect(settings) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select
                  job.*,
                  organization.slug as org_slug
                from public.pipeline_jobs as job
                inner join public.organizations as organization
                  on organization.id = job.org_id
                where job.id = %s
                """,
                (job_id,),
            )
            row = cursor.fetchone()

    if not row:
        raise RuntimeError(f"Pipeline job {job_id} was not found.")

    return row


def build_job_status_payload(settings: Settings, job_id: str) -> dict[str, Any]:
    row = get_job_row(settings, job_id)
    result = row.get("result") if isinstance(row.get("result"), dict) else {}
    counts = result.get("counts") if isinstance(result.get("counts"), dict) else {}
    child_job_ids = (
        result.get("childJobIds") if isinstance(result.get("childJobIds"), list) else []
    )
    return JobStatusPayload(
        childJobIds=child_job_ids,
        completedAt=row.get("completed_at").isoformat() if row.get("completed_at") else None,
        counts={
            "childJobsQueued": int(counts.get("childJobsQueued", 0)),
            "chunks": int(counts.get("chunks", 0)),
            "documents": int(counts.get("documents", 0)),
            "embeddings": int(counts.get("embeddings", 0)),
            "failures": int(counts.get("failures", 0)),
            "filesAccepted": int(counts.get("filesAccepted", 0)),
            "filesRejected": int(counts.get("filesRejected", 0)),
            "warnings": int(counts.get("warnings", 0)),
        },
        createdAt=row["created_at"].isoformat(),
        errorMessage=row.get("error_message"),
        jobId=row["id"],
        jobType=row["job_type"],
        message=result.get("message"),
        orgId=row["org_id"],
        orgSlug=row["org_slug"],
        source=row["source"],
        startedAt=row.get("started_at").isoformat() if row.get("started_at") else None,
        status=row["status"],
    ).model_dump()


def _update_job_status(
    settings: Settings,
    *,
    job_id: str,
    status: str,
    result: dict[str, Any] | None = None,
    error_message: str | None = None,
) -> None:
    with _connect(settings) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                update public.pipeline_jobs
                set
                  status = %s,
                  started_at = case
                    when %s = 'running' and started_at is null then now()
                    else started_at
                  end,
                  completed_at = case
                    when %s in ('completed', 'failed', 'partial') then now()
                    else completed_at
                  end,
                  error_message = %s,
                  result = coalesce(%s, result)
                where id = %s
                """,
                (
                    status,
                    status,
                    status,
                    error_message,
                    Jsonb(result) if result is not None else None,
                    job_id,
                ),
            )
        connection.commit()


def _create_child_graphrag_job(
    connection: psycopg.Connection[Any],
    *,
    org_id: str,
    parent_job_id: str,
) -> str:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            insert into public.pipeline_jobs (
              org_id,
              parent_job_id,
              job_type,
              status,
              source,
              payload,
              result
            )
            values (%s, %s, 'graphrag_index', 'queued', 'system', %s, '{}'::jsonb)
            returning id
            """,
            (
                org_id,
                parent_job_id,
                Jsonb({"queued_by_parent_job_id": parent_job_id}),
            ),
        )
        return str(cursor.fetchone()["id"])


def _reset_demo_workspace(
    connection: psycopg.Connection[Any],
    *,
    org_id: str,
) -> None:
    with connection.cursor() as cursor:
        cursor.execute("delete from public.ask_logs where org_id = %s", (org_id,))
        cursor.execute("delete from public.health_flags where org_id = %s", (org_id,))
        cursor.execute("delete from public.skills where org_id = %s", (org_id,))
        cursor.execute("delete from public.documents where org_id = %s", (org_id,))


def _insert_document(
    connection: psycopg.Connection[Any],
    *,
    org_id: str,
    title: str,
    source_type: str,
    source_date: str | None,
    storage_path: str,
    raw_text: str,
    metadata: dict[str, Any],
) -> str:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            insert into public.documents (
              org_id,
              title,
              source_type,
              source_date,
              storage_path,
              raw_text,
              metadata
            )
            values (%s, %s, %s, %s, %s, %s, %s)
            returning id
            """,
            (
                org_id,
                title,
                source_type,
                source_date,
                storage_path,
                raw_text,
                Jsonb(metadata),
            ),
        )
        row = cursor.fetchone()
        return str(row["id"])


def _insert_chunks(
    connection: psycopg.Connection[Any],
    *,
    org_id: str,
    document_id: str,
    chunks: list[dict[str, Any]],
    embeddings: list[list[float]],
) -> None:
    with connection.cursor() as cursor:
        for chunk, embedding in zip(chunks, embeddings, strict=True):
            cursor.execute(
                """
                insert into public.chunks (
                  org_id,
                  document_id,
                  chunk_index,
                  content,
                  embedding,
                  metadata
                )
                values (%s, %s, %s, %s, (%s)::vector, %s)
                """,
                (
                    org_id,
                    document_id,
                    chunk["chunk_index"],
                    chunk["content"],
                    vector_literal(embedding),
                    Jsonb(chunk["metadata"]),
                ),
            )


async def upload_to_supabase_storage(
    settings: Settings,
    *,
    storage_path: str,
    content_type: str,
    payload: bytes,
) -> None:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase URL and service role key are required for storage uploads.")

    url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{quote(storage_path)}"
    )
    headers = {
        "apikey": settings.supabase_service_role_key.get_secret_value(),
        "Authorization": f"Bearer {settings.supabase_service_role_key.get_secret_value()}",
        "Content-Type": content_type or "application/octet-stream",
        "x-upsert": "false",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, content=payload)

    if response.status_code >= 400:
        raise RuntimeError(
            f"Supabase storage upload failed with HTTP {response.status_code}: {response.text}"
        )


async def embed_text_batch(settings: Settings, texts: list[str]) -> list[list[float]]:
    payload = {
        "input": texts,
        "model": settings.embeddings_model,
    }
    headers = {"Content-Type": "application/json"}

    for attempt in range(EMBEDDING_MAX_ATTEMPTS):
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.embeddings_base_url.rstrip('/')}/embeddings",
                headers=headers,
                json=payload,
            )

        if response.status_code < 400:
            data = response.json().get("data", [])
            embeddings = [item["embedding"] for item in sorted(data, key=lambda item: item["index"])]
            if any(len(embedding) != EMBEDDING_DIMENSIONS for embedding in embeddings):
                raise RuntimeError("Embedding dimensionality did not match the database schema.")
            return embeddings

        if response.status_code not in {429, 500, 502, 503, 504}:
            raise RuntimeError(
                f"Embedding request failed with HTTP {response.status_code}: {response.text}"
            )

        if attempt == EMBEDDING_MAX_ATTEMPTS - 1:
            raise RuntimeError(
                f"Embedding request failed after retries with HTTP {response.status_code}."
            )

        delay_seconds = min(8.0, math.pow(2, attempt)) + random.random()
        await asyncio.sleep(delay_seconds)

    raise RuntimeError("Embedding request exhausted retries unexpectedly.")


async def embed_chunks(settings: Settings, chunk_rows: list[dict[str, Any]]) -> list[list[float]]:
    embeddings: list[list[float]] = []

    for offset in range(0, len(chunk_rows), EMBEDDING_BATCH_SIZE):
        batch = chunk_rows[offset : offset + EMBEDDING_BATCH_SIZE]
        batch_embeddings = await embed_text_batch(
            settings,
            [chunk["content"] for chunk in batch],
        )
        embeddings.extend(batch_embeddings)

    return embeddings


def get_storage_path(org_id: str, job_id: str, document: NormalizedDocument) -> str:
    safe_name = re.sub(r"[^a-zA-Z0-9._-]+", "-", document.filename).strip("-") or "document"
    return f"org/{org_id}/{job_id}/{document.sha256[:16]}-{safe_name}"


def load_demo_artifacts(settings: Settings) -> list[SourceArtifact]:
    seed_dir = get_seed_directory()
    allowed_extensions = get_allowed_extensions(settings)
    artifacts: list[SourceArtifact] = []

    for path in sorted(seed_dir.iterdir()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in allowed_extensions:
            continue
        content_type = {
            ".json": "application/json",
            ".md": "text/markdown",
            ".txt": "text/plain",
        }.get(path.suffix.lower(), "application/octet-stream")
        artifacts.append(
            SourceArtifact(
                filename=path.name,
                content_type=content_type,
                payload=path.read_bytes(),
                source_name="public_demo",
            )
        )

    if not artifacts:
        raise RuntimeError("No demo seed artifacts were found.")

    return artifacts


def validate_artifacts(settings: Settings, artifacts: list[SourceArtifact]) -> None:
    allowed_extensions = get_allowed_extensions(settings)

    for artifact in artifacts:
        extension = Path(artifact.filename).suffix.lower()
        if extension not in allowed_extensions:
            raise IngestValidationError(f"Unsupported file type: {artifact.filename}")
        if len(artifact.payload) > settings.ingest_max_upload_bytes:
            raise IngestValidationError(
                f"{artifact.filename} exceeded the upload limit of {settings.ingest_max_upload_bytes} bytes."
            )


async def process_artifacts(
    settings: Settings,
    *,
    job_id: str,
    org_id: str,
    artifacts: list[SourceArtifact],
    is_demo_seed: bool,
) -> dict[str, Any]:
    counts = {
        "childJobsQueued": 0,
        "chunks": 0,
        "documents": 0,
        "embeddings": 0,
        "failures": 0,
        "filesAccepted": 0,
        "filesRejected": 0,
        "warnings": 0,
    }

    _update_job_status(
        settings,
        job_id=job_id,
        status="running",
        result={"childJobIds": [], "counts": counts, "message": "Processing ingestion job."},
        error_message=None,
    )

    validate_artifacts(settings, artifacts)
    child_job_ids: list[str] = []

    with _connect(settings) as connection:
        if is_demo_seed:
            _reset_demo_workspace(connection, org_id=org_id)

        for artifact in artifacts:
            try:
                normalized = normalize_document(artifact, is_demo_seed=is_demo_seed)
                chunk_rows = build_chunk_rows(
                    normalized.raw_text,
                    document_sha256=normalized.sha256,
                    source_type=normalized.source_type,
                    normalization_version="v1",
                )
                if not chunk_rows:
                    raise RuntimeError("No chunkable content was produced.")
                embeddings = await embed_chunks(settings, chunk_rows)
                storage_path = get_storage_path(org_id, job_id, normalized)
                await upload_to_supabase_storage(
                    settings,
                    storage_path=storage_path,
                    content_type=normalized.content_type,
                    payload=normalized.payload,
                )

                metadata = {
                    **normalized.metadata,
                    "storage_path": storage_path,
                }
                document_id = _insert_document(
                    connection,
                    org_id=org_id,
                    title=normalized.title,
                    source_type=normalized.source_type,
                    source_date=normalized.source_date,
                    storage_path=storage_path,
                    raw_text=normalized.raw_text,
                    metadata=metadata,
                )
                _insert_chunks(
                    connection,
                    org_id=org_id,
                    document_id=document_id,
                    chunks=chunk_rows,
                    embeddings=embeddings,
                )
                connection.commit()

                counts["documents"] += 1
                counts["chunks"] += len(chunk_rows)
                counts["embeddings"] += len(embeddings)
                counts["filesAccepted"] += 1
            except Exception:
                connection.rollback()
                counts["failures"] += 1
                counts["filesRejected"] += 1

        child_job_ids.append(
            _create_child_graphrag_job(
                connection,
                org_id=org_id,
                parent_job_id=job_id,
            )
        )
        connection.commit()

    counts["childJobsQueued"] = len(child_job_ids)
    status = "completed" if counts["failures"] == 0 else "partial"
    message = (
        "Ingestion complete."
        if status == "completed"
        else "Ingestion completed with partial failures."
    )
    result = {
        "childJobIds": child_job_ids,
        "counts": counts,
        "message": message,
    }
    _update_job_status(
        settings,
        job_id=job_id,
        status=status,
        result=result,
        error_message=None,
    )
    return result


async def run_demo_ingest_job(settings: Settings, request: DemoIngestRequest) -> None:
    try:
        artifacts = load_demo_artifacts(settings)
        await process_artifacts(
            settings,
            job_id=request.job_id,
            org_id=request.org_id,
            artifacts=artifacts,
            is_demo_seed=True,
        )
    except Exception as exc:
        _update_job_status(
            settings,
            job_id=request.job_id,
            status="failed",
            result={
                "childJobIds": [],
                "counts": {
                    "childJobsQueued": 0,
                    "chunks": 0,
                    "documents": 0,
                    "embeddings": 0,
                    "failures": 1,
                    "filesAccepted": 0,
                    "filesRejected": 0,
                    "warnings": 0,
                },
                "message": "Demo ingestion failed.",
            },
            error_message=str(exc),
        )


async def run_upload_ingest_job(
    settings: Settings,
    request: UploadIngestRequest,
    artifacts: list[SourceArtifact],
) -> None:
    try:
        await process_artifacts(
            settings,
            job_id=request.job_id,
            org_id=request.org_id,
            artifacts=artifacts,
            is_demo_seed=False,
        )
    except Exception as exc:
        _update_job_status(
            settings,
            job_id=request.job_id,
            status="failed",
            result={
                "childJobIds": [],
                "counts": {
                    "childJobsQueued": 0,
                    "chunks": 0,
                    "documents": 0,
                    "embeddings": 0,
                    "failures": 1,
                    "filesAccepted": 0,
                    "filesRejected": 0,
                    "warnings": 0,
                },
                "message": "Upload ingestion failed.",
            },
            error_message=str(exc),
        )
