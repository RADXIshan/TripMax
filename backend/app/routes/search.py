from fastapi import APIRouter
from app.services.search_service import search_service

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("/live")
async def live_search(q: str):
    results = await search_service.search(q, max_results=5)
    return {"query": q, "results": results}
