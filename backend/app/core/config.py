import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeceptiTrace API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    ADAPTION_API_KEY: str = os.getenv("ADAPTION_API_KEY", "")
    ADAPTION_PROJECT_ID: str = os.getenv("ADAPTION_PROJECT_ID", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
