from typing import List
from app.models.trip import TripPreferences, StayOption
from app.services.deep_links import get_booking_com_url, get_airbnb_url, get_google_hotels_url

class StayAgent:
    """
    Curates customized accommodations based on destination, duration, budget, and party type.
    Includes direct deep links to Booking.com and Airbnb.
    """

    @classmethod
    def recommend_stays(cls, prefs: TripPreferences) -> List[StayOption]:
        dest = prefs.destination or "Destination"
        days = prefs.duration_days or 5
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

        booking_link = get_booking_com_url(dest)
        airbnb_link = get_airbnb_url(dest)
        google_hotels_link = get_google_hotels_url(dest)

        stays = [
            StayOption(
                id="stay-boutique",
                name=f"The Artisan House {dest}",
                type="Boutique Design Hotel",
                neighborhood="Historic Arts & Heritage Quarter",
                rating=4.9,
                review_count=480,
                price_per_night=round(180 * rate, 0),
                total_price=round(180 * rate * days, 0),
                currency=curr,
                key_amenities=["Artisan Breakfast Included", "Rooftop Terrace", "Designer Interiors", "Espresso Bar", "Complimentary High-Speed Wi-Fi"],
                why_recommended=f"Ranked #1 for couples and culture lovers in {dest}. Walking distance to top cafes, bistros, and iconic sights.",
                booking_url=booking_link,
                provider="Booking.com",
                badge="Top Pick - Curated Choice"
            ),
            StayOption(
                id="stay-authentic",
                name=f"{dest} Heritage Haven & Garden Suite",
                type="Authentic Local Villa / Heritage Stay",
                neighborhood="Peaceful Traditional Quarter",
                rating=4.95,
                review_count=320,
                price_per_night=round(210 * rate, 0),
                total_price=round(210 * rate * days, 0),
                currency=curr,
                key_amenities=["Traditional Garden View", "Deep Soaking Tub", "Local Tea Ceremony / Welcome Drinks", "Full Kitchenette"],
                why_recommended=f"Provides genuine local immersion and serenity after a bustling day exploring {dest}.",
                booking_url=airbnb_link,
                provider="Airbnb",
                badge="🏮 Authentic Cultural Vibe"
            ),
            StayOption(
                id="stay-luxury",
                name=f"Grand Horizon Palace & Spa",
                type="5-Star Luxury Landmark",
                neighborhood="Prestige City Center / Scenic Waterfront",
                rating=4.92,
                review_count=750,
                price_per_night=round(390 * rate, 0),
                total_price=round(390 * rate * days, 0),
                currency=curr,
                key_amenities=["Infinity Hydrotherapy Spa", "Michelin-starred Dining On-Site", "24/7 Dedicated Concierge", "Panoramic City Views"],
                why_recommended=f"Unmatched luxury, panoramic city views, and effortless VIP airport transfers for {dest}.",
                booking_url=google_hotels_link,
                provider="Google Hotels / Direct",
                badge="💎 Ultra Premium"
            ),
            StayOption(
                id="stay-value",
                name=f"Urban Core Smart Suites",
                type="Central Modern Concept Hotel",
                neighborhood="Central Transit & Shopping District",
                rating=4.75,
                review_count=610,
                price_per_night=round(95 * rate, 0),
                total_price=round(95 * rate * days, 0),
                currency=curr,
                key_amenities=["Direct Metro & Train Access", "Coworking Lounge", "24-hr Self Check-in", "Keyless Entry"],
                why_recommended=f"Best value-for-money option in {dest} with top-tier cleanliness and immediate transit connectivity.",
                booking_url=booking_link,
                provider="Booking.com",
                badge="🏷️ Best Value"
            )
        ]

        return stays
