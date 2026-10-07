from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TripPreferences(BaseModel):
    destination: Optional[str] = None
    origin: Optional[str] = None
    dates: Optional[str] = None
    duration_days: Optional[int] = None
    budget_amount: Optional[float] = None
    budget_currency: str = "USD"
    party_type: Optional[str] = None  # solo, couple, friends, family
    travel_pace: Optional[str] = None  # relaxed, balanced, fast-paced
    transport_preference: Optional[str] = None  # flight, train, both
    stay_preference: Optional[str] = None  # boutique, luxury, budget_hotel, hostel, apartment, authentic
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

class FlightOption(BaseModel):
    airline: str
    flight_number: Optional[str] = None
    departure: str
    arrival: str
    duration: str
    stops: str
    estimated_price: float
    currency: str = "USD"
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    booking_url: str
    provider: str = "Google Flights"

class TrainOption(BaseModel):
    operator: str
    train_name: str
    route: str
    duration: str
    class_tier: str
    estimated_price: float
    currency: str = "USD"
    scenic_highlights: str
    pros: List[str] = Field(default_factory=list)
    booking_url: str
    provider: str = "Trainline / Official Rail"

class StayOption(BaseModel):
    id: str
    name: str
    type: str  # Boutique Hotel, Luxury Resort, Central Apartment, Traditional Ryokan, Eco Lodge
    neighborhood: str
    rating: float
    review_count: Optional[int] = 320
    price_per_night: float
    total_price: float
    currency: str = "USD"
    key_amenities: List[str] = Field(default_factory=list)
    why_recommended: str
    booking_url: str
    provider: str = "Booking.com"
    badge: Optional[str] = None

class ActivityItem(BaseModel):
    time: str
    title: str
    location: str
    duration: str
    description: str
    estimated_cost: float = 0.0
    booking_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class ItineraryDay(BaseModel):
    day: int
    title: str
    theme: str
    morning: ActivityItem
    afternoon: ActivityItem
    evening: ActivityItem
    lunch_recommendation: Dict[str, str] = Field(
        default_factory=lambda: {"place": "Local Bistro", "dish": "Chef Special", "vibe": "Authentic"}
    )
    dinner_recommendation: Dict[str, str] = Field(
        default_factory=lambda: {"place": "Evening Dining", "dish": "Regional Specialty", "vibe": "Cozy"}
    )
    transit_tips: str
    daily_budget_estimate: float

class BudgetBreakdown(BaseModel):
    currency: str = "USD"
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

class ResearchSource(BaseModel):
    title: str
    url: str
    snippet: str

class TripPlan(BaseModel):
    id: str
    destination: str
    origin: str
    duration_days: int
    dates: str
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
