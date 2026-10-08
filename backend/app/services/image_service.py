import re
import urllib.parse
from typing import Optional, Dict
import httpx

class ImageService:
    """
    Retrieves real, verified, high-resolution photography for any global destination,
    landmark, attraction, hotel, and dining spot.
    Leverages Wikipedia REST API, Wikimedia Commons, and curated high-res galleries.
    """

    _cache: Dict[str, str] = {}
    _client: Optional[httpx.Client] = None

    HEADERS = {
        "User-Agent": "TripMaxTravelAssistant/2.0 (https://tripmax.travel; contact@tripmax.travel)"
    }

    # Curated fallbacks by destination category and keywords
    FALLBACK_IMAGES = {
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
        "iceland": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Hallgrimskirkja_mai_2026.jpg/1200px-Hallgrimskirkja_mai_2026.jpg",
        "reykjavik": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Hallgrimskirkja_mai_2026.jpg/1200px-Hallgrimskirkja_mai_2026.jpg",
        "amsterdam": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80",
        "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
        "india": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
        "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
        "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
        "greece": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        "hawaii": "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80",
        "vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
        "thailand": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
        "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
        "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80",
        "germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80"
    }

    GENERIC_CATEGORY_FALLBACKS = {
        "food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        "hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        "luxury_hotel": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
        "boutique_hotel": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
        "heritage_hotel": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
        "temple": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
        "museum": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
        "viewpoint": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
        "sunset": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
        "market": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
        "nature": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80"
    }

    @classmethod
    def _get_client(cls) -> httpx.Client:
        if cls._client is None or cls._client.is_closed:
            cls._client = httpx.Client(
                timeout=1.8,
                headers=cls.HEADERS,
                follow_redirects=True,
                limits=httpx.Limits(max_keepalive_connections=10, max_connections=20)
            )
        return cls._client

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
    def _fetch_wikipedia_image_sync(cls, query: str) -> Optional[str]:
        """Synchronously queries Wikipedia REST API for page image with timeout control"""
        clean_q = cls.clean_query_title(query)
        if not clean_q or len(clean_q) < 3:
            return None

        # Check cache
        cache_k = f"wiki_{clean_q.lower()}"
        if cache_k in cls._cache:
            return cls._cache[cache_k]

        client = cls._get_client()

        # 1. Try direct summary page
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

        # 2. Try Wikipedia Page Search API
        try:
            search_url = f"https://en.wikipedia.org/w/rest.php/v1/search/page?q={urllib.parse.quote(clean_q)}&limit=1"
            resp = client.get(search_url)
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
    def get_image_for_query(cls, query: str, category: str = "general", destination: str = "") -> str:
        cache_key = f"{query.lower().strip()}_{destination.lower().strip()}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        # If query is a long sentence description (> 5 words), skip search and resolve destination
        words = query.strip().split()
        if len(words) > 5 and destination:
            dest_clean = destination.split(",")[0].strip()
            dest_img = cls._fetch_wikipedia_image_sync(dest_clean)
            if dest_img:
                cls._cache[cache_key] = dest_img
                return dest_img

        # 1. Try Wikipedia for the specific landmark/hotel
        wiki_img = cls._fetch_wikipedia_image_sync(query)
        if wiki_img:
            cls._cache[cache_key] = wiki_img
            return wiki_img

        # 2. Try Wikipedia with destination context if short query
        dest_clean = destination.split(",")[0].strip() if destination else ""
        if dest_clean and dest_clean.lower() not in query.lower() and len(words) <= 3:
            combined_query = f"{cls.clean_query_title(query)} {dest_clean}"
            wiki_img2 = cls._fetch_wikipedia_image_sync(combined_query)
            if wiki_img2:
                cls._cache[cache_key] = wiki_img2
                return wiki_img2

        # 3. Try Wikipedia for the destination city itself
        if dest_clean:
            dest_img = cls._fetch_wikipedia_image_sync(dest_clean)
            if dest_img:
                cls._cache[cache_key] = dest_img
                return dest_img

        # 4. Check destination-specific gallery fallback
        dest_lower = destination.lower()
        for k, img_url in cls.FALLBACK_IMAGES.items():
            if k in dest_lower or k in query.lower():
                cls._cache[cache_key] = img_url
                return img_url

        # 5. Check category fallback
        cat_lower = category.lower()
        if cat_lower in cls.GENERIC_CATEGORY_FALLBACKS:
            cls._cache[cache_key] = cls.GENERIC_CATEGORY_FALLBACKS[cat_lower]
            return cls.GENERIC_CATEGORY_FALLBACKS[cat_lower]

        # 6. Fallback
        res = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
        cls._cache[cache_key] = res
        return res

image_service = ImageService()
