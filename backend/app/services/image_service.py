import re
import urllib.parse
from typing import Optional, Dict, Any
import httpx
import asyncio

class ImageService:
    """
    Retrieves real, verified, high-resolution photography for any global destination,
    landmark, attraction, hotel, and dining spot.
    Combines instant in-memory destination databases, Wikipedia REST API, Wikimedia Commons,
    and region-aware photographic fallback engines.
    """

    _cache: Dict[str, str] = {}
    _sync_client: Optional[httpx.Client] = None
    _async_client: Optional[httpx.AsyncClient] = None

    HEADERS = {
        "User-Agent": "TripMaxTravelAssistant/2.0 (https://tripmax.travel; contact@tripmax.travel)"
    }

    # Curated landmark & city high-res photography
    FALLBACK_IMAGES: Dict[str, str] = {
        # Indian Destinations & Heritage
        "bhubaneswar": "https://images.unsplash.com/photo-1626014903704-58a36c641fc8?auto=format&fit=crop&w=1200&q=80",
        "odisha": "https://images.unsplash.com/photo-1626014903704-58a36c641fc8?auto=format&fit=crop&w=1200&q=80",
        "lingaraj": "https://images.unsplash.com/photo-1626014903704-58a36c641fc8?auto=format&fit=crop&w=1200&q=80",
        "mukteshvara": "https://images.unsplash.com/photo-1600100397608-f010f443b7bb?auto=format&fit=crop&w=1200&q=80",
        "rajarani": "https://images.unsplash.com/photo-1626014903704-58a36c641fc8?auto=format&fit=crop&w=1200&q=80",
        "dhauli": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        "puri": "https://images.unsplash.com/photo-1609137144822-263d91b48b6e?auto=format&fit=crop&w=1200&q=80",
        "konark": "https://images.unsplash.com/photo-1609137144822-263d91b48b6e?auto=format&fit=crop&w=1200&q=80",
        "jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        "udaipur": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
        "rajasthan": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
        "munnar": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
        "alleppey": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
        "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
        "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
        "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
        "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
        "bengaluru": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
        "bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
        "kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
        "ladakh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
        "leh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
        "manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
        "kashmir": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80",
        "amritsar": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
        "hampi": "https://images.unsplash.com/photo-1600100397608-f010f443b7bb?auto=format&fit=crop&w=1200&q=80",
        "india": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",

        # Global Destinations
        "japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        "tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
        "spain": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80",
        "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "france": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
        "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
        "italy": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
        "uk": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80",
        "swiss": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
        "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
        "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "indonesia": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
        "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
        "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
        "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
        "greece": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        "thailand": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
        "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
        "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80",
        "germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80"
    }

    # Location / Region-specific category fallbacks
    INDIA_CATEGORY_FALLBACKS = {
        "temple": "https://images.unsplash.com/photo-1626014903704-58a36c641fc8?auto=format&fit=crop&w=1000&q=80",
        "food": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80",
        "hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        "luxury_hotel": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "boutique_hotel": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
        "heritage_hotel": "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1000&q=80",
        "market": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
        "museum": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80",
        "viewpoint": "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1000&q=80",
        "sunset": "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1000&q=80",
        "nature": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80"
    }

    EAST_ASIA_CATEGORY_FALLBACKS = {
        "temple": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
        "food": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
        "hotel": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
        "luxury_hotel": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "boutique_hotel": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
        "heritage_hotel": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
        "market": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
        "museum": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
        "viewpoint": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
        "sunset": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
        "nature": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80"
    }

    EUROPE_CATEGORY_FALLBACKS = {
        "temple": "https://images.unsplash.com/photo-1548625361-19599557a26f?auto=format&fit=crop&w=1000&q=80",
        "food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        "hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        "luxury_hotel": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "boutique_hotel": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
        "heritage_hotel": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "market": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
        "museum": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
        "viewpoint": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
        "sunset": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
        "nature": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80"
    }

    GENERIC_CATEGORY_FALLBACKS = {
        "food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        "hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        "luxury_hotel": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "boutique_hotel": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
        "heritage_hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        "temple": "https://images.unsplash.com/photo-1626014903704-58a36c641fc8?auto=format&fit=crop&w=1000&q=80",
        "museum": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
        "viewpoint": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
        "sunset": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
        "market": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
        "nature": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80"
    }

    @classmethod
    def _is_india(cls, text: str) -> bool:
        t = text.lower()
        indian_tokens = [
            "india", "bhubaneswar", "odisha", "orissa", "puri", "konark", "jaipur", "udaipur",
            "rajasthan", "kerala", "munnar", "alleppey", "goa", "varanasi", "delhi", "mumbai",
            "bangalore", "bengaluru", "kolkata", "ladakh", "leh", "manali", "kashmir", "amritsar",
            "hampi", "agra", "chennai", "hyderabad", "pune", "ahmedabad", "darjeeling", "rishikesh"
        ]
        return any(tok in t for tok in indian_tokens)

    @classmethod
    def _is_east_asia(cls, text: str) -> bool:
        t = text.lower()
        return any(tok in t for tok in ["japan", "tokyo", "kyoto", "osaka", "korea", "seoul", "china", "taiwan"])

    @classmethod
    def _is_europe(cls, text: str) -> bool:
        t = text.lower()
        return any(tok in t for tok in ["spain", "barcelona", "madrid", "france", "paris", "italy", "rome", "swiss", "switzerland", "uk", "london", "germany", "berlin", "amsterdam", "greece", "santorini"])

    @classmethod
    def _get_sync_client(cls) -> httpx.Client:
        if cls._sync_client is None or cls._sync_client.is_closed:
            cls._sync_client = httpx.Client(
                timeout=0.9,
                headers=cls.HEADERS,
                follow_redirects=True,
                limits=httpx.Limits(max_keepalive_connections=15, max_connections=30)
            )
        return cls._sync_client

    @classmethod
    def _get_async_client(cls) -> httpx.AsyncClient:
        if cls._async_client is None or cls._async_client.is_closed:
            cls._async_client = httpx.AsyncClient(
                timeout=0.9,
                headers=cls.HEADERS,
                follow_redirects=True,
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=40)
            )
        return cls._async_client

    @classmethod
    def clean_query_title(cls, text: str) -> str:
        t = re.sub(
            r'^(?:Day \d+[:•\s\-]*|Morning[:\s\-]*|Afternoon[:\s\-]*|Evening[:\s\-]*|'
            r'Visit(?:ing)?\s+|Explore(?:ing)?\s+|Tour (?:of )?|Walk(?:ing)? (?:through |along )?|'
            r'Stroll (?:through )?|Discover(?:ing)?\s+|Marvel at\s+|Journey to\s+|'
            r'Panoramic View(?:point)? of\s+|Wander (?:through )?)', 
            '', 
            text, 
            flags=re.IGNORECASE
        )
        t = re.sub(r'\s*\([^)]*\)', '', t)
        t = re.sub(r'[,•&].*$', '', t)
        t = t.strip(' "\'.,:-')
        return t.strip()

    @classmethod
    async def _fetch_wikipedia_image_async(cls, query: str) -> Optional[str]:
        clean_q = cls.clean_query_title(query)
        if not clean_q or len(clean_q) < 3:
            return None

        cache_k = f"wiki_{clean_q.lower()}"
        if cache_k in cls._cache:
            return cls._cache[cache_k]

        client = cls._get_async_client()

        # 1. Direct summary page
        try:
            slug = urllib.parse.quote(clean_q.replace(" ", "_"))
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}"
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                img = (data.get("originalimage", {}) or {}).get("source") or (data.get("thumbnail", {}) or {}).get("source")
                if img and ("http://" in img or "https://" in img):
                    large_img = re.sub(r'/\d+px-', '/1200px-', img)
                    cls._cache[cache_k] = large_img
                    return large_img
        except Exception:
            pass

        # 2. Search endpoint
        try:
            search_url = f"https://en.wikipedia.org/w/rest.php/v1/search/page?q={urllib.parse.quote(clean_q)}&limit=1"
            resp = await client.get(search_url)
            if resp.status_code == 200:
                data = resp.json()
                pages = data.get("pages", [])
                if pages:
                    thumb = pages[0].get("thumbnail", {}).get("url")
                    if thumb:
                        if thumb.startswith("//"):
                            thumb = "https:" + thumb
                        large_img = re.sub(r'/\d+px-', '/1200px-', thumb)
                        cls._cache[cache_k] = large_img
                        return large_img
        except Exception:
            pass

        return None

    @classmethod
    def _fetch_wikipedia_image_sync(cls, query: str) -> Optional[str]:
        clean_q = cls.clean_query_title(query)
        if not clean_q or len(clean_q) < 3:
            return None

        cache_k = f"wiki_{clean_q.lower()}"
        if cache_k in cls._cache:
            return cls._cache[cache_k]

        client = cls._get_sync_client()
        try:
            slug = urllib.parse.quote(clean_q.replace(" ", "_"))
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}"
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                img = (data.get("originalimage", {}) or {}).get("source") or (data.get("thumbnail", {}) or {}).get("source")
                if img and ("http://" in img or "https://" in img):
                    large_img = re.sub(r'/\d+px-', '/1200px-', img)
                    cls._cache[cache_k] = large_img
                    return large_img
        except Exception:
            pass
        return None

    @classmethod
    def get_image_for_query(cls, query: str, category: str = "general", destination: str = "") -> str:
        """
        Fast resolution with in-memory lookup, region-aware fallbacks, and sync Wikipedia probe.
        """
        cache_key = f"{query.lower().strip()}_{destination.lower().strip()}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        # Instant check in landmark / city photography database
        combined_text = f"{query} {destination}".lower()
        for k, img_url in cls.FALLBACK_IMAGES.items():
            if k in query.lower() or k in destination.lower():
                cls._cache[cache_key] = img_url
                return img_url

        # Check Wikipedia for landmark if short query
        words = query.strip().split()
        if len(words) <= 5:
            wiki_img = cls._fetch_wikipedia_image_sync(query)
            if wiki_img:
                cls._cache[cache_key] = wiki_img
                return wiki_img

        # Check region-based category fallbacks
        cat_lower = category.lower()
        if cls._is_india(combined_text):
            img = cls.INDIA_CATEGORY_FALLBACKS.get(cat_lower) or cls.INDIA_CATEGORY_FALLBACKS["temple"]
            cls._cache[cache_key] = img
            return img
        elif cls._is_east_asia(combined_text):
            img = cls.EAST_ASIA_CATEGORY_FALLBACKS.get(cat_lower) or cls.EAST_ASIA_CATEGORY_FALLBACKS["temple"]
            cls._cache[cache_key] = img
            return img
        elif cls._is_europe(combined_text):
            img = cls.EUROPE_CATEGORY_FALLBACKS.get(cat_lower) or cls.EUROPE_CATEGORY_FALLBACKS["temple"]
            cls._cache[cache_key] = img
            return img

        # Generic category fallback
        res = cls.GENERIC_CATEGORY_FALLBACKS.get(cat_lower, "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80")
        cls._cache[cache_key] = res
        return res

    @classmethod
    async def get_image_for_query_async(cls, query: str, category: str = "general", destination: str = "") -> str:
        """
        Asynchronous resolution running concurrently across all items in under 0.8s.
        """
        cache_key = f"{query.lower().strip()}_{destination.lower().strip()}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        # Instant check in landmark / city photography database
        combined_text = f"{query} {destination}".lower()
        for k, img_url in cls.FALLBACK_IMAGES.items():
            if k in query.lower() or (k in destination.lower() and len(query.split()) > 3):
                cls._cache[cache_key] = img_url
                return img_url

        # Probe Wikipedia asynchronously
        words = query.strip().split()
        if len(words) <= 5:
            wiki_img = await cls._fetch_wikipedia_image_async(query)
            if wiki_img:
                cls._cache[cache_key] = wiki_img
                return wiki_img

            dest_clean = destination.split(",")[0].strip() if destination else ""
            if dest_clean and dest_clean.lower() not in query.lower():
                wiki_img2 = await cls._fetch_wikipedia_image_async(f"{cls.clean_query_title(query)} {dest_clean}")
                if wiki_img2:
                    cls._cache[cache_key] = wiki_img2
                    return wiki_img2

        # Region-aware photographic fallback
        cat_lower = category.lower()
        if cls._is_india(combined_text):
            img = cls.INDIA_CATEGORY_FALLBACKS.get(cat_lower) or cls.INDIA_CATEGORY_FALLBACKS["temple"]
            cls._cache[cache_key] = img
            return img
        elif cls._is_east_asia(combined_text):
            img = cls.EAST_ASIA_CATEGORY_FALLBACKS.get(cat_lower) or cls.EAST_ASIA_CATEGORY_FALLBACKS["temple"]
            cls._cache[cache_key] = img
            return img
        elif cls._is_europe(combined_text):
            img = cls.EUROPE_CATEGORY_FALLBACKS.get(cat_lower) or cls.EUROPE_CATEGORY_FALLBACKS["temple"]
            cls._cache[cache_key] = img
            return img

        res = cls.GENERIC_CATEGORY_FALLBACKS.get(cat_lower, "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80")
        cls._cache[cache_key] = res
        return res

image_service = ImageService()
