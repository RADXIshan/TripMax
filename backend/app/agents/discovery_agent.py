import re
from datetime import datetime
from typing import Tuple, List, Optional
from app.models.trip import TripPreferences, SuggestedReply

class DiscoveryAgent:
    """
    Intelligently analyzes user messages, updates extracted preferences,
    and asks sequential, one-by-one structured questions with rich, personalized MCQs
    plus an 'Other' option where the user can enter custom responses.
    """

    @classmethod
    def get_pending_question_key(cls, prefs: TripPreferences) -> str:
        if not prefs.destination:
            return "destination"
        if not prefs.origin:
            return "origin"
        if not prefs.dates or not prefs.duration_days:
            return "dates"
        if not prefs.party_type:
            return "party_type"
        if not prefs.travel_pace:
            return "travel_pace"
        if not prefs.budget_amount:
            return "budget"
        if not prefs.transport_preference:
            return "transport"
        if not prefs.interests or len(prefs.interests) == 0:
            return "interests"
        if not prefs.stay_preference:
            return "stay"
        if not prefs.dining_preference:
            return "dining"
        return "ready"

    @classmethod
    def get_current_question_key(cls, prefs: TripPreferences) -> str:
        k = prefs.current_question_key
        if k == "destination" and not prefs.destination:
            return "destination"
        if k == "origin" and not prefs.origin:
            return "origin"
        if k in ["dates", "duration"] and (not prefs.dates or not prefs.duration_days):
            return "dates"
        if k == "party_type" and not prefs.party_type:
            return "party_type"
        if k == "travel_pace" and not prefs.travel_pace:
            return "travel_pace"
        if k == "budget" and not prefs.budget_amount:
            return "budget"
        if k == "transport" and not prefs.transport_preference:
            return "transport"
        if k == "interests" and (not prefs.interests or len(prefs.interests) == 0):
            return "interests"
        if k == "stay" and not prefs.stay_preference:
            return "stay"
        if k == "dining" and not prefs.dining_preference:
            return "dining"
        return cls.get_pending_question_key(prefs)

    @classmethod
    def _parse_dates_and_duration(cls, text: str) -> Tuple[str, str, str, str, str, int]:
        """
        Parses text for exact travel dates, start/end date, travel month, season, and duration.
        Returns: (dates_str, start_date, end_date, travel_month, season, duration_days)
        """
        text_lower = text.lower()
        now = datetime.now()
        current_year = now.year

        # Check for duration like '7 days', '4 days', '10 days'
        duration = None
        dur_match = re.search(r'(\d+)\s*(?:days?|nights?|day)', text_lower)
        if dur_match:
            try:
                duration = int(dur_match.group(1))
            except ValueError:
                pass
        elif "one week" in text_lower or "a week" in text_lower or "1 week" in text_lower:
            duration = 7
        elif "two weeks" in text_lower or "2 weeks" in text_lower:
            duration = 14
        elif "three weeks" in text_lower or "3 weeks" in text_lower:
            duration = 21
        elif "weekend" in text_lower:
            duration = 4

        # Month names mapping
        months = {
            "january": 1, "jan": 1,
            "february": 2, "feb": 2,
            "march": 3, "mar": 3,
            "april": 4, "apr": 4,
            "may": 5,
            "june": 6, "jun": 6,
            "july": 7, "jul": 7,
            "august": 8, "aug": 8,
            "september": 9, "sep": 9, "sept": 9,
            "october": 10, "oct": 10,
            "november": 11, "nov": 11,
            "december": 12, "dec": 12
        }

        found_month_name = None
        found_month_num = None
        for m_name, m_num in months.items():
            if re.search(r'\b' + m_name + r'\b', text_lower):
                found_month_name = m_name.capitalize()
                found_month_num = m_num
                break

        # Year mentioned
        year_match = re.search(r'\b(202[5-9])\b', text)
        year = int(year_match.group(1)) if year_match else (current_year if found_month_num and found_month_num >= now.month else current_year + 1)

        # Season determination
        season = "Autumn"
        if found_month_num in [3, 4, 5] or "spring" in text_lower or "cherry" in text_lower or "sakura" in text_lower:
            season = "Spring"
            if not found_month_num:
                found_month_num = 4
                found_month_name = "April"
        elif found_month_num in [6, 7, 8] or "summer" in text_lower:
            season = "Summer"
            if not found_month_num:
                found_month_num = 7
                found_month_name = "July"
        elif found_month_num in [9, 10, 11] or "autumn" in text_lower or "fall" in text_lower or "koyo" in text_lower:
            season = "Autumn"
            if not found_month_num:
                found_month_num = 11
                found_month_name = "November"
        elif found_month_num in [12, 1, 2] or "winter" in text_lower:
            season = "Winter"
            if not found_month_num:
                found_month_num = 12
                found_month_name = "December"

        # Check for day numbers: e.g. "10 to 17", "10 - 17", "Nov 10 – Nov 17"
        day_range_match = re.search(r'(\d{1,2})\s*(?:to|-|–|through)\s*(\d{1,2})', text)
        start_day = 10
        end_day = 17
        if day_range_match:
            d1 = int(day_range_match.group(1))
            d2 = int(day_range_match.group(2))
            if 1 <= d1 <= 31 and 1 <= d2 <= 31 and d2 > d1:
                start_day = d1
                end_day = d2
                duration = d2 - d1
            elif 1 <= d1 <= 31:
                start_day = d1
                duration = duration or 7
                end_day = min(28, start_day + duration)
        elif not duration:
            duration = 7

        if not found_month_num:
            found_month_num = 11
            found_month_name = "November"
            season = "Autumn"

        dur_final = duration or 7
        end_day = min(28, start_day + dur_final)
        travel_month = f"{found_month_name} {year}"
        start_date = f"{year}-{found_month_num:02d}-{start_day:02d}"
        end_date = f"{year}-{found_month_num:02d}-{end_day:02d}"
        
        month_abbr = datetime(year, found_month_num, 1).strftime("%b")
        dates_str = f"{month_abbr} {start_day:02d} – {month_abbr} {end_day:02d}, {year}"

        return dates_str, start_date, end_date, travel_month, season, dur_final

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

        def clean_val(val: str, prefix_patterns: List[str] = None) -> str:
            v = val.strip()
            patterns = [r'^(?:other\s*[:\-]?\s*)'] + (prefix_patterns or [])
            for p in patterns:
                v = re.sub(p, '', v, flags=re.IGNORECASE).strip()
            v = re.sub(r'[\.\,\!\?]+$', '', v).strip()
            return v

        q_key = cls.get_current_question_key(prefs)

        # 1. Targeted Extraction based on active question
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

        elif q_key in ["dates", "duration"]:
            dates_str, start_date, end_date, travel_month, season, dur = cls._parse_dates_and_duration(text_clean)
            prefs.dates = dates_str
            prefs.start_date = start_date
            prefs.end_date = end_date
            prefs.travel_month = travel_month
            prefs.season = season
            prefs.duration_days = dur
            if "dates" not in prefs.completed_steps:
                prefs.completed_steps.append("dates")
            if "duration" not in prefs.completed_steps:
                prefs.completed_steps.append("duration")

        elif q_key == "party_type":
            cleaned = clean_val(text_clean)
            if any(w in text_lower for w in ["solo", "myself", "alone"]):
                prefs.party_type = "Solo Explorer"
            elif any(w in text_lower for w in ["couple", "romantic", "partner", "wife", "husband", "girlfriend", "boyfriend", "honeymoon"]):
                prefs.party_type = "Couple / Romantic"
            elif any(w in text_lower for w in ["family", "kid", "child", "children", "parents"]):
                prefs.party_type = "Family with Children"
            elif any(w in text_lower for w in ["friends", "buddies", "group", "mates", "colleagues"]):
                prefs.party_type = "Group of Friends"
            elif any(w in text_lower for w in ["senior", "elder", "multi-gen"]):
                prefs.party_type = "Multi-Generational Family"
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
            # Detect currency explicitly
            if "€" in text_clean or "eur" in text_lower or "euro" in text_lower:
                prefs.budget_currency = "EUR"
            elif "£" in text_clean or "gbp" in text_lower or "pound" in text_lower:
                prefs.budget_currency = "GBP"
            elif "¥" in text_clean or "jpy" in text_lower or "yen" in text_lower:
                prefs.budget_currency = "JPY"
            elif "$" in text_clean or "usd" in text_lower or "dollar" in text_lower:
                prefs.budget_currency = "USD"
            elif "₹" in text_clean or "inr" in text_lower or "rupee" in text_lower or "rs" in text_lower:
                prefs.budget_currency = "INR"
            else:
                prefs.budget_currency = prefs.budget_currency or "INR"

            # Parse budget with Indian Lakh / k support
            lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l\b)', text_lower)
            k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', text_lower)
            if lakh_match:
                try:
                    num_val = float(lakh_match.group(1)) * 100000.0
                    if num_val > 0:
                        prefs.budget_amount = num_val
                except ValueError:
                    pass
            elif k_match:
                try:
                    num_val = float(k_match.group(1)) * 1000.0
                    if num_val > 0:
                        prefs.budget_amount = num_val
                except ValueError:
                    pass
            else:
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
            elif "car" in text_lower or "drive" in text_lower or "road trip" in text_lower or "chauffeur" in text_lower:
                prefs.transport_preference = "private car & road trip"
            elif "both" in text_lower or "mix" in text_lower:
                prefs.transport_preference = "both"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.transport_preference = cleaned
            if "transport" not in prefs.completed_steps:
                prefs.completed_steps.append("transport")

        elif q_key == "interests":
            cleaned = clean_val(text_clean)
            known_cats = {
                "culinary & food": ["food", "foodie", "culinary", "restaurant", "dining", "street food", "ramen", "tasting", "wine", "cafe", "eats", "gastronomy"],
                "culture & history": ["culture", "history", "temple", "museum", "monument", "heritage", "historic", "shrine", "castle", "palace", "unesco"],
                "nature & outdoors": ["nature", "hiking", "mountain", "scenery", "scenic", "beach", "lake", "landscape", "outdoors", "park", "alps"],
                "nightlife & bars": ["nightlife", "club", "bar", "party", "cocktail", "pub", "speakeasy", "rooftop"],
                "shopping & markets": ["shopping", "boutique", "market", "bazaar", "vintage", "souvenir", "artisan"],
                "photography & viewpoints": ["photography", "photo", "viewpoint", "panoramic", "golden hour"],
                "wellness & relaxation": ["wellness", "spa", "onsen", "hot spring", "yoga", "retreat", "ayurvedic"]
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
            if prefs.interests and "interests" not in prefs.completed_steps:
                prefs.completed_steps.append("interests")

        elif q_key == "stay":
            cleaned = clean_val(text_clean)
            if any(w in text_lower for w in ["boutique", "design", "aesthetic"]):
                prefs.stay_preference = "Boutique & Design Hotel"
            elif any(w in text_lower for w in ["ryokan", "authentic", "heritage", "traditional", "villa", "riad", "haveli"]):
                prefs.stay_preference = "Authentic Cultural Stays"
            elif any(w in text_lower for w in ["luxury", "5-star", "five star", "resort", "palace"]):
                prefs.stay_preference = "5-Star Luxury Resorts & Palaces"
            elif any(w in text_lower for w in ["central", "city", "modern", "smart"]):
                prefs.stay_preference = "Centrally Located Modern City Hotels"
            elif any(w in text_lower for w in ["apartment", "serviced", "airbnb"]):
                prefs.stay_preference = "Scenic Villa / Serviced Apartment"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.stay_preference = cleaned
            if "stay" not in prefs.completed_steps:
                prefs.completed_steps.append("stay")

        elif q_key == "dining":
            cleaned = clean_val(text_clean)
            if any(w in text_lower for w in ["pure veg", "vegetarian", "jain", "vegan", "plant-based"]):
                prefs.dining_preference = "Pure Vegetarian & Vegan Friendly"
            elif any(w in text_lower for w in ["street food", "street eat", "night market", "hole in the wall"]):
                prefs.dining_preference = "Authentic Local Street Food & Night Markets"
            elif any(w in text_lower for w in ["fine dining", "michelin", "gourmet", "tasting menu"]):
                prefs.dining_preference = "Fine Dining & Michelin-Starred Experiences"
            elif any(w in text_lower for w in ["halal"]):
                prefs.dining_preference = "Halal-Certified Dining"
            elif any(w in text_lower for w in ["seafood", "coastal", "fish"]):
                prefs.dining_preference = "Coastal Seafood & Regional Specialties"
            elif any(w in text_lower for w in ["all", "everything", "no restriction", "authentic local", "meat"]):
                prefs.dining_preference = "Authentic Regional Cuisine (No Dietary Restrictions)"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.dining_preference = cleaned
            if "dining" not in prefs.completed_steps:
                prefs.completed_steps.append("dining")

        # 2. General Fallbacks across full message if not already set
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
                for place in ["Tokyo", "Kyoto", "Japan", "Paris", "Rome", "Italy", "Switzerland", "London", "Barcelona", "Bali", "Vietnam", "Goa", "Kerala", "Rajasthan", "Jaipur", "Udaipur", "New York", "Hawaii", "Iceland"]:
                    if place.lower() in text_lower:
                        prefs.destination = place
                        break

        if not prefs.origin:
            origin_match = re.search(r'\b(?:from|leaving from|departing from)\s+([a-zA-Z\s]{3,25})(?:to|\?|\.|\,|$)', text_clean, re.IGNORECASE)
            if origin_match:
                cand = origin_match.group(1).strip()
                if cand.lower() not in ["a trip", "here", "home"]:
                    prefs.origin = cand.title()

        if not prefs.duration_days:
            dur_match = re.search(r'(\d+)\s*(?:days?|nights?|day)', text_lower)
            if dur_match:
                try:
                    d = int(dur_match.group(1))
                    if 1 <= d <= 60:
                        prefs.duration_days = d
                except ValueError:
                    pass

        # Currency fallback
        if "€" in text_clean or "eur" in text_lower:
            prefs.budget_currency = "EUR"
        elif "£" in text_clean or "gbp" in text_lower:
            prefs.budget_currency = "GBP"
        elif "¥" in text_clean or "jpy" in text_lower:
            prefs.budget_currency = "JPY"
        elif "$" in text_clean or "usd" in text_lower:
            prefs.budget_currency = "USD"
        elif "₹" in text_clean or "inr" in text_lower:
            prefs.budget_currency = "INR"

        return prefs

    @classmethod
    def get_next_step(cls, prefs: TripPreferences, user_text: str = "") -> Tuple[str, List[SuggestedReply], str, str]:
        """
        Determines the next sequential question, MCQ options (including 'Other'),
        the stage ('discovery', 'options_completed', or 'ready_to_plan'), and question_key.
        Strict rule: Do NOT trigger plan generation before all 10 options are complete!
        """
        user_lower = user_text.lower()
        ready_triggers = [
            "plan now", "generate plan", "i am ready", "i'm ready", 
            "create itinerary", "build trip", "let's go", 
            "generate complete trip plan now", "generate plan now", "start planning"
        ]

        # Check which question is pending
        next_key = cls.get_pending_question_key(prefs)
        is_all_done = (next_key == "ready")

        # If user explicitly requested generation
        if any(tr in user_lower for tr in ready_triggers):
            if is_all_done:
                return (
                    f"Understood! All 10 specialized travel parameters are confirmed. All agents are assembling now to research and engineer your complete trip plan for {prefs.destination or 'your destination'}.",
                    [],
                    "ready_to_plan",
                    "ready"
                )
            else:
                # User asked to generate before options are done - prevent early generation!
                pending_hints = {
                    "destination": "destination",
                    "origin": "departure city",
                    "dates": "travel dates & duration",
                    "party_type": "travel party",
                    "travel_pace": "travel pacing",
                    "budget": "target budget",
                    "transport": "transit preference",
                    "interests": "activity interests",
                    "stay": "accommodation style",
                    "dining": "dining & dietary preferences"
                }
                hint = pending_hints.get(next_key, "next requirement")
                # Fall through to ask the missing question with polite context

        # 1. Destination
        if not prefs.destination:
            return (
                "Welcome to TripMax! I am your Trip Discovery Architect. Let's design your perfect journey step-by-step.\n\nFirst, where in the world would you love to travel?",
                [
                    SuggestedReply(label="🌸 Tokyo & Kyoto, Japan (Modern Metropolis & Ancient Shrines)", value="Tokyo & Kyoto, Japan"),
                    SuggestedReply(label="🏔️ Swiss Alps & Zurich, Switzerland (Scenic Glaciers & Rail)", value="Swiss Alps & Zurich, Switzerland"),
                    SuggestedReply(label="🏛️ Rome, Florence & Amalfi Coast, Italy (Renaissance & Coast)", value="Rome & Amalfi Coast, Italy"),
                    SuggestedReply(label="🥐 Paris & French Riviera, France (Haute Cuisine & Art)", value="Paris & French Riviera, France"),
                    SuggestedReply(label="🌴 Bali & Ubud, Indonesia (Tropical Temples & Rice Terraces)", value="Bali & Ubud, Indonesia"),
                    SuggestedReply(label="🏰 Jaipur & Udaipur, Rajasthan, India (Royal Palaces & Forts)", value="Jaipur & Udaipur, Rajasthan, India"),
                    SuggestedReply(label="🌿 Kerala Backwaters & Munnar, India (Serene Houseboats & Hills)", value="Kerala & Munnar, India"),
                    SuggestedReply(label="🏖️ Goa & Konkan Coast, India (Beaches, Heritage & Seafood)", value="Goa, India"),
                    SuggestedReply(label="✏️ Other (Write your own destination)", value="other", is_other=True, placeholder="Enter destination (e.g. Barcelona, Iceland, Hawaii, Kashmir)..."),
                ],
                "discovery",
                "destination"
            )

        # 2. Origin
        if not prefs.origin:
            return (
                f"**{prefs.destination}** is an exceptional destination! Where will you be departing from?",
                [
                    SuggestedReply(label="🇮🇳 New Delhi (DEL - Indira Gandhi Intl)", value="New Delhi (DEL)"),
                    SuggestedReply(label="🇮🇳 Mumbai (BOM - Chhatrapati Shivaji Intl)", value="Mumbai (BOM)"),
                    SuggestedReply(label="🇮🇳 Bengaluru (BLR - Kempegowda Intl)", value="Bengaluru (BLR)"),
                    SuggestedReply(label="🗽 New York City (JFK/EWR)", value="New York City (JFK)"),
                    SuggestedReply(label="🇬🇧 London (LHR/LGW)", value="London (LHR)"),
                    SuggestedReply(label="🇸🇬 Singapore (SIN - Changi Intl)", value="Singapore (SIN)"),
                    SuggestedReply(label="🇦🇪 Dubai (DXB)", value="Dubai (DXB)"),
                    SuggestedReply(label="🍁 Toronto (YYZ)", value="Toronto (YYZ)"),
                    SuggestedReply(label="✏️ Other (Write your departure city)", value="other", is_other=True, placeholder="Enter departure city (e.g. Hyderabad, Chennai, Chicago, Berlin)..."),
                ],
                "discovery",
                "origin"
            )

        # 3. Dates and Duration of Stay
        dest_str = prefs.destination.lower()
        if not prefs.dates or not prefs.duration_days:
            # Customize season options based on destination
            if any(k in dest_str for k in ["japan", "tokyo", "kyoto"]):
                date_replies = [
                    SuggestedReply(label="🍁 Autumn Foliage (Nov 10 – Nov 17, 2026 • 7 Days)", value="Nov 10 to Nov 17, 2026 (7 days)"),
                    SuggestedReply(label="🌸 Sakura Cherry Blossoms (Apr 04 – Apr 11, 2027 • 7 Days)", value="Apr 04 to Apr 11, 2027 (7 days)"),
                    SuggestedReply(label="☀️ Summer Festivals & Fuji (Jul 10 – Jul 17, 2027 • 7 Days)", value="Jul 10 to Jul 17, 2027 (7 days)"),
                    SuggestedReply(label="❄️ Winter Illuminations (Dec 12 – Dec 19, 2026 • 7 Days)", value="Dec 12 to Dec 19, 2026 (7 days)"),
                    SuggestedReply(label="⚡ 10-Day Grand Tour (Nov 05 – Nov 15, 2026 • 10 Days)", value="Nov 05 to Nov 15, 2026 (10 days)"),
                ]
            elif any(k in dest_str for k in ["swiss", "switzerland", "alps"]):
                date_replies = [
                    SuggestedReply(label="☀️ Summer Alpine Trails & Lakes (Jul 10 – Jul 17, 2027 • 7 Days)", value="Jul 10 to Jul 17, 2027 (7 days)"),
                    SuggestedReply(label="❄️ Winter Snow & Glacier Rail (Dec 12 – Dec 19, 2026 • 7 Days)", value="Dec 12 to Dec 19, 2026 (7 days)"),
                    SuggestedReply(label="🍁 Golden Autumn Vistas (Oct 10 – Oct 17, 2026 • 7 Days)", value="Oct 10 to Oct 17, 2026 (7 days)"),
                    SuggestedReply(label="🌸 Spring Alpine Blooms (May 08 – May 15, 2027 • 7 Days)", value="May 08 to May 15, 2027 (7 days)"),
                    SuggestedReply(label="⚡ Quick 5-Day Rail Highlights (Nov 12 – Nov 17, 2026 • 5 Days)", value="Nov 12 to Nov 17, 2026 (5 days)"),
                ]
            elif any(k in dest_str for k in ["rajasthan", "kerala", "goa", "india", "jaipur"]):
                date_replies = [
                    SuggestedReply(label="☀️ Pleasant Winter Peak (Dec 05 – Dec 12, 2026 • 7 Days)", value="Dec 05 to Dec 12, 2026 (7 days)"),
                    SuggestedReply(label="🪔 Festive Autumn (Nov 07 – Nov 14, 2026 • 7 Days)", value="Nov 07 to Nov 14, 2026 (7 days)"),
                    SuggestedReply(label="🌸 Spring Cultural Getaway (Feb 14 – Feb 21, 2027 • 7 Days)", value="Feb 14 to Feb 21, 2027 (7 days)"),
                    SuggestedReply(label="🌧️ Lush Monsoon Magic (Aug 08 – Aug 15, 2026 • 7 Days)", value="Aug 08 to Aug 15, 2026 (7 days)"),
                    SuggestedReply(label="⚡ Quick 5-Day Highlights (Nov 12 – Nov 17, 2026 • 5 Days)", value="Nov 12 to Nov 17, 2026 (5 days)"),
                ]
            else:
                date_replies = [
                    SuggestedReply(label="🍁 Autumn Foliage (Nov 10 – Nov 17, 2026 • 7 Days)", value="Nov 10 to Nov 17, 2026 (7 days)"),
                    SuggestedReply(label="🌸 Spring Season (Apr 10 – Apr 17, 2027 • 7 Days)", value="Apr 10 to Apr 17, 2027 (7 days)"),
                    SuggestedReply(label="☀️ Summer Holiday (Jul 10 – Jul 17, 2027 • 7 Days)", value="Jul 10 to Jul 17, 2027 (7 days)"),
                    SuggestedReply(label="❄️ Winter Getaway (Dec 12 – Dec 19, 2026 • 7 Days)", value="Dec 12 to Dec 19, 2026 (7 days)"),
                    SuggestedReply(label="⚡ 10-Day Deep Dive (Nov 05 – Nov 15, 2026 • 10 Days)", value="Nov 05 to Nov 15, 2026 (10 days)"),
                ]
            date_replies.append(
                SuggestedReply(label="✏️ Other (Write exact dates & duration)", value="other", is_other=True, placeholder="Enter exact dates (e.g. Oct 15 - Oct 22, 2026 or 6 days in December)...")
            )

            return (
                f"When are you planning to travel to **{prefs.destination}**? Please share your preferred travel window and duration.\n\n"
                f"Our AI agents will check seasonal weather, local festival calendars, live flight schedules, and hotel availability for those exact dates.",
                date_replies,
                "discovery",
                "dates"
            )

        # 4. Party type
        if not prefs.party_type:
            return (
                f"Who will be joining you on this {prefs.duration_days}-day journey to **{prefs.destination}**?",
                [
                    SuggestedReply(label="🎒 Solo Explorer (Independent, agile & self-paced)", value="Solo Explorer"),
                    SuggestedReply(label="💑 Couple / Romantic Getaway (Intimate dining & scenic moments)", value="Couple / Romantic"),
                    SuggestedReply(label="👨‍👩‍👧‍👦 Family with Children (Kid-friendly pacing & spacious stays)", value="Family with Children"),
                    SuggestedReply(label="🍻 Group of Friends (Dynamic shared adventures & vibrant vibe)", value="Group of Friends"),
                    SuggestedReply(label="🧓 Multi-Generational Family (Comfortable transit & accessible sights)", value="Multi-Generational Family"),
                    SuggestedReply(label="✏️ Other (Write your travel party)", value="other", is_other=True, placeholder="Enter party details (e.g. Senior parents, College reunion, Photography club)..."),
                ],
                "discovery",
                "party_type"
            )

        # 5. Travel pace
        if not prefs.travel_pace:
            return (
                f"What travel pace best matches how you and your {prefs.party_type or 'party'} like to experience new places?",
                [
                    SuggestedReply(label="☕ Relaxed & Leisurely (Slow mornings, café downtime, 1–2 highlights daily)", value="Relaxed pace"),
                    SuggestedReply(label="⚖️ Balanced & Curated (2–3 iconic highlights daily + scenic pauses & free time)", value="Balanced pace"),
                    SuggestedReply(label="⚡ Action-Packed & High-Energy (Early starts, see everything, immersive days)", value="Fast-paced"),
                    SuggestedReply(label="✏️ Other (Write custom pacing)", value="other", is_other=True, placeholder="Enter custom pace (e.g. Sunrise photographer pace, Nocturnal night-owl vibe)..."),
                ],
                "discovery",
                "travel_pace"
            )

        # 6. Budget (INR Default)
        if not prefs.budget_amount:
            curr = prefs.budget_currency or "INR"
            if curr == "INR":
                budget_replies = [
                    SuggestedReply(label="🎒 Smart Budget (~₹45,000 / person) (Boutique budget stays, public transit & street eats)", value="₹45000"),
                    SuggestedReply(label="🏨 Comfort & Balanced (~₹95,000 / person) (4-star hotels, scenic rail, curated dining)", value="₹95000"),
                    SuggestedReply(label="👑 Luxury & Indulgent (~₹2,20,000+ / person) (5-star heritage resorts, private transfers, fine dining)", value="₹220000"),
                    SuggestedReply(label="✏️ Other (Write your target budget in ₹)", value="other", is_other=True, placeholder="Enter budget per person in ₹ (e.g. ₹60000, ₹1.5 Lakh, ₹3 Lakh)..."),
                ]
            elif curr == "EUR":
                budget_replies = [
                    SuggestedReply(label="🎒 Smart Budget (~€1,400 / person)", value="€1400"),
                    SuggestedReply(label="🏨 Comfort & Balanced (~€2,800 / person)", value="€2800"),
                    SuggestedReply(label="👑 Luxury & Premium (~€5,500+ / person)", value="€5500"),
                    SuggestedReply(label="✏️ Other (Write target budget in €)", value="other", is_other=True, placeholder="Enter budget per person in € (e.g. €2000, €4500)..."),
                ]
            elif curr == "GBP":
                budget_replies = [
                    SuggestedReply(label="🎒 Smart Budget (~£1,200 / person)", value="£1200"),
                    SuggestedReply(label="🏨 Comfort & Balanced (~£2,500 / person)", value="£2500"),
                    SuggestedReply(label="👑 Luxury & Premium (~£5,000+ / person)", value="£5000"),
                    SuggestedReply(label="✏️ Other (Write target budget in £)", value="other", is_other=True, placeholder="Enter budget per person in £ (e.g. £1800, £4000)..."),
                ]
            elif curr == "JPY":
                budget_replies = [
                    SuggestedReply(label="🎒 Smart Budget (~¥200,000 / person)", value="¥200000"),
                    SuggestedReply(label="🏨 Comfort & Balanced (~¥450,000 / person)", value="¥450000"),
                    SuggestedReply(label="👑 Luxury & Premium (~¥900,000+ / person)", value="¥900000"),
                    SuggestedReply(label="✏️ Other (Write target budget in ¥)", value="other", is_other=True, placeholder="Enter budget per person in ¥ (e.g. ¥300000, ¥600000)..."),
                ]
            else: # USD default
                budget_replies = [
                    SuggestedReply(label="🎒 Smart Budget (~$1,500 / person)", value="$1500"),
                    SuggestedReply(label="🏨 Comfort & Balanced (~$3,000 / person)", value="$3000"),
                    SuggestedReply(label="👑 Luxury & Premium (~$6,000+ / person)", value="$6000"),
                    SuggestedReply(label="✏️ Other (Write target budget in $)", value="other", is_other=True, placeholder="Enter budget per person in $ (e.g. $2200, $4500)..."),
                ]

            return (
                f"What is your target budget per person (in {curr}) for lodging, transit, dining, and activities in **{prefs.destination}**?",
                budget_replies,
                "discovery",
                "budget"
            )

        # 7. Transport preference
        if not prefs.transport_preference:
            if any(k in dest_str for k in ["japan", "tokyo", "kyoto"]):
                transit_replies = [
                    SuggestedReply(label="🚆 Shinkansen Bullet Trains (Fast, iconic & center-to-center)", value="Shinkansen bullet trains preferred"),
                    SuggestedReply(label="✈️ Domestic Flights (Fast point-to-point connections)", value="Flights preferred"),
                    SuggestedReply(label="🔄 Optimal Blend (Bullet trains + regional flights)", value="Both flights and trains"),
                    SuggestedReply(label="🚗 Private Chauffeur & Transfers (Door-to-door comfort)", value="Private chauffeur and car"),
                ]
            elif any(k in dest_str for k in ["swiss", "switzerland", "alps"]):
                transit_replies = [
                    SuggestedReply(label="🚆 Panoramic Rail & Glacier Express (Swiss Travel Pass)", value="Panoramic Swiss rail preferred"),
                    SuggestedReply(label="✈️ Quick Flights (Intercity connections)", value="Flights preferred"),
                    SuggestedReply(label="🔄 Rail & Alpine Road Mix (Trains + scenic mountain drives)", value="Both flights and trains"),
                    SuggestedReply(label="🚗 Scenic Road Trip (Self-drive through mountain passes)", value="Scenic road trip car rental"),
                ]
            elif any(k in dest_str for k in ["rajasthan", "kerala", "goa", "india"]):
                transit_replies = [
                    SuggestedReply(label="🚗 Private Chauffeur & AC SUV (Dedicated driver for entire tour)", value="Private chauffeur and car"),
                    SuggestedReply(label="🚆 High-Speed Vande Bharat & Express Trains (Scenic rail routes)", value="High-speed rail and express trains"),
                    SuggestedReply(label="✈️ Direct Flights (Fast city connections)", value="Flights preferred"),
                    SuggestedReply(label="🔄 Both Flights & Private Chauffeur (Optimal combination)", value="Both flights and private car"),
                ]
            else:
                transit_replies = [
                    SuggestedReply(label="🚆 Scenic High-Speed Trains (Relaxed transit & station access)", value="Scenic high-speed trains preferred"),
                    SuggestedReply(label="✈️ Flights Preferred (Fastest intercity hops)", value="Flights preferred"),
                    SuggestedReply(label="🔄 Optimal Blend (Flights for long haul + scenic trains for regional sights)", value="Both flights and trains"),
                    SuggestedReply(label="🚗 Private Car / Scenic Road Trip (Flexible door-to-door exploring)", value="Private car and road trip"),
                ]
            transit_replies.append(
                SuggestedReply(label="✏️ Other (Write custom transit preference)", value="other", is_other=True, placeholder="Enter transit preference (e.g. Scooter rental, luxury private yacht transfer)...")
            )

            return (
                f"How would you prefer to travel between cities and regional sights in **{prefs.destination}**?",
                transit_replies,
                "discovery",
                "transport"
            )

        # 8. Interests & Vibes
        if not prefs.interests or len(prefs.interests) == 0:
            if any(k in dest_str for k in ["japan", "tokyo", "kyoto"]):
                interest_replies = [
                    SuggestedReply(label="🍜 Ramen, Kaiseki & Street Food Tasting", value="Culinary & food tasting"),
                    SuggestedReply(label="⛩️ Historic Temples, Shrines & Geisha Districts", value="History, culture & heritage"),
                    SuggestedReply(label="🌲 Mt. Fuji Panoramas, Bamboo Groves & Gardens", value="Nature, landscapes & outdoors"),
                    SuggestedReply(label="🎮 Anime, Akihabara Tech & Shibuya Nightlife", value="Nightlife, arts & entertainment"),
                    SuggestedReply(label="🛍️ Traditional Craft Markets & Ginza Shopping", value="Shopping & local markets"),
                    SuggestedReply(label="♨️ Onsen Thermal Hot Springs & Zen Wellness", value="Wellness & relaxation"),
                ]
            elif any(k in dest_str for k in ["swiss", "switzerland", "alps"]):
                interest_replies = [
                    SuggestedReply(label="🏔️ Alpine Hiking, Cable Cars & Glacier Vistas", value="Nature, landscapes & outdoors"),
                    SuggestedReply(label="🧀 Swiss Fondue, Chocolate Tastings & Local Dining", value="Culinary & food tasting"),
                    SuggestedReply(label="🏰 Medieval Castles & Old Town Heritage", value="History, culture & heritage"),
                    SuggestedReply(label="🚢 Scenic Lake Cruises & Mountain Viewpoints", value="Photography & viewpoints"),
                    SuggestedReply(label="🛍️ Swiss Watchmaking Boutiques & Artisan Shops", value="Shopping & local markets"),
                    SuggestedReply(label="🧖 Alpine Thermal Spas & Mountain Wellness", value="Wellness & relaxation"),
                ]
            elif any(k in dest_str for k in ["rajasthan", "kerala", "goa", "india"]):
                interest_replies = [
                    SuggestedReply(label="🏰 Royal Forts, Palaces & UNESCO Heritage", value="History, culture & heritage"),
                    SuggestedReply(label="🍛 Authentic Regional Thali & Royal Street Eats", value="Culinary & food tasting"),
                    SuggestedReply(label="🌿 Serene Backwaters, Houseboats & Tea Estates", value="Nature, landscapes & outdoors"),
                    SuggestedReply(label="🛍️ Vibrant Bazaars, Handcrafted Textiles & Gems", value="Shopping & local markets"),
                    SuggestedReply(label="🧘 Ayurvedic Wellness, Spas & Yoga Retreats", value="Wellness & relaxation"),
                    SuggestedReply(label="📸 Golden Hour Desert Safaris & Sunset Viewpoints", value="Photography & viewpoints"),
                ]
            else:
                interest_replies = [
                    SuggestedReply(label="🍜 Culinary Tastings, Street Food & Local Eateries", value="Culinary & food tasting"),
                    SuggestedReply(label="⛩️ Historic Heritage, Ancient Architecture & Museums", value="History, culture & heritage"),
                    SuggestedReply(label="🌲 Scenic Nature, Mountain Panoramas & Outdoors", value="Nature, landscapes & outdoors"),
                    SuggestedReply(label="🍸 Vibrant Nightlife, Speakeasies & Live Arts", value="Nightlife, arts & entertainment"),
                    SuggestedReply(label="🛍️ Local Markets, Designer Boutiques & Shopping", value="Shopping & local markets"),
                    SuggestedReply(label="📸 Photography, Golden Hour Sights & Hidden Gems", value="Photography & viewpoints"),
                ]
            interest_replies.append(
                SuggestedReply(label="✏️ Other (Write custom passions)", value="other", is_other=True, placeholder="Enter custom interests (e.g. Scuba diving, architectural walks, vintage vinyl hunting)...")
            )

            return (
                f"What experiences and activities excite you most about visiting **{prefs.destination}**?",
                interest_replies,
                "discovery",
                "interests"
            )

        # 9. Accommodation style
        if not prefs.stay_preference:
            if any(k in dest_str for k in ["japan", "tokyo", "kyoto"]):
                stay_replies = [
                    SuggestedReply(label="🏮 Traditional Onsen Ryokan with Tatami & Kaiseki", value="Authentic cultural stays (Ryokan)"),
                    SuggestedReply(label="🎨 Boutique & Aesthetic Design Hotels", value="Boutique design hotels"),
                    SuggestedReply(label="👑 5-Star Luxury Hotels with City Views", value="5-star luxury hotels"),
                    SuggestedReply(label="🏙️ Centrally Located Smart Modern Hotels (Steps to Station)", value="Centrally located modern hotels"),
                ]
            elif any(k in dest_str for k in ["swiss", "switzerland", "alps"]):
                stay_replies = [
                    SuggestedReply(label="🪵 Traditional Alpine Wooden Chalets & Lodges", value="Authentic alpine chalets"),
                    SuggestedReply(label="🎨 Boutique Mountain Design Hotels with Spas", value="Boutique mountain hotels"),
                    SuggestedReply(label="👑 5-Star Luxury Grand Palace Resorts", value="5-star luxury hotels"),
                    SuggestedReply(label="🏙️ Central Historic Old Town City Hotels", value="Central historic hotels"),
                ]
            elif any(k in dest_str for k in ["rajasthan", "kerala", "goa", "india"]):
                stay_replies = [
                    SuggestedReply(label="🏰 Heritage Havelis & Royal Palaces", value="Heritage palace & haveli stays"),
                    SuggestedReply(label="🌿 Eco-Luxury Ayurvedic Resorts & Houseboats", value="Eco-luxury nature stays"),
                    SuggestedReply(label="🎨 Chic Boutique Heritage Hotels", value="Boutique hotels"),
                    SuggestedReply(label="👑 5-Star International Luxury Beach/City Resorts", value="5-star luxury resorts"),
                ]
            else:
                stay_replies = [
                    SuggestedReply(label="🎨 Boutique & Aesthetic Design Hotels", value="Boutique design hotels"),
                    SuggestedReply(label="🏮 Authentic Heritage & Cultural Stays", value="Authentic cultural stays"),
                    SuggestedReply(label="👑 5-Star Luxury Resorts with Premium Spas", value="5-star luxury hotels"),
                    SuggestedReply(label="🏙️ Centrally Located Modern City Hotels", value="Centrally located modern hotels"),
                    SuggestedReply(label="🏡 Private Scenic Villa or Serviced Apartment", value="Private serviced apartments"),
                ]
            stay_replies.append(
                SuggestedReply(label="✏️ Other (Write custom lodging style)", value="other", is_other=True, placeholder="Enter lodging style (e.g. Eco-lodge, penthouse with terrace, historic monastery)...")
            )

            return (
                f"What accommodation style fits your vision for **{prefs.destination}**?",
                stay_replies,
                "discovery",
                "stay"
            )

        # 10. Dining & Dietary Preferences
        if not prefs.dining_preference:
            return (
                f"Lastly, what are your dining & dietary preferences for **{prefs.destination}**?\n\n"
                f"This allows our culinary agents to curate daily lunch, dinner, and café recommendations that match your diet.",
                [
                    SuggestedReply(label="🥗 Pure Vegetarian & Vegan Friendly (Plant-based dining)", value="Pure Vegetarian & Vegan Friendly"),
                    SuggestedReply(label="🍲 Street Food & Iconic Local Eateries (Must-try regional bites)", value="Authentic Local Street Food & Night Markets"),
                    SuggestedReply(label="🍷 Fine Dining & Gourmet Tasting Menus (Michelin-starred & chef-driven)", value="Fine Dining & Michelin-Starred Experiences"),
                    SuggestedReply(label="🥩 Coastal Seafood & Regional Specialties (Non-vegetarian feasts)", value="Coastal Seafood & Regional Specialties"),
                    SuggestedReply(label="🕌 Halal-Friendly Dining (Certified halal eateries)", value="Halal-Certified Dining"),
                    SuggestedReply(label="✨ Authentic Local Cuisine (No dietary restrictions)", value="Authentic Regional Cuisine (No Dietary Restrictions)"),
                    SuggestedReply(label="✏️ Other (Write custom dietary notes)", value="other", is_other=True, placeholder="Enter dietary notes (e.g. Jain food, Gluten-free, Nut allergy, Coffee lover)..."),
                ],
                "discovery",
                "dining"
            )

        # 11. All 10 Options Completed! Present Final Blueprint
        curr = prefs.budget_currency or "INR"
        dates_display = prefs.dates or f"{prefs.duration_days} Days"
        season_display = f" ({prefs.season} Season • {prefs.travel_month})" if prefs.season and prefs.travel_month else ""
        
        return (
            f"All 10 travel criteria are verified and locked in! Here is your custom travel blueprint:\n\n"
            f"• Destination: **{prefs.destination}**\n"
            f"• Departure: **{prefs.origin}**\n"
            f"• Travel Dates: **{dates_display}**{season_display}\n"
            f"• Duration: **{prefs.duration_days} Days**\n"
            f"• Travelers: **{prefs.party_type}**\n"
            f"• Pacing: **{prefs.travel_pace.title()}**\n"
            f"• Budget: **{curr} {prefs.budget_amount:,.0f}**\n"
            f"• Transit: **{prefs.transport_preference.title()}**\n"
            f"• Stays: **{prefs.stay_preference.title() if prefs.stay_preference else 'Boutique'}**\n"
            f"• Dining: **{prefs.dining_preference.title() if prefs.dining_preference else 'Local Curated'}**\n"
            f"• Focus: **{', '.join(prefs.interests) if prefs.interests else 'Curated Highlights'}**\n\n"
            f"Our multi-agent system (Web Intelligence, Transit Specialist, Lodging Agent, Itinerary Architect, and Budget Auditor) is ready to engineer your complete, day-by-day travel architecture with live web pricing and verified booking links.\n\n"
            f"Click below to generate your complete trip plan!",
            [
                SuggestedReply(label="🚀 Generate Complete Trip Plan Now", value="Generate Plan Now"),
                SuggestedReply(label="✏️ Adjust Any Preference", value="I want to adjust my preferences"),
            ],
            "options_completed",
            "ready"
        )
