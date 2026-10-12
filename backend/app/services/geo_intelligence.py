"""
GeoIntelligence Engine
Provides accurate country resolution, cross-border analysis, and passenger rail feasibility.
Ensures trains are never proposed for cross-country / intercontinental journeys across oceans or non-rail connected borders.
"""

import re
from typing import Optional, Tuple, Dict, Set

# Comprehensive City/State/Region to Canonical Country Registry
CITY_TO_COUNTRY: Dict[str, str] = {
    # India (Cities, States & Regions)
    "bengaluru": "India", "bangalore": "India", "bhubaneswar": "India", "odisha": "India",
    "delhi": "India", "new delhi": "India", "mumbai": "India", "bombay": "India",
    "kolkata": "India", "calcutta": "India", "chennai": "India", "madras": "India",
    "hyderabad": "India", "pune": "India", "ahmedabad": "India", "jaipur": "India",
    "goa": "India", "kochi": "India", "cochin": "India", "kerala": "India",
    "varanasi": "India", "agra": "India", "amritsar": "India", "chandigarh": "India",
    "lucknow": "India", "patna": "India", "surat": "India", "udaipur": "India",
    "shimla": "India", "manali": "India", "darjeeling": "India", "srinagar": "India",
    "guwahati": "India", "assam": "India", "coimbatore": "India", "visakhapatnam": "India",
    "vizag": "India", "mysuru": "India", "mysore": "India", "thiruvananthapuram": "India",
    "trivandrum": "India", "mangalore": "India", "indore": "India", "bhopal": "India",
    "nagpur": "India", "vadodara": "India", "ranchi": "India", "raipur": "India",
    "dehradun": "India", "haridwar": "India", "rishikesh": "India", "tirupati": "India",
    "madurai": "India", "pondicherry": "India", "puducherry": "India", "puri": "India",
    "konark": "India", "cuttack": "India", "ladakh": "India", "leh": "India",
    "hampi": "India", "ooty": "India", "kodaikanal": "India", "munnar": "India",
    "alleppey": "India", "alappuzha": "India", "jodhpur": "India", "jaisalmer": "India",
    "andaman": "India", "port blair": "India",

    # Japan
    "tokyo": "Japan", "kyoto": "Japan", "osaka": "Japan", "hiroshima": "Japan",
    "nara": "Japan", "sapporo": "Japan", "fukuoka": "Japan", "nagoya": "Japan",
    "yokohama": "Japan", "kobe": "Japan", "okinawa": "Japan", "hakone": "Japan",
    "kanazawa": "Japan", "takayama": "Japan", "kamakura": "Japan", "nikko": "Japan",

    # France
    "paris": "France", "nice": "France", "lyon": "France", "marseille": "France",
    "bordeaux": "France", "strasbourg": "France", "toulouse": "France", "cannes": "France",
    "avignon": "France", "chamonix": "France", "versailles": "France", "aix-en-provence": "France",

    # Italy
    "rome": "Italy", "florence": "Italy", "venice": "Italy", "milan": "Italy",
    "naples": "Italy", "amalfi": "Italy", "positano": "Italy", "bologna": "Italy",
    "turin": "Italy", "palermo": "Italy", "sorrento": "Italy", "cinque terre": "Italy",
    "verona": "Italy", "pisa": "Italy", "genoa": "Italy", "capri": "Italy",

    # Spain
    "barcelona": "Spain", "madrid": "Spain", "seville": "Spain", "valencia": "Spain",
    "mallorca": "Spain", "ibiza": "Spain", "granada": "Spain", "bilbao": "Spain",
    "malaga": "Spain", "san sebastian": "Spain", "cordoba": "Spain", "toledo": "Spain",

    # United Kingdom
    "london": "United Kingdom", "manchester": "United Kingdom", "edinburgh": "United Kingdom",
    "birmingham": "United Kingdom", "glasgow": "United Kingdom", "liverpool": "United Kingdom",
    "bristol": "United Kingdom", "oxford": "United Kingdom", "cambridge": "United Kingdom",
    "belfast": "United Kingdom", "cardiff": "United Kingdom", "bath": "United Kingdom",

    # United States
    "new york": "United States", "nyc": "United States", "san francisco": "United States",
    "los angeles": "United States", "chicago": "United States", "miami": "United States",
    "las vegas": "United States", "seattle": "United States", "boston": "United States",
    "washington": "United States", "dc": "United States", "austin": "United States",
    "orlando": "United States", "honolulu": "United States", "san diego": "United States",
    "dallas": "United States", "atlanta": "United States", "denver": "United States",
    "philadelphia": "United States", "new orleans": "United States", "hawaii": "United States",

    # Switzerland
    "zurich": "Switzerland", "geneva": "Switzerland", "lucerne": "Switzerland",
    "interlaken": "Switzerland", "zermatt": "Switzerland", "basel": "Switzerland",
    "bern": "Switzerland", "lausanne": "Switzerland", "grindelwald": "Switzerland",

    # Germany
    "berlin": "Germany", "munich": "Germany", "frankfurt": "Germany", "hamburg": "Germany",
    "cologne": "Germany", "dusseldorf": "Germany", "stuttgart": "Germany", "dresden": "Germany",

    # Netherlands
    "amsterdam": "Netherlands", "rotterdam": "Netherlands", "the hague": "Netherlands",
    "utrecht": "Netherlands",

    # Belgium
    "brussels": "Belgium", "bruges": "Belgium", "ghent": "Belgium", "antwerp": "Belgium",

    # Austria
    "vienna": "Austria", "salzburg": "Austria", "innsbruck": "Austria", "graz": "Austria",

    # Portugal
    "lisbon": "Portugal", "porto": "Portugal", "faro": "Portugal", "algarve": "Portugal",

    # Greece
    "athens": "Greece", "santorini": "Greece", "mykonos": "Greece", "crete": "Greece",
    "rhodes": "Greece", "corfu": "Greece",

    # Australia
    "sydney": "Australia", "melbourne": "Australia", "brisbane": "Australia",
    "perth": "Australia", "adelaide": "Australia", "cairns": "Australia",

    # Canada
    "toronto": "Canada", "vancouver": "Canada", "montreal": "Canada", "calgary": "Canada",
    "quebec": "Canada", "ottawa": "Canada", "banff": "Canada",

    # UAE
    "dubai": "United Arab Emirates", "abu dhabi": "United Arab Emirates", "sharjah": "United Arab Emirates",

    # Singapore
    "singapore": "Singapore",

    # Thailand
    "bangkok": "Thailand", "phuket": "Thailand", "chiang mai": "Thailand", "pattaya": "Thailand",
    "krabi": "Thailand", "koh samui": "Thailand",

    # Indonesia
    "bali": "Indonesia", "jakarta": "Indonesia", "ubud": "Indonesia", "lombok": "Indonesia",

    # Turkey
    "istanbul": "Turkey", "cappadocia": "Turkey", "antalya": "Turkey", "bodrum": "Turkey",

    # Czech Republic
    "prague": "Czech Republic", "cesky krumlov": "Czech Republic",

    # South Korea
    "seoul": "South Korea", "busan": "South Korea", "jeju": "South Korea", "incheon": "South Korea",

    # Vietnam
    "hanoi": "Vietnam", "ho chi minh": "Vietnam", "da nang": "Vietnam", "hoi an": "Vietnam",

    # Malaysia
    "kuala lumpur": "Malaysia", "penang": "Malaysia", "langkawi": "Malaysia"
}

