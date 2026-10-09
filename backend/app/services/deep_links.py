import urllib.parse
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.trip import BookingLink

def format_date_for_search(date_str: str) -> str:
    """Returns YYYY-MM-DD or empty string"""
    if not date_str:
        future = datetime.now() + timedelta(days=30)
        return future.strftime("%Y-%m-%d")
    return date_str

# --- Flights ---
def get_google_flights_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    q = f"flights from {origin} to {destination}"
    if depart_date:
        q += f" departing {depart_date}"
    if return_date:
        q += f" returning {return_date}"
    return f"https://www.google.com/travel/flights?q={urllib.parse.quote_plus(q)}"

def get_skyscanner_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    orig_clean = origin.split('(')[-1].replace(')', '').strip() if '(' in origin else origin
    dest_clean = destination.split(',')[0].strip()
    return f"https://www.skyscanner.com/transport/flights/{urllib.parse.quote_plus(orig_clean.lower())}/{urllib.parse.quote_plus(dest_clean.lower())}/"

def get_kayak_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    orig_code = origin.split('(')[-1].replace(')', '').strip() if '(' in origin else origin[:3].upper()
    dest_code = destination.split('(')[-1].replace(')', '').strip() if '(' in destination else destination[:3].upper()
    base = f"https://www.kayak.com/flights/{urllib.parse.quote_plus(orig_code)}-{urllib.parse.quote_plus(dest_code)}"
    if depart_date:
        base += f"/{depart_date}"
        if return_date:
            base += f"/{return_date}"
    return base

def get_expedia_flights_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    q = f"flights from {origin} to {destination}"
    if depart_date:
        q += f" on {depart_date}"
    return f"https://www.expedia.com/Flights-Search?flight-type=on&mode=search&trip=roundtrip&leg1=from:{urllib.parse.quote_plus(origin)},to:{urllib.parse.quote_plus(destination)}"

def get_multi_flight_links(origin: str, destination: str, depart_date: str = "", return_date: str = "", airline: str = "") -> List[BookingLink]:
    links = [
        BookingLink(
            provider="Google Flights",
            label="Google Flights",
            url=get_google_flights_url(origin, destination, depart_date, return_date),
            price_hint="Live Calendar & Fares"
        ),
        BookingLink(
            provider="Skyscanner",
            label="Skyscanner",
            url=get_skyscanner_url(origin, destination, depart_date, return_date),
            price_hint="Cheapest Month Comparison"
        ),
        BookingLink(
            provider="Kayak",
            label="Kayak",
            url=get_kayak_url(origin, destination, depart_date, return_date),
            price_hint="Hacker Fares & Matrix"
        ),
        BookingLink(
            provider="Expedia",
            label="Expedia",
            url=get_expedia_flights_url(origin, destination, depart_date, return_date),
            price_hint="Flight + Package Deals"
        )
    ]
    if airline:
        airline_name = airline.split('/')[0].strip()
        direct_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(f'{airline_name} official flight booking {origin} to {destination}')}"
        links.append(BookingLink(
            provider="Airline Direct",
            label=f"{airline_name} Direct",
            url=direct_url,
            price_hint="Zero 3rd-party Fees"
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

def get_google_hotels_url(hotel_name: str, destination: str, checkin: str = "", checkout: str = "") -> str:
    q = f"{hotel_name} {destination}"
    if checkin and checkout:
        q += f" from {checkin} to {checkout}"
    return f"https://www.google.com/travel/search?q={urllib.parse.quote_plus(q)}"

def get_agoda_url(hotel_name: str, destination: str) -> str:
    q = f"{hotel_name} {destination}"
    return f"https://www.agoda.com/search?text={urllib.parse.quote_plus(q)}"

def get_hotels_com_url(hotel_name: str, destination: str) -> str:
    q = f"{hotel_name} {destination}"
    return f"https://www.hotels.com/Hotel-Search?destination={urllib.parse.quote_plus(q)}"

def get_multi_stay_links(
    hotel_name: str, 
    destination: str, 
    checkin: str = "", 
    checkout: str = "",
    price_per_night: Optional[float] = None,
    currency: str = "INR"
) -> List[BookingLink]:
    target = f"{hotel_name}, {destination}"
    rate_str = f"~{currency} {round(price_per_night):,}/nt" if price_per_night else "Verified Guest Reviews"
    return [
        BookingLink(
            provider="Booking.com",
            label="Booking.com",
            url=get_booking_com_url(target, checkin, checkout),
            price_hint=rate_str
        ),
        BookingLink(
            provider="Google Hotels",
            label="Google Hotels",
            url=get_google_hotels_url(hotel_name, destination, checkin, checkout),
            price_hint="Best Rate Comparison"
        ),
        BookingLink(
            provider="Agoda",
            label="Agoda",
            url=get_agoda_url(hotel_name, destination),
            price_hint="Member Exclusive Rates"
        ),
        BookingLink(
            provider="Airbnb",
            label="Airbnb",
            url=get_airbnb_url(f"{destination} boutique apartments", checkin, checkout),
            price_hint="Unique Local Stays"
        ),
        BookingLink(
            provider="Hotels.com",
            label="Hotels.com",
            url=get_hotels_com_url(hotel_name, destination),
            price_hint="Rewards & Free Cancellation"
        )
    ]

# --- Trains & Rail ---
def get_trainline_url(origin: str, destination: str, travel_date: str = "") -> str:
    base = f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"
    if travel_date:
        base += f"&outwardDate={urllib.parse.quote_plus(travel_date)}"
    return base

def get_omio_url(origin: str, destination: str, travel_date: str = "") -> str:
    return f"https://www.omio.com/search-frontend/results?departure={urllib.parse.quote_plus(origin)}&arrival={urllib.parse.quote_plus(destination)}"

def get_seat61_url(country_or_city: str) -> str:
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(f'site:seat61.com train travel to {country_or_city}')}"

def get_irctc_or_rail_url(origin: str, destination: str, travel_date: str = "") -> str:
    q = f"trains between {origin} and {destination} booking tickets"
    if travel_date:
        q += f" on {travel_date}"
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(q)}"

