from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.trip import TripPreferences
from app.services.booking_playwright_agent import booking_playwright_agent

router = APIRouter(prefix="/api/booking", tags=["Booking Playwright Agent"])

class AutoBookRequest(BaseModel):
    item_type: str = "stay"  # stay, flight, train
    title: str
    provider: str
    booking_url: str
    price: float = 0.0
    currency: str = "INR"
    dates: Optional[str] = ""
    party_type: Optional[str] = "Travelers"
    preferences: Optional[TripPreferences] = None

@router.post("/auto-book")
async def auto_book_item(payload: AutoBookRequest):
    """
    Triggers the autonomous Playwright Booking Agent to navigate to the selected
    stay, flight, or train on verified booking portals (Booking.com, MakeMyTrip, Agoda, Skyscanner, ConfirmTkt),
    selects the best personalized rate, adds to cart, and returns live status & screenshot.
    """
    try:
        result = await booking_playwright_agent.auto_book(
            item_type=payload.item_type,
            title=payload.title,
            provider=payload.provider,
            booking_url=payload.booking_url,
            price=payload.price,
            currency=payload.currency,
            dates=payload.dates or "",
            party_type=payload.party_type or "Travelers",
            preferences=payload.preferences
        )
        return result
    except Exception as e:
        print(f"[BookingRouter] Auto-book error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))
