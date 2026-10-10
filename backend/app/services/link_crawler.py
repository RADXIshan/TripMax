import re
import urllib.parse
from typing import List, Dict, Any, Optional
import asyncio
from app.models.trip import BookingLink
from app.services.search_service import search_service

# Comprehensive IATA airport code registry for accurate live flight links
AIRPORT_IATA_MAP: Dict[str, str] = {
    # India Hubs
    "bengaluru": "BLR", "bangalore": "BLR", "blr": "BLR",
    "bhubaneswar": "BBI", "odisha": "BBI", "bbi": "BBI",
    "delhi": "DEL", "new delhi": "DEL", "del": "DEL",
    "mumbai": "BOM", "bombay": "BOM", "bom": "BOM",
    "kolkata": "CCU", "calcutta": "CCU", "ccu": "CCU",
    "chennai": "MAA", "madras": "MAA", "maa": "MAA",
    "hyderabad": "HYD", "hyd": "HYD",
    "goa": "GOI", "dabolim": "GOI", "mopa": "GOX",
    "jaipur": "JAI", "jai": "JAI",
    "udaipur": "UDR", "udr": "UDR",
    "kochi": "COK", "cochin": "COK", "cok": "COK",
    "thiruvananthapuram": "TRV", "trivandrum": "TRV",
    "ahmedabad": "AMD", "amd": "AMD",
    "pune": "PNQ", "pnq": "PNQ",
    "varanasi": "VNS", "vns": "VNS",
    "amritsar": "ATQ", "atq": "ATQ",
    "guwahati": "GAU", "gau": "GAU",
    "srinagar": "SXR", "sxr": "SXR",
    "leh": "IXL", "ixl": "IXL",
    "chandigarh": "IXC",
    "lucknow": "LKO",
    "patna": "PAT",
    "indore": "IDR",
    "nagpur": "NAG",

    # Global Hubs
    "tokyo": "HND", "haneda": "HND", "narita": "NRT",
    "kyoto": "KIX", "osaka": "KIX",
    "barcelona": "BCN", "madrid": "MAD",
    "paris": "CDG", "nice": "NCE",
    "rome": "FCO", "milan": "MXP",
    "florence": "FLR", "venice": "VCE",
    "zurich": "ZRH", "geneva": "GVA",
    "bali": "DPS", "denpasar": "DPS",
    "london": "LHR", "gatwick": "LGW",
    "new york": "JFK", "newark": "EWR",
    "dubai": "DXB",
    "singapore": "SIN",
    "bangkok": "BKK",
    "amsterdam": "AMS",
    "berlin": "BER"
}

def resolve_iata(name_or_code: str) -> Optional[str]:
    """Resolves standard 3-letter IATA code from city name or text"""
    if not name_or_code:
        return None
    clean = name_or_code.lower().strip()
    # Check direct code in parentheses e.g. "Bengaluru (BLR)"
    m = re.search(r'\b([a-zA-Z]{3})\b', clean)
    if m and m.group(1).upper() in AIRPORT_IATA_MAP.values():
        return m.group(1).upper()

    for k, iata in AIRPORT_IATA_MAP.items():
        if k in clean:
            return iata
    return None

def is_indian_locale(origin: str, dest: str) -> bool:
    """Checks if either origin or destination is in India"""
    combined = f"{origin} {dest}".lower()
    indian_tokens = [
        "india", "bengaluru", "bangalore", "bhubaneswar", "odisha", "delhi", "mumbai",
        "kolkata", "chennai", "hyderabad", "goa", "jaipur", "udaipur", "kerala", "kochi",
        "pune", "ahmedabad", "varanasi", "amritsar", "srinagar", "leh", "ladakh", "puri",
        "konark", "cuttack", "lucknow", "chandigarh", "indore", "patna", "inr", "₹"
    ]
    return any(tok in combined for tok in indian_tokens)

