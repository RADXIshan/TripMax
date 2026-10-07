import asyncio
import httpx
from typing import List, Dict, Any
from app.config import get_tavily_key

class SearchService:
    @staticmethod
    async def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Perform search using ddgs library in threadpool"""
        def _sync_search():
            try:
                from ddgs import DDGS
                results = []
                with DDGS() as ddgs:
                    for r in ddgs.text(query, max_results=max_results):
                        results.append({
                            "title": r.get("title", ""),
                            "url": r.get("href", ""),
                            "snippet": r.get("body", "")
                        })
                return results
            except Exception as e:
                print(f"[SearchService] DDGS error: {e}", flush=True)
                return []

        return await asyncio.to_thread(_sync_search)

    @staticmethod
    async def search_tavily(query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Search using Tavily API if key is present"""
        tavily_key = get_tavily_key()
        if not tavily_key:
            return []
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": tavily_key,
                        "query": query,
                        "search_depth": "basic",
                        "max_results": max_results,
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data.get("results", []):
                        results.append({
                            "title": item.get("title", ""),
                            "url": item.get("url", ""),
                            "snippet": item.get("content", "")
                        })
                    return results
        except Exception as e:
            print(f"[SearchService] Tavily error: {e}", flush=True)
        return []

    @classmethod
    async def multi_search(cls, queries: List[str], max_per_query: int = 4) -> List[Dict[str, str]]:
        """Run multiple queries concurrently and deduplicate by URL"""
        tasks = []
        for q in queries:
            tasks.append(cls.search(q, max_results=max_per_query))
        
        all_res = await asyncio.gather(*tasks, return_exceptions=True)
        unique_results = {}
        
        for res_group in all_res:
            if isinstance(res_group, list):
                for item in res_group:
                    url = item.get("url")
                    if url and url not in unique_results:
                        unique_results[url] = item
                        
        return list(unique_results.values())

    @classmethod
    async def search(cls, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Unified search trying Tavily first if key is set, otherwise DDGS"""
        tavily_key = get_tavily_key()
        if tavily_key:
            results = await cls.search_tavily(query, max_results=max_results)
            if results:
                return results

        # Fallback to DDGS
        results = await cls.search_duckduckgo(query, max_results=max_results)
        return results

search_service = SearchService()