def get_multi_train_links(origin: str, destination: str, travel_date: str = "", operator: str = "") -> List[BookingLink]:
    links = [
        BookingLink(
            provider="Trainline",
            label="Trainline",
            url=get_trainline_url(origin, destination, travel_date),
            price_hint="Live Timetables & Seat Booking"
        ),
        BookingLink(
            provider="Omio",
            label="Omio",
            url=get_omio_url(origin, destination, travel_date),
            price_hint="Compare Train, Bus & Flight"
        ),
        BookingLink(
            provider="Rail Europe",
            label="Rail Europe",
            url=f"https://www.raileurope.com/en/destinations?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}",
            price_hint="Eurail & Regional Passes"
        )
    ]
    if operator:
        op_clean = operator.split('(')[0].strip()
        links.append(BookingLink(
            provider=f"{op_clean} Direct",
            label=f"{op_clean} Official",
            url=f"https://www.google.com/search?q={urllib.parse.quote_plus(f'{operator} train booking timetable {origin} to {destination}')}",
            price_hint="Official Timetable"
        ))
    return links

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

def get_multi_activity_links(
    attraction: str, 
    destination: str,
    estimated_cost: Optional[float] = None,
    currency: str = "INR"
) -> List[BookingLink]:
    cost_str = f"~{currency} {round(estimated_cost):,}" if estimated_cost and estimated_cost > 0 else "Free / Walk-in"
    return [
        BookingLink(
            provider="GetYourGuide",
            label="GetYourGuide",
            url=get_attraction_booking_url(attraction, destination),
            price_hint=cost_str if estimated_cost and estimated_cost > 0 else "Skip-the-Line Priority"
        ),
        BookingLink(
            provider="Viator",
            label="Viator (TripAdvisor)",
            url=get_viator_url(attraction, destination),
            price_hint="Top-Rated Guided Tours"
        ),
        BookingLink(
            provider="Klook",
            label="Klook",
            url=get_klook_url(attraction, destination),
            price_hint="Instant Mobile Entry E-Ticket"
        ),
        BookingLink(
            provider="Official Portal",
            label="Official Site",
            url=f"https://www.google.com/search?q={urllib.parse.quote_plus(f'{attraction} {destination} official tickets opening hours')}",
            price_hint="Official Standard Admission"
        )
    ]