class LinkCrawler:
    """
    Intelligent Web Crawler & Deep Linking Engine.
    Discovers authentic, working, region-relevant booking links:
    - For Hotels: Hotel official direct portals, Google Hotels live rates, MakeMyTrip, Agoda, Booking.com.
    - For Trains: IRCTC Official, ConfirmTkt, MakeMyTrip Trains, SmartEX Shinkansen, Trainline.
    - For Flights: Airline Official Direct, Google Flights matrix, MakeMyTrip, EaseMyTrip, Skyscanner.
    """

    _cache: Dict[str, Any] = {}

    # Verified official portals for renowned hotel groups
    KNOWN_HOTEL_OFFICIALS: Dict[str, str] = {
        "mayfair lagoon": "https://www.mayfairhotels.com/lagoon-bhubaneswar/",
        "mayfair heritage": "https://www.mayfairhotels.com/heritage-puri/",
        "welcomhotel bhubaneswar": "https://www.itchotels.com/in/en/welcomhotelbhubaneswar",
        "trident bhubaneswar": "https://www.tridenthotels.com/hotels-in-bhubaneswar",
        "vivanta bhubaneswar": "https://www.vivantahotels.com/en-in/vivanta-bhubaneswar-dn-square/",
        "cotton house": "https://www.marriott.com/en-us/hotels/bcnak-cotton-house-hotel-autograph-collection/overview/",
        "mercer hotel": "https://www.mercerbarcelona.com/en",
        "majestic hotel": "https://www.hotelmajestic.es/en",
        "mandapa": "https://www.ritzcarlton.com/en/hotels/indonesia/mandapa",
        "alila villas": "https://www.alilahotels.com/uluwatu"
    }

    # Verified official portals for airlines
    AIRLINE_OFFICIALS: Dict[str, str] = {
        "indigo": "https://www.goindigo.in/",
        "air india": "https://www.airindia.com/",
        "vistara": "https://www.airindia.com/",
        "akasa": "https://www.akasaair.com/",
        "spicejet": "https://www.spicejet.com/",
        "japan airlines": "https://www.jal.co.jp/en/",
        "ana": "https://www.ana.co.jp/en/us/",
        "iberia": "https://www.iberia.com/",
        "air france": "https://www.airfrance.com/",
        "british airways": "https://www.britishairways.com/",
        "emirates": "https://www.emirates.com/",
        "singapore airlines": "https://www.singaporeair.com/"
    }

    @classmethod
    async def crawl_hotel_links(
        cls, 
        hotel_name: str, 
        destination: str, 
        checkin: str = "", 
        checkout: str = "",
        price_per_night: Optional[float] = None,
        currency: str = "INR"
    ) -> Dict[str, Any]:
        """
        Crawls and compiles authentic direct official links and top-rated booking platforms
        """
        cache_key = f"hotel_{hotel_name.lower().strip()}_{destination.lower().strip()}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        target_query = f"{hotel_name} {destination}".strip()
        encoded_target = urllib.parse.quote_plus(target_query)
        encoded_hotel = urllib.parse.quote_plus(hotel_name)
        is_india = is_indian_locale("", destination)

        # 1. Determine Official Website
        official_url = None
        official_brand = "Official Direct Website"

        # Check known dictionary first
        hotel_lower = hotel_name.lower()
        for k, url in cls.KNOWN_HOTEL_OFFICIALS.items():
            tokens = k.split()
            if all(tok in hotel_lower for tok in tokens):
                official_url = url
                official_brand = f"{hotel_name.split()[0]} Official Direct"
                break

        # If not known, probe live search engine to find the true hotel official page
        if not official_url:
            try:
                search_q = f"{hotel_name} {destination} official website booking"
                results = await search_service.search(search_q, max_results=3)
                for r in results:
                    u = r.get("url", "")
                    # Ignore common third-party aggregator domains to find the actual hotel domain
                    if not any(agg in u for agg in ["booking.com", "tripadvisor", "agoda", "expedia", "hotels.com", "trivago", "makemytrip", "goibibo"]):
                        official_url = u
                        official_brand = f"{hotel_name.split()[0]} Official Direct"
                        break
            except Exception:
                pass

        if not official_url:
            official_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(f'{hotel_name} {destination} official website')}"

        # 2. Build multi-platform comparison list tailored to region
        links: List[BookingLink] = []

        # (A) Official Direct
        links.append(BookingLink(
            provider=official_brand,
            label="Official Hotel Direct",
            url=official_url,
            price_hint="Direct Best Rate & Perks"
        ))

        # (B) Google Hotels Live Rates
        google_hotels_q = f"{hotel_name} {destination}"
        if checkin and checkout:
            google_hotels_q += f" from {checkin} to {checkout}"
        google_hotels_url = f"https://www.google.com/travel/search?q={urllib.parse.quote_plus(google_hotels_q)}"
        links.append(BookingLink(
            provider="Google Hotels",
            label="Google Hotels",
            url=google_hotels_url,
            price_hint="Live Price Comparison"
        ))

        # (C) Regional OTA (MakeMyTrip for India / Asia)
        if is_india:
            mmt_url = f"https://www.makemytrip.com/hotels/hotel-listing/?city={urllib.parse.quote_plus(destination)}&searchText={encoded_hotel}"
            links.append(BookingLink(
                provider="MakeMyTrip",
                label="MakeMyTrip Hotels",
                url=mmt_url,
                price_hint="Exclusive Member Discounts"
            ))

        # (D) Agoda
        agoda_url = f"https://www.agoda.com/search?text={encoded_target}"
        links.append(BookingLink(
            provider="Agoda",
            label="Agoda",
            url=agoda_url,
            price_hint="Secret Deals & Cash Back"
        ))

        # (E) Booking.com
        booking_params = {"ss": target_query}
        if checkin:
            booking_params["checkin"] = checkin
        if checkout:
            booking_params["checkout"] = checkout
        booking_url = f"https://www.booking.com/searchresults.html?{urllib.parse.urlencode(booking_params)}"
        links.append(BookingLink(
            provider="Booking.com",
            label="Booking.com",
            url=booking_url,
            price_hint="Free Cancellation & Reviews"
        ))

        # (F) TripAdvisor Reviews
        tripadvisor_url = f"https://www.tripadvisor.com/Search?q={encoded_target}"
        links.append(BookingLink(
            provider="Tripadvisor",
            label="TripAdvisor",
            url=tripadvisor_url,
            price_hint="Verified Guest Photos"
        ))

        # Primary link is the Official Direct link
        primary_provider = official_brand
        primary_url = official_url

        res = {
            "primary_url": primary_url,
            "primary_provider": primary_provider,
            "links": links
        }
        cls._cache[cache_key] = res
        return res

    @classmethod
    async def crawl_train_links(
        cls, 
        train_name: str, 
        operator: str, 
        origin: str, 
        destination: str, 
        travel_date: str = ""
    ) -> Dict[str, Any]:
        """
        Crawls and compiles authentic train reservation portals for Indian, Japanese, or European routes.
        """
        cache_key = f"train_{train_name.lower()}_{origin.lower()}_{destination.lower()}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        is_india = is_indian_locale(origin, destination)
        is_japan = any(k in f"{origin} {destination}".lower() for k in ["japan", "tokyo", "kyoto", "osaka"])
        is_europe = any(k in f"{origin} {destination}".lower() for k in ["spain", "france", "italy", "germany", "swiss", "uk", "barcelona", "paris", "rome"])

        links: List[BookingLink] = []

        if is_india:
            # Indian Railway System
            confirmtkt_url = f"https://www.confirmtkt.com/trains/{urllib.parse.quote_plus(origin.split()[0].lower())}-to-{urllib.parse.quote_plus(destination.split()[0].lower())}-train-tickets"
            irctc_url = "https://www.irctc.co.in/nget/train-search"
            mmt_trains = "https://www.makemytrip.com/railways/"
            ixigo_url = f"https://www.ixigo.com/trains/{urllib.parse.quote_plus(origin.split()[0].lower())}-to-{urllib.parse.quote_plus(destination.split()[0].lower())}"

            # Check if live search gives an exact ConfirmTkt or IRCTC timetable link
            try:
                search_q = f"{train_name} {origin} to {destination} IRCTC confirmtkt"
                results = await search_service.search(search_q, max_results=2)
                for r in results:
                    u = r.get("url", "")
                    if "confirmtkt.com" in u:
                        confirmtkt_url = u
                        break
            except Exception:
                pass

            links.append(BookingLink(
                provider="ConfirmTkt",
                label="ConfirmTkt (Live Seats)",
                url=confirmtkt_url,
                price_hint="Live PNR & Seat Prediction"
            ))
            links.append(BookingLink(
                provider="IRCTC Official",
                label="IRCTC Indian Railways",
                url=irctc_url,
                price_hint="Official Govt E-Ticketing"
            ))
            links.append(BookingLink(
                provider="MakeMyTrip Trains",
                label="MakeMyTrip Trains",
                url=mmt_trains,
                price_hint="Free Cancellation & Instant Refund"
            ))
            links.append(BookingLink(
                provider="ixigo Trains",
                label="ixigo Trains",
                url=ixigo_url,
                price_hint="Live Running Status & Food Delivery"
            ))

            primary_provider = "ConfirmTkt & IRCTC"
            primary_url = confirmtkt_url

        elif is_japan:
            # Japanese Shinkansen System
            smartex_url = "https://smart-ex.jp/en/"
            navitime_url = "https://japantravel.navitime.com/en/booking/railway/"
            jrpass_url = "https://japanrailpass.net/en/"

            links.append(BookingLink(
                provider="SmartEX Official",
                label="SmartEX Shinkansen Direct",
                url=smartex_url,
                price_hint="Official Shinkansen E-Ticket"
            ))
            links.append(BookingLink(
                provider="NAVITIME",
                label="Japan Travel by NAVITIME",
                url=navitime_url,
                price_hint="Bullet Train Timetable & Seats"
            ))
            links.append(BookingLink(
                provider="JR Pass",
                label="Japan Rail Pass Official",
                url=jrpass_url,
                price_hint="Unlimited Nationwide Rail Pass"
            ))

            primary_provider = "SmartEX Shinkansen Official"
            primary_url = smartex_url

        else:
            # European Rail Network
            trainline_url = f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"
            omio_url = f"https://www.omio.com/search-frontend/results?departure={urllib.parse.quote_plus(origin)}&arrival={urllib.parse.quote_plus(destination)}"
            rail_europe_url = f"https://www.raileurope.com/en/destinations?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"

            links.append(BookingLink(
                provider="Trainline",
                label="Trainline Rail",
                url=trainline_url,
                price_hint="Official High-Speed Timetable"
            ))
            links.append(BookingLink(
                provider="Omio",
                label="Omio Multi-Transit",
                url=omio_url,
                price_hint="Compare Train vs Coach vs Flight"
            ))
            links.append(BookingLink(
                provider="Rail Europe",
                label="Rail Europe",
                url=rail_europe_url,
                price_hint="Eurail & Country Passes"
            ))

            primary_provider = f"{operator.split()[0]} Official" if operator else "Trainline Rail"
            primary_url = trainline_url

        res = {
            "primary_url": primary_url,
            "primary_provider": primary_provider,
            "links": links
        }
        cls._cache[cache_key] = res
        return res

    @classmethod
    async def crawl_flight_links(
        cls, 
        airline: str, 
        flight_number: str, 
        origin: str, 
        destination: str, 
        depart_date: str = "", 
        return_date: str = ""
    ) -> Dict[str, Any]:
        """
        Crawls and compiles authentic flight booking links using real IATA codes and airline portals.
        """
        cache_key = f"flight_{airline.lower()}_{origin.lower()}_{destination.lower()}_{depart_date}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]

        orig_iata = resolve_iata(origin) or origin.split()[0][:3].upper()
        dest_iata = resolve_iata(destination) or destination.split()[0][:3].upper()
        is_india = is_indian_locale(origin, destination)

        # 1. Determine Airline Official URL
        airline_lower = airline.lower()
        airline_url = None
        airline_brand = f"{airline.split()[0]} Official Direct"

        for k, url in cls.AIRLINE_OFFICIALS.items():
            if k in airline_lower:
                airline_url = url
                airline_brand = f"{airline.split()[0]} Direct"
                break

        if not airline_url:
            airline_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(f'{airline} official flight booking from {origin} to {destination}')}"

        # 2. Google Flights Live Matrix
        google_flights_q = f"flights from {orig_iata} to {dest_iata}"
        if depart_date:
            google_flights_q += f" on {depart_date}"
        google_flights_url = f"https://www.google.com/travel/flights?q={urllib.parse.quote_plus(google_flights_q)}"

        links: List[BookingLink] = []

        # (A) Airline Direct
        links.append(BookingLink(
            provider=airline_brand,
            label=f"{airline.split()[0]} Official Direct",
            url=airline_url,
            price_hint="Zero Middleman Markups"
        ))

        # (B) Google Flights Matrix
        links.append(BookingLink(
            provider="Google Flights",
            label="Google Flights",
            url=google_flights_url,
            price_hint="Live Fares & Price Graph"
        ))

        # (C) Regional Portals (MakeMyTrip & EaseMyTrip for India)
        if is_india:
            mmt_flight_url = f"https://www.makemytrip.com/flight/search?itinerary={orig_iata}-{dest_iata}-{depart_date or 'today'}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E"
            links.append(BookingLink(
                provider="MakeMyTrip",
                label="MakeMyTrip Flights",
                url=mmt_flight_url,
                price_hint="Instant Cashback & Seat Selection"
            ))

            emt_flight_url = f"https://flight.easemytrip.com/FlightList/Index?srch={orig_iata}-{dest_iata}-{depart_date or 'today'}"
            links.append(BookingLink(
                provider="EaseMyTrip",
                label="EaseMyTrip (Zero Conv Fee)",
                url=emt_flight_url,
                price_hint="Zero Convenience Fee"
            ))

        # (D) Skyscanner
        skyscanner_url = f"https://www.skyscanner.com/transport/flights/{orig_iata.lower()}/{dest_iata.lower()}/"
        links.append(BookingLink(
            provider="Skyscanner",
            label="Skyscanner",
            url=skyscanner_url,
            price_hint="Multi-Carrier Comparison"
        ))

        # (E) Kayak
        kayak_url = f"https://www.kayak.com/flights/{orig_iata}-{dest_iata}"
        if depart_date:
            kayak_url += f"/{depart_date}"
        links.append(BookingLink(
            provider="Kayak",
            label="Kayak",
            url=kayak_url,
            price_hint="Hacker Fares"
        ))

        primary_provider = airline_brand
        primary_url = airline_url

        res = {
            "primary_url": primary_url,
            "primary_provider": primary_provider,
            "links": links
        }
        cls._cache[cache_key] = res
        return res

link_crawler = LinkCrawler()
