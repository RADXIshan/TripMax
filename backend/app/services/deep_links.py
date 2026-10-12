import re
import urllib.parse
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from app.models.trip import BookingLink
from app.services.link_crawler import resolve_iata, is_indian_locale

def format_date_for_search(date_str: str) -> str:
    """Returns YYYY-MM-DD or empty string"""
    if not date_str:
        future = datetime.now() + timedelta(days=30)
        return future.strftime("%Y-%m-%d")
    return date_str

# --- Flights ---
def get_google_flights_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    orig_iata = resolve_iata(origin) or origin
    dest_iata = resolve_iata(destination) or destination
    q = f"flights from {orig_iata} to {dest_iata}"
    if depart_date:
        q += f" departing {depart_date}"
    if return_date:
        q += f" returning {return_date}"
    return f"https://www.google.com/travel/flights?q={urllib.parse.quote_plus(q)}"

def get_skyscanner_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    orig_iata = (resolve_iata(origin) or origin.split()[0][:3]).lower()
    dest_iata = (resolve_iata(destination) or destination.split()[0][:3]).lower()
    return f"https://www.skyscanner.com/transport/flights/{urllib.parse.quote_plus(orig_iata)}/{urllib.parse.quote_plus(dest_iata)}/"

def get_kayak_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    orig_code = resolve_iata(origin) or origin[:3].upper()
    dest_code = resolve_iata(destination) or destination[:3].upper()
    base = f"https://www.kayak.com/flights/{urllib.parse.quote_plus(orig_code)}-{urllib.parse.quote_plus(dest_code)}"
    if depart_date:
        base += f"/{depart_date}"
        if return_date:
            base += f"/{return_date}"
    return base

def get_multi_flight_links(
    origin: str, 
    destination: str, 
    depart_date: str = "", 
    return_date: str = "", 
    airline: str = ""
) -> List[BookingLink]:
    orig_iata = resolve_iata(origin) or origin.split()[0][:3].upper()
    dest_iata = resolve_iata(destination) or destination.split()[0][:3].upper()
    is_india = is_indian_locale(origin, destination)

    links: List[BookingLink] = []

    # 1. Airline Direct Official
    airline_name = airline.split('/')[0].strip() if airline else "Airline"
    airline_lower = airline.lower()
    airline_direct_url = None
    airline_label = f"{airline_name} Direct"

    from app.services.link_crawler import LinkCrawler
    for k, url in LinkCrawler.AIRLINE_OFFICIALS.items():
        if k in airline_lower:
            airline_direct_url = url
            airline_label = f"{k.title()} Direct"
            break

    if airline_direct_url:
        links.append(BookingLink(
            provider="Airline Direct",
            label=airline_label,
            url=airline_direct_url,
            price_hint="Official Carrier Direct Booking"
        ))

    # 2. Google Flights
    links.append(BookingLink(
        provider="Google Flights",
        label="Google Flights",
        url=get_google_flights_url(origin, destination, depart_date, return_date),
        price_hint="Live Calendar & Fare Graph"
    ))

    # 3. Regional Leading Flight Portals (MakeMyTrip & EaseMyTrip for India)
    if is_india:
        mmt_date = depart_date or "today"
        mmt_url = f"https://www.makemytrip.com/flight/search?itinerary={orig_iata}-{dest_iata}-{mmt_date}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E"
        links.append(BookingLink(
            provider="MakeMyTrip",
            label="MakeMyTrip Flights",
            url=mmt_url,
            price_hint="Instant Seat Selection & Cashbacks"
        ))

        goibibo_flight_url = f"https://www.goibibo.com/flights/air-{orig_iata}-{dest_iata}-{mmt_date.replace('-', '')}--1-0-0-E-D/"
        links.append(BookingLink(
            provider="Goibibo",
            label="Goibibo Flights",
            url=goibibo_flight_url,
            price_hint="Instant Promo Discounts"
        ))

        emt_url = f"https://flight.easemytrip.com/FlightList/Index?srch={orig_iata}-{dest_iata}-{mmt_date}"
        links.append(BookingLink(
            provider="EaseMyTrip",
            label="EaseMyTrip",
            url=emt_url,
            price_hint="Zero Convenience Fee"
        ))

    # 4. Skyscanner & Kayak
    links.append(BookingLink(
        provider="Skyscanner",
        label="Skyscanner",
        url=get_skyscanner_url(origin, destination, depart_date, return_date),
        price_hint="Cheapest Month Comparison"
    ))
    links.append(BookingLink(
        provider="Kayak",
        label="Kayak",
        url=get_kayak_url(origin, destination, depart_date, return_date),
        price_hint="Matrix & Hacker Fares"
    ))

    return links

