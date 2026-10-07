import urllib.parse
from datetime import datetime, timedelta

def format_date_for_search(date_str: str) -> str:
    """Returns YYYY-MM-DD or empty string"""
    if not date_str:
        # Default to 30 days from now
        future = datetime.now() + timedelta(days=30)
        return future.strftime("%Y-%m-%d")
    return date_str

def get_google_flights_url(origin: str, destination: str, date: str = "") -> str:
    q = f"flights from {origin} to {destination}"
    if date:
        q += f" on {date}"
    return f"https://www.google.com/travel/flights?q={urllib.parse.quote_plus(q)}"

def get_skyscanner_url(origin: str, destination: str) -> str:
    # Skyscanner direct search query format
    q = f"{origin} to {destination}"
    return f"https://www.skyscanner.com/transport/flights-from/{urllib.parse.quote_plus(origin.lower())}/to/{urllib.parse.quote_plus(destination.lower())}/"

def get_kayak_url(origin: str, destination: str) -> str:
    return f"https://www.kayak.com/flights/{urllib.parse.quote_plus(origin)}-{urllib.parse.quote_plus(destination)}"

def get_trainline_url(origin: str, destination: str) -> str:
    return f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"

def get_seat61_url(country_or_city: str) -> str:
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(f'site:seat61.com train travel to {country_or_city}')}&btnI=1"

def get_irctc_or_rail_url(origin: str, destination: str) -> str:
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(f'trains between {origin} and {destination} booking tickets')}"

def get_booking_com_url(destination: str, checkin: str = "", checkout: str = "") -> str:
    base = "https://www.booking.com/searchresults.html"
    params = {"ss": destination}
    if checkin:
        params["checkin"] = checkin
    if checkout:
        params["checkout"] = checkout
    return f"{base}?{urllib.parse.urlencode(params)}"

def get_airbnb_url(destination: str) -> str:
    return f"https://www.airbnb.com/s/{urllib.parse.quote_plus(destination)}/homes"

def get_google_hotels_url(destination: str) -> str:
    return f"https://www.google.com/travel/search?q=hotels+in+{urllib.parse.quote_plus(destination)}"

def get_attraction_booking_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination} tickets"
    return f"https://www.getyourguide.com/s/?q={urllib.parse.quote_plus(query)}"

def get_viator_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination}"
    return f"https://www.viator.com/searchResults/all?text={urllib.parse.quote_plus(query)}"
