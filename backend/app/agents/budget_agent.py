from typing import List, Tuple
from app.models.trip import (
    TripPreferences, 
    BudgetBreakdown, 
    ChecklistItem, 
    PackingItem, 
    FlightOption, 
    TrainOption, 
    StayOption, 
    ItineraryDay
)

class BudgetAgent:
    """
    Computes precise financial distributions, flags budget surpluses or stretches,
    and produces actionable pre-trip booking checklists and tailored packing lists.
    """

    @classmethod
    def analyze_budget_and_prep(
        cls,
        prefs: TripPreferences,
        flights: List[FlightOption],
        trains: List[TrainOption],
        stays: List[StayOption],
        itinerary: List[ItineraryDay]
    ) -> Tuple[BudgetBreakdown, List[ChecklistItem], List[PackingItem]]:
        dest = prefs.destination or "Destination"
        days = prefs.duration_days or 5
        curr = prefs.budget_currency

        rate = 1.0
        if curr == "EUR":
            rate = 0.92
        elif curr == "GBP":
            rate = 0.78
        elif curr == "INR":
            rate = 84.0
        elif curr == "JPY":
            rate = 152.0

        # Estimate transit cost: average of selected flight/train
        chosen_flight_cost = flights[0].estimated_price if flights else (350.0 * rate)
        chosen_train_cost = trains[0].estimated_price if trains else (100.0 * rate)
        
        # If user wants both or flights, or if no trains exist for cross-country routes
        if prefs.transport_preference == "train" and trains:
            transit_cost = chosen_train_cost
        elif prefs.transport_preference == "flight" or not trains:
            transit_cost = chosen_flight_cost
        else:
            transit_cost = chosen_flight_cost  # default main long haul

        # Select stay that best matches user's budget and preference
        target = prefs.budget_amount
        selected_stay = None
        if stays:
            if prefs.stay_preference == "budget" or (target and target > 0 and (stays[0].total_price > target * 0.5)):
                # Pick best value or budget-friendly stay that fits within lodging budget
                budget_matches = [s for s in stays if target and s.total_price <= (target * 0.5)]
                selected_stay = budget_matches[0] if budget_matches else stays[-1]
            else:
                selected_stay = stays[0]

        stay_cost = selected_stay.total_price if selected_stay else (45.0 * rate * days)

        # Activities cost sum across days
        activities_cost = sum(
            day.morning.estimated_cost + day.afternoon.estimated_cost + day.evening.estimated_cost
            for day in itinerary
        )

        # Realistic Food & dining cost estimate calibrated to party/budget tier
        if curr == "INR":
            # Real Indian dining cost: authentic local meals, street food & cafes
            if target and target <= 30000:
                food_daily_rate = 800.0  # ~₹800/day per person for delicious authentic local food
            elif target and target <= 60000:
                food_daily_rate = 1200.0 # ~₹1,200/day
            else:
                food_daily_rate = 2000.0 # ~₹2,000/day fine dining
        elif curr == "JPY":
            food_daily_rate = 4500.0
        elif curr == "EUR":
            food_daily_rate = 40.0
        elif curr == "GBP":
            food_daily_rate = 35.0
        else: # USD
            food_daily_rate = 45.0

        food_cost = food_daily_rate * days

        # Local transit & buffer (local cabs, metro, souvenirs, contingencies)
        buffer_cost = round((stay_cost + transit_cost) * 0.08, 0)

        total_estimated = round(transit_cost + stay_cost + activities_cost + food_cost + buffer_cost, 0)

        # Determine budget status
        insights = []
        if target and target > 0:
            diff = target - total_estimated
            if diff >= 0:
                budget_status = "within_budget"
                insights.append(f"✅ Great news! Your estimated total ({curr} {total_estimated:,.0f}) is within your {curr} {target:,.0f} budget by {curr} {diff:,.0f}.")
                insights.append(f"💡 You have room for an extra fine dining experience or special day tour excursion.")
            elif abs(diff) <= (target * 0.15):
                budget_status = "tight"
                insights.append(f"⚖️ Your plan is right at your target budget boundary ({curr} {total_estimated:,.0f} vs {curr} {target:,.0f}).")
                insights.append(f"💡 Booking flights and stays 4-6 weeks early will lock in the lower tier rates to stay strictly under cap.")
            else:
                budget_status = "luxury_stretch"
                insights.append(f"⚠️ Current premium selections total {curr} {total_estimated:,.0f}, slightly exceeding {curr} {target:,.0f}.")
                insights.append(f"💡 Switching to our 'Smart Value' stay saves {curr} {stays[3].total_price - stays[0].total_price:,.0f} and brings you right into budget!")
        else:
            budget_status = "balanced"
            insights.append(f"📊 Balanced mid-to-upscale projection totaling {curr} {total_estimated:,.0f} for {days} days.")

        budget = BudgetBreakdown(
            currency=curr,
            target_budget=target,
            total_estimated=total_estimated,
            transit_cost=round(transit_cost, 0),
            stay_cost=round(stay_cost, 0),
            activities_cost=round(activities_cost, 0),
            food_dining_cost=round(food_cost, 0),
            buffer_local_transit_cost=round(buffer_cost, 0),
            budget_status=budget_status,
            insights=insights
        )

        transit_task_label = f"Book Flights / High-Speed Train tickets to {dest}" if trains else f"Book Commercial Flights to {dest}"

        # Actionable checklist
        checklist = [
            ChecklistItem(
                id="check-1",
                task=transit_task_label,
                category="Transit",
                timeline="6 to 8 weeks before trip",
                booking_url=flights[0].booking_url if flights else None,
                completed=False
            ),
            ChecklistItem(
                id="check-2",
                task=f"Reserve accommodation in {dest} ({stays[0].name})",
                category="Lodging",
                timeline="4 to 6 weeks before trip",
                booking_url=stays[0].booking_url if stays else None,
                completed=False
            ),
            ChecklistItem(
                id="check-3",
                task="Reserve priority time-slot tickets for top cultural attractions & museums",
                category="Activities",
                timeline="2 to 3 weeks before trip",
                booking_url=itinerary[0].morning.booking_url if itinerary else None,
                completed=False
            ),
            ChecklistItem(
                id="check-4",
                task=f"Check visa requirements and passport validity (min 6 months)",
                category="Docs",
                timeline="4 weeks before trip",
                booking_url="https://visaguide.world/",
                completed=False
            ),
            ChecklistItem(
                id="check-5",
                task=f"Purchase eSIM or international roaming data pass for {dest}",
                category="Transit",
                timeline="3 days before departure",
                booking_url="https://www.airalo.com/",
                completed=False
            ),
            ChecklistItem(
                id="check-6",
                task="Inform bank of international credit card usage and verify zero foreign transaction fees",
                category="Docs",
                timeline="1 week before departure",
                completed=False
            )
        ]

        # Tailored packing list
        packing_list = [
            PackingItem(
                category="Essentials & Documents",
                items=[
                    "Passport (valid for at least 6 months)",
                    "Flight/Train mobile boarding passes & PDF confirmations",
                    "Credit/Debit cards with zero foreign transaction fees + small local cash",
                    "Travel insurance policy card",
                    "eSIM QR code or portable Wi-Fi confirmation"
                ]
            ),
            PackingItem(
                category="Apparel & Footwear",
                items=[
                    "Ultra-comfortable walking shoes / broken-in sneakers (15,000+ steps/day)",
                    "Versatile layering pieces (breathable base layers, lightweight merino wool or fleece)",
                    "Compact windproof / rain jacket",
                    "Smart-casual evening dinner outfits",
                    "Modest clothing for sacred temples / historic cathedrals (shoulders & knees covered)"
                ]
            ),
            PackingItem(
                category="Tech & Electronics",
                items=[
                    "Universal travel plug adapter with multiple USB-C ports",
                    "High-capacity power bank (10,000-20,000 mAh)",
                    "Noise-cancelling headphones for flights and trains",
                    "Offline Google Maps download of destination"
                ]
            ),
            PackingItem(
                category="Health & Personal Comfort",
                items=[
                    "Refillable insulated water bottle",
                    "Personal first-aid kit (pain relief, blister cushions, electrolyte sachets)",
                    "UV sunscreen and lip balm",
                    "Travel-sized laundry detergent strips or compact steamer"
                ]
            )
        ]

        return budget, checklist, packing_list