# --- Stays & Hotels ---
def get_booking_com_url(hotel_or_dest: str, checkin: str = "", checkout: str = "") -> str:
    base = "https://www.booking.com/searchresults.html"
    params = {"ss": hotel_or_dest}
    if checkin:
        params["checkin"] = checkin
    if checkout:
        params["checkout"] = checkout
    return f"{base}?{urllib.parse.urlencode(params)}"

def get_google_hotels_url(hotel_name: str, destination: str, checkin: str = "", checkout: str = "") -> str:
    q = f"{hotel_name} {destination}"
    if checkin and checkout:
        q += f" from {checkin} to {checkout}"
    return f"https://www.google.com/travel/search?q={urllib.parse.quote_plus(q)}"

def get_agoda_url(hotel_name: str, destination: str) -> str:
    q = f"{hotel_name} {destination}"
    return f"https://www.agoda.com/search?text={urllib.parse.quote_plus(q)}"

def get_airbnb_url(destination: str, checkin: str = "", checkout: str = "") -> str:
    base = f"https://www.airbnb.com/s/{urllib.parse.quote_plus(destination)}/homes"
    params = {}
    if checkin:
        params["checkin"] = checkin
    if checkout:
        params["checkout"] = checkout
    if params:
        return f"{base}?{urllib.parse.urlencode(params)}"
    return base

def get_multi_stay_links(
    hotel_name: str, 
    destination: str, 
    checkin: str = "", 
    checkout: str = "",
    price_per_night: Optional[float] = None,
    currency: str = "INR"
) -> List[BookingLink]:
    target = f"{hotel_name}, {destination}"
    rate_str = f"~{currency} {round(price_per_night):,}/nt" if price_per_night else "Live Nightly Rate"
    is_india = is_indian_locale("", destination)

    # 1. Official Hotel Direct Portal
    hotel_lower = hotel_name.lower()
    from app.services.link_crawler import LinkCrawler
    official_url = None
    official_label = f"{hotel_name.split()[0]} Official Direct"

    for k, url in LinkCrawler.KNOWN_HOTEL_OFFICIALS.items():
        tokens = k.split()
        if all(tok in hotel_lower for tok in tokens):
            official_url = url
            official_label = f"{hotel_name.split()[0]} Official Site"
            break

    links: List[BookingLink] = []

    if official_url:
        links.append(BookingLink(
            provider="Official Hotel Direct",
            label=official_label,
            url=official_url,
            price_hint="Official Direct Rates & Member Perks"
        ))

    links.append(BookingLink(
        provider="Google Hotels",
        label="Google Hotels",
        url=get_google_hotels_url(hotel_name, destination, checkin, checkout),
        price_hint="Live Rates Across All Sellers"
    ))

    # Regional OTA (MakeMyTrip for India / Asia)
    if is_india:
        mmt_hotel_url = f"https://www.makemytrip.com/hotels/hotel-listing/?city={urllib.parse.quote_plus(destination)}&searchText={urllib.parse.quote_plus(hotel_name)}"
        links.append(BookingLink(
            provider="MakeMyTrip",
            label="MakeMyTrip Hotels",
            url=mmt_hotel_url,
            price_hint="Pay@Hotel & Live Deals"
        ))
        goibibo_hotel_url = f"https://www.goibibo.com/hotels/hotels-in-{urllib.parse.quote_plus(destination.lower().strip())}/?searchText={urllib.parse.quote_plus(hotel_name)}"
        links.append(BookingLink(
            provider="Goibibo",
            label="Goibibo Hotels (Best Deals)",
            url=goibibo_hotel_url,
            price_hint="Pay@Hotel & Secret Rates"
        ))

    # Agoda
    links.append(BookingLink(
        provider="Agoda",
        label="Agoda",
        url=get_agoda_url(hotel_name, destination),
        price_hint="VIP Exclusive Rates"
    ))

    # Booking.com
    links.append(BookingLink(
        provider="Booking.com",
        label="Booking.com",
        url=get_booking_com_url(target, checkin, checkout),
        price_hint=rate_str
    ))

    # TripAdvisor Reviews
    links.append(BookingLink(
        provider="Tripadvisor",
        label="TripAdvisor",
        url=f"https://www.tripadvisor.com/Search?q={urllib.parse.quote_plus(target)}",
        price_hint="Verified Photos & Candid Ratings"
    ))

    return links