# European countries connected by high-speed cross-border international rail (Eurostar, TGV, ICE, Thalys, EuroCity)
EUROPEAN_CONNECTED_RAIL_ZONE: Set[str] = {
    "united kingdom", "france", "belgium", "netherlands", "germany",
    "switzerland", "italy", "austria", "spain", "czech republic", "luxembourg", "monaco"
}

def resolve_country(location: str) -> Optional[str]:
    """
    Extracts or resolves the standard country name from a location string.
    Handles 'City, Country', 'City, State', airport codes, or plain city names.
    """
    if not location:
        return None
    
    clean = location.strip()
    clean_lower = clean.lower()

    # 1. Check if location has comma-separated parts like "Paris, France" or "Bengaluru, Karnataka, India"
    parts = [p.strip() for p in clean.split(",") if p.strip()]
    if len(parts) >= 2:
        last_part = parts[-1].lower()
        # Direct country checks
        for c_key in ["india", "japan", "france", "italy", "spain", "united kingdom", "uk", "usa", "united states", 
                      "germany", "switzerland", "netherlands", "belgium", "austria", "portugal", "greece", 
                      "australia", "canada", "singapore", "thailand", "indonesia", "turkey", "south korea", "uae"]:
            if c_key == last_part or c_key in last_part:
                if c_key in ["uk", "united kingdom"]:
                    return "United Kingdom"
                if c_key in ["usa", "united states"]:
                    return "United States"
                if c_key in ["uae"]:
                    return "United Arab Emirates"
                return c_key.title()

    # 2. Match city tokens against comprehensive registry
    for city, country in CITY_TO_COUNTRY.items():
        # Match as word boundary or exact token
        pattern = rf"\b{re.escape(city)}\b"
        if re.search(pattern, clean_lower):
            return country

    # 3. Direct country names inside text
    country_keywords = {
        "india": "India",
        "japan": "Japan",
        "france": "France",
        "italy": "Italy",
        "spain": "Spain",
        "united kingdom": "United Kingdom",
        "britain": "United Kingdom",
        "england": "United Kingdom",
        "scotland": "United Kingdom",
        "united states": "United States",
        "america": "United States",
        "germany": "Germany",
        "switzerland": "Switzerland",
        "swiss": "Switzerland",
        "netherlands": "Netherlands",
        "holland": "Netherlands",
        "belgium": "Belgium",
        "austria": "Austria",
        "portugal": "Portugal",
        "greece": "Greece",
        "australia": "Australia",
        "canada": "Canada",
        "united arab emirates": "United Arab Emirates",
        "emirates": "United Arab Emirates",
        "singapore": "Singapore",
        "thailand": "Thailand",
        "indonesia": "Indonesia",
        "turkey": "Turkey",
        "czech republic": "Czech Republic",
        "south korea": "South Korea",
        "korea": "South Korea",
        "vietnam": "Vietnam",
        "malaysia": "Malaysia"
    }

    for k, canonical in country_keywords.items():
        if re.search(rf"\b{re.escape(k)}\b", clean_lower):
            return canonical

    return None

