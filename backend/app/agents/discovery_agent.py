import re
from typing import Tuple, List, Optional
from app.models.trip import TripPreferences, SuggestedReply

class DiscoveryAgent:
    """
    Intelligently analyzes user messages, updates extracted preferences,
    and asks sequential, one-by-one structured questions with MCQs
    plus an 'Other' option where the user can enter custom responses.
    """

    @classmethod
    def get_current_question_key(cls, prefs: TripPreferences) -> str:
        if prefs.current_question_key:
            return prefs.current_question_key
        if not prefs.destination:
            return "destination"
        if not prefs.origin:
            return "origin"
        if not prefs.duration_days:
            return "duration"
        if not prefs.party_type:
            return "party_type"
        if not prefs.travel_pace:
            return "travel_pace"
        if not prefs.budget_amount:
            return "budget"
        if not prefs.transport_preference:
            return "transport"
        if len(prefs.interests) == 0:
            return "interests"
        if not prefs.stay_preference:
            return "stay"
        return "ready"

    @classmethod
    def update_preferences_from_text(cls, text: str, prefs: TripPreferences) -> TripPreferences:
        text_clean = text.strip()
        text_lower = text_clean.lower()
        if not text_clean:
            return prefs

        def smart_title(s: str) -> str:
            words = s.split()
            res = []
            for w in words:
                if (w.startswith("(") and w.endswith(")") and len(w) > 2) or (w.isupper() and len(w) <= 4):
                    res.append(w)
                else:
                    res.append(w.capitalize())
            return " ".join(res)

        # Clean common user prefixes like "Other:", "I want...", "My choice is..."
        def clean_val(val: str, prefix_patterns: List[str] = None) -> str:
            v = val.strip()
            patterns = [r'^(?:other\s*[:\-]?\s*)'] + (prefix_patterns or [])
            for p in patterns:
                v = re.sub(p, '', v, flags=re.IGNORECASE).strip()
            # Remove trailing periods or punctuation
            v = re.sub(r'[\.\,\!\?]+$', '', v).strip()
            return v

        q_key = cls.get_current_question_key(prefs)

        # 1. Targeted Extraction based on the active question being asked
        if q_key == "destination":
            cleaned = clean_val(text_clean, [
                r'^(?:i want to (?:visit|go to|explore)\s*)',
                r'^(?:planning a trip to\s*)',
                r'^(?:looking for a trip to\s*)',
                r'^(?:trip to\s*)',
                r'^(?:travel to\s*)',
                r'^(?:visit\s*)'
            ])
            if cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.destination = smart_title(cleaned)
                if "destination" not in prefs.completed_steps:
                    prefs.completed_steps.append("destination")

        elif q_key == "origin":
            cleaned = clean_val(text_clean, [
                r'^(?:departing from\s*)',
                r'^(?:leaving from\s*)',
                r'^(?:flying from\s*)',
                r'^(?:from\s*)'
            ])
            if cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.origin = smart_title(cleaned)
                if "origin" not in prefs.completed_steps:
                    prefs.completed_steps.append("origin")

        elif q_key == "duration":
            num_match = re.search(r'(\d+)', text_clean)
            if num_match:
                try:
                    d = int(num_match.group(1))
                    if 1 <= d <= 60:
                        prefs.duration_days = d
                except ValueError:
                    pass
            elif "one week" in text_lower or "a week" in text_lower or "1 week" in text_lower:
                prefs.duration_days = 7
            elif "two weeks" in text_lower or "2 weeks" in text_lower:
                prefs.duration_days = 14
            elif "three weeks" in text_lower or "3 weeks" in text_lower:
                prefs.duration_days = 21
            elif "weekend" in text_lower:
                prefs.duration_days = 4
            if prefs.duration_days and "duration" not in prefs.completed_steps:
                prefs.completed_steps.append("duration")

        elif q_key == "party_type":
            cleaned = clean_val(text_clean)
            if any(w in text_lower for w in ["solo", "myself", "alone"]):
                prefs.party_type = "Solo Traveler"
            elif any(w in text_lower for w in ["couple", "romantic", "partner", "wife", "husband", "girlfriend", "boyfriend", "honeymoon"]):
                prefs.party_type = "Couple / Romantic"
            elif any(w in text_lower for w in ["family", "kid", "child", "children", "parent"]):
                prefs.party_type = "Family with Children"
            elif any(w in text_lower for w in ["friends", "buddies", "group", "mates", "colleagues"]):
                prefs.party_type = "Group of Friends"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.party_type = cleaned
            if "party_type" not in prefs.completed_steps:
                prefs.completed_steps.append("party_type")

        elif q_key == "travel_pace":
            cleaned = clean_val(text_clean)
            if any(w in text_lower for w in ["relax", "chill", "slow", "unhurried", "leisurely", "easygoing"]):
                prefs.travel_pace = "relaxed"
            elif any(w in text_lower for w in ["fast", "packed", "action", "energetic", "see everything"]):
                prefs.travel_pace = "fast-paced"
            elif any(w in text_lower for w in ["balance", "moderate", "mix"]):
                prefs.travel_pace = "balanced"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.travel_pace = cleaned
            if "travel_pace" not in prefs.completed_steps:
                prefs.completed_steps.append("travel_pace")

        elif q_key == "budget":
            # Detect currency
            if "€" in text_clean or "eur" in text_lower or "euro" in text_lower:
                prefs.budget_currency = "EUR"
            elif "£" in text_clean or "gbp" in text_lower or "pound" in text_lower:
                prefs.budget_currency = "GBP"
            elif "₹" in text_clean or "inr" in text_lower or "rupee" in text_lower:
                prefs.budget_currency = "INR"
            elif "¥" in text_clean or "jpy" in text_lower or "yen" in text_lower:
                prefs.budget_currency = "JPY"
            elif "$" in text_clean or "usd" in text_lower or "dollar" in text_lower:
                prefs.budget_currency = "USD"

            budget_match = re.search(r'(\d[\d,]+(?:\.\d+)?)', text_clean)
            if budget_match:
                try:
                    num_val = float(budget_match.group(1).replace(",", ""))
                    if num_val > 0:
                        prefs.budget_amount = num_val
                except ValueError:
                    pass
            if prefs.budget_amount and "budget" not in prefs.completed_steps:
                prefs.completed_steps.append("budget")

        elif q_key == "transport":
            cleaned = clean_val(text_clean)
            if "train" in text_lower and "flight" not in text_lower and "fly" not in text_lower:
                prefs.transport_preference = "train"
            elif ("flight" in text_lower or "fly" in text_lower) and "train" not in text_lower and "rail" not in text_lower:
                prefs.transport_preference = "flight"
            elif "both" in text_lower:
                prefs.transport_preference = "both"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.transport_preference = cleaned
            if "transport" not in prefs.completed_steps:
                prefs.completed_steps.append("transport")

        elif q_key == "interests":
            cleaned = clean_val(text_clean)
            known_cats = {
                "culinary & food": ["food", "foodie", "culinary", "restaurant", "dining", "street food", "ramen", "tasting", "wine", "cafe", "eats"],
                "culture & history": ["culture", "history", "temple", "museum", "monument", "heritage", "historic", "shrine", "castle"],
                "nature & outdoors": ["nature", "hiking", "mountain", "scenery", "scenic", "beach", "lake", "landscape", "outdoors", "park"],
                "nightlife & bars": ["nightlife", "club", "bar", "party", "cocktail", "pub", "speakeasy"],
                "shopping & markets": ["shopping", "boutique", "market", "bazaar", "vintage", "souvenir", "artisan"],
                "photography & viewpoints": ["photography", "photo", "viewpoint", "panoramic"],
                "wellness & relaxation": ["wellness", "spa", "onsen", "hot spring", "yoga", "retreat"]
            }
            matched_any = False
            for cat, keywords in known_cats.items():
                if any(k in text_lower for k in keywords):
                    if cat not in prefs.interests:
                        prefs.interests.append(cat)
                    matched_any = True
            if not matched_any and cleaned and cleaned.lower() not in ["other", "skip"]:
                if cleaned not in prefs.interests:
                    prefs.interests.append(cleaned)
            if "interests" not in prefs.completed_steps:
                prefs.completed_steps.append("interests")

        elif q_key == "stay":
            cleaned = clean_val(text_clean)
            if any(w in text_lower for w in ["boutique", "design", "aesthetic"]):
                prefs.stay_preference = "Boutique Hotel"
            elif any(w in text_lower for w in ["ryokan", "authentic", "heritage", "traditional", "villa", "riad"]):
                prefs.stay_preference = "Authentic Heritage"
            elif any(w in text_lower for w in ["luxury", "5-star", "five star", "resort"]):
                prefs.stay_preference = "5-Star Luxury"
            elif any(w in text_lower for w in ["central", "city", "modern", "smart"]):
                prefs.stay_preference = "Central Modern Hotel"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.stay_preference = cleaned
            if "stay" not in prefs.completed_steps:
                prefs.completed_steps.append("stay")

        # 2. General Multi-Entity Extraction across full message
        # Destination fallback
        if not prefs.destination:
            dest_patterns = [
                r'\b(?:to|in|visit|explore|trip to)\s+([a-zA-Z\s]{3,30})(?:for|\?|\.|\,|$|\bfrom\b)',
                r'\b([a-zA-Z\s]{3,25})\s+(?:for\s+\d+\s+days)',
            ]
            for pat in dest_patterns:
                m = re.search(pat, text_clean, re.IGNORECASE)
                if m:
                    cand = m.group(1).strip()
                    if cand.lower() not in ["a trip", "my family", "budget", "flights", "vacation", "hotels", "days"]:
                        prefs.destination = cand.title()
                        break
            if not prefs.destination:
                for place in ["Tokyo", "Kyoto", "Japan", "Paris", "Rome", "Italy", "Switzerland", "London", "Barcelona", "Bali", "Vietnam", "Goa", "Kerala", "New York", "Hawaii", "Iceland"]:
                    if place.lower() in text_lower:
                        prefs.destination = place
                        break

        # Origin fallback
        if not prefs.origin:
            origin_match = re.search(r'\b(?:from|leaving from|departing from)\s+([a-zA-Z\s]{3,25})(?:to|\?|\.|\,|$)', text_clean, re.IGNORECASE)
            if origin_match:
                cand = origin_match.group(1).strip()
                if cand.lower() not in ["a trip", "here", "home"]:
                    prefs.origin = cand.title()

        # Duration fallback
        if not prefs.duration_days:
            dur_match = re.search(r'(\d+)\s*(?:days?|nights?|day)', text_lower)
            if dur_match:
                try:
                    d = int(dur_match.group(1))
                    if 1 <= d <= 60:
                        prefs.duration_days = d
                except ValueError:
                    pass

        # Budget fallback
        if not prefs.budget_amount:
            b_match = re.search(r'(?:budget\s*(?:is|of|around)?\s*[\$€£₹¥]?\s*|[\$€£₹¥]\s*)(\d[\d,]+)', text_lower)
            if b_match:
                try:
                    clean_n = b_match.group(1).replace(",", "")
                    prefs.budget_amount = float(clean_n)
                except ValueError:
                    pass

        # Currency fallback
        if "€" in text_clean or "eur" in text_lower:
            prefs.budget_currency = "EUR"
        elif "£" in text_clean or "gbp" in text_lower:
            prefs.budget_currency = "GBP"
        elif "₹" in text_clean or "inr" in text_lower:
            prefs.budget_currency = "INR"
        elif "¥" in text_clean or "jpy" in text_lower:
            prefs.budget_currency = "JPY"

        # Party type fallback
        if not prefs.party_type:
            if any(w in text_lower for w in ["solo", "by myself", "alone"]):
                prefs.party_type = "Solo Traveler"
            elif any(w in text_lower for w in ["couple", "partner", "wife", "husband", "girlfriend", "boyfriend", "honeymoon"]):
                prefs.party_type = "Couple / Romantic"
            elif any(w in text_lower for w in ["friends", "buddies", "group", "mates"]):
                prefs.party_type = "Group of Friends"
            elif any(w in text_lower for w in ["family", "kids", "children", "parents"]):
                prefs.party_type = "Family with Children"

        # Pace fallback
        if not prefs.travel_pace:
            if any(w in text_lower for w in ["relax", "chill", "slow", "unhurried"]):
                prefs.travel_pace = "relaxed"
            elif any(w in text_lower for w in ["fast", "packed", "action"]):
                prefs.travel_pace = "fast-paced"
            elif any(w in text_lower for w in ["balanced", "moderate"]):
                prefs.travel_pace = "balanced"

        return prefs

    @classmethod
    def get_next_step(cls, prefs: TripPreferences, user_text: str = "") -> Tuple[str, List[SuggestedReply], str, str]:
        """
        Determines the next sequential question, MCQ options (including 'Other'),
        the stage ('discovery' or 'ready_to_plan'), and question_key.
        """
        user_lower = user_text.lower()
        ready_triggers = ["plan now", "generate plan", "i am ready", "i'm ready", "create itinerary", "build trip", "let's go"]
        if any(tr in user_lower for tr in ready_triggers):
            return (
                f"Understood! All agents are assembling now to research and engineer your complete trip plan for {prefs.destination or 'your destination'}.",
                [],
                "ready_to_plan",
                "ready"
            )

        # 1. Destination
        if not prefs.destination:
            return (
                "Welcome to TripMax! I am your Trip Discovery Architect. Let's design your perfect journey step-by-step.\n\nFirst, where in the world would you love to travel?",
                [
                    SuggestedReply(label="🌸 Tokyo & Kyoto, Japan", value="Tokyo & Kyoto, Japan"),
                    SuggestedReply(label="🏔️ Swiss Alps & Zurich, Switzerland", value="Swiss Alps & Zurich, Switzerland"),
                    SuggestedReply(label="🏛️ Rome & Amalfi Coast, Italy", value="Rome & Amalfi Coast, Italy"),
                    SuggestedReply(label="🥐 Paris & French Riviera, France", value="Paris & French Riviera, France"),
                    SuggestedReply(label="🌴 Bali, Indonesia", value="Bali, Indonesia"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter destination (e.g. Barcelona, Iceland, Hawaii)..."),
                ],
                "discovery",
                "destination"
            )

        # 2. Origin
        if not prefs.origin:
            return (
                f"**{prefs.destination}** is an exceptional choice! Where will you be departing from?",
                [
                    SuggestedReply(label="🗽 New York City (JFK/EWR)", value="New York City (JFK)"),
                    SuggestedReply(label="🇬🇧 London (LHR/LGW)", value="London (LHR)"),
                    SuggestedReply(label="🌉 San Francisco (SFO)", value="San Francisco (SFO)"),
                    SuggestedReply(label="🇮🇳 Mumbai / New Delhi (BOM/DEL)", value="Mumbai (BOM)"),
                    SuggestedReply(label="🍁 Toronto (YYZ)", value="Toronto (YYZ)"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter departure city (e.g. Chicago, Boston, Berlin)..."),
                ],
                "discovery",
                "origin"
            )

        # 3. Duration
        if not prefs.duration_days:
            return (
                f"How many days are you planning for your trip to {prefs.destination}?",
                [
                    SuggestedReply(label="⚡ 4 Days (Quick Getaway)", value="4 days"),
                    SuggestedReply(label="🗓️ 7 Days (Classic 1-Week Adventure)", value="7 days"),
                    SuggestedReply(label="🗺️ 10 Days (In-Depth Exploration)", value="10 days"),
                    SuggestedReply(label="🌍 14 Days (Two-Week Grand Tour)", value="14 days"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter number of days (e.g. 5 days, 8 days, 12 days)..."),
                ],
                "discovery",
                "duration"
            )

        # 4. Party type
        if not prefs.party_type:
            return (
                f"Who will you be traveling with on this {prefs.duration_days}-day trip?",
                [
                    SuggestedReply(label="🎒 Solo Traveler (Independent Explorer)", value="Solo Traveler"),
                    SuggestedReply(label="💑 Couple / Romantic Getaway", value="Couple / Romantic"),
                    SuggestedReply(label="👨‍👩‍👧‍👦 Family with Children", value="Family with Children"),
                    SuggestedReply(label="🍻 Group of Friends", value="Group of Friends"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter party type (e.g. Senior parents, College reunion)..."),
                ],
                "discovery",
                "party_type"
            )

        # 5. Travel pace
        if not prefs.travel_pace:
            return (
                "What travel pace best matches your preferred rhythm?",
                [
                    SuggestedReply(label="☕ Relaxed & Leisurely (Slow mornings, ample downtime)", value="Relaxed pace"),
                    SuggestedReply(label="⚖️ Balanced & Moderate (2–3 key highlights daily + free time)", value="Balanced pace"),
                    SuggestedReply(label="⚡ Fast-Paced & Energetic (Action-packed, see everything)", value="Fast-paced"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter custom pace (e.g. Early mornings only, nocturnal vibe)..."),
                ],
                "discovery",
                "travel_pace"
            )

        # 6. Budget
        if not prefs.budget_amount:
            curr = prefs.budget_currency or "USD"
            sym = "€" if curr == "EUR" else ("£" if curr == "GBP" else ("₹" if curr == "INR" else ("¥" if curr == "JPY" else "$")))
            return (
                f"What is your target budget per person (in {curr}) for lodging, dining, and activities?",
                [
                    SuggestedReply(label=f"🎒 Smart Budget (~{sym}1,500)", value=f"{sym}1500"),
                    SuggestedReply(label=f"🏨 Moderate & Comfortable (~{sym}3,000)", value=f"{sym}3000"),
                    SuggestedReply(label=f"👑 Luxury & Premium (~{sym}6,000+)", value=f"{sym}6000"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder=f"Enter target budget per person (e.g. {sym}2200, {sym}4500)..."),
                ],
                "discovery",
                "budget"
            )

        # 7. Transport preference
        if not prefs.transport_preference:
            return (
                f"How would you prefer to travel between cities and regional sights?",
                [
                    SuggestedReply(label="🚆 Scenic High-Speed Trains Preferred", value="Scenic high-speed trains preferred"),
                    SuggestedReply(label="✈️ Flights Preferred (Fastest point-to-point)", value="Flights preferred"),
                    SuggestedReply(label="🔄 Both Flights & Trains (Optimal mix)", value="Both flights and trains"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter transit preference (e.g. Rental car road trip, private chauffeur)..."),
                ],
                "discovery",
                "transport"
            )

        # 8. Interests & Vibes
        if len(prefs.interests) == 0:
            return (
                f"What experiences and vibes are you most excited to explore in {prefs.destination}?",
                [
                    SuggestedReply(label="🍜 Culinary Tastings, Street Food & Local Eateries", value="Culinary & food tasting"),
                    SuggestedReply(label="⛩️ Historic Heritage, Temples & Architecture", value="History, culture & heritage"),
                    SuggestedReply(label="🌲 Scenic Nature, Hiking & Panoramic Viewpoints", value="Nature, landscapes & outdoors"),
                    SuggestedReply(label="🍸 Nightlife, Speakeasies & Modern Arts", value="Nightlife, arts & entertainment"),
                    SuggestedReply(label="🛍️ Local Markets, Boutiques & Artisan Shopping", value="Shopping & local markets"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter custom interests (e.g. Photography, scuba diving, wellness)..."),
                ],
                "discovery",
                "interests"
            )

        # 9. Accommodation style
        if not prefs.stay_preference:
            return (
                f"What style of accommodations do you envision for {prefs.destination}?",
                [
                    SuggestedReply(label="🎨 Boutique & Aesthetic Design Hotels", value="Boutique hotels"),
                    SuggestedReply(label="🏮 Authentic Cultural Stays (e.g. Ryokan, Historic Villa)", value="Authentic cultural stays"),
                    SuggestedReply(label="👑 5-Star Luxury Resorts with Premium Amenities", value="5-star luxury hotels"),
                    SuggestedReply(label="🏙️ Centrally Located Modern City Hotels", value="Centrally located smart hotels"),
                    SuggestedReply(label="✏️ Other (Write your own)", value="other", is_other=True, placeholder="Enter stay style (e.g. Eco-lodge, serviced penthouse apartment)..."),
                ],
                "discovery",
                "stay"
            )

        # 10. Completed!
        curr = prefs.budget_currency or "USD"
        return (
            f"All your journey details are confirmed! Here is your custom travel blueprint:\n\n"
            f"• Destination: **{prefs.destination}**\n"
            f"• Departure: **{prefs.origin}**\n"
            f"• Duration: **{prefs.duration_days} Days**\n"
            f"• Travelers: **{prefs.party_type}**\n"
            f"• Pacing: **{prefs.travel_pace.title()}**\n"
            f"• Budget: **{curr} {prefs.budget_amount:,.0f}**\n"
            f"• Transit: **{prefs.transport_preference.title()}**\n"
            f"• Focus: **{', '.join(prefs.interests) if prefs.interests else 'Curated Highlights'}**\n"
            f"• Stays: **{prefs.stay_preference.title() if prefs.stay_preference else 'Boutique'}**\n\n"
            f"Our specialized AI agents (Web Intelligence, Transit, Lodging, Itinerary, and Budget) are ready to engineer your complete itinerary. Click below to launch!",
            [
                SuggestedReply(label="🚀 Generate Complete Trip Plan Now", value="Generate Plan Now"),
                SuggestedReply(label="✏️ Adjust Any Preference", value="I want to adjust my preferences"),
            ],
            "ready_to_plan",
            "ready"
        )
