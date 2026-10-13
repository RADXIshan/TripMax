import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from app.config import get_firecrawl_url, get_firecrawl_key

class FirecrawlService:
    """
    Firecrawl MCP & REST Service for deep-web scraping and live search.
    Provides verified tourist attraction intel, pricing, hidden gems, and structured markdown.
    """

    def __init__(self):
        self.base_api_url = "https://api.firecrawl.dev/v1"

    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Executes a real-time deep web search via Firecrawl.
        Returns structured titles, URLs, snippets, and markdown content.
        """
        api_key = get_firecrawl_key()
        if not api_key:
            return []

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "query": query,
            "limit": limit
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(f"{self.base_api_url}/search", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data.get("data", []):
                        results.append({
                            "title": item.get("title", ""),
                            "url": item.get("url", ""),
                            "snippet": item.get("description", "") or item.get("snippet", "") or (item.get("markdown", "")[:280] if item.get("markdown") else ""),
                            "markdown": item.get("markdown", "")
                        })
                    return results
                else:
                    print(f"[FirecrawlService] Search error {res.status_code}: {res.text[:120]}", flush=True)
        except Exception as e:
            print(f"[FirecrawlService] Search exception: {e}", flush=True)

        return []

    async def scrape(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrapes a full page to clean markdown and metadata using Firecrawl.
        """
        api_key = get_firecrawl_key()
        if not api_key or not url:
            return None

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": url,
            "formats": ["markdown"]
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{self.base_api_url}/scrape", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    scrape_data = data.get("data", {})
                    return {
                        "url": url,
                        "title": scrape_data.get("metadata", {}).get("title", ""),
                        "markdown": scrape_data.get("markdown", ""),
                        "description": scrape_data.get("metadata", {}).get("description", "")
                    }
        except Exception as e:
            print(f"[FirecrawlService] Scrape exception for {url}: {e}", flush=True)

        return None

    async def research_destination(
        self,
        destination: str,
        origin: str,
        budget_currency: str = "INR",
        budget_amount: Optional[float] = None,
        interests: Optional[List[str]] = None,
        party_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive destination research combining queries tailored to user's
        budget, interests, and travelers party type.
        """
        interest_text = " ".join(interests) if interests else "culture history food sightseeing"
        queries = [
            f"{destination} top attractions hidden gems {interest_text} travel guide",
            f"{destination} realistic budget guide {budget_currency} daily costs tourist places",
            f"{destination} must eat traditional dishes iconic restaurants"
        ]

        tasks = [self.search(q, limit=3) for q in queries]
        all_results = await asyncio.gather(*tasks, return_exceptions=True)

        flat_results: List[Dict[str, Any]] = []
        for r in all_results:
            if isinstance(r, list):
                flat_results.extend(r)

        # De-duplicate by URL
        seen_urls = set()
        unique_results = []
        for item in flat_results:
            u = item.get("url")
            if u and u not in seen_urls:
                seen_urls.add(u)
                unique_results.append(item)

        # If info not found or fewer than 3 sources, sequentially scrape destination knowledge sites
        if len(unique_results) < 3:
            clean_dest = destination.split(",")[0].strip().replace(" ", "_")
            fallback_sites = [
                f"https://en.wikipedia.org/wiki/{clean_dest}",
                f"https://whc.unesco.org/en/list/?search={clean_dest.replace('_', '+')}"
            ]
            for fb_url in fallback_sites:
                try:
                    scraped = await self.scrape(fb_url)
                    if scraped and scraped.get("title"):
                        unique_results.append({
                            "title": scraped["title"],
                            "url": fb_url,
                            "snippet": scraped.get("description") or (scraped.get("markdown", "")[:280] if scraped.get("markdown") else f"Verified intelligence for {destination}"),
                            "markdown": scraped.get("markdown", "")
                        })
                        if len(unique_results) >= 4:
                            break
                except Exception:
                    pass

        return {
            "destination": destination,
            "sources": unique_results,
            "total_found": len(unique_results)
        }

firecrawl_service = FirecrawlService()
