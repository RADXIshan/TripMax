import asyncio
from typing import List, Dict
from app.services.search_service import search_service
from app.models.trip import TripPreferences, ResearchSource

class ResearchAgent:
    """
    Executes live web search queries across various trip domains:
    - Top attractions, hidden gems, and local secrets
    - Transit passes and routes (flights and high speed trains)
    - Best neighborhoods to stay in
    - Signature culinary experiences and dining
    """

    @classmethod
    async def conduct_destination_research(cls, prefs: TripPreferences) -> List[ResearchSource]:
        dest = prefs.destination or "Destination"
        origin = prefs.origin or "Origin"
        interests_str = " ".join(prefs.interests) if prefs.interests else "culture food scenic"

        queries = [
            f"{dest} top attractions travel guide wikitravel",
            f"best places to stay hotels {dest}",
            f"must eat traditional dishes {dest}"
        ]

        try:
            raw_results = await asyncio.wait_for(search_service.multi_search(queries, max_per_query=2), timeout=3.0)
        except Exception:
            raw_results = []

        sources: List[ResearchSource] = []
        for r in raw_results[:12]:
            if r.get("title") and r.get("url"):
                sources.append(ResearchSource(
                    title=r.get("title", ""),
                    url=r.get("url", ""),
                    snippet=r.get("snippet", "")[:280]
                ))

        # If search returned few results (e.g. offline/rate limit), provide curated high-quality reference links
        if len(sources) < 3:
            sources.extend([
                ResearchSource(
                    title=f"Wikitravel Guide: {dest}",
                    url=f"https://wikitravel.org/en/{dest.replace(' ', '_')}",
                    snippet=f"Comprehensive travel overview, districts, transit, and local customs for {dest}."
                ),
                ResearchSource(
                    title=f"The Man in Seat 61: Train Travel Guide",
                    url="https://www.seat61.com/",
                    snippet=f"Expert guide to scenic rail travel, international train connections, and booking tips."
                ),
                ResearchSource(
                    title=f"Eater / Michelin Local Dining Guide: {dest}",
                    url=f"https://www.google.com/search?q={dest}+eater+best+food+guide",
                    snippet=f"Curated culinary hotspots, street food stalls, and traditional regional dishes in {dest}."
                )
            ])

        return sources