# --- Trains & Rail ---
def get_trainline_url(origin: str, destination: str, travel_date: str = "") -> str:
    orig_clean = origin.split()[0]
    dest_clean = destination.split()[0]
    if is_indian_locale(origin, destination):
        return f"https://www.confirmtkt.com/trains/{urllib.parse.quote_plus(orig_clean.lower())}-to-{urllib.parse.quote_plus(dest_clean.lower())}-train-tickets"
    return f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(orig_clean)}&destination={urllib.parse.quote_plus(dest_clean)}"

def get_seat61_url(destination: str) -> str:
    return f"https://www.seat61.com/{urllib.parse.quote_plus(destination.split()[0].lower())}.htm"

def get_irctc_or_rail_url(origin: str, destination: str, travel_date: str = "") -> str:
    orig_clean = origin.split()[0].lower()
    dest_clean = destination.split()[0].lower()
    if is_indian_locale(origin, destination):
        return f"https://www.confirmtkt.com/trains/{urllib.parse.quote_plus(orig_clean)}-to-{urllib.parse.quote_plus(dest_clean)}-train-tickets"
    return f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(orig_clean)}&destination={urllib.parse.quote_plus(dest_clean)}"

def get_multi_train_links(
    origin: str, 
    destination: str, 
    travel_date: str = "", 
    operator: str = ""
) -> List[BookingLink]:
    from app.services.geo_intelligence import can_have_direct_intercity_trains, resolve_country
    can_train, rail_type = can_have_direct_intercity_trains(origin, destination)
    if not can_train:
        return []

    c_orig = (resolve_country(origin) or "").lower()
    c_dest = (resolve_country(destination) or "").lower()
    is_india = (c_orig == "india" and c_dest == "india")
    is_japan = (c_orig == "japan" and c_dest == "japan")

    if is_india:
        # Indian Railways Network
        from app.services.link_crawler import LinkCrawler
        orig_city = LinkCrawler.resolve_rail_slug(origin)
        dest_city = LinkCrawler.resolve_rail_slug(destination)
        confirmtkt_url = f"https://www.confirmtkt.com/trains/{urllib.parse.quote_plus(orig_city)}-to-{urllib.parse.quote_plus(dest_city)}-train-tickets"
        irctc_url = "https://www.irctc.co.in/nget/train-search"
        mmt_trains_url = "https://www.makemytrip.com/railways/"
        ixigo_trains_url = f"https://www.ixigo.com/trains/{urllib.parse.quote_plus(orig_city)}-to-{urllib.parse.quote_plus(dest_city)}"

        return [
            BookingLink(
                provider="ConfirmTkt",
                label="ConfirmTkt (Live Seat Matrix)",
                url=confirmtkt_url,
                price_hint="Live PNR Prediction & Instant Seat Check"
            ),
            BookingLink(
                provider="IRCTC Official",
                label="IRCTC Indian Railways",
                url=irctc_url,
                price_hint="Official Govt Railway Reservation"
            ),
            BookingLink(
                provider="MakeMyTrip Trains",
                label="MakeMyTrip Trains",
                url=mmt_trains_url,
                price_hint="Free Cancellation & Live Status"
            ),
            BookingLink(
                provider="Goibibo Trains",
                label="Goibibo Trains",
                url=f"https://www.goibibo.com/trains/{urllib.parse.quote_plus(orig_city)}-to-{urllib.parse.quote_plus(dest_city)}-train-tickets/",
                price_hint="Live PNR & Free Cancellation"
            ),
            BookingLink(
                provider="ixigo Trains",
                label="ixigo Trains",
                url=ixigo_trains_url,
                price_hint="Running Status & Seat Position"
            )
        ]

    elif is_japan:
        # Japan Shinkansen Network
        return [
            BookingLink(
                provider="SmartEX Official",
                label="SmartEX Shinkansen Direct",
                url="https://smart-ex.jp/en/",
                price_hint="Official Tokaido/Sanyo Shinkansen E-Ticket"
            ),
            BookingLink(
                provider="NAVITIME",
                label="Japan Travel by NAVITIME",
                url="https://japantravel.navitime.com/en/booking/railway/",
                price_hint="Timetables & Transit Transfers"
            ),
            BookingLink(
                provider="JR Pass",
                label="Japan Rail Pass Official",
                url="https://japanrailpass.net/en/",
                price_hint="Nationwide Unlimited Rail Pass"
            )
        ]

    else:
        # European & Global Rail Network
        trainline_url = f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"
        if travel_date:
            trainline_url += f"&outwardDate={urllib.parse.quote_plus(travel_date)}"
        omio_url = f"https://www.omio.com/search-frontend/results?departure={urllib.parse.quote_plus(origin)}&arrival={urllib.parse.quote_plus(destination)}"
        rail_europe_url = f"https://www.raileurope.com/en/destinations?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"

        return [
            BookingLink(
                provider="Trainline",
                label="Trainline Rail",
                url=trainline_url,
                price_hint="Official High-Speed Timetables"
            ),
            BookingLink(
                provider="Omio",
                label="Omio Multi-Transit",
                url=omio_url,
                price_hint="Compare Train, Bus & Flight"
            ),
            BookingLink(
                provider="Rail Europe",
                label="Rail Europe",
                url=rail_europe_url,
                price_hint="Eurail & Regional Rail Passes"
            )
        ]

