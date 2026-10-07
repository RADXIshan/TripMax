import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PORT: int = 8000
    CLIENT_URL: str = "http://localhost:5173"
    GEMINI_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    DEFAULT_CURRENCY: str = "USD"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Runtime in-memory key overrides (can be provided via frontend Settings modal)
runtime_keys = {
    "gemini": os.getenv("GEMINI_API_KEY") or "",
    "tavily": os.getenv("TAVILY_API_KEY") or ""
}

def get_gemini_key() -> str:
    return runtime_keys.get("gemini") or os.getenv("GEMINI_API_KEY") or ""

def get_tavily_key() -> str:
    return runtime_keys.get("tavily") or os.getenv("TAVILY_API_KEY") or ""

def set_runtime_keys(gemini: Optional[str] = None, tavily: Optional[str] = None):
    if gemini is not None:
        runtime_keys["gemini"] = gemini.strip()
    if tavily is not None:
        runtime_keys["tavily"] = tavily.strip()
