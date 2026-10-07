from fastapi import APIRouter, HTTPException
from app.models.trip import ChatRequest
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("")
async def chat_interaction(payload: ChatRequest):
    try:
        result = await orchestrator.handle_chat(
            message=payload.message,
            history=payload.history,
            preferences=payload.preferences
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
