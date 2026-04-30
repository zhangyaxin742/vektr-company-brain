import asyncio

import httpx
import psycopg
from neo4j import GraphDatabase

from app.config import Settings


def _not_configured(name: str, summary: str) -> dict[str, str]:
    return {"name": name, "state": "not_configured", "summary": summary}


async def check_supabase_project(settings: Settings) -> dict[str, str]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return _not_configured(
            "Supabase project",
            "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to worker/.env.",
        )

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/settings",
                headers={
                    "apikey": settings.supabase_service_role_key.get_secret_value(),
                    "Authorization": (
                        "Bearer "
                        f"{settings.supabase_service_role_key.get_secret_value()}"
                    ),
                },
            )

        if response.is_success:
            return {
                "name": "Supabase project",
                "state": "ready",
                "summary": "Worker can reach the Supabase project APIs.",
            }

        return {
            "name": "Supabase project",
            "state": "error",
            "summary": f"Supabase returned HTTP {response.status_code}.",
        }
    except Exception as exc:  # pragma: no cover - surfaced through API
        return {
            "name": "Supabase project",
            "state": "error",
            "summary": str(exc),
        }


def _check_supabase_database_sync(settings: Settings) -> dict[str, str]:
    if not settings.supabase_db_url:
        return _not_configured(
            "Supabase Postgres",
            "Add SUPABASE_DB_URL to worker/.env for a direct database check.",
        )

    with psycopg.connect(
        settings.supabase_db_url.get_secret_value(), connect_timeout=5
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute("select current_database()")
            database_name = cursor.fetchone()[0]

    return {
        "name": "Supabase Postgres",
        "state": "ready",
        "summary": f"Connected to the {database_name} database.",
    }


async def check_supabase_database(settings: Settings) -> dict[str, str]:
    try:
        return await asyncio.to_thread(_check_supabase_database_sync, settings)
    except Exception as exc:  # pragma: no cover - surfaced through API
        return {
            "name": "Supabase Postgres",
            "state": "error",
            "summary": str(exc),
        }


def _check_neo4j_sync(settings: Settings) -> dict[str, str]:
    if not settings.neo4j_uri or not settings.neo4j_username or not settings.neo4j_password:
        return _not_configured(
            "Neo4j AuraDB",
            "Add NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD to worker/.env.",
        )

    with GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_username, settings.neo4j_password.get_secret_value()),
    ) as driver:
        driver.verify_connectivity()

        with driver.session() as session:
            result = session.run("RETURN 1 AS ok")
            result.single(strict=True)

    return {
        "name": "Neo4j AuraDB",
        "state": "ready",
        "summary": "Connected to Neo4j over the official Python driver.",
    }


async def check_neo4j(settings: Settings) -> dict[str, str]:
    try:
        return await asyncio.to_thread(_check_neo4j_sync, settings)
    except Exception as exc:  # pragma: no cover - surfaced through API
        return {
            "name": "Neo4j AuraDB",
            "state": "error",
            "summary": str(exc),
        }