def is_cross_country(origin: str, destination: str) -> bool:
    """
    Returns True if origin and destination are located in different countries.
    """
    country_orig = resolve_country(origin)
    country_dest = resolve_country(destination)

    if country_orig and country_dest:
        return country_orig.lower() != country_dest.lower()

    # If only one is resolved, or neither, check if they are obviously distinct
    clean_orig = origin.strip().lower()
    clean_dest = destination.strip().lower()
    return clean_orig != clean_dest

def can_have_direct_intercity_trains(origin: str, destination: str) -> Tuple[bool, str]:
    """
    Determines whether a direct/practical passenger rail option connects origin to destination.
    Returns:
        (can_train: bool, route_type: str)
        route_type values:
          - "domestic_rail": Within the same country (e.g. BLR -> BBS, Tokyo -> Kyoto, Paris -> Nice).
          - "european_cross_border_rail": Within the connected European international rail network (e.g. London -> Paris Eurostar, Paris -> Amsterdam Thalys).
          - "cross_country_no_rail": Different countries with NO continuous passenger rail link (e.g. India -> Japan, US -> France, India -> Europe, Australia -> anywhere).
    """
    country_orig = resolve_country(origin)
    country_dest = resolve_country(destination)

    # 1. Both countries identified and identical -> Domestic Rail
    if country_orig and country_dest and country_orig.lower() == country_dest.lower():
        return (True, "domestic_rail")

    # 2. Both countries within the European connected high-speed rail corridor (Eurostar, TGV, Thalys, ICE, SBB)
    if country_orig and country_dest:
        c_orig_lower = country_orig.lower()
        c_dest_lower = country_dest.lower()
        if c_orig_lower in EUROPEAN_CONNECTED_RAIL_ZONE and c_dest_lower in EUROPEAN_CONNECTED_RAIL_ZONE:
            return (True, "european_cross_border_rail")

    # 3. Otherwise: Cross-country / intercontinental across oceans or non-connected land borders
    return (False, "cross_country_no_rail")

def get_rail_region(origin: str, destination: str) -> str:
    """
    Returns the primary rail network family for booking link generation.
    """
    country_dest = resolve_country(destination) or ""
    country_dest_lower = country_dest.lower()

    if country_dest_lower == "india":
        return "india"
    if country_dest_lower == "japan":
        return "japan"
    if country_dest_lower in EUROPEAN_CONNECTED_RAIL_ZONE:
        return "europe"
    if country_dest_lower == "united states":
        return "usa"
    return "global"
