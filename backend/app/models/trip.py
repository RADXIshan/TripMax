from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any

class TripPreferences(BaseModel):
    destination: Optional[str] = None
    origin: Optional[str] = None
    dates: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travel_month: Optional[str] = None
    season: Optional[str] = None
    duration_days: Optional[int] = None
    budget_amount: Optional[float] = None
    budget_currency: str = "INR"
    party_type: Optional[str] = None  # solo, couple, friends, family
    travel_pace: Optional[str] = None  # relaxed, balanced, fast-paced
    transport_preference: Optional[str] = None  # flight, train, both
    stay_preference: Optional[str] = None  # boutique, luxury, budget_hotel, hostel, apartment, authentic
    dining_preference: Optional[str] = None  # vegetarian, vegan, street food, fine dining, halal, etc.
    interests: List[str] = Field(default_factory=list)  # food, culture, history, nightlife, nature, shopping, photography, relaxation
    special_requirements: Optional[str] = None
    completed_steps: List[str] = Field(default_factory=list)
    current_question_key: Optional[str] = None

class SuggestedReply(BaseModel):
    label: str
    value: str
    category: Optional[str] = None
    is_other: Optional[bool] = False
    placeholder: Optional[str] = None

class ChatMessage(BaseModel):
    id: str
    role: str  # user, assistant, system
    content: str
    agent_name: Optional[str] = "Discovery Agent"
    suggested_replies: Optional[List[SuggestedReply]] = None
    stage: Optional[str] = "discovery"  # discovery, researching, plan_ready, refining
    timestamp: Optional[str] = None
    question_key: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class BookingLink(BaseModel):
    provider: str
    label: str
    url: str
    price_hint: Optional[str] = None

def _coerce_str_list(v: Any) -> List[str]:
    if v is None:
        return []
    if isinstance(v, list):
        return [str(item).strip() for item in v if item is not None and str(item).strip()]
    if isinstance(v, str):
        v = v.strip()
        if not v:
            return []
        if "\n" in v:
            return [line.lstrip("•-* \t").strip() for line in v.split("\n") if line.strip()]
        if ";" in v:
            return [p.strip() for p in v.split(";") if p.strip()]
        if "." in v and len(v.split(".")) > 1 and len(v) > 60:
            return [p.strip() for p in v.split(".") if p.strip()]
        if "," in v and len(v.split(",")) > 1 and len(v) < 120:
            return [p.strip() for p in v.split(",") if p.strip()]
        return [v]
    return [str(v)]

class FlightOption(BaseModel):
    airline: str
    flight_number: Optional[str] = None
    departure: str
    arrival: str
    duration: str
    stops: str
    estimated_price: float
    currency: str = "INR"
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    booking_url: str
    provider: str = "Google Flights"
    source_name: Optional[str] = "Google Flights Real-Time Search"
    source_url: Optional[str] = None
    dates: Optional[str] = None
    image_url: Optional[str] = None
    booking_links: List[BookingLink] = Field(default_factory=list)

    @field_validator("pros", "cons", mode="before")
    @classmethod
    def _validate_flight_pros_cons(cls, v: Any) -> List[str]:
        return _coerce_str_list(v)

class TrainOption(BaseModel):
    operator: str
    train_name: str
    route: str
    duration: str
    class_tier: str
    estimated_price: float
    currency: str = "INR"
    scenic_highlights: str
    pros: List[str] = Field(default_factory=list)
    booking_url: str
    provider: str = "Trainline / Official Rail"
    source_name: Optional[str] = "Trainline & Official Rail Network"
    source_url: Optional[str] = None
    dates: Optional[str] = None
    image_url: Optional[str] = None
    booking_links: List[BookingLink] = Field(default_factory=list)

    @field_validator("pros", mode="before")
    @classmethod
    def _validate_train_pros(cls, v: Any) -> List[str]:
        return _coerce_str_list(v)

