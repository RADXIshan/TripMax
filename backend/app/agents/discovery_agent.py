import re
from datetime import datetime
from typing import Tuple, List, Optional, Dict, Any
from app.models.trip import TripPreferences, SuggestedReply

class DiscoveryAgent:
    """
    Intelligently analyzes user messages, updates extracted preferences,
    and asks sequential, one-by-one structured questions with rich, personalized MCQs
    tailored to the place travelling TO and travelling FROM every time.
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
        text_lower = text.lower()
        now = datetime.now()
        current_year = now.year

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
        elif "weekend" in text_lower or "4 days" in text_lower:
            duration = 4

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

        year_match = re.search(r'\b(202[5-9])\b', text)
        year = int(year_match.group(1)) if year_match else (current_year if found_month_num and found_month_num >= now.month else current_year + 1)

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
                "culinary & food": ["food", "foodie", "culinary", "restaurant", "dining", "street food", "ramen", "tasting", "wine", "cafe", "eats", "gastronomy", "dalma", "sweets"],
                "culture & history": ["culture", "history", "temple", "museum", "monument", "heritage", "historic", "shrine", "castle", "palace", "unesco", "kalinga", "sun temple"],
                "nature & outdoors": ["nature", "hiking", "mountain", "scenery", "scenic", "beach", "lake", "landscape", "outdoors", "park", "alps", "chilika", "dolphins", "forest"],
                "nightlife & bars": ["nightlife", "club", "bar", "party", "cocktail", "pub", "speakeasy", "rooftop"],
                "shopping & markets": ["shopping", "boutique", "market", "bazaar", "vintage", "souvenir", "artisan", "handloom", "ikat", "applique"],
                "photography & viewpoints": ["photography", "photo", "viewpoint", "panoramic", "golden hour", "sunset"],
                "wellness & relaxation": ["wellness", "spa", "onsen", "hot spring", "yoga", "retreat", "ayurvedic", "peace"]
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
            elif any(w in text_lower for w in ["seafood", "coastal", "fish", "crab"]):
                prefs.dining_preference = "Coastal Seafood & Regional Specialties"
            elif any(w in text_lower for w in ["sweet", "dessert"]):
                prefs.dining_preference = "Regional Sweet Delicacies & Local Eateries"
            elif any(w in text_lower for w in ["all", "everything", "no restriction", "authentic local", "meat"]):
                prefs.dining_preference = "Authentic Regional Cuisine (No Dietary Restrictions)"
            elif cleaned and cleaned.lower() not in ["other", "skip"]:
                prefs.dining_preference = cleaned
            if "dining" not in prefs.completed_steps:
                prefs.completed_steps.append("dining")

        # Fallbacks across full message if not set
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

        return prefs

    @classmethod
    def get_destination_profile(cls, dest: str) -> Dict[str, Any]:
        """
        Returns rich localized profile for any place: weather windows, top sights,
        authentic regional dining, unique stays, and route keywords.
        """
        d = dest.lower().strip()

        # 1. Odisha / Bhubaneswar / Puri / Konark
        if any(k in d for k in ["bhubaneswar", "puri", "konark", "odisha", "cuttack"]):
            return {
                "name": "Bhubaneswar & Golden Triangle of Odisha",
                "tag": "Temple City & Coastal Heritage",
                "dates": [
                    {"label": "☀️ Pleasant Winter Peak (Nov 15 – Nov 22, 2026 • 7 Days)", "value": "Nov 15 to Nov 22, 2026 (7 days)"},
                    {"label": "🪔 Autumn Festive Season (Oct 20 – Oct 27, 2026 • 7 Days)", "value": "Oct 20 to Oct 27, 2026 (7 days)"},
                    {"label": "🌸 Spring Temple & Culture Tour (Feb 10 – Feb 17, 2027 • 7 Days)", "value": "Feb 10 to Feb 17, 2027 (7 days)"},
                    {"label": "⚡ Quick 4-Day Golden Triangle (Nov 12 – Nov 16, 2026 • 4 Days)", "value": "Nov 12 to Nov 16, 2026 (4 days)"},
                    {"label": "🛕 Rath Yatra Spiritual Season (Jun 25 – Jul 02, 2027 • 7 Days)", "value": "Jun 25 to Jul 02, 2027 (7 days)"},
                ],
                "interests": [
                    {"label": "⛩️ Ancient Kalinga Temples (Lingaraj, Mukteshwar & Rajarani)", "value": "Ancient Kalinga temple architecture"},
                    {"label": "🏛️ Konark Sun Temple (UNESCO) & Puri Golden Beach", "value": "Konark Sun Temple & Puri Beach"},
                    {"label": "🐬 Chilika Lake Irrawaddy Dolphin Boat Safari", "value": "Chilika Lake dolphin sanctuary"},
                    {"label": "🛍️ Pipili Applique Craft & Ikat Handloom Bazaars", "value": "Handicrafts, applique and ikat handlooms"},
                    {"label": "🦁 Nandankanan White Tiger Safari & Botanical Reserve", "value": "Nandankanan wildlife sanctuary"},
                ],
                "stays": [
                    {"label": "👑 5-Star Heritage Luxury (Mayfair Lagoon / Welcomhotel)", "value": "5-star luxury heritage resort"},
                    {"label": "🌿 Boutique Landscaped Retreat (Trident Bhubaneswar)", "value": "Boutique landscaped hotel"},
                    {"label": "🏙️ Central City Smart Hotel (Vivanta / Fortune Park)", "value": "Centrally located modern hotel"},
                    {"label": "🏡 Authentic Odia Heritage Homestay or Temple-View Villa", "value": "Heritage villa and homestay"},
                ],
                "dining": [
                    {"label": "🍲 Authentic Odia Thali (Dalma, Pakhala Bhata & Besara)", "value": "Authentic Odia cuisine and Dalma thali"},
                    {"label": "🍬 Famous Odia Sweets (Chhena Poda, Pahala Rasagola & Gaja)", "value": "Famous Odia sweets and Chhena Poda"},
                    {"label": "🦀 Bay of Bengal Coastal Seafood, Chilika Prawns & Crab", "value": "Coastal seafood and Chilika prawns"},
                    {"label": "🥗 Pure Vegetarian & Temple Mahaprasad Satvik Dining", "value": "Pure vegetarian temple Mahaprasad"},
                    {"label": "✨ Multi-Cuisine Modern Dining & Rooftop Cafés", "value": "Modern dining and cafes"},
                ],
                "is_india": True,
                "airport": "BBI",
                "station": "BBS"
            }

        # 2. Rajasthan / Jaipur / Udaipur / Jodhpur
        if any(k in d for k in ["rajasthan", "jaipur", "udaipur", "jodhpur", "jaisalmer", "pushkar"]):
            return {
                "name": "Rajasthan Royal Heritage",
                "tag": "Palaces, Desert Forts & Royal Dining",
                "dates": [
                    {"label": "☀️ Pleasant Royal Winter (Nov 10 – Nov 17, 2026 • 7 Days)", "value": "Nov 10 to Nov 17, 2026 (7 days)"},
                    {"label": "🪔 Festive Diwali Season (Oct 28 – Nov 04, 2026 • 7 Days)", "value": "Oct 28 to Nov 04, 2026 (7 days)"},
                    {"label": "🌸 Spring Desert Explorer (Feb 12 – Feb 19, 2027 • 7 Days)", "value": "Feb 12 to Feb 19, 2027 (7 days)"},
                    {"label": "⚡ 5-Day Golden Forts Highlights (Nov 15 – Nov 20, 2026 • 5 Days)", "value": "Nov 15 to Nov 20, 2026 (5 days)"},
                ],
                "interests": [
                    {"label": "🏰 Amber Fort, City Palace & Lake Pichola Boating", "value": "Historic palaces and forts"},
                    {"label": "🐪 Desert Dunes Safari & Golden Hour Stargazing", "value": "Desert safari and dunes"},
                    {"label": "🛍️ Johari Bazaar Jewelry, Block Prints & Blue Pottery", "value": "Artisan bazaars and handicrafts"},
                    {"label": "🪕 Rajasthani Folk Music, Puppet Shows & Puppet Dance", "value": "Folk culture and heritage"},
                ],
                "stays": [
                    {"label": "🏰 Restored Royal Heritage Haveli & Palace Stay", "value": "Heritage palace hotel"},
                    {"label": "👑 5-Star Luxury Lake Resort (Taj Lake Palace / Oberoi)", "value": "5-star luxury palace resort"},
                    {"label": "🎨 Chic Boutique Design Hotel in Old City", "value": "Boutique heritage stay"},
                    {"label": "🏕️ Luxury Royal Desert Camp in the Dunes", "value": "Luxury desert tented camp"},
                ],
                "dining": [
                    {"label": "🍛 Traditional Dal Baati Churma & Gatte Ki Sabzi", "value": "Traditional Dal Baati Churma"},
                    {"label": "👑 Royal Mewari & Rajputana Non-Veg Laal Maas", "value": "Royal Laal Maas specialties"},
                    {"label": "🥗 Pure Vegetarian Marwari Thali & Local Sweets (Ghewar)", "value": "Pure vegetarian Marwari thali"},
                    {"label": "☕ Rooftop Lake-View Cafés & Sunset Lounges", "value": "Rooftop lake view dining"},
                ],
                "is_india": True,
                "airport": "JAI/UDR",
                "station": "JP/UDZ"
            }

        # 3. Kerala / Munnar / Kochi / Alleppey
        if any(k in d for k in ["kerala", "munnar", "kochi", "alleppey", "wayanad", "kovalam"]):
            return {
                "name": "Kerala God's Own Country",
                "tag": "Houseboats, Tea Mist Hills & Coastal Spice",
                "dates": [
                    {"label": "☀️ Pleasant Backwater Winter (Dec 05 – Dec 12, 2026 • 7 Days)", "value": "Dec 05 to Dec 12, 2026 (7 days)"},
                    {"label": "🌸 Spring Plantation Season (Jan 15 – Jan 22, 2027 • 7 Days)", "value": "Jan 15 to Jan 22, 2027 (7 days)"},
                    {"label": "🌧️ Ayurvedic Monsoon Rejuvenation (Aug 10 – Aug 17, 2026 • 7 Days)", "value": "Aug 10 to Aug 17, 2026 (7 days)"},
                    {"label": "⚡ 5-Day Backwaters & Hills (Nov 12 – Nov 17, 2026 • 5 Days)", "value": "Nov 12 to Nov 17, 2026 (5 days)"},
                ],
                "interests": [
                    {"label": "🌿 Serene Alleppey Houseboat Cruise through Paddy Canals", "value": "Private houseboat cruise"},
                    {"label": "🍃 Munnar Tea Plantations, Misty Waterfalls & Hikes", "value": "Tea plantations and hiking"},
                    {"label": "🏮 Fort Kochi Heritage Walk & Chinese Fishing Nets", "value": "Historic colonial heritage"},
                    {"label": "🧘 Authentic Ayurvedic Abhyanga Spas & Yoga Retreats", "value": "Ayurvedic wellness and spas"},
                ],
                "stays": [
                    {"label": "🚢 Private Luxury Backwater Houseboat with Chef", "value": "Private luxury houseboat"},
                    {"label": "🌿 Eco-Luxury Plantation Resort in Munnar Hills", "value": "Eco-luxury plantation resort"},
                    {"label": "🎨 Heritage Dutch/Portuguese Boutique Villa in Kochi", "value": "Historic boutique villa"},
                    {"label": "👑 5-Star Beach & Lakefront Luxury Resort", "value": "5-star luxury lake resort"},
                ],
                "dining": [
                    {"label": "🍌 Traditional Kerala Sadya Feast on Banana Leaf", "value": "Traditional Kerala Sadya"},
                    {"label": "🐟 Fresh Karimeen Pollichathu & Malabar Fish Curry", "value": "Coastal fish and seafood"},
                    {"label": "🥥 Appam with Vegetable Stew & Coconut Chutney", "value": "Appam and vegetable stew"},
                    {"label": "☕ Organic Single-Origin Tea & Spice Tasting", "value": "Tea and spice tasting"},
                ],
                "is_india": True,
                "airport": "COK",
                "station": "ERS"
            }

        # 4. Goa & Konkan
        if any(k in d for k in ["goa", "panaji", "madgaon"]):
            return {
                "name": "Goa Coastal Paradise",
                "tag": "Sunkissed Beaches, Heritage & Seafood",
                "dates": [
                    {"label": "☀️ Peak Sunny Beach Season (Nov 18 – Nov 25, 2026 • 7 Days)", "value": "Nov 18 to Nov 25, 2026 (7 days)"},
                    {"label": "🎉 Festive Christmas & New Year (Dec 22 – Dec 29, 2026 • 7 Days)", "value": "Dec 22 to Dec 29, 2026 (7 days)"},
                    {"label": "🌸 Spring Coastal Breeze (Feb 08 – Feb 15, 2027 • 7 Days)", "value": "Feb 08 to Feb 15, 2027 (7 days)"},
                    {"label": "⚡ Quick 4-Day Getaway (Nov 12 – Nov 16, 2026 • 4 Days)", "value": "Nov 12 to Nov 16, 2026 (4 days)"},
                ],
                "interests": [
                    {"label": "🏖️ Sunkissed Beaches & Vibrant Coastal Beach Shacks", "value": "Beaches and coastal shacks"},
                    {"label": "🏛️ Old Goa Portuguese Cathedrals & Fontainhas Latin Quarter", "value": "Portuguese heritage architecture"},
                    {"label": "🚢 Sunset River Cruise on Mandovi & Water Sports", "value": "River cruises and water sports"},
                    {"label": "🍸 Trendy Beachside Sundowner Bars & Live Music", "value": "Nightlife and beach lounges"},
                ],
                "stays": [
                    {"label": "🏖️ 5-Star Luxury Beachfront Resort with Infinity Pool", "value": "5-star beachfront resort"},
                    {"label": "🎨 Portuguese Colonial Heritage Boutique Villa", "value": "Portuguese heritage villa"},
                    {"label": "🏡 Private Luxury Pool Villa for Group/Couples", "value": "Private pool villa"},
                    {"label": "🌴 Bohemian Eco-Boutique Beach Resort", "value": "Boutique beach resort"},
                ],
                "dining": [
                    {"label": "🦀 Authentic Goan Fish Curry Thali & Prawn Balchão", "value": "Goan fish curry thali"},
                    {"label": "🥘 Portuguese-Goan Vindaloo & Cafreal Specialties", "value": "Portuguese Goan fusion"},
                    {"label": "🥗 Organic Garden Cafés & Vegan Smoothie Bowls", "value": "Healthy organic cafes"},
                    {"label": "🍹 Sunkissed Beach Shacks with Fresh Tandoori Catch", "value": "Beach shack fresh seafood"},
                ],
                "is_india": True,
                "airport": "GOI/GOX",
                "station": "MAO"
            }

        # 5. Japan / Tokyo / Kyoto
        if any(k in d for k in ["japan", "tokyo", "kyoto", "osaka"]):
            return {
                "name": "Japan (Tokyo & Kyoto)",
                "tag": "Hyper-Modern Metropolis & Ancient Zen",
                "dates": [
                    {"label": "🍁 Autumn Foliage & Koyo (Nov 10 – Nov 17, 2026 • 7 Days)", "value": "Nov 10 to Nov 17, 2026 (7 days)"},
                    {"label": "🌸 Sakura Cherry Blossoms (Apr 04 – Apr 11, 2027 • 7 Days)", "value": "Apr 04 to Apr 11, 2027 (7 days)"},
                    {"label": "☀️ Summer Festivals & Mt. Fuji (Jul 10 – Jul 17, 2027 • 7 Days)", "value": "Jul 10 to Jul 17, 2027 (7 days)"},
                    {"label": "❄️ Winter Illuminations (Dec 12 – Dec 19, 2026 • 7 Days)", "value": "Dec 12 to Dec 19, 2026 (7 days)"},
                ],
                "interests": [
                    {"label": "🍜 Authentic Ramen, Sushi & Tsukiji/Nishiki Market Trail", "value": "Culinary tasting and ramen"},
                    {"label": "⛩️ Fushimi Inari Torii, Kinkaku-ji & Ancient Zen Shrines", "value": "Ancient shrines and temples"},
                    {"label": "🚄 Shinkansen Bullet Train Panoramas with Mt. Fuji Views", "value": "Scenic Shinkansen views"},
                    {"label": "🎮 Akihabara Tech, Shibuya Crossing & TeamLab Digital Art", "value": "Modern tech and digital arts"},
                ],
                "stays": [
                    {"label": "🏮 Traditional Ryokan with Tatami, Onsen & Kaiseki Dinner", "value": "Traditional Ryokan with onsen"},
                    {"label": "🎨 Aesthetic Boutique Design Hotel in Gion/Shinjuku", "value": "Boutique design hotel"},
                    {"label": "👑 5-Star Luxury Tower with Panoramic Mt. Fuji / City Views", "value": "5-star luxury high-rise"},
                    {"label": "🏙️ Central Smart Station Hotel (Direct Shinkansen Access)", "value": "Central modern station hotel"},
                ],
                "dining": [
                    {"label": "🍜 Artisanal Ramen Bowls & Yakitori Alley Izakayas", "value": "Ramen and izakaya dining"},
                    {"label": "🍣 Master Chef Edomae Sushi & Multi-Course Kaiseki", "value": "Sushi and kaiseki cuisine"},
                    {"label": "🥗 Plant-Based Shojin Ryori Zen Temple Dining & Vegan Ramen", "value": "Shojin Ryori Buddhist vegan"},
                    {"label": "🍵 Uji Matcha Tea Ceremonies & Wagashi Sweets", "value": "Matcha tea and sweets"},
                ],
                "is_india": False,
                "airport": "HND/NRT",
                "station": "Tokyo/Kyoto"
            }

        # 6. Swiss Alps & Switzerland
        if any(k in d for k in ["swiss", "switzerland", "alps", "zurich"]):
            return {
                "name": "Swiss Alps & Switzerland",
                "tag": "Panoramic Glaciers, Scenic Rail & Alpine Lakes",
                "dates": [
                    {"label": "☀️ Summer Alpine Hiking & Lakes (Jul 10 – Jul 17, 2027 • 7 Days)", "value": "Jul 10 to Jul 17, 2027 (7 days)"},
                    {"label": "❄️ Winter Glacier Express & Snow (Dec 12 – Dec 19, 2026 • 7 Days)", "value": "Dec 12 to Dec 19, 2026 (7 days)"},
                    {"label": "🍁 Golden Autumn Panoramas (Oct 10 – Oct 17, 2026 • 7 Days)", "value": "Oct 10 to Oct 17, 2026 (7 days)"},
                    {"label": "🌸 Spring Meadow Blooms (May 08 – May 15, 2027 • 7 Days)", "value": "May 08 to May 15, 2027 (7 days)"},
                ],
                "interests": [
                    {"label": "🚆 Glacier Express & Bernina Scenic Panoramic Rail Routes", "value": "Scenic alpine trains"},
                    {"label": "🏔️ Jungfraujoch Top of Europe & Mount Titlis Cable Cars", "value": "Mountain viewpoints and cable cars"},
                    {"label": "🚢 Lake Lucerne & Lake Geneva Steamboat Cruises", "value": "Scenic lake cruises"},
                    {"label": "🧀 Traditional Cheese Fondue & Swiss Chocolate Workshops", "value": "Cheese fondue and chocolate"},
                ],
                "stays": [
                    {"label": "🪵 Authentic Timber Alpine Chalet with Mountain Balcony", "value": "Traditional alpine chalet"},
                    {"label": "👑 5-Star Luxury Palace Resort with Thermal Spa", "value": "5-star luxury alpine palace"},
                    {"label": "🎨 Boutique Alpine Mountain Design Lodge", "value": "Boutique mountain lodge"},
                    {"label": "🏙️ Central Lakefront Historic Old Town Hotel", "value": "Central lakefront hotel"},
                ],
                "dining": [
                    {"label": "🫕 Authentic Swiss Cheese Fondue & Crisp Potato Rösti", "value": "Fondue and Rosti"},
                    {"label": "🍫 Artisanal Swiss Chocolatier Tastings & Mountain Bakeries", "value": "Swiss chocolate and pastries"},
                    {"label": "🍷 Local Valais Vineyard Wine & Alpine Grilled Specialties", "value": "Alpine wine and dining"},
                    {"label": "🥗 Farm-to-Table Vegetarian Mountain Dining", "value": "Organic farm-to-table cuisine"},
                ],
                "is_india": False,
                "airport": "ZRH/GVA",
                "station": "Zurich/Interlaken"
            }

        # 7. Default Universal Fallback for any other destination on earth
        return {
            "name": dest.title(),
            "tag": "Curated Highlights & Hidden Gems",
            "dates": [
                {"label": f"☀️ Prime Season Travel ({dest} • Nov 10 – Nov 17, 2026 • 7 Days)", "value": "Nov 10 to Nov 17, 2026 (7 days)"},
                {"label": f"🌸 Spring Blossom Getaway ({dest} • Apr 10 – Apr 17, 2027 • 7 Days)", "value": "Apr 10 to Apr 17, 2027 (7 days)"},
                {"label": f"🍁 Autumn Culture Tour ({dest} • Oct 15 – Oct 22, 2026 • 7 Days)", "value": "Oct 15 to Oct 22, 2026 (7 days)"},
                {"label": f"⚡ Quick 4-Day Highlights ({dest} • Nov 12 – Nov 16, 2026 • 4 Days)", "value": "Nov 12 to Nov 16, 2026 (4 days)"},
            ],
            "interests": [
                {"label": f"🏛️ Iconic Cultural Landmarks & Historic Heritage in {dest}", "value": f"Historic landmarks in {dest}"},
                {"label": f"🌲 Panoramic Nature, Scenic Viewpoints & Outdoors in {dest}", "value": f"Nature and viewpoints in {dest}"},
                {"label": f"🍜 Authentic Local Gastronomy & Famous Street Eateries", "value": f"Local gastronomy in {dest}"},
                {"label": f"🛍️ Artisan Bazaars, Boutiques & Local Shopping in {dest}", "value": f"Shopping and markets in {dest}"},
            ],
            "stays": [
                {"label": f"👑 5-Star Luxury Resort / Hotel with Signature Amenities", "value": "5-star luxury hotel"},
                {"label": f"🎨 Aesthetic Boutique Design Hotel in Prime Neighborhood", "value": "Boutique design hotel"},
                {"label": f"🏮 Authentic Heritage & Traditional Local Stay in {dest}", "value": "Authentic heritage stay"},
                {"label": f"🏙️ Centrally Located Modern Hotel (Near Transit Hubs)", "value": "Centrally located modern hotel"},
            ],
            "dining": [
                {"label": f"🍲 Authentic Local Cuisine & Famous Regional Specialties of {dest}", "value": f"Authentic specialties of {dest}"},
                {"label": "🥗 Pure Vegetarian & Vegan Friendly Curated Dining", "value": "Pure vegetarian and vegan dining"},
                {"label": "🍷 Celebrated Chef-Driven Restaurants & Scenic Dinner Views", "value": "Fine dining and scenic dinner"},
                {"label": "🍢 Bustling Local Food Markets & Street Food Tasting", "value": "Local street food and markets"},
            ],
            "is_india": any(ind in dest.lower() for ind in ["india", "bhubaneswar", "delhi", "mumbai", "bangalore", "kerala", "goa", "jaipur", "odisha", "kolkata", "chennai", "hyderabad", "pune", "varanasi", "kashmir", "shimla", "manali"]),
            "airport": "Main Airport",
            "station": "Central Rail"
        }

    @classmethod
    def get_route_transit_options(cls, origin: str, dest: str, prof: Dict[str, Any]) -> List[SuggestedReply]:
        """
        Dynamically crafts authentic transit options between origin and destination every time.
        """
        o_clean = origin.strip() or "Departure City"
        d_clean = dest.strip() or "Destination"
        o_low = o_clean.lower()
        d_low = d_clean.lower()

        # Route 1: Bengaluru to Bhubaneswar
        if ("bengaluru" in o_low or "blr" in o_low or "bangalore" in o_low) and ("bhubaneswar" in d_low or "bbi" in d_low or "odisha" in d_low or "puri" in d_low):
            return [
                SuggestedReply(label="✈️ Direct Non-Stop Flight (IndiGo / Air India Express, ~2h 15m from BLR to BBI)", value="Direct flight from Bengaluru to Bhubaneswar"),
                SuggestedReply(label="🚆 Premium Express Train (SMVB HWH Duronto 12246 / Prashanti Express to BBS)", value="High-speed train from Bengaluru to Bhubaneswar"),
                SuggestedReply(label="🔄 Optimal Blend (Fly to BBI + Dedicated AC Car for Puri & Konark)", value="Both flight and private car for Golden Triangle"),
                SuggestedReply(label="🚗 Scenic Coastal Highway Drive (via NH16 Corridor)", value="Scenic highway road trip via NH16"),
            ]

        # Route 2: New Delhi to Bhubaneswar
        if ("delhi" in o_low or "del" in o_low) and ("bhubaneswar" in d_low or "bbi" in d_low or "odisha" in d_low):
            return [
                SuggestedReply(label="✈️ Direct Flight (Air India / IndiGo from DEL to BBI, ~2h 10m)", value="Direct flight from Delhi to Bhubaneswar"),
                SuggestedReply(label="🚆 High-Speed Rajdhani Express (BBS Tejas Rajdhani 20818 / Vande Bharat)", value="High-speed Rajdhani train from Delhi to Bhubaneswar"),
                SuggestedReply(label="🔄 Flight + Private AC Chauffeur for Golden Triangle Tour", value="Flight and private car for Bhubaneswar, Puri, Konark"),
                SuggestedReply(label="🚗 Long-Haul Road Expedition via NH19 / NH16", value="Road trip via national highways"),
            ]

        # Route 3: Mumbai to Bhubaneswar
        if ("mumbai" in o_low or "bom" in o_low) and ("bhubaneswar" in d_low or "bbi" in d_low or "odisha" in d_low):
            return [
                SuggestedReply(label="✈️ Direct Non-Stop Flight (IndiGo / Akasa Air from BOM to BBI, ~2h 20m)", value="Direct flight from Mumbai to Bhubaneswar"),
                SuggestedReply(label="🚆 Superfast Express Rail (LTT BBS Express 12879 / Konark Express to BBS)", value="Superfast train from Mumbai to Bhubaneswar"),
                SuggestedReply(label="🔄 Flight to BBI + Dedicated AC Chauffeur for Puri & Konark", value="Flight and private chauffeur"),
                SuggestedReply(label="🚗 Western to Eastern Ghats Highway Road Journey", value="Cross-country road trip"),
            ]

        # Route 4: Kolkata to Bhubaneswar
        if ("kolkata" in o_low or "ccu" in o_low or "howrah" in o_low) and ("bhubaneswar" in d_low or "bbi" in d_low or "odisha" in d_low):
            return [
                SuggestedReply(label="🚆 Vande Bharat Express (22895 HWH to BBS, ~6h 30m)", value="Vande Bharat Express train from Howrah to Bhubaneswar"),
                SuggestedReply(label="✈️ Quick Flight (IndiGo / Alliance Air CCU to BBI, ~1h)", value="Short flight from Kolkata to Bhubaneswar"),
                SuggestedReply(label="🚗 Scenic 8-Hour Highway Drive via NH16", value="Highway road trip via NH16"),
                SuggestedReply(label="🔄 Shatabdi / Dhauli Express Rail Route", value="Express train from Howrah to Bhubaneswar"),
            ]

        # Route 5: Indian Domestic Route General
        if prof.get("is_india", False):
            return [
                SuggestedReply(label=f"✈️ Direct / Fast Connecting Flight from {o_clean} to {d_clean}", value=f"Flight from {o_clean} to {d_clean}"),
                SuggestedReply(label=f"🚆 Vande Bharat / Superfast Express Rail from {o_clean} to {d_clean}", value=f"Train from {o_clean} to {d_clean}"),
                SuggestedReply(label=f"🔄 Optimal Blend (Flight Arrival + Dedicated AC Car for Local Sightseeing)", value=f"Both flight and private car in {d_clean}"),
                SuggestedReply(label=f"🚗 Scenic Highway Drive / Private AC Chauffeur Route", value=f"Private car road trip to {d_clean}"),
            ]

        # Route 6: International Route
        return [
            SuggestedReply(label=f"✈️ Direct / 1-Stop International Flight from {o_clean} to {d_clean}", value=f"Flight from {o_clean} to {d_clean}"),
            SuggestedReply(label=f"🚆 Scenic High-Speed Rail Pass & Trains across {d_clean}", value=f"Scenic high-speed train in {d_clean}"),
            SuggestedReply(label=f"🔄 Optimal Blend (International Flight + Scenic Regional Trains)", value=f"Both flights and rail in {d_clean}"),
            SuggestedReply(label=f"🚗 Scenic Road Trip & Rental Car Drive through {d_clean}", value=f"Rental car road trip in {d_clean}"),
        ]

    @classmethod
    def get_next_step(cls, prefs: TripPreferences, user_text: str = "") -> Tuple[str, List[SuggestedReply], str, str]:
        """
        Determines the next sequential question, MCQ options (including 'Other'),
        the stage ('discovery', 'options_completed', or 'ready_to_plan'), and question_key.
        Personalized to both destination and origin every single time.
        """
        user_lower = user_text.lower()
        ready_triggers = [
            "plan now", "generate plan", "i am ready", "i'm ready", 
            "create itinerary", "build trip", "let's go", 
            "generate complete trip plan now", "generate plan now", "start planning"
        ]

        next_key = cls.get_pending_question_key(prefs)
        is_all_done = (next_key == "ready")

        if any(tr in user_lower for tr in ready_triggers):
            if is_all_done:
                return (
                    f"Understood! All 10 specialized travel parameters are confirmed for {prefs.destination} departing from {prefs.origin or 'your home city'}. All agents are assembling now to research and engineer your complete trip plan.",
                    [],
                    "ready_to_plan",
                    "ready"
                )

        # 1. Destination
        if not prefs.destination:
            return (
                "Welcome to TripMax! I am your Trip Discovery Architect. Let's design your perfect journey step-by-step.\n\nFirst, where in the world would you love to travel?",
                [
                    SuggestedReply(label="🏛️ Bhubaneswar, Puri & Konark, Odisha (Temples, Heritage & Coast)", value="Bhubaneswar, Odisha"),
                    SuggestedReply(label="🌸 Tokyo & Kyoto, Japan (Modern Metropolis & Ancient Shrines)", value="Tokyo & Kyoto, Japan"),
                    SuggestedReply(label="🏔️ Swiss Alps & Zurich, Switzerland (Scenic Glaciers & Rail)", value="Swiss Alps & Zurich, Switzerland"),
                    SuggestedReply(label="🏰 Jaipur & Udaipur, Rajasthan, India (Royal Palaces & Forts)", value="Jaipur & Udaipur, Rajasthan, India"),
                    SuggestedReply(label="🌿 Kerala Backwaters & Munnar, India (Serene Houseboats & Hills)", value="Kerala & Munnar, India"),
                    SuggestedReply(label="🏖️ Goa Coastal Getaway, India (Sunkissed Beaches & Seafood)", value="Goa, India"),
                    SuggestedReply(label="🌴 Bali & Ubud, Indonesia (Tropical Temples & Rice Terraces)", value="Bali & Ubud, Indonesia"),
                    SuggestedReply(label="🏛️ Rome & Amalfi Coast, Italy (Renaissance Art & Coastal Living)", value="Rome & Amalfi Coast, Italy"),
                    SuggestedReply(label="✏️ Other (Write your own destination)", value="other", is_other=True, placeholder="Enter destination (e.g. Bhubaneswar, Kashmir, London, Barcelona)..."),
                ],
                "discovery",
                "destination"
            )

        # Retrieve profile for destination
        prof = cls.get_destination_profile(prefs.destination)

        # 2. Origin
        if not prefs.origin:
            origin_options = [
                SuggestedReply(label="🇮🇳 Bengaluru (BLR - Kempegowda Intl)", value="Bengaluru (BLR)"),
                SuggestedReply(label="🇮🇳 New Delhi (DEL - Indira Gandhi Intl)", value="New Delhi (DEL)"),
                SuggestedReply(label="🇮🇳 Mumbai (BOM - Chhatrapati Shivaji Intl)", value="Mumbai (BOM)"),
                SuggestedReply(label="🇮🇳 Kolkata (CCU - Netaji Subhash Chandra Bose Intl)", value="Kolkata (CCU)"),
                SuggestedReply(label="🇮🇳 Hyderabad (HYD - Rajiv Gandhi Intl)", value="Hyderabad (HYD)"),
                SuggestedReply(label="🇮🇳 Chennai (MAA - Chennai Intl)", value="Chennai (MAA)"),
                SuggestedReply(label="🗽 New York City (JFK/EWR)", value="New York City (JFK)"),
                SuggestedReply(label="🇬🇧 London (LHR/LGW)", value="London (LHR)"),
                SuggestedReply(label="🇸🇬 Singapore (SIN - Changi Intl)", value="Singapore (SIN)"),
                SuggestedReply(label="🇦🇪 Dubai (DXB)", value="Dubai (DXB)"),
                SuggestedReply(label="✏️ Other (Write your departure city)", value="other", is_other=True, placeholder="Enter departure city (e.g. Pune, Ahmedabad, Chicago, Berlin)..."),
            ]
            return (
                f"**{prefs.destination}** is an exceptional choice! Where will you be departing from?",
                origin_options,
                "discovery",
                "origin"
            )

        # 3. Dates and Duration
        if not prefs.dates or not prefs.duration_days:
            date_replies = [SuggestedReply(label=d["label"], value=d["value"]) for d in prof.get("dates", [])]
            date_replies.append(
                SuggestedReply(label="✏️ Other (Write exact dates & duration)", value="other", is_other=True, placeholder=f"Enter exact travel dates and days for {prefs.destination}...")
            )
            return (
                f"When would you like to experience **{prefs.destination}**? Please choose your preferred seasonal window or specify exact dates and duration.\n\n"
                f"Our agents calibrate live seasonal weather, seasonal hotel rates, and attraction schedules for those exact dates.",
                date_replies,
                "discovery",
                "dates"
            )

        # 4. Party Type
        if not prefs.party_type:
            party_options = [
                SuggestedReply(label=f"🎒 Solo Explorer (Independent, agile & self-paced in {prefs.destination})", value="Solo Explorer"),
                SuggestedReply(label=f"💑 Couple / Romantic Getaway (Scenic moments & intimate dining)", value="Couple / Romantic"),
                SuggestedReply(label=f"👨‍👩‍👧‍👦 Family with Children (Kid-friendly pacing & spacious stays)", value="Family with Children"),
                SuggestedReply(label=f"🍻 Group of Friends (Dynamic adventures & shared memories)", value="Group of Friends"),
                SuggestedReply(label=f"🧓 Multi-Generational Family (Comfortable transit & accessible sights)", value="Multi-Generational Family"),
                SuggestedReply(label="✏️ Other (Write your travel party)", value="other", is_other=True, placeholder="Enter party details (e.g. Senior parents, College reunion, Photography group)..."),
            ]
            return (
                f"Who will be traveling with you on this {prefs.duration_days}-day journey to **{prefs.destination}**?",
                party_options,
                "discovery",
                "party_type"
            )

        # 5. Travel Pace
        if not prefs.travel_pace:
            pace_options = [
                SuggestedReply(label=f"☕ Relaxed & Leisurely (Slow mornings, café downtime, 1–2 highlights daily)", value="Relaxed pace"),
                SuggestedReply(label=f"⚖️ Balanced & Curated (2–3 key sights daily + scenic breaks & free evenings)", value="Balanced pace"),
                SuggestedReply(label=f"⚡ Action-Packed & High-Energy (Early starts, maximize sights across {prefs.destination})", value="Fast-paced"),
                SuggestedReply(label="✏️ Other (Write custom pacing)", value="other", is_other=True, placeholder="Enter custom pace (e.g. Photography golden hour pace, Night-owl vibe)..."),
            ]
            return (
                f"What travel pace matches how you and your {prefs.party_type or 'party'} prefer to explore **{prefs.destination}**?",
                pace_options,
                "discovery",
                "travel_pace"
            )

        # 6. Budget
        if not prefs.budget_amount:
            curr = prefs.budget_currency or "INR"
            is_ind = prof.get("is_india", False)
            if curr == "INR":
                if is_ind:
                    budget_replies = [
                        SuggestedReply(label=f"🎒 Smart Value Budget (~₹15,000 / person) (Clean boutique hotels, local transit & authentic street eats)", value="₹15000"),
                        SuggestedReply(label=f"🏨 Comfort & Balanced (~₹35,000 / person) (4-star hotels, express rail/cabs, curated dining)", value="₹35000"),
                        SuggestedReply(label=f"👑 Luxury & Heritage (~₹75,000+ / person) (5-star luxury resorts, private AC chauffeur, fine dining)", value="₹75000"),
                        SuggestedReply(label="✏️ Other (Write target budget in ₹)", value="other", is_other=True, placeholder="Enter budget per person in ₹ (e.g. ₹20000, ₹50000, ₹1 Lakh)..."),
                    ]
                else:
                    budget_replies = [
                        SuggestedReply(label=f"🎒 Smart Budget (~₹50,000 / person) (Boutique budget stays & public transit)", value="₹50000"),
                        SuggestedReply(label=f"🏨 Comfort & Balanced (~₹1,20,000 / person) (4-star hotels, scenic rail, curated dining)", value="₹120000"),
                        SuggestedReply(label=f"👑 Luxury & Indulgent (~₹2,50,000+ / person) (5-star luxury hotels, private transfers, fine dining)", value="₹250000"),
                        SuggestedReply(label="✏️ Other (Write target budget in ₹)", value="other", is_other=True, placeholder="Enter budget per person in ₹ (e.g. ₹80000, ₹1.5 Lakh, ₹3 Lakh)..."),
                    ]
            else:
                budget_replies = [
                    SuggestedReply(label=f"🎒 Smart Budget (~{curr} 1,200 / person)", value=f"{curr} 1200"),
                    SuggestedReply(label=f"🏨 Comfort & Balanced (~{curr} 2,800 / person)", value=f"{curr} 2800"),
                    SuggestedReply(label=f"👑 Luxury & Premium (~{curr} 5,500+ / person)", value=f"{curr} 5500"),
                    SuggestedReply(label=f"✏️ Other (Write target budget in {curr})", value="other", is_other=True, placeholder=f"Enter budget per person in {curr}..."),
                ]

            return (
                f"What is your target budget per person (in {curr}) for lodging, transit, and activities in **{prefs.destination}**?",
                budget_replies,
                "discovery",
                "budget"
            )

        # 7. Transport (Personalized between origin and destination every time)
        if not prefs.transport_preference:
            transit_replies = cls.get_route_transit_options(prefs.origin or "Home", prefs.destination, prof)
            transit_replies.append(
                SuggestedReply(label="✏️ Other (Write custom transit preference)", value="other", is_other=True, placeholder=f"Enter transit preference from {prefs.origin or 'Origin'} to {prefs.destination}...")
            )
            return (
                f"How would you prefer to travel from **{prefs.origin or 'your departure city'}** to **{prefs.destination}** and between regional sights?",
                transit_replies,
                "discovery",
                "transport"
            )

        # 8. Interests & Highlights
        if not prefs.interests or len(prefs.interests) == 0:
            interest_replies = [SuggestedReply(label=i["label"], value=i["value"]) for i in prof.get("interests", [])]
            interest_replies.append(
                SuggestedReply(label="✏️ Other (Write custom passions)", value="other", is_other=True, placeholder=f"Enter custom interests or experiences in {prefs.destination}...")
            )
            return (
                f"What experiences and activities excite you most about visiting **{prefs.destination}**?",
                interest_replies,
                "discovery",
                "interests"
            )

        # 9. Stays & Lodging
        if not prefs.stay_preference:
            stay_replies = [SuggestedReply(label=s["label"], value=s["value"]) for s in prof.get("stays", [])]
            stay_replies.append(
                SuggestedReply(label="✏️ Other (Write custom stay style)", value="other", is_other=True, placeholder=f"Enter lodging style for {prefs.destination}...")
            )
            return (
                f"What style of accommodations fits your vision for **{prefs.destination}**?",
                stay_replies,
                "discovery",
                "stay"
            )

        # 10. Dining & Dietary
        if not prefs.dining_preference:
            dining_replies = [SuggestedReply(label=dn["label"], value=dn["value"]) for dn in prof.get("dining", [])]
            dining_replies.append(
                SuggestedReply(label="✏️ Other (Write dietary notes or favorite food)", value="other", is_other=True, placeholder=f"Enter specific dietary requirements or food preferences for {prefs.destination}...")
            )
            return (
                f"Lastly, what are your dining & culinary preferences for **{prefs.destination}**?\n\n"
                f"Our culinary agents will match your exact diet across morning breakfasts, lunches, and evening dining spots.",
                dining_replies,
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
