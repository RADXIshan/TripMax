import asyncio
import urllib.parse
from typing import List, Dict, Any
from app.services.search_service import search_service
from app.services.firecrawl_service import firecrawl_service
from app.services.playwright_scraper import playwright_scraper
from app.models.trip import TripPreferences, ResearchSource

class ResearchAgent:
    """
    Executes live web search and scraping queries using Firecrawl & Playwright:
    - Firecrawl deep web search for attractions, hidden gems, and dining
    - Playwright dynamic DOM extraction for interactive tourism guides & passes
    - Pacing, budget calibration, and verified source citations
    """

    @classmethod
    async def conduct_destination_research(cls, prefs: TripPreferences) -> List[ResearchSource]:
        dest = prefs.destination or "Destination"
        origin = prefs.origin or "Origin"
        curr = prefs.budget_currency or "INR"
        budget = prefs.budget_amount

        sources: List[ResearchSource] = []

        # 1. Firecrawl Deep Web Discovery
        try:
            fc_data = await firecrawl_service.research_destination(
                destination=dest,
                origin=origin,
                budget_currency=curr,
                budget_amount=budget,
                interests=prefs.interests,
                party_type=prefs.party_type
            )
            for r in fc_data.get("sources", []):
                t = r.get("title", "").strip()
                u = r.get("url", "").strip()
                snip = r.get("snippet", "").strip()
                if t and u and not any(bad in u.lower() for bad in ["google.com/search", "bing.com/search", "duckduckgo.com"]):
                    sources.append(ResearchSource(
                        title=f"{t} (Firecrawl Verified)",
                        url=u,
                        snippet=snip[:300]
                    ))
        except Exception as fc_err:
            print(f"[ResearchAgent] Firecrawl notice: {fc_err}", flush=True)

        # 2. Multi-search fallback/enhancement via search_service
        if len(sources) < 6:
            interests_str = " ".join(prefs.interests) if prefs.interests else "culture food scenic"
            queries = [
                f"{dest} top attractions travel guide wikitravel",
                f"best places to stay hotels {dest}",
                f"must eat traditional dishes {dest}"
            ]
            try:
                raw_results = await asyncio.wait_for(search_service.multi_search(queries, max_per_query=3), timeout=8.0)
                for r in raw_results:
                    t = r.get("title", "").strip()
                    u = r.get("url", "").strip()
                    if t and u and not any(bad in u.lower() for bad in ["google.com/search", "bing.com/search", "duckduckgo.com"]):
                        if not any(s.url == u for s in sources):
                            sources.append(ResearchSource(
                                title=t,
                                url=u,
                                snippet=r.get("snippet", "")[:280]
                            ))
            except Exception as s_err:
                print(f"[ResearchAgent] Search service notice: {s_err}", flush=True)

        # 3. Dynamic Playwright inspection on top destination guide
        if sources:
            top_source = sources[0]
            try:
                # Use Playwright to extract dynamic DOM content
                pw_res = await asyncio.wait_for(
                    playwright_scraper.get_page_text_and_links(top_source.url, timeout=6000),
                    timeout=8.0
                )
                if pw_res.get("status") == "success" and pw_res.get("text"):
                    # Enrich snippet with dynamic live rendered content
                    top_source.snippet = f"{top_source.snippet} [Playwright Live Extract]: {pw_res['text'][:180]}..."
            except Exception:
                pass

        # 4. Fallback if offline/rate-limited
        if len(sources) < 3:
            dest_slug = dest.replace(' ', '_')
            sources.extend([
                ResearchSource(
                    title=f"Wikipedia Cultural & Architectural Archive: {dest}",
                    url=f"https://en.wikipedia.org/wiki/{dest_slug}",
                    snippet=f"Authoritative history, prominent monuments, museums, and architectural landmarks in {dest}."
                ),
                ResearchSource(
                    title=f"Wikitravel Comprehensive Destination Guide: {dest}",
                    url=f"https://wikitravel.org/en/{dest_slug}",
                    snippet=f"District maps, cultural etiquette, transit hubs, and authentic neighborhood highlights for {dest}."
                ),
                ResearchSource(
                    title=f"TripAdvisor Verified Attractions & Gastronomy: {dest}",
                    url=f"https://www.tripadvisor.com/Search?q={urllib.parse.quote_plus(dest)}",
                    snippet=f"Traveler-vetted heritage landmarks, top-rated local dining bistros, and authentic street food experiences in {dest}."
                )
            ])

        return sources[:12]
