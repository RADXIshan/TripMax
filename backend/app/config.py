import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

# Ensure .env is loaded regardless of current working directory
backend_dir = Path(__file__).resolve().parent.parent
root_dir = backend_dir.parent
for env_candidate in [backend_dir / ".env", root_dir / ".env", Path(".env")]:
    if env_candidate.exists():
        load_dotenv(dotenv_path=env_candidate, override=False)
load_dotenv()

class Settings(BaseSettings):
    PORT: int = 8000
    CLIENT_URL: str = "http://localhost:5173"
    GEMINI_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    DEFAULT_CURRENCY: str = "USD"

    class Config:
        env_file = [str(backend_dir / ".env"), str(root_dir / ".env"), ".env"]
        extra = "ignore"

settings = Settings()

# Runtime in-memory key overrides
runtime_keys = {
    "gemini": os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY or "",
    "tavily": os.getenv("TAVILY_API_KEY") or settings.TAVILY_API_KEY or ""
}

def get_gemini_key() -> str:
    key = runtime_keys.get("gemini") or os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None) or ""
    if not key:
        for env_path in [backend_dir / ".env", root_dir / ".env", Path(".env")]:
            if env_path.exists():
                try:
                    from dotenv import dotenv_values
                    vals = dotenv_values(env_path)
                    val = vals.get("GEMINI_API_KEY")
                    if val and val.strip():
                        key = val.strip()
                        runtime_keys["gemini"] = key
                        os.environ["GEMINI_API_KEY"] = key
                        break
                except Exception:
                    pass
    return key.strip() if key else ""

def get_tavily_key() -> str:
    key = runtime_keys.get("tavily") or os.getenv("TAVILY_API_KEY") or getattr(settings, "TAVILY_API_KEY", None) or ""
    if not key:
        for env_path in [backend_dir / ".env", root_dir / ".env", Path(".env")]:
            if env_path.exists():
                try:
                    from dotenv import dotenv_values
                    vals = dotenv_values(env_path)
                    val = vals.get("TAVILY_API_KEY")
                    if val and val.strip():
                        key = val.strip()
                        runtime_keys["tavily"] = key
                        os.environ["TAVILY_API_KEY"] = key
                        break
                except Exception:
                    pass
    return key.strip() if key else ""

def set_runtime_keys(gemini: Optional[str] = None, tavily: Optional[str] = None):
    if gemini is not None:
        runtime_keys["gemini"] = gemini.strip()
    if tavily is not None:
        runtime_keys["tavily"] = tavily.strip()