# --- Activities & Attractions ---
def get_attraction_booking_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination} tickets"
    return f"https://www.getyourguide.com/s/?q={urllib.parse.quote_plus(query)}"

def get_viator_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination}"
    return f"https://www.viator.com/searchResults/all?text={urllib.parse.quote_plus(query)}"

def get_klook_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination}"
    return f"https://www.klook.com/search/result/?query={urllib.parse.quote_plus(query)}"

TOURISM_PORTALS: Dict[str, str] = {
    "bhubaneswar": "https://odishatourism.gov.in/",
    "puri": "https://odishatourism.gov.in/",
    "odisha": "https://odishatourism.gov.in/",
    "india": "https://www.incredibleindia.org/",
    "delhi": "https://delhitourism.gov.in/",
    "jaipur": "https://www.tourism.rajasthan.gov.in/",
    "kerala": "https://www.keralatourism.org/",
    "tokyo": "https://www.gotokyo.org/en/",
    "kyoto": "https://kyoto.travel/en/",
    "japan": "https://www.japan.travel/en/",
    "barcelona": "https://www.barcelonaturisme.com/",
    "madrid": "https://www.esmadrid.com/en",
    "spain": "https://www.spain.info/en/",
    "paris": "https://parisjetaime.com/eng/",
    "france": "https://www.france.fr/en/",
    "rome": "https://www.turismoroma.it/en",
    "italy": "https://www.italia.it/en",
    "zurich": "https://www.zuerich.com/en",
    "swiss": "https://www.myswitzerland.com/en/",
    "switzerland": "https://www.myswitzerland.com/en/",
    "london": "https://www.visitlondon.com/",
    "bali": "https://www.indonesia.travel/gb/en/destinations/bali-nusa-tenggara/bali.html",
    "dubai": "https://www.visitdubai.com/en/"
}

def get_multi_activity_links(
    attraction: str, 
    destination: str,
    estimated_cost: Optional[float] = None,
    currency: str = "INR"
) -> List[BookingLink]:
    cost_str = f"~{currency} {round(estimated_cost):,}" if estimated_cost and estimated_cost > 0 else "Free / Walk-in"
    dest_lower = destination.lower()
    
    tourism_url = None
    for k, u in TOURISM_PORTALS.items():
        if k in dest_lower:
            tourism_url = u
            break
    if not tourism_url:
        tourism_url = "https://www.tripadvisor.com/"

    links: List[BookingLink] = [
        # (1) Primary: GetYourGuide Skip-the-Line & Entry Ticket
        BookingLink(
            provider="GetYourGuide",
            label="GetYourGuide Tickets",
            url=get_attraction_booking_url(attraction, destination),
            price_hint=cost_str if estimated_cost and estimated_cost > 0 else "Skip-the-Line Priority Entry"
        ),
        # (2) Viator (TripAdvisor Experiences)
        BookingLink(
            provider="Viator",
            label="Viator Guided Tours",
            url=get_viator_url(attraction, destination),
            price_hint="Verified Expert Guided Experiences"
        ),
        # (3) Official Regional Tourism Board
        BookingLink(
            provider="Official Tourism Board",
            label="Official Tourism Guide",
            url=tourism_url,
            price_hint="Official Visitor Regulations & Hours"
        ),
        # (4) Klook
        BookingLink(
            provider="Klook",
            label="Klook",
            url=get_klook_url(attraction, destination),
            price_hint="Instant Mobile E-Voucher"
        )
    ]
    return links