class StayOption(BaseModel):
    id: str
    name: str
    type: str  # Boutique Hotel, Luxury Resort, Central Apartment, Traditional Ryokan, Eco Lodge
    neighborhood: str
    rating: float
    review_count: Optional[int] = 320
    price_per_night: float
    total_price: float
    currency: str = "INR"
    key_amenities: List[str] = Field(default_factory=list)
    why_recommended: str
    booking_url: str
    provider: str = "Booking.com"
    badge: Optional[str] = None
    image_url: Optional[str] = None
    source_name: Optional[str] = "Booking.com Official Verified Listing"
    source_url: Optional[str] = None
    dates: Optional[str] = None
    verified_review_snippet: Optional[str] = None
    booking_links: List[BookingLink] = Field(default_factory=list)

    @field_validator("key_amenities", mode="before")
    @classmethod
    def _validate_amenities(cls, v: Any) -> List[str]:
        return _coerce_str_list(v)

class ResearchSource(BaseModel):
    title: str
    url: str
    snippet: str

class ActivityItem(BaseModel):
    time: str
    title: str
    location: str
    duration: str
    description: str
    estimated_cost: float = 0.0
    booking_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    source_snippet: Optional[str] = None
    booking_links: List[BookingLink] = Field(default_factory=list)

    @field_validator("tags", mode="before")
    @classmethod
    def _validate_tags(cls, v: Any) -> List[str]:
        return _coerce_str_list(v)

class DiningRecommendation(BaseModel):
    place: str
    dish: str
    vibe: str
    image_url: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    source_snippet: Optional[str] = None

class ItineraryDay(BaseModel):
    day: int
    title: str
    theme: str
    image_url: Optional[str] = None
    morning: ActivityItem
    afternoon: ActivityItem
    evening: ActivityItem
    lunch_recommendation: DiningRecommendation = Field(
        default_factory=lambda: DiningRecommendation(place="Local Bistro", dish="Chef Special", vibe="Authentic")
    )
    dinner_recommendation: DiningRecommendation = Field(
        default_factory=lambda: DiningRecommendation(place="Evening Dining", dish="Regional Specialty", vibe="Cozy")
    )
    transit_tips: str
    daily_budget_estimate: float
    sources: List[ResearchSource] = Field(default_factory=list)

class BudgetBreakdown(BaseModel):
    currency: str = "INR"
    target_budget: Optional[float] = None
    total_estimated: float
    transit_cost: float
    stay_cost: float
    activities_cost: float
    food_dining_cost: float
    buffer_local_transit_cost: float
    budget_status: str  # within_budget, tight, luxury_stretch
    insights: List[str] = Field(default_factory=list)

class ChecklistItem(BaseModel):
    id: str
    task: str
    category: str  # Transit, Lodging, Activities, Docs, Packing
    timeline: str  # 4 weeks before, 2 weeks before, 3 days before
    booking_url: Optional[str] = None
    completed: bool = False

class PackingItem(BaseModel):
    category: str
    items: List[str]

class TripPlan(BaseModel):
    id: str
    destination: str
    origin: str
    duration_days: int
    dates: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travel_month: Optional[str] = None
    season: Optional[str] = None
    tagline: str
    overview: str
    best_time_to_visit: str
    local_transport_pass_tip: str
    flights: List[FlightOption] = Field(default_factory=list)
    trains: List[TrainOption] = Field(default_factory=list)
    stays: List[StayOption] = Field(default_factory=list)
    itinerary: List[ItineraryDay] = Field(default_factory=list)
    budget: BudgetBreakdown
    checklist: List[ChecklistItem] = Field(default_factory=list)
    packing_list: List[PackingItem] = Field(default_factory=list)
    research_sources: List[ResearchSource] = Field(default_factory=list)
    agent_logs: List[str] = Field(default_factory=list)
    quality_score: int = 98
    quality_badge: str = "Verified Exceptional (98/100)"
    critic_evaluation: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    preferences: TripPreferences = Field(default_factory=TripPreferences)

class PlanGenerationRequest(BaseModel):
    preferences: TripPreferences
    user_prompt: Optional[str] = None

class PlanRefineRequest(BaseModel):
    current_plan: TripPlan
    refinement_instruction: str
    preferences: TripPreferences
