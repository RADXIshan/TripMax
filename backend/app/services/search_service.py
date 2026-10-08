import asyncio
import re
import urllib.parse
from typing import List, Dict, Any
import httpx
from app.config import get_tavily_key

AD_DOMAINS = [
    "bing.com/aclick",
    "googleadservices.com",
    "doubleclick.net",
    "ad.doubleclick",
    "syndication",
    "advertising",
    "adclick",
    "bat.bing.com",
    "clickserve"
]

AD_QUERY_PARAMS = {
    "cmp", "ad_id", "adgroup_id", "partner_id", "keyword", "target_id",
    "feed_item_id", "bid_match_type", "match_type", "network",
    "loc_interest_ms", "loc_physical_ms", "msclkid", "gclid", "fbclid",
    "wbraid", "gbraid", "utm_source", "utm_medium", "utm_campaign",
    "utm_term", "utm_content", "utm_adgroup", "utm_keyword", "utm_query"
}

def clean_url(raw_url: str) -> str:
    if not raw_url:
        return ""
    
    # 1. Decode percent-encoding (e.g. https%3a%2f%2f -> https://)
    try:
        raw_url = urllib.parse.unquote(raw_url)
    except Exception:
        pass

    # 2. Decode embedded redirect if found in Bing ad links
    if "bing.com/aclick" in raw_url or "ad." in raw_url:
        import base64
        m = re.search(r'[?&]u=([a-zA-Z0-9_\-]+)', raw_url)
        if m:
            try:
                padded = m.group(1) + "=" * ((4 - len(m.group(1)) % 4) % 4)
                decoded = base64.urlsafe_b64decode(padded).decode("utf-8", errors="ignore")
                decoded = urllib.parse.unquote(decoded)
                if decoded.startswith("http"):
                    raw_url = decoded
            except Exception:
                pass
    
    # 3. Strip all tracking and ad query params
    try:
        parsed = urllib.parse.urlparse(raw_url)
        if not parsed.scheme or not parsed.netloc:
            return raw_url
            
        qs = urllib.parse.parse_qs(parsed.query)
        clean_qs = {
            k: v for k, v in qs.items() 
            if k.lower() not in AD_QUERY_PARAMS and not k.lower().startswith("utm_")
        }
        new_query = urllib.parse.urlencode(clean_qs, doseq=True) if clean_qs else ""
        cleaned = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))
        return cleaned.rstrip("?")
    except Exception:
        return raw_url

def is_valid_content_url(url: str) -> bool:
    if not url or not (url.startswith("http://") or url.startswith("https://")):
        return False
    # Reject raw ad redirection services
    for ad in AD_DOMAINS:
        if ad in url:
            return False
    # Reject generic tracking endpoints
    if "duckduckgo.com/y.js" in url or "bing.com/ck/a" in url:
        return False
    return True

class SearchService:
    @staticmethod
    async def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """Perform search using ddgs library in threadpool with strict ad-filtering"""
        def _sync_search():
            try:
                from ddgs import DDGS
                results = []
                with DDGS() as ddgs:
                    # Request slightly more to filter out ads
                    for r in ddgs.text(query, max_results=max_results * 2):
                        url = clean_url(r.get("href", ""))
                        if is_valid_content_url(url):
                            results.append({
                                "title": r.get("title", ""),
                                "url": url,
                                "snippet": r.get("body", "")
                            })
                            if len(results) >= max_results:
                                break
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
                        url = clean_url(item.get("url", ""))
                        if is_valid_content_url(url):
                            results.append({
                                "title": item.get("title", ""),
                                "url": url,
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
                    if url and is_valid_content_url(url) and url not in unique_results:
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
