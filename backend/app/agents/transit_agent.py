from typing import List, Tuple
from app.models.trip import TripPreferences, FlightOption, TrainOption
from app.services.deep_links import (
    get_google_flights_url,
    get_skyscanner_url,
    get_trainline_url,
    get_seat61_url,
    get_irctc_or_rail_url
)

class TransitAgent:
    """
    Evaluates both Flight and Train options between Origin and Destination.
    Provides direct deep booking links and comparison trade-offs (speed, scenic value, carbon, cost).
    """

    @classmethod
    def evaluate_transit(cls, prefs: TripPreferences) -> Tuple[List[FlightOption], List[TrainOption]]:
        origin = prefs.origin or "Origin Airport"
        dest = prefs.destination or "Destination"
        curr = prefs.budget_currency
        
        # Scaling factor based on currency
        rate = 1.0
        if curr == "EUR":
            rate = 0.92
        elif curr == "GBP":
            rate = 0.78
        elif curr == "INR":
            rate = 83.0
        elif curr == "JPY":
            rate = 150.0

        google_flights_link = get_google_flights_url(origin, dest)
        skyscanner_link = get_skyscanner_url(origin, dest)
        trainline_link = get_trainline_url(origin, dest)
        seat61_link = get_seat61_url(dest)
        rail_official_link = get_irctc_or_rail_url(origin, dest)

        # Realistic flight options
        flights = [
            FlightOption(
                airline=f"Premier Flagship Carrier ({origin[:3].upper()} - {dest[:3].upper()})",
                flight_number="Non-stop Express",
                departure=f"{origin} Main International",
                arrival=f"{dest} International",
                duration="Direct / Shortest Layover (~4-8 hrs)",
                stops="Non-stop / 1 quick connection",
                estimated_price=round(480 * rate, 0),
                currency=curr,
                pros=["Fastest transit time", "Cabin baggage included", "In-flight entertainment"],
                cons=["Higher carbon footprint", "Airport transit & security check required 2h prior"],
                booking_url=google_flights_link,
                provider="Google Flights"
            ),
            FlightOption(
                airline=f"Smart Value Airline",
                flight_number="Flexible Saver",
                departure=f"{origin} Airport",
                arrival=f"{dest} Airport",
                duration="1 Layover (~7-11 hrs)",
                stops="1 Stop (1.5h layover)",
                estimated_price=round(310 * rate, 0),
                currency=curr,
                pros=["Great price-to-comfort ratio", "Frequent departure times"],
                cons=["Check-in luggage may incur fee", "Slightly longer total travel window"],
                booking_url=skyscanner_link,
                provider="Skyscanner"
            )
        ]

        # Realistic train options
        trains = [
            TrainOption(
                operator=f"High-Speed Express Rail / Bullet Train",
                train_name=f"{dest} High-Speed InterCity",
                route=f"{origin} Central Station ➔ {dest} Main Terminus",
                duration="Scenic & Relaxed (City center to City center)",
                class_tier="Standard / Quiet Car / Panoramic First",
                estimated_price=round(120 * rate, 0),
                currency=curr,
                scenic_highlights="Sweeping countryside, river valleys, and zero airport security queues",
                pros=[
                    "Departs right in city center (saves $40+ in airport taxis)",
                    "Generous luggage allowance with no weight fees",
                    "85% lower carbon footprint than flying",
                    "High-speed Wi-Fi and power outlets at every seat"
                ],
                booking_url=trainline_link,
                provider="Trainline / Rail Network"
            ),
            TrainOption(
                operator=f"Scenic Regional / Night Sleeper Experience",
                train_name="Overnight Sleeper / Scenic Panorama",
                route=f"{origin} ➔ {dest}",
                duration="Overnight Sleeper or Heritage Rail",
                class_tier="Couchette Sleeper Berth / Club Class",
                estimated_price=round(95 * rate, 0),
                currency=curr,
                scenic_highlights="Fall asleep in one city, wake up refreshed right in the heart of your destination; saves 1 night hotel cost!",
                pros=[
                    "Saves the cost of one night's hotel room",
                    "Iconic bucket-list railway adventure",
                    "Spacious berths and dining car access"
                ],
                booking_url=seat61_link,
                provider="The Man in Seat 61 / Official Rail"
            )
        ]

        return flights, trains
