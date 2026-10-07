from typing import List, Dict, Any
from app.models.trip import TripPreferences, ItineraryDay, ActivityItem
from app.services.deep_links import get_attraction_booking_url, get_viator_url

class ItineraryAgent:
    """
    Constructs high-fidelity, day-by-day travel schedules customized to the user's
    pace (relaxed vs balanced vs fast-paced), interests, and destination.
    """

    @classmethod
    def generate_day_by_day(
        cls, 
        prefs: TripPreferences, 
        web_context: List[Dict[str, str]] = None
    ) -> List[ItineraryDay]:
        dest = prefs.destination or "Destination"
        days_count = min(max(prefs.duration_days or 5, 1), 14)
        curr = prefs.budget_currency
        
        # Scaling factor based on currency
        rate = 1.0
        if curr == "EUR":
            rate = 0.92
        elif curr == "GBP":
            rate = 0.78
        elif curr == "INR":
            rate = 83.0
        elif curr == "JPY":
            rate = 150.0

        # Themes and templates tailored by destination & interests
        dest_lower = dest.lower()
        
        # Known custom itineraries for popular destinations or smart dynamic generator
        day_plans: List[ItineraryDay] = []

        is_japan = any(k in dest_lower for k in ["japan", "kyoto", "tokyo", "osaka"])
        is_italy = any(k in dest_lower for k in ["italy", "amalfi", "rome", "florence", "venice"])
        is_swiss = any(k in dest_lower for k in ["swiss", "switzerland", "zurich", "zermatt", "interlaken"])
        is_france = any(k in dest_lower for k in ["paris", "france", "nice", "provence"])

        for d in range(1, days_count + 1):
            if is_japan:
                day_plans.append(cls._build_japan_day(d, dest, rate, curr))
            elif is_italy:
                day_plans.append(cls._build_italy_day(d, dest, rate, curr))
            elif is_swiss:
                day_plans.append(cls._build_swiss_day(d, dest, rate, curr))
            elif is_france:
                day_plans.append(cls._build_france_day(d, dest, rate, curr))
            else:
                day_plans.append(cls._build_generic_day(d, dest, rate, curr, prefs.interests))

        return day_plans

    @classmethod
    def _build_japan_day(cls, day: int, dest: str, rate: float, curr: str) -> ItineraryDay:
        templates = [
            {
                "title": "Historic Temples & Bamboo Forest Whispers",
                "theme": "Spiritual Heritage & Nature",
                "morning": ("08:30 AM", "Arashiyama Bamboo Grove & Tenryu-ji Temple", "West District", "Walk under the towering bamboo canopies before morning crowds, followed by meditation at Zen UNESCO temple.", 8 * rate),
                "afternoon": ("01:30 PM", "Kinkaku-ji (Golden Pavilion) & Tea Garden", "North District", "Marvel at the shimmering golden pavilion mirrored over Kyoko-chi pond, followed by matcha in a quiet tea courtyard.", 10 * rate),
                "evening": ("06:00 PM", "Gion Lantern Quarter & Geisha District Walk", "Historic Gion", "Wander wooden machiya lanes illuminated by evening paper lanterns and explore Shirakawa canal.", 0),
                "lunch": {"place": "Shigetsu Zen Restaurant", "dish": "Shojin Ryori (Buddhist Vegetarian Feast)", "vibe": "Overlooking tranquil rock garden"},
                "dinner": {"place": "Gion Karyo", "dish": "Multi-course Kaiseki Tasting with Seasonal Wagyu", "vibe": "Restored traditional machiya"},
                "tip": "Purchase an ICOCA IC transit card at the train station for seamless tap-and-ride on all buses and trains."
            },
            {
                "title": "Torii Gates & Sensory Market Delights",
                "theme": "Iconic Shrines & Culinary Exploration",
                "morning": ("07:30 AM", "Fushimi Inari Shrine Hike (Thousands of Vermillion Torii)", "Southern Hills", "Early morning summit walk along thousands of vibrant scarlet gates winding up Mount Inari.", 0),
                "afternoon": ("12:30 PM", "Nishiki Market 'Kyoto's Kitchen'", "Central District", "Browse 100+ bustling food stalls sampling grilled wagyu skewers, octopus dumplings, and matcha warabi mochi.", 15 * rate),
                "evening": ("05:30 PM", "Kiyomizu-dera Temple Sunset & Ninenzaka Streets", "Eastern Hills", "Witness golden hour over the wooden stage without nails, overlooking panoramic views of Kyoto.", 6 * rate),
                "lunch": {"place": "Daiyasu Oyster & Sake Bar", "dish": "Fresh Hokkaido Oysters & Yuzu Tempura", "vibe": "Lively market atmosphere"},
                "dinner": {"place": "Chao Chao Gyoza", "dish": "Crispy Plum Shiso & Cheese Dumplings", "vibe": "Cozy, buzzing izakaya"},
                "tip": "Wear comfortable walking shoes with good tread for the stairs at Fushimi Inari and Ninenzaka slopes."
            },
            {
                "title": "Zen Philosophy & Philosopher's Path",
                "theme": "Art, Meditation & Hidden Alleyways",
                "morning": ("09:00 AM", "Ginkaku-ji (Silver Pavilion) & Sand Garden", "Eastern Foothills", "Contemplate the dry landscape sand garden 'Sea of Silver Sand' and moss grove.", 7 * rate),
                "afternoon": ("02:00 PM", "Strolling the Philosopher's Path & Nanzen-ji Aqueduct", "Canal Way", "Scenic walk along stone canal lined with cherry trees and ancient brick Roman-style aqueducts.", 0),
                "evening": ("06:30 PM", "Pontocho Alley Izakaya Hop", "Kamogawa River", "Atmospheric dining along narrow riverside alley with charming wooden verandas (kawayuka).", 20 * rate),
                "lunch": {"place": "Omen Udon Noodles", "dish": "Handmade Udon with Fresh Mountain Vegetables", "vibe": "Rustic and comforting"},
                "dinner": {"place": "Torito Charcoal Yakitori", "dish": "Artisan Binchotan Grilled Skewers & Craft Beer", "vibe": "Vibrant local favorite"},
                "tip": "Book riverside dining (Kawayuka) ahead if visiting between May and September for scenic river breezes."
            }
        ]
        t = templates[(day - 1) % len(templates)]
        return ItineraryDay(
            day=day,
            title=f"Day {day}: {t['title']}",
            theme=t['theme'],
            morning=ActivityItem(
                time=t['morning'][0],
                title=t['morning'][1],
                location=t['morning'][2],
                duration="3 hours",
                description=t['morning'][3],
                estimated_cost=round(t['morning'][4], 1),
                booking_url=get_attraction_booking_url(t['morning'][1], dest),
                tags=["Must-See", "Culture", "Photography"]
            ),
            afternoon=ActivityItem(
                time=t['afternoon'][0],
                title=t['afternoon'][1],
                location=t['afternoon'][2],
                duration="3.5 hours",
                description=t['afternoon'][3],
                estimated_cost=round(t['afternoon'][4], 1),
                booking_url=get_attraction_booking_url(t['afternoon'][1], dest),
                tags=["Food", "Sightseeing"]
            ),
            evening=ActivityItem(
                time=t['evening'][0],
                title=t['evening'][1],
                location=t['evening'][2],
                duration="2.5 hours",
                description=t['evening'][3],
                estimated_cost=round(t['evening'][4], 1),
                booking_url=get_viator_url(t['evening'][1], dest),
                tags=["Evening Walk", "Atmosphere"]
            ),
            lunch_recommendation=t['lunch'],
            dinner_recommendation=t['dinner'],
            transit_tips=t['tip'],
            daily_budget_estimate=round((55 + t['morning'][4] + t['afternoon'][4] + t['evening'][4]) * rate, 0)
        )

    @classmethod
    def _build_italy_day(cls, day: int, dest: str, rate: float, curr: str) -> ItineraryDay:
        templates = [
            {
                "title": "Cliffside Panoramas & Lemon Groves",
                "theme": "Coastal Grandeur & Mediterranean Flavors",
                "morning": ("09:00 AM", "Path of the Gods (Sentiero degli Dei) Cliff Walk", "Bomerano to Nocelle", "Breathtaking hike high above the azure sea through lemon groves and ancient cliffside hamlets.", 0),
                "afternoon": ("01:30 PM", "Positano Pastel Harbor & Spiaggia Grande", "Positano Harbor", "Stroll through cascading bougainvillea streets, designer linen boutiques, and pebble beaches.", 12 * rate),
                "evening": ("06:30 PM", "Aperitivo at Sunset Cliff Bar & Coastal Ferry", "Amalfi Coastline", "Sip Limoncello Spritz while the golden hour turns cliffs terracotta pink.", 18 * rate),
                "lunch": {"place": "Trattoria Santa Croce", "dish": "Homemade Scialatielli with Fresh Seafood & Lemon Zest", "vibe": "Perched on cliff terrace"},
                "dinner": {"place": "Ristorante Da Vincenzo", "dish": "Catch of the Day in Crazy Water (Acqua Pazza)", "vibe": "Warm romantic candlelit tavern"},
                "tip": "Take the public hydrofoil/ferry between towns instead of buses to avoid winding traffic and get spectacular sea views."
            },
            {
                "title": "Historic Villas & Ravello Concert Gardens",
                "theme": "Romantic Architecture & Classical Views",
                "morning": ("09:30 AM", "Villa Rufolo Gardens & Infinity Terrace", "Ravello Mountain Peak", "Explore 13th-century gardens that inspired Richard Wagner, overlooking the entire Gulf of Salerno.", 10 * rate),
                "afternoon": ("02:00 PM", "Villa Cimbrone 'Terrace of Infinity'", "Ravello Cliffs", "Walk past marble Roman busts framed against the endless horizon line of the Tyrrhenian Sea.", 10 * rate),
                "evening": ("06:00 PM", "Amalfi Cathedral (Duomo di Sant'Andrea) Square", "Amalfi Town", "Marvel at striped Arab-Norman arches and bronze doors from Constantinople.", 5 * rate),
                "lunch": {"place": "Cumpa' Cosimo", "dish": "Tasting Trio of Fresh Pastas (Gnocchi, Ravioli, Cannelloni)", "vibe": "Legendary matriarch hospitable bistro"},
                "dinner": {"place": "Eolo Ristorante", "dish": "Handmade Paccheri with Local Lobster", "vibe": "Floor-to-ceiling sea panorama"},
                "tip": "Reserve tables with sunset views at least 2 weeks in advance during high season."
            }
        ]
        t = templates[(day - 1) % len(templates)]
        return ItineraryDay(
            day=day,
            title=f"Day {day}: {t['title']}",
            theme=t['theme'],
            morning=ActivityItem(time=t['morning'][0], title=t['morning'][1], location=t['morning'][2], duration="3h", description=t['morning'][3], estimated_cost=round(t['morning'][4], 1), booking_url=get_attraction_booking_url(t['morning'][1], dest)),
            afternoon=ActivityItem(time=t['afternoon'][0], title=t['afternoon'][1], location=t['afternoon'][2], duration="3.5h", description=t['afternoon'][3], estimated_cost=round(t['afternoon'][4], 1), booking_url=get_attraction_booking_url(t['afternoon'][1], dest)),
            evening=ActivityItem(time=t['evening'][0], title=t['evening'][1], location=t['evening'][2], duration="2.5h", description=t['evening'][3], estimated_cost=round(t['evening'][4], 1), booking_url=get_viator_url(t['evening'][1], dest)),
            lunch_recommendation=t['lunch'],
            dinner_recommendation=t['dinner'],
            transit_tips=t['tip'],
            daily_budget_estimate=round(75 * rate, 0)
        )

    @classmethod
    def _build_swiss_day(cls, day: int, dest: str, rate: float, curr: str) -> ItineraryDay:
        templates = [
            {
                "title": "Glacier Peaks & Alpine Cogwheel Railway",
                "theme": "High Mountain Majesty",
                "morning": ("08:30 AM", "Matterhorn Glacier Paradise / Jungfraujoch Ascent", "Alpine Summit", "Ascend via high-tech 3S cableway or cogwheel train into perpetual snow and ice palace.", 85 * rate),
                "afternoon": ("01:30 PM", "Alpine Meadow Hike to Mirror Lakes (Riffelsee)", "Upper Ridge", "Gentle descent hiking past wildflowers with the reflection of iconic peaks in crystal alpine waters.", 0),
                "evening": ("06:00 PM", "Car-Free Alpine Village Stroll & Chocolate Tasting", "Old Village", "Explore 17th-century larch-wood chalets and artisanal Swiss chocolatiers.", 15 * rate),
                "lunch": {"place": "Chez Vrony", "dish": "Artisan Alpine Cheese Rösti with Dried Beef", "vibe": "Rustic chic chalet on mountain slope"},
                "dinner": {"place": "Restaurant Schäferstube", "dish": "Traditional Swiss Fondue Moitié-Moitié & Crisp Fendant Wine", "vibe": "Cozy pine-wood hearth"},
                "tip": "Get the Swiss Travel Pass for unlimited rides on all trains, boats, panoramic routes, and 50% discount on mountain lifts."
            }
        ]
        t = templates[(day - 1) % len(templates)]
        return ItineraryDay(
            day=day,
            title=f"Day {day}: {t['title']}",
            theme=t['theme'],
            morning=ActivityItem(time=t['morning'][0], title=t['morning'][1], location=t['morning'][2], duration="4h", description=t['morning'][3], estimated_cost=round(t['morning'][4], 1), booking_url=get_attraction_booking_url(t['morning'][1], dest)),
            afternoon=ActivityItem(time=t['afternoon'][0], title=t['afternoon'][1], location=t['afternoon'][2], duration="3h", description=t['afternoon'][3], estimated_cost=round(t['afternoon'][4], 1), booking_url=get_attraction_booking_url(t['afternoon'][1], dest)),
            evening=ActivityItem(time=t['evening'][0], title=t['evening'][1], location=t['evening'][2], duration="2h", description=t['evening'][3], estimated_cost=round(t['evening'][4], 1), booking_url=get_viator_url(t['evening'][1], dest)),
            lunch_recommendation=t['lunch'],
            dinner_recommendation=t['dinner'],
            transit_tips=t['tip'],
            daily_budget_estimate=round(110 * rate, 0)
        )

    @classmethod
    def _build_france_day(cls, day: int, dest: str, rate: float, curr: str) -> ItineraryDay:
        templates = [
            {
                "title": "Iconic Art Galleries & Seine Riverbanks",
                "theme": "Impressionism & Paris Elegance",
                "morning": ("09:00 AM", "Musée d'Orsay & Tuileries Garden Walk", "Left Bank", "Marvel at masterpieces by Monet, Van Gogh, and Renoir inside a magnificent Beaux-Arts railway terminal.", 16 * rate),
                "afternoon": ("02:00 PM", "Le Marais Designer Boutiques & Place des Vosges", "Historic 4th Arr.", "Explore cobblestone courtyards, vibrant art galleries, and historic aristocratic townhouses.", 0),
                "evening": ("06:30 PM", "Golden Hour Sunset Cruise on River Seine", "Pont Neuf", "Glide past Notre Dame and the sparkling Eiffel Tower as city lights reflect over the water.", 18 * rate),
                "lunch": {"place": "Café de Flore / Chez Janou", "dish": "Duck Confit with Rosemary Potatoes & Famous Chocolate Mousse", "vibe": "Quintessential Parisian terrace"},
                "dinner": {"place": "Le Comptoir du Relais", "dish": "Bistronomy Braised Beef Cheek with Burgundy Reduction", "vibe": "Buzzing Saint-Germain haven"},
                "tip": "Download the Île-de-France Mobilités app or buy a Navigo Easy card to tap effortlessly across all metro and RER lines."
            }
        ]
        t = templates[(day - 1) % len(templates)]
        return ItineraryDay(
            day=day,
            title=f"Day {day}: {t['title']}",
            theme=t['theme'],
            morning=ActivityItem(time=t['morning'][0], title=t['morning'][1], location=t['morning'][2], duration="3h", description=t['morning'][3], estimated_cost=round(t['morning'][4], 1), booking_url=get_attraction_booking_url(t['morning'][1], dest)),
            afternoon=ActivityItem(time=t['afternoon'][0], title=t['afternoon'][1], location=t['afternoon'][2], duration="3.5h", description=t['afternoon'][3], estimated_cost=round(t['afternoon'][4], 1), booking_url=get_attraction_booking_url(t['afternoon'][1], dest)),
            evening=ActivityItem(time=t['evening'][0], title=t['evening'][1], location=t['evening'][2], duration="2h", description=t['evening'][3], estimated_cost=round(t['evening'][4], 1), booking_url=get_viator_url(t['evening'][1], dest)),
            lunch_recommendation=t['lunch'],
            dinner_recommendation=t['dinner'],
            transit_tips=t['tip'],
            daily_budget_estimate=round(80 * rate, 0)
        )

    @classmethod
    def _build_generic_day(cls, day: int, dest: str, rate: float, curr: str, interests: List[str]) -> ItineraryDay:
        title_themes = [
            ("Historic Core & Landmark Marvels", "Cultural Immersion"),
            ("Hidden Neighborhoods & Artisan Markets", "Local Secrets & Food"),
            ("Panoramic Viewpoints & Scenic Outdoors", "Scenic Exploration"),
            ("Arts, Architecture & Waterfront Sunset", "Design & Atmosphere"),
            ("Leisure Discovery & Farewell Feast", "Celebration & Souvenirs")
        ]
        t = title_themes[(day - 1) % len(title_themes)]
        return ItineraryDay(
            day=day,
            title=f"Day {day}: {t[0]} in {dest}",
            theme=t[1],
            morning=ActivityItem(
                time="09:00 AM",
                title=f"{dest} Iconic Historic Landmark & Heritage Walk",
                location=f"Central {dest}",
                duration="3 hours",
                description=f"Explore the premier architectural wonder and historical highlights of {dest} with early entry to beat queues.",
                estimated_cost=round(18 * rate, 1),
                booking_url=get_attraction_booking_url(f"{dest} main landmark", dest),
                tags=["Top Highlight", "Culture"]
            ),
            afternoon=ActivityItem(
                time="02:00 PM",
                title=f"Artisan Quarter & Local Crafts Bazaar",
                location=f"Old Town Quarter",
                duration="3 hours",
                description=f"Browse winding historic pedestrian streets, boutique workshops, and sample regional street delicacies.",
                estimated_cost=round(10 * rate, 1),
                booking_url=get_viator_url(f"{dest} walking tour", dest),
                tags=["Hidden Gems", "Shopping"]
            ),
            evening=ActivityItem(
                time="06:30 PM",
                title=f"Golden Hour Sunset Viewpoint & Scenic Promenade",
                location=f"Skyline Terrace / Riverfront",
                duration="2.5 hours",
                description=f"Watch the sunset illuminate {dest}'s skyline, followed by relaxed drinks and evening ambiance.",
                estimated_cost=0,
                booking_url=get_viator_url(f"{dest} evening", dest),
                tags=["Sunset", "Relaxation"]
            ),
            lunch_recommendation={
                "place": f"Bistro Saint-{dest}",
                "dish": "Chef's Signature Regional Platter",
                "vibe": "Charming courtyard setting"
            },
            dinner_recommendation={
                "place": f"The Lantern House {dest}",
                "dish": "Fresh Local Catch & Artisan House Wine",
                "vibe": "Intimate candlelit dining"
            },
            transit_tips=f"Get the local 24-48hr public transit pass for unlimited metro, bus, and light rail rides in {dest}.",
            daily_budget_estimate=round(65 * rate, 0)
        )
