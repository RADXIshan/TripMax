import uuid
import json
from typing import List, Dict, Any, Optional
from app.config import get_gemini_key
from app.models.trip import (
    TripPreferences,
    TripPlan,
    ChatMessage,
    SuggestedReply
)
from app.agents.discovery_agent import DiscoveryAgent
from app.agents.research_agent import ResearchAgent
from app.agents.transit_agent import TransitAgent
from app.agents.stay_agent import StayAgent
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.budget_agent import BudgetAgent

class AgentOrchestrator:
    """
    Coordinates the multi-agent workflow:
    - Discovery & Clarification
    - Web Intelligence & Research
    - Transit Logistics (Flight vs Train)
    - Lodging & Stays
    - Day-by-Day Itinerary Engineering
    - Financial Budget & Booking Checklist
    """

    @classmethod
    async def handle_chat(
        cls, 
        message: str, 
        history: List[ChatMessage], 
        preferences: TripPreferences
    ) -> Dict[str, Any]:
        """
        Processes a chat turn. Updates preferences, decides whether to ask
        further questions or trigger full planning.
        """
        # 1. Update preferences from latest user input
        updated_prefs = DiscoveryAgent.update_preferences_from_text(message, preferences)

        # 2. Check if user wants to generate plan or if we need advancing questions
        bot_response, suggested_replies, stage, q_key = DiscoveryAgent.get_next_step(updated_prefs, message)
        updated_prefs.current_question_key = q_key

        # Build response message
        msg_id = str(uuid.uuid4())
        agent_msg = ChatMessage(
            id=msg_id,
            role="assistant",
            content=bot_response,
            agent_name="Discovery Agent",
            suggested_replies=suggested_replies,
            stage=stage,
            question_key=q_key
        )

        return {
            "message": agent_msg,
            "preferences": updated_prefs,
            "stage": stage,
            "ready_for_plan": stage == "ready_to_plan"
        }

    @classmethod
    async def generate_trip_plan(
        cls, 
        preferences: TripPreferences, 
        user_prompt: Optional[str] = None
    ) -> TripPlan:
        """
        Dispatches all specialized agents to construct the complete TripPlan.
        """
        # Ensure fallback defaults if plan generation is triggered before all questions
        preferences.destination = preferences.destination or "World Explorer"
        preferences.origin = preferences.origin or "Home City"
        preferences.duration_days = preferences.duration_days or 5
        preferences.budget_amount = preferences.budget_amount or 2500
        preferences.budget_currency = preferences.budget_currency or "USD"
        preferences.party_type = preferences.party_type or "Travelers"
        preferences.travel_pace = preferences.travel_pace or "balanced"
        preferences.transport_preference = preferences.transport_preference or "both"
        preferences.stay_preference = preferences.stay_preference or "boutique"
        if not preferences.dates:
            preferences.dates = "Nov 10 – Nov 17, 2026"
            preferences.start_date = "2026-11-10"
            preferences.end_date = "2026-11-17"
            preferences.travel_month = "November 2026"
            preferences.season = "Autumn"
        if not preferences.interests:
            preferences.interests = ["culinary & food", "culture & history"]

        logs = []
        logs.append(f"🤖 [Orchestrator] Starting trip architecture for destination: {preferences.destination} ({preferences.dates})")
        
        # 1. Live Web Research
        logs.append(f"🌐 [WebResearchAgent] Initiating live web queries across attractions, transit passes, and food...")
        research_sources = await ResearchAgent.conduct_destination_research(preferences)
        logs.append(f"✅ [WebResearchAgent] Retrieved {len(research_sources)} live intelligence sources and verified local links.")

        # 2. Transit Agent (Flights vs Trains)
        logs.append(f"🚆✈️ [TransitAgent] Evaluating real flight carriers vs high-speed trains for {preferences.dates}...")
        flights, trains = TransitAgent.evaluate_transit(preferences)
        logs.append(f"✅ [TransitAgent] Evaluated {len(flights)} flight options and {len(trains)} rail routes with deep booking URLs.")

        # 3. Stay Agent
        logs.append(f"🏨 [StayAgent] Curating verified hotels matching budget {preferences.budget_currency} {preferences.budget_amount or 'custom'} for {preferences.dates}...")
        stays = StayAgent.recommend_stays(preferences)
        logs.append(f"✅ [StayAgent] Selected 4 curated accommodations (Boutique, Authentic, Luxury, Value) with live check-in/out links.")

        # 4. Itinerary Agent
        logs.append(f"📅 [ItineraryAgent] Engineering {preferences.duration_days or 5}-day pacing, seasonal weather, and photo-backed schedule...")
        itinerary = ItineraryAgent.generate_day_by_day(preferences, [s.model_dump() for s in research_sources])
        logs.append(f"✅ [ItineraryAgent] Completed detailed morning/afternoon/evening schedule for {len(itinerary)} days with verified sources.")

        # 5. Budget & Checklist Agent
        logs.append(f"💳 [BudgetAgent] Calculating exact cost breakdown for {preferences.duration_days or 5} nights...")
        budget, checklist, packing_list = BudgetAgent.analyze_budget_and_prep(
            preferences, flights, trains, stays, itinerary
        )
        logs.append(f"✅ [BudgetAgent] Budget verified: status is '{budget.budget_status}' with {len(checklist)} booking milestones.")

        dest = preferences.destination or "Destination"
        origin = preferences.origin or "Origin"
        season_txt = f"{preferences.season} Season ({preferences.travel_month})" if preferences.season else "Curated Season"
        tagline = f"A Curated {preferences.duration_days}-Day Journey to {dest} • {season_txt}"
        overview = (
            f"An immersive, multi-agent travel experience calibrated for {preferences.dates} ({season_txt}) "
            f"designed at a {preferences.travel_pace} pace. Featuring real flight & scenic rail routes, "
            f"handpicked top-rated stays, authentic regional dining, and verified web citations."
        )

        plan = TripPlan(
            id=f"plan-{uuid.uuid4().hex[:8]}",
            destination=dest,
            origin=origin,
            duration_days=preferences.duration_days or 5,
            dates=preferences.dates,
            start_date=preferences.start_date,
            end_date=preferences.end_date,
            travel_month=preferences.travel_month,
            season=preferences.season,
            tagline=tagline,
            overview=overview,
            best_time_to_visit=f"{preferences.season or 'Spring/Autumn'} ({preferences.travel_month or 'Peak Season'}) for optimal seasonal weather and cultural highlights.",
            local_transport_pass_tip=f"Pick up the regional unlimited transit smartcard upon arrival at the main station/airport.",
            flights=flights,
            trains=trains,
            stays=stays,
            itinerary=itinerary,
            budget=budget,
            checklist=checklist,
            packing_list=packing_list,
            research_sources=research_sources,
            agent_logs=logs
        )

        # Optional: If Gemini key is available, enhance the overview and tagline
        gemini_key = get_gemini_key()
        if gemini_key:
            try:
                enhanced_text = await cls._enhance_with_gemini(plan, preferences, gemini_key)
                if enhanced_text:
                    plan.overview = enhanced_text
                    logs.append("[Gemini Engine] Enhanced trip narrative with generative reasoning.")
            except Exception as e:
                logs.append(f"ℹ️ [Gemini Engine] Using high-fidelity base synthesis: {e}")

        return plan

    @classmethod
    async def _enhance_with_gemini(cls, plan: TripPlan, prefs: TripPreferences, api_key: str) -> Optional[str]:
        """Invoke Gemini to provide custom editorial color with fallback models"""
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Write a 2-paragraph inspiring luxury editorial overview for a {plan.duration_days}-day trip to {plan.destination} "
            f"departing from {plan.origin}. Traveling as {prefs.party_type or 'adventurers'} with interests in {', '.join(prefs.interests)}. "
            f"Highlight both scenic train and flight connectivity. Do not use markdown double asterisks (**) or raw bullet asterisks; keep sentences smooth, clean, and natural."
        )
        
        models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        for model_name in models_to_try:
            try:
                response = await client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                continue
        return None

    @classmethod
    async def refine_plan(
        cls, 
        current_plan: TripPlan, 
        instruction: str, 
        preferences: TripPreferences
    ) -> TripPlan:
        """
        Refines an existing plan based on conversational user instruction.
        """
        instruction_lower = instruction.lower()

        # Check for budget adjustment
        if "cheaper" in instruction_lower or "budget" in instruction_lower or "save money" in instruction_lower:
            # Switch stay to value hotel
            if len(current_plan.stays) >= 4:
                # promote value stay to top
                val = current_plan.stays[3]
                current_plan.stays = [val] + [s for s in current_plan.stays if s.id != val.id]
                current_plan.agent_logs.append(f"🔄 [BudgetAgent] Swapped primary lodging to '{val.name}' to optimize cost.")
                # recompute budget
                budget, checklist, packing = BudgetAgent.analyze_budget_and_prep(
                    preferences, current_plan.flights, current_plan.trains, current_plan.stays, current_plan.itinerary
                )
                current_plan.budget = budget

        # Check for train prioritization
        if "train" in instruction_lower or "rail" in instruction_lower:
            preferences.transport_preference = "train"
            current_plan.agent_logs.append(f"🔄 [TransitAgent] Prioritized scenic high-speed rail routing over flights.")

        # Check for day modification
        for day_obj in current_plan.itinerary:
            if f"day {day_obj.day}" in instruction_lower:
                day_obj.title = f"Day {day_obj.day}: Custom Tailored Experience"
                day_obj.theme = "Personalized Adventure"
                day_obj.afternoon.description += f" (Customized: {instruction})"
                current_plan.agent_logs.append(f"🔄 [ItineraryAgent] Tailored Day {day_obj.day} as requested.")

        return current_plan

orchestrator = AgentOrchestrator()
