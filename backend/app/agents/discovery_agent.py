import re
import uuid
from typing import Tuple, List, Optional
from app.models.trip import TripPreferences, ChatMessage, SuggestedReply

class DiscoveryAgent:
    """
    Intelligently analyzes user messages, updates extracted preferences,
    and asks advancing, structured questions with quick-reply buttons.
    """

    @classmethod
    def update_preferences_from_text(cls, text: str, prefs: TripPreferences) -> TripPreferences:
        text_lower = text.lower()

        # Destination detection (common words or patterns)
        if not prefs.destination:
            # Check for patterns like "to [Destination]", "in [Destination]", "visit [Destination]"
            dest_match = re.search(r'\b(?:to|in|visit|explore|trip to)\s+([a-zA-Z\s]{3,25})(?:for|\?|\.|\,|$|\bfrom\b)', text, re.IGNORECASE)
            if dest_match:
                candidate = dest_match.group(1).strip()
                # Exclude common non-destination words
                if candidate.lower() not in ["a trip", "my family", "budget", "flights", "vacation"]:
                    prefs.destination = candidate.title()
            elif any(w in text_lower for w in ["japan", "tokyo", "kyoto", "paris", "rome", "italy", "switzerland", "london", "barcelona", "bali", "vietnam", "goa", "kerala", "new york", "hawaii"]):
                for place in ["Tokyo", "Kyoto", "Japan", "Paris", "Rome", "Italy", "Switzerland", "London", "Barcelona", "Bali", "Vietnam", "Goa", "Kerala", "New York", "Hawaii"]:
                    if place.lower() in text_lower:
                        prefs.destination = place
                        break

        # Origin detection
        if not prefs.origin:
            origin_match = re.search(r'\b(?:from|leaving from|departing from)\s+([a-zA-Z\s]{3,20})(?:to|\?|\.|\,|$)', text, re.IGNORECASE)
            if origin_match:
                prefs.origin = origin_match.group(1).strip().title()

        # Duration detection
        duration_match = re.search(r'(\d+)\s*(?:days?|nights?|day)', text_lower)
        if duration_match:
            try:
                days = int(duration_match.group(1))
                if 1 <= days <= 30:
                    prefs.duration_days = days
            except ValueError:
                pass

        # Budget detection
        budget_match = re.search(r'(?:budget\s*(?:is|of|around)?\s*[\$€£₹]?\s*|[\$€£₹]\s*)(\d[\d,]+)', text_lower)
        if budget_match:
            try:
                clean_num = budget_match.group(1).replace(",", "")
                prefs.budget_amount = float(clean_num)
            except ValueError:
                pass
        
        # Currency detection
        if "€" in text or "eur" in text_lower or "euro" in text_lower:
            prefs.budget_currency = "EUR"
        elif "£" in text or "gbp" in text_lower or "pound" in text_lower:
            prefs.budget_currency = "GBP"
        elif "₹" in text or "inr" in text_lower or "rupee" in text_lower:
            prefs.budget_currency = "INR"
        elif "¥" in text or "jpy" in text_lower or "yen" in text_lower:
            prefs.budget_currency = "JPY"

        # Party type detection
        if any(w in text_lower for w in ["solo", "by myself", "alone"]):
            prefs.party_type = "Solo Traveler"
        elif any(w in text_lower for w in ["couple", "partner", "wife", "husband", "girlfriend", "boyfriend", "honeymoon"]):
            prefs.party_type = "Couple / Romantic"
        elif any(w in text_lower for w in ["friends", "buddies", "group", "mates"]):
            prefs.party_type = "Friends Group"
        elif any(w in text_lower for w in ["family", "kids", "children", "parents"]):
            prefs.party_type = "Family"

        # Travel pace
        if any(w in text_lower for w in ["relax", "chill", "slow", "unwind", "easygoing"]):
            prefs.travel_pace = "relaxed"
        elif any(w in text_lower for w in ["fast", "packed", "see everything", "action packed"]):
            prefs.travel_pace = "fast-paced"
        elif any(w in text_lower for w in ["balanced", "moderate", "mix"]):
            prefs.travel_pace = "balanced"

        # Transport preference
        if "train only" in text_lower or ("train" in text_lower and "no flight" in text_lower):
            prefs.transport_preference = "train"
        elif "flight only" in text_lower or ("fly" in text_lower and "no train" in text_lower):
            prefs.transport_preference = "flight"
        elif "train" in text_lower or "flight" in text_lower:
            prefs.transport_preference = "both"

        # Interests
        known_interests = {
            "food": ["food", "foodie", "culinary", "restaurants", "dining", "street food", "ramen", "tasting", "wine"],
            "culture & history": ["culture", "history", "temples", "museums", "monuments", "heritage", "historic"],
            "nature & outdoors": ["nature", "hiking", "mountains", "scenery", "scenic", "beaches", "lake", "landscape"],
            "nightlife & bars": ["nightlife", "clubs", "bars", "party", "cocktails", "pub"],
            "shopping & markets": ["shopping", "boutiques", "markets", "bazaars", "vintage", "souvenirs"],
            "photography & viewpoints": ["photography", "photo", "viewpoint", "instagrammable", "panoramic"],
            "wellness & spa": ["wellness", "spa", "onsen", "hot springs", "yoga", "retreat"]
        }

        for cat, keywords in known_interests.items():
            if any(k in text_lower for k in keywords):
                if cat not in prefs.interests:
                    prefs.interests.append(cat)

        return prefs

    @classmethod
    def get_next_step(cls, prefs: TripPreferences, user_text: str = "") -> Tuple[str, List[SuggestedReply], str]:
        """
        Determines the next conversation prompt, suggested reply buttons, and current stage.
        Stages: 'discovery' or 'ready_to_plan'
        """
        user_lower = user_text.lower()
        ready_triggers = ["plan now", "generate plan", "i am ready", "i'm ready", "create itinerary", "build trip", "let's go"]
        if any(tr in user_lower for tr in ready_triggers):
            return (
                f"Understood! All agents are assembling now to research and engineer your complete trip plan for {prefs.destination or 'your destination'}.",
                [],
                "ready_to_plan"
            )

        # 1. Destination check
        if not prefs.destination:
            return (
                "Welcome to TripMax! I am your trip discovery specialist. Where in the world would you love to travel to?",
                [
                    SuggestedReply(label="Kyoto & Tokyo, Japan", value="I want to visit Kyoto & Tokyo, Japan"),
                    SuggestedReply(label="Swiss Alps & Zurich", value="Planning a trip to Swiss Alps & Zurich, Switzerland"),
                    SuggestedReply(label="Amalfi Coast, Italy", value="Looking for a trip to the Amalfi Coast, Italy"),
                    SuggestedReply(label="Paris, France", value="I'd love to explore Paris, France"),
                    SuggestedReply(label="Bali, Indonesia", value="Want to travel to Bali, Indonesia"),
                ],
                "discovery"
            )

        # 2. Origin & Duration check
        if not prefs.origin:
            return (
                f"{prefs.destination} is an incredible choice! Where will you be departing from, and how many days are you envisioning?",
                [
                    SuggestedReply(label="New York (JFK) • 7 Days", value="Departing from New York for 7 days"),
                    SuggestedReply(label="London (LHR) • 5 Days", value="Departing from London for 5 days"),
                    SuggestedReply(label="San Francisco (SFO) • 8 Days", value="Departing from San Francisco for 8 days"),
                    SuggestedReply(label="Mumbai / Delhi • 6 Days", value="Departing from Mumbai for 6 days"),
                    SuggestedReply(label="Berlin (BER) • 4 Days", value="Departing from Berlin for 4 days"),
                ],
                "discovery"
            )

        # 3. Party type & Travel pace
        if not prefs.party_type:
            return (
                f"Got it, departing from {prefs.origin} for a {prefs.duration_days}-day adventure! Who are you traveling with, and what travel pace do you prefer?",
                [
                    SuggestedReply(label="Couple • Balanced Pace", value="Traveling as a couple, looking for a balanced pace"),
                    SuggestedReply(label="Solo Traveler • Immersive & Relaxed", value="I'm a solo traveler, prefer a relaxed and immersive pace"),
                    SuggestedReply(label="Friends Group • Action-Packed", value="Traveling with a group of friends, action-packed pace"),
                    SuggestedReply(label="Family with Kids • Relaxed", value="Traveling with family and kids, relaxed pace"),
                ],
                "discovery"
            )

        # 4. Budget & Transport preference
        if not prefs.budget_amount:
            curr = prefs.budget_currency
            symbol = "€" if curr == "EUR" else ("£" if curr == "GBP" else ("₹" if curr == "INR" else "$"))
            return (
                f"What is your total estimated budget per person for this trip? Also, do you prefer Flights, Trains, or Both?",
                [
                    SuggestedReply(label=f"Smart Budget ({symbol}1,200 - {symbol}1,800)", value=f"My budget is around {symbol}1500, compare both flights and trains"),
                    SuggestedReply(label=f"Comfort & Moderate ({symbol}2,500 - {symbol}3,500)", value=f"My budget is around {symbol}3000, open to both flights and scenic trains"),
                    SuggestedReply(label=f"Luxury & Premium ({symbol}5,000+)", value=f"Budget is {symbol}5500, recommend high-speed flights and first-class trains"),
                    SuggestedReply(label="Scenic Rail Fan (Trains Preferred)", value="Budget is around $2500, highly prioritize scenic train travel"),
                ],
                "discovery"
            )

        # 5. Core Interests & Vibe
        if len(prefs.interests) < 2:
            return (
                f"Almost there! What are your absolute favorite vibes and experiences for {prefs.destination}? Select or tell me your favorites:",
                [
                    SuggestedReply(label="Culinary & Street Food + Historic Temples", value="Focus heavily on local food, street eats, and historic cultural sites"),
                    SuggestedReply(label="Scenic Landscapes + Outdoor Nature", value="Love scenic viewpoints, nature, hikes, and photography"),
                    SuggestedReply(label="Vibrant Nightlife + Arts & Shopping", value="Interested in nightlife, cocktail bars, modern art, and shopping"),
                    SuggestedReply(label="Wellness, Hot Springs & Hidden Cafes", value="Looking for quiet hidden gems, wellness, spas, and aesthetic cafes"),
                ],
                "discovery"
            )

        # 6. Accommodation Style
        if "stay_confirmed" not in prefs.completed_steps:
            prefs.completed_steps.append("stay_confirmed")
            return (
                f"Fantastic! What kind of stay matches your vibe for {prefs.destination}?",
                [
                    SuggestedReply(label="Boutique & Aesthetic Hotels", value="I prefer boutique aesthetic hotels with good design"),
                    SuggestedReply(label="Authentic & Unique (Ryokan/Villas)", value="I love authentic local stays, heritage ryokans, or unique architecture"),
                    SuggestedReply(label="5-Star Luxury with Great Views", value="Looking for luxury 5-star hotels with premier amenities"),
                    SuggestedReply(label="Centrally-Located Smart Comfort", value="Central location, clean modern smart comfort"),
                ],
                "discovery"
            )

        # If all core preferences are collected
        return (
            f"All your preferences are locked in! I have everything needed:\n"
            f"• Destination: {prefs.destination}\n"
            f"• Origin: {prefs.origin}\n"
            f"• Duration: {prefs.duration_days} Days\n"
            f"• Party: {prefs.party_type}\n"
            f"• Pace: {prefs.travel_pace.title()}\n"
            f"• Budget: {prefs.budget_currency} {prefs.budget_amount:,.0f}\n"
            f"• Interests: {', '.join(prefs.interests)}\n\n"
            f"Click below to launch our multi-agent web research and build your complete trip plan!",
            [
                SuggestedReply(label="Generate Complete Trip Plan Now", value="Generate Plan Now"),
                SuggestedReply(label="Adjust Budget", value="I want to adjust my budget"),
                SuggestedReply(label="Add Special Requests", value="I have special dietary and accessibility requirements"),
            ],
            "ready_to_plan"
        )
