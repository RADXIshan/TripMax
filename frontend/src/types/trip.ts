export interface TripPreferences {
  destination?: string;
  origin?: string;
  dates?: string;
  duration_days?: number;
  budget_amount?: number;
  budget_currency: string;
  party_type?: string;
  travel_pace?: string;
  transport_preference?: string;
  stay_preference?: string;
  interests: string[];
  special_requirements?: string;
  completed_steps?: string[];
}

export interface SuggestedReply {
  label: string;
  value: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_name?: string;
  suggested_replies?: SuggestedReply[];
  stage?: 'discovery' | 'researching' | 'ready_to_plan' | 'plan_ready' | 'refining';
  timestamp?: string;
}

export interface FlightOption {
  airline: string;
  flight_number?: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  estimated_price: number;
  currency: string;
  pros: string[];
  cons: string[];
  booking_url: string;
  provider: string;
}

export interface TrainOption {
  operator: string;
  train_name: string;
  route: string;
  duration: string;
  class_tier: string;
  estimated_price: number;
  currency: string;
  scenic_highlights: string;
  pros: string[];
  booking_url: string;
  provider: string;
}

export interface StayOption {
  id: string;
  name: string;
  type: string;
  neighborhood: string;
  rating: number;
  review_count?: number;
  price_per_night: number;
  total_price: number;
  currency: string;
  key_amenities: string[];
  why_recommended: string;
  booking_url: string;
  provider: string;
  badge?: string;
}

export interface ActivityItem {
  time: string;
  title: string;
  location: string;
  duration: string;
  description: string;
  estimated_cost: number;
  booking_url?: string;
  tags?: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  theme: string;
  morning: ActivityItem;
  afternoon: ActivityItem;
  evening: ActivityItem;
  lunch_recommendation: {
    place: string;
    dish: string;
    vibe: string;
  };
  dinner_recommendation: {
    place: string;
    dish: string;
    vibe: string;
  };
  transit_tips: string;
  daily_budget_estimate: number;
}

export interface BudgetBreakdown {
  currency: string;
  target_budget?: number;
  total_estimated: number;
  transit_cost: number;
  stay_cost: number;
  activities_cost: number;
  food_dining_cost: number;
  buffer_local_transit_cost: number;
  budget_status: 'within_budget' | 'tight' | 'luxury_stretch' | 'balanced';
  insights: string[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: string;
  timeline: string;
  booking_url?: string;
  completed: boolean;
}

export interface PackingItem {
  category: string;
  items: string[];
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  origin: string;
  duration_days: number;
  dates: string;
  tagline: string;
  overview: string;
  best_time_to_visit: string;
  local_transport_pass_tip: string;
  flights: FlightOption[];
  trains: TrainOption[];
  stays: StayOption[];
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  checklist: ChecklistItem[];
  packing_list: PackingItem[];
  research_sources: ResearchSource[];
  agent_logs: string[];
}
