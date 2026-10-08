import urllib.parse
from datetime import datetime, timedelta

def format_date_for_search(date_str: str) -> str:
    """Returns YYYY-MM-DD or empty string"""
    if not date_str:
        # Default to 30 days from now
        future = datetime.now() + timedelta(days=30)
        return future.strftime("%Y-%m-%d")
    return date_str

def get_google_flights_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    q = f"flights from {origin} to {destination}"
    if depart_date:
        q += f" departing {depart_date}"
    if return_date:
        q += f" returning {return_date}"
    return f"https://www.google.com/travel/flights?q={urllib.parse.quote_plus(q)}"

def get_skyscanner_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    q = f"flights from {origin} to {destination}"
    if depart_date:
        q += f" {depart_date}"
    return f"https://www.skyscanner.com/transport/flights-from/{urllib.parse.quote_plus(origin.lower())}/to/{urllib.parse.quote_plus(destination.lower())}/"

def get_kayak_url(origin: str, destination: str, depart_date: str = "", return_date: str = "") -> str:
    base = f"https://www.kayak.com/flights/{urllib.parse.quote_plus(origin)}-{urllib.parse.quote_plus(destination)}"
    if depart_date:
        base += f"/{depart_date}"
        if return_date:
            base += f"/{return_date}"
    return base

def get_trainline_url(origin: str, destination: str, travel_date: str = "") -> str:
    base = f"https://www.thetrainline.com/book/results?origin={urllib.parse.quote_plus(origin)}&destination={urllib.parse.quote_plus(destination)}"
    if travel_date:
        base += f"&outwardDate={urllib.parse.quote_plus(travel_date)}"
    return base

def get_seat61_url(country_or_city: str) -> str:
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(f'site:seat61.com train travel to {country_or_city}')}&btnI=1"

def get_irctc_or_rail_url(origin: str, destination: str, travel_date: str = "") -> str:
    q = f"trains between {origin} and {destination} booking tickets"
    if travel_date:
        q += f" on {travel_date}"
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(q)}"

def get_booking_com_url(destination: str, checkin: str = "", checkout: str = "") -> str:
    base = "https://www.booking.com/searchresults.html"
    params = {"ss": destination}
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

def get_google_hotels_url(destination: str, checkin: str = "", checkout: str = "") -> str:
    q = f"hotels in {destination}"
    if checkin and checkout:
        q += f" from {checkin} to {checkout}"
    return f"https://www.google.com/travel/search?q={urllib.parse.quote_plus(q)}"

def get_attraction_booking_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination} tickets"
    return f"https://www.getyourguide.com/s/?q={urllib.parse.quote_plus(query)}"

def get_viator_url(attraction: str, destination: str) -> str:
    query = f"{attraction} {destination}"
    return f"https://www.viator.com/searchResults/all?text={urllib.parse.quote_plus(query)}"
