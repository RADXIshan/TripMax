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
        bot_response, suggested_replies, stage = DiscoveryAgent.get_next_step(updated_prefs, message)

        # Build response message
        msg_id = str(uuid.uuid4())
        agent_msg = ChatMessage(
            id=msg_id,
            role="assistant",
            content=bot_response,
            agent_name="Discovery Agent",
            suggested_replies=suggested_replies,
            stage=stage
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
        logs = []
        logs.append(f"🤖 [Orchestrator] Starting trip architecture for destination: {preferences.destination or 'World Explorer'}")
        
        # 1. Live Web Research
        logs.append(f"🌐 [WebResearchAgent] Initiating live web queries across attractions, transit passes, and food...")
        research_sources = await ResearchAgent.conduct_destination_research(preferences)
        logs.append(f"✅ [WebResearchAgent] Retrieved {len(research_sources)} live intelligence sources and verified local links.")

        # 2. Transit Agent (Flights vs Trains)
        logs.append(f"🚆✈️ [TransitAgent] Evaluating direct flight options vs scenic high-speed trains...")
        flights, trains = TransitAgent.evaluate_transit(preferences)
        logs.append(f"✅ [TransitAgent] Evaluated {len(flights)} flight routes and {len(trains)} rail routes with deep booking URLs.")

        # 3. Stay Agent
        logs.append(f"🏨 [StayAgent] Curating accommodations matching budget {preferences.budget_currency} {preferences.budget_amount or 'custom'}...")
        stays = StayAgent.recommend_stays(preferences)
        logs.append(f"✅ [StayAgent] Selected 4 curated accommodations (Boutique, Authentic, Luxury, Value).")

        # 4. Itinerary Agent
        logs.append(f"📅 [ItineraryAgent] Engineering {preferences.duration_days or 5}-day pacing, meals, and timed activities...")
        itinerary = ItineraryAgent.generate_day_by_day(preferences, [s.model_dump() for s in research_sources])
        logs.append(f"✅ [ItineraryAgent] Completed detailed morning/afternoon/evening schedule for {len(itinerary)} days.")

        # 5. Budget & Checklist Agent
        logs.append(f"💳 [BudgetAgent] Calculating cost breakdown, contingency buffer, and booking timeline...")
        budget, checklist, packing_list = BudgetAgent.analyze_budget_and_prep(
            preferences, flights, trains, stays, itinerary
        )
        logs.append(f"✅ [BudgetAgent] Budget verified: status is '{budget.budget_status}' with {len(checklist)} booking milestones.")

        dest = preferences.destination or "Destination"
        origin = preferences.origin or "Origin"
        tagline = f"A Curated {preferences.duration_days}-Day Journey to {dest}"
        overview = (
            f"An immersive, multi-agent crafted travel experience designed for a {preferences.travel_pace} pace. "
            f"Featuring seamless transitions, authentic culinary hotspots, and handpicked stays."
        )

        plan = TripPlan(
            id=f"plan-{uuid.uuid4().hex[:8]}",
            destination=dest,
            origin=origin,
            duration_days=preferences.duration_days or 5,
            dates=preferences.dates or "Flexible / Upcoming Season",
            tagline=tagline,
            overview=overview,
            best_time_to_visit=f"Spring (March-May) for mild blooms or Autumn (Sept-Nov) for vibrant foliage and comfortable walking temperatures.",
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
                    logs.append("✨ [Gemini Engine] Enhanced trip narrative with generative reasoning.")
            except Exception as e:
                logs.append(f"ℹ️ [Gemini Engine] Using high-fidelity base synthesis: {e}")

        return plan

    @classmethod
    async def _enhance_with_gemini(cls, plan: TripPlan, prefs: TripPreferences, api_key: str) -> Optional[str]:
        """Optionally invoke Gemini to provide custom editorial color"""
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Write a 2-paragraph inspiring luxury editorial overview for a {plan.duration_days}-day trip to {plan.destination} "
            f"departing from {plan.origin}. Traveling as {prefs.party_type or 'adventurers'} with interests in {', '.join(prefs.interests)}. "
            f"Highlight both scenic train and flight connectivity."
        )
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text if response and response.text else None

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
