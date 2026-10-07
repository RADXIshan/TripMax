from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.config import get_gemini_key, get_tavily_key, set_runtime_keys

router = APIRouter(prefix="/api/config", tags=["Config"])

class KeyUpdateRequest(BaseModel):
    gemini_key: Optional[str] = None
    tavily_key: Optional[str] = None

@router.get("")
def get_config_status():
    gemini = get_gemini_key()
    tavily = get_tavily_key()
    return {
        "gemini_configured": bool(gemini),
        "gemini_masked": f"{gemini[:4]}...{gemini[-4:]}" if len(gemini) > 8 else ("Set" if gemini else "Not configured"),
        "tavily_configured": bool(tavily),
        "tavily_masked": f"{tavily[:4]}...{tavily[-4:]}" if len(tavily) > 8 else ("Set" if tavily else "Not configured"),
        "search_engine": "Tavily AI" if tavily else "DuckDuckGo Live (Built-in Free)"
    }

@router.post("")
def update_config(payload: KeyUpdateRequest):
    set_runtime_keys(gemini=payload.gemini_key, tavily=payload.tavily_key)
    return {"status": "success", "message": "API keys updated successfully"}
