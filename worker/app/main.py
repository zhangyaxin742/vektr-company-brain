from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, status

from app.config import get_settings
from app.connectors import (
    check_neo4j,
    check_supabase_database,
    check_supabase_project,
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


@worker_router.post("/ingest/document", status_code=status.HTTP_202_ACCEPTED)
async def ingest_document():
    return _stub_payload("/worker/ingest/document")


@worker_router.post("/ingest/demo", status_code=status.HTTP_202_ACCEPTED)
async def ingest_demo():
    return _stub_payload("/worker/ingest/demo")


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
