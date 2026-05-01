from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, FastAPI, File, Form, Header, HTTPException, UploadFile, status

from app.config import get_settings
from app.connectors import (
    check_neo4j,
    check_supabase_database,
    check_supabase_project,
)
from app.ingestion import (
    DemoIngestRequest,
    SourceArtifact,
    UploadIngestRequest,
    build_job_status_payload,
    get_allowed_extensions,
    run_demo_ingest_job,
    run_upload_ingest_job,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(
    title="Vektr Worker",
    version="0.1.0",
    summary="FastAPI worker scaffold for ingestion, GraphRAG, and connector health.",
    lifespan=lifespan,
)

worker_router = APIRouter(prefix="/worker", tags=["worker"])


@app.get("/")
async def root():
    settings = get_settings()
    return {
        "name": "Vektr Worker",
        "environment": settings.app_env,
        "docs": "/docs",
        "worker_prefix": "/worker",
    }


@worker_router.get("/health")
async def worker_health():
    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.app_env,
        "host": settings.worker_host,
        "port": settings.worker_port,
    }


@worker_router.get("/health/connectors")
async def worker_health_connectors():
    settings = get_settings()
    checks = [
        await check_supabase_project(settings),
        await check_supabase_database(settings),
        await check_neo4j(settings),
    ]

    overall = (
        "ready"
        if all(check["state"] == "ready" for check in checks)
        else "partial"
        if any(check["state"] == "ready" for check in checks)
        else "not_configured"
    )

    return {"status": overall, "checks": checks}


def _stub_payload(name: str) -> dict[str, str]:
    return {
        "status": "stub",
        "route": name,
        "message": "This worker route is scaffolded for the sprint and not implemented yet.",
    }


def _require_worker_secret(x_worker_secret: str | None) -> None:
    settings = get_settings()

    if not settings.worker_shared_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WORKER_SHARED_SECRET is not configured.",
        )

    if x_worker_secret != settings.worker_shared_secret.get_secret_value():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid worker secret.",
        )


@worker_router.post("/ingest/demo", status_code=status.HTTP_202_ACCEPTED)
async def ingest_demo(
    request: DemoIngestRequest,
    background_tasks: BackgroundTasks,
    x_worker_secret: str | None = Header(default=None, alias="x-worker-secret"),
):
    _require_worker_secret(x_worker_secret)
    settings = get_settings()
    background_tasks.add_task(run_demo_ingest_job, settings, request)
    return build_job_status_payload(settings, request.job_id)


@worker_router.post("/ingest/document", status_code=status.HTTP_202_ACCEPTED)
async def ingest_document(
    background_tasks: BackgroundTasks,
    job_id: str = Form(...),
    org_id: str = Form(...),
    org_slug: str = Form(...),
    triggered_by_user_id: str | None = Form(default=None),
    files: list[UploadFile] = File(...),
    x_worker_secret: str | None = Header(default=None, alias="x-worker-secret"),
):
    _require_worker_secret(x_worker_secret)
    settings = get_settings()
    allowed_extensions = get_allowed_extensions(settings)
    artifacts: list[SourceArtifact] = []

    for file in files:
        extension = Path(file.filename or "").suffix.lower()
        if extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type for {file.filename}.",
            )
        payload = await file.read()
        artifacts.append(
            SourceArtifact(
                filename=file.filename or "upload",
                content_type=file.content_type or "application/octet-stream",
                payload=payload,
                source_name="authenticated_upload",
            )
        )

    request = UploadIngestRequest(
        jobId=job_id,
        orgId=org_id,
        orgSlug=org_slug,
        triggeredByUserId=triggered_by_user_id,
    )
    background_tasks.add_task(run_upload_ingest_job, settings, request, artifacts)
    return build_job_status_payload(settings, request.job_id)


@worker_router.post("/graphrag/index", status_code=status.HTTP_202_ACCEPTED)
async def graphrag_index():
    return _stub_payload("/worker/graphrag/index")


@worker_router.post("/graphrag/import-neo4j", status_code=status.HTTP_202_ACCEPTED)
async def import_neo4j():
    return _stub_payload("/worker/graphrag/import-neo4j")


@worker_router.post("/extract/fallback", status_code=status.HTTP_202_ACCEPTED)
async def extract_fallback():
    return _stub_payload("/worker/extract/fallback")


@worker_router.post("/skills/generate", status_code=status.HTTP_202_ACCEPTED)
async def skills_generate():
    return _stub_payload("/worker/skills/generate")


@worker_router.post("/health/generate", status_code=status.HTTP_202_ACCEPTED)
async def health_generate():
    return _stub_payload("/worker/health/generate")


app.include_router(worker_router)
