from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    worker_host: str = "127.0.0.1"
    worker_port: int = 8000
    supabase_url: str | None = None
    supabase_service_role_key: SecretStr | None = None
    supabase_db_url: SecretStr | None = None
    supabase_storage_bucket: str = "documents"
    neo4j_uri: str | None = None
    neo4j_username: str | None = None
    neo4j_password: SecretStr | None = None
    embeddings_base_url: str = "http://127.0.0.1:8080/v1"
    embeddings_model: str = "text-embeddings-inference"
    worker_shared_secret: SecretStr | None = None
    ingest_max_upload_bytes: int = 10 * 1024 * 1024
    ingest_allowed_extensions: str = ".json,.md,.txt"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
