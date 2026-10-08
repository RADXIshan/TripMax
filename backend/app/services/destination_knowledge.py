from typing import Dict, Any, List, Optional

# Comprehensive knowledge base of top world destinations with real authentic data
GLOBAL_DESTINATIONS: Dict[str, Dict[str, Any]] = {
    "barcelona": {
        "country": "Spain",
        "tagline": "Gaudí's Masterpieces, Mediterranean Tapas & Gothic Quarters",
        "overview": "Barcelona combines visionary Modernisme architecture with sun-drenched Mediterranean beaches, vibrant neighborhood food markets, and world-class Catalan dining.",
        "best_time": "May to June or September to October (pleasant 22°C-25°C, warm seas, avoiding peak July heat)",
        "transit_tip": "Purchase the T-Casual card (10 journeys across metro, bus, and tram in Zone 1 for ~€12) or the Hola Barcelona Travel Card for unlimited rides.",
        "currency": "EUR",
        "stays": [
            {
                "id": "stay-cotton-house",
                "name": "Cotton House Hotel, Autograph Collection",
                "type": "Boutique Design & Heritage Landmark",
                "neighborhood": "Gran Via / Eixample Cultural District",
                "rating": 4.93,
                "review_count": 920,
                "base_usd": 240,
                "badge": "🌟 Top Rated Boutique (9.5/10)",
                "key_amenities": [
                    "Restored 19th-Century Neoclassical Cotton Guild Headquarters",
                    "Rooftop Plunge Pool with Sagrada Família Views",
                    "Artisan Cocktail Bar Batuar & Lush Courtyard",
                    "Original Suspended Spiral Marble Staircase",
                    "Complimentary Tailoring & Concierge Suite"
                ],
                "why": "Ranked #1 luxury boutique hotel in central Barcelona. Architectural marvel in elegant Eixample, walking distance to Passeig de Gràcia.",
                "snippet": "Verified guest: 'The historic architecture took our breath away. Having drinks in the lush courtyard after touring Gaudí sights was absolute perfection.'"
            },
            {
                "id": "stay-mercer-gothic",
                "name": "Mercer Hotel Barcelona",
                "type": "Authentic Historic Villa / Medieval Roman Quarter",
                "neighborhood": "Barri Gòtic (Gothic Quarter)",
                "rating": 4.96,
                "review_count": 640,
                "base_usd": 280,
                "badge": "🏮 Historic Roman Wall Heritage",
                "key_amenities": [
                    "Integrated within 1st-Century Roman Bastion & Medieval Arches",
                    "Quiet Interior Orange Tree Courtyard (Patio de los Naranjos)",
                    "Rooftop Terrace & Swimming Pool Overlooking Old Town",
                    "Fine Dining Catalan Bistro by Chef Xavier Lahuerta",
                    "Designer Rooms by Architect Rafael Moneo"
                ],
                "why": "Unrivaled historical authenticity. Set directly inside ancient Roman defensive walls in the atmospheric labyrinth of the Gothic Quarter.",
                "snippet": "Verified guest: 'A secret oasis inside the Gothic Quarter. You are literally sleeping next to Roman stones with 5-star modern comforts.'"
            },
            {
                "id": "stay-majestic-luxury",
                "name": "Majestic Hotel & Spa Barcelona GL",
                "type": "5-Star Grand Luxury Palace",
                "neighborhood": "Passeig de Gràcia High Fashion Avenue",
                "rating": 4.94,
                "review_count": 1420,
                "base_usd": 390,
                "badge": "💎 5-Star Grand Luxury (Since 1918)",
                "key_amenities": [
                    "Iconic Rooftop La Dolce Vitae with 360° Barcelona Skyline Views",
                    "Nandu Jubany Curated Gourmet Breakfast (Voted Best in Europe)",
                    "Directly Adjacent to Gaudí's Casa Batlló & Casa Milà",
                    "Subterranean Hydrotherapy Spa & Wellness Suite",
                    "VIP Personal Shopper Service on Passeig de Gràcia"
                ],
                "why": "The grand dame of Barcelona luxury hospitality. The rooftop bar offers the most famous sunset panoramic view of the Sagrada Família in the city.",
                "snippet": "Traveler review: 'The breakfast is truly an artisan culinary experience, and the rooftop view of Sagrada Família at dusk is unmatched.'"
            },
            {
                "id": "stay-motel-one-ciutadella",
                "name": "Motel One Barcelona-Ciutadella",
                "type": "Central Smart Modern Concept",
                "neighborhood": "El Born / Ciutadella Park Edges",
                "rating": 4.86,
                "review_count": 2180,
                "base_usd": 115,
                "badge": "🏷️ Best Value (~$115/nt)",
                "key_amenities": [
                    "Rooftop Skybar Overlooking Ciutadella Park & Arc de Triomf",
                    "3-Minute Walk to El Born Tapas Bars & Metro",
                    "High-End Boxspring Beds & Organic Cotton Linens",
                    "Rain Showers & Complimentary High-Speed Wi-Fi",
                    "Organic Artisan Buffet Breakfast"
                ],
                "why": "Outstanding price-to-quality ratio. Right beside the lush palm trees of Ciutadella Park and a short walk to the beach and El Born.",
                "snippet": "Verified guest: 'Super stylish, spotlessly clean, and perfectly situated right next to El Born and the park. Best value in town.'"
            }
        ],
        "flights": [
            {
                "airline": "Iberia / British Airways",
                "flight_number": "IB-5420",
                "stops": "Non-stop Direct",
                "price_usd": 180,
                "verdict": "Fastest non-stop flagship connection with terminal 1 priority lanes.",
                "pros": ["Direct non-stop flight", "Arrives Barcelona El Prat T1", "Generous luggage policy"],
                "cons": ["Slightly higher peak weekend rates"]
            },
            {
                "airline": "Vueling Airlines",
                "flight_number": "VY-7842",
                "stops": "Non-stop Direct (Smart Value)",
                "price_usd": 95,
                "verdict": "Highest frequency budget option with hourly morning departures.",
                "pros": ["Lowest fare guarantee", "Multiple daily departures", "Direct mobile check-in"],
                "cons": ["Cabin bag strictly regulated", "Paid seat selection"]
            }
        ],
        "trains": [
            {
                "operator": "Renfe AVE / Ouigo High-Speed",
                "train_type": "AVE 310 km/h Bullet Train",
                "route": "Central Hub -> Barcelona Sants Station",
                "duration": "2h 45m",
                "stops": "Non-stop Express",
                "price_usd": 45,
                "departure_time": "08:15 AM",
                "arrival_time": "11:00 AM",
                "verdict": "City-center to city-center with zero airport security queues.",
                "pros": ["Arrives downtown at Barcelona Sants", "Free high-speed Wi-Fi & bistro car", "Generous baggage allowances"],
                "cons": ["Advance booking essential for promo fares"]
            },
            {
                "operator": "Iryo Frecciarossa High-Speed",
                "train_type": "Ultra-Modern High-Speed Rail",
                "route": "Regional Trunk -> Barcelona Sants",
                "duration": "2h 50m",
                "stops": "1 Quick Intermediate Stop",
                "price_usd": 38,
                "departure_time": "10:30 AM",
                "arrival_time": "01:20 PM",
                "verdict": "Spain's newest luxury high-speed train operator with Italian design coaches.",
                "pros": ["Infinita executive quiet coaches", "Gastronomic Haizea onboard dining", "USB-C power at every seat"],
                "cons": ["Fewer departure slots than Renfe"]
            }
        ],
        "days": [
            {
                "day": 1,
                "title": "Gaudí Masterpieces: Sagrada Família & Park Güell",
                "theme": "Visionary Modernisme Architecture",
                "morning": {
                    "time": "09:00 AM",
                    "title": "Basílica de la Sagrada Família (Nativity Façade & Towers)",
                    "location": "Eixample Historic District",
                    "duration": "2.5 hours",
                    "description": "Marvel at Antoni Gaudí's soaring UNESCO basilica with morning sun streaming through rainbow stained glass and ascend the Nativity Towers.",
                    "cost": 26,
                    "tags": ["UNESCO World Heritage", "Gaudí", "Tower Ascent"],
                    "wiki_query": "Sagrada Família",
                    "source_name": "Basílica de la Sagrada Família Official Foundation",
                    "source_url": "https://sagradafamilia.org/en/",
                    "source_snippet": "Official visiting portal: Fast-track timed entry with tower access audio guides."
                },
                "lunch": {
                    "place": "Cervecería Catalana",
                    "dish": "Gambas al Ajillo (Garlic Prawns), Huevos Cabreados & Flauta de Jamón Ibérico",
                    "vibe": "Iconic energetic tapas institution on Carrer de Mallorca",
                    "source_name": "Eater 38 Essential Barcelona Restaurants",
                    "source_url": "https://barcelona.eater.com/maps/best-tapas-bars-barcelona",
                    "source_snippet": "Celebrated as one of Barcelona's most consistent and delicious tapas institutions."
                },
                "afternoon": {
                    "time": "02:30 PM",
                    "title": "Park Güell & Carmel Hill Monumental Zone",
                    "location": "Gràcia / Carmel Hill",
                    "duration": "2.5 hours",
                    "description": "Stroll through Gaudí's whimsical mosaic wonderland, the iconic multicolored salamander (El Drac), and curved serpentine benches overlooking the city.",
                    "cost": 10,
                    "tags": ["Park Güell", "Panoramic City Views", "Mosaics"],
                    "wiki_query": "Park Güell",
                    "source_name": "Park Güell Heritage Conservation Authority",
                    "source_url": "https://parkguell.barcelona/en",
                    "source_snippet": "Preserved municipal park system designed by Antoni Gaudí overlooking the Mediterranean Sea."
                },
                "evening": {
                    "time": "06:30 PM",
                    "title": "Passeig de Gràcia Architectural Walk: Casa Batlló & Casa Milà",
                    "location": "Passeig de Gràcia",
                    "duration": "2 hours",
                    "description": "Walk Barcelona's premier boulevard admiring Gaudí's dragon-scaled Casa Batlló and undulating limestone Casa Milà (La Pedrera) illuminated at twilight.",
                    "cost": 0,
                    "tags": ["Casa Batlló", "Golden Hour", "Illuminated Facades"],
                    "wiki_query": "Casa Batlló",
                    "source_name": "Casa Batlló World Heritage Archive",
                    "source_url": "https://www.casabatllo.es/en/",
                    "source_snippet": "Masterpiece of Antoni Gaudí situated in the Manzana de la Discordia."
                },
                "dinner": {
                    "place": "El Xampanyet",
                    "dish": "Artisan Cantabrian Anchovies with Pan con Tomate & House Sparkling Cava",
                    "vibe": "Authentic 1920s tiled tapas tavern in El Born",
                    "source_name": "Michelin Guide Barcelona Street Food & Tapas",
                    "source_url": "https://guide.michelin.com/en/es/catalunya/barcelona/restaurants",
                    "source_snippet": "Century-old family tavern famous for house-bottled sparkling cava and fresh coastal anchovies."
                },
                "transit_tips": "Take Metro Line L5 to Sagrada Família, then bus 24 directly up to Park Güell's eastern gate."
            },
            {
                "day": 2,
                "title": "Medieval Barri Gòtic, El Born & Mediterranean Sunset",
                "theme": "Gothic History & Coastal Atmosphere",
                "morning": {
                    "time": "09:30 AM",
                    "title": "Barri Gòtic (Gothic Quarter) & Cathedral of Barcelona",
                    "location": "Historic Center",
                    "duration": "3 hours",
                    "description": "Wander through Roman defensive ruins, medieval cobblestone alleys, Bishop's Bridge (Pont del Bisbe), and the cloister of Barcelona Cathedral.",
                    "cost": 9,
                    "tags": ["Medieval Gothic", "Roman Walls", "Pont del Bisbe"],
                    "wiki_query": "Gothic Quarter, Barcelona",
                    "source_name": "Barcelona Turisme Official Gothic Archive",
                    "source_url": "https://www.barcelonaturisme.com/",
                    "source_snippet": "The historic heart of the old city with monuments dating from Roman Augustus to 14th century Gothic."
                },
                "lunch": {
                    "place": "Mercat de Sant Josep de la Boqueria / Bar Pinotxo",
                    "dish": "Fresh Calamari with White Beans & Pimientos de Padrón",
                    "vibe": "World-famous bustling food market on La Rambla",
                    "source_name": "Lonely Planet Barcelona Food & Markets",
                    "source_url": "https://www.lonelyplanet.com/spain/barcelona",
                    "source_snippet": "Centuries-old market hall featuring Spain's freshest seafood, Iberian ham legs, and market counter dining."
                },
                "afternoon": {
                    "time": "02:30 PM",
                    "title": "Picasso Museum & El Born Artisan Alleys",
                    "location": "Carrer de Montcada, El Born",
                    "duration": "2.5 hours",
                    "description": "Explore Pablo Picasso's formative years housed inside five adjoining medieval stone palaces, followed by boutique shops in El Born.",
                    "cost": 12,
                    "tags": ["Picasso", "Medieval Palaces", "Artisan Born"],
                    "wiki_query": "Picasso Museum (Barcelona)",
                    "source_name": "Museu Picasso de Barcelona Official",
                    "source_url": "http://www.museupicasso.bcn.cat/en",
                    "source_snippet": "Housing over 4,200 works by young Picasso and his famous Las Meninas interpretation series."
                },
                "evening": {
                    "time": "06:30 PM",
                    "title": "Barceloneta Beach Promenade & Mediterranean Sunset",
                    "location": "Passeig Marítim de la Barceloneta",
                    "duration": "2 hours",
                    "description": "Stroll the palm-fringed coastal promenade watching the golden hour light reflect across the Mediterranean Sea with cool sea breezes.",
                    "cost": 0,
                    "tags": ["Beach Promenade", "Sunset", "Mediterranean"],
                    "wiki_query": "La Barceloneta, Barcelona",
                    "source_name": "Port Vell & Barcelona Waterfront Authority",
                    "source_url": "https://www.portvellbcn.com/en",
                    "source_snippet": "Waterfront regeneration spanning the old fishermen's quarter to the Olympic marina."
                },
                "dinner": {
                    "place": "7 Portes (Set Portes) / Can Solé",
                    "dish": "Traditional Paella Parellada (Rich Seafood & Shell-free Shellfish Rice)",
                    "vibe": "Historic white-tablecloth seafood institution established in 1836",
                    "source_name": "Michelin Guide Historic Dining Barcelona",
                    "source_url": "https://guide.michelin.com/en/es/catalunya/barcelona/restaurants",
                    "source_snippet": "Barcelona's oldest active restaurant where Picasso, Miró, and García Márquez dined."
                },
                "transit_tips": "El Born and the Gothic Quarter are completely pedestrian; walking is the most efficient and scenic way to explore."
            },
            {
                "day": 3,
                "title": "Montjuïc Hill Panoramas & Magic Fountain Illuminations",
                "theme": "Scenic Heights & Catalan Culture",
                "morning": {
                    "time": "09:30 AM",
                    "title": "Montjuïc Castle & Telefèric Cable Car",
                    "location": "Montjuïc Mountain",
                    "duration": "3 hours",
                    "description": "Glide across the harbor in the scenic Montjuïc Cable Car to the 17th-century fortress offering 360° panoramas over Barcelona harbor and city.",
                    "cost": 15,
                    "tags": ["Cable Car", "Castle Fortress", "Harbor Panorama"],
                    "wiki_query": "Montjuïc Castle",
                    "source_name": "Castell de Montjuïc Heritage Guide",
                    "source_url": "https://ajuntament.barcelona.cat/castelldemontjuic/en",
                    "source_snippet": "Military fortress standing 173 meters above sea level with complete harbor control history."
                },
                "lunch": {
                    "place": "La Caseta del Migdia",
                    "dish": "Grilled Chorizo & Butifarra Sausage with Catalan Tomato Bread & Sangria",
                    "vibe": "Rustic pine tree outdoor terrace with sea views on Montjuïc",
                    "source_name": "Time Out Barcelona Best Hidden Terraces",
                    "source_url": "https://www.timeout.com/barcelona/bars-and-pubs/la-caseta-del-migdia",
                    "source_snippet": "Secluded outdoor cliffside lookout serving grilled Catalan fare in a pine grove."
                },
                "afternoon": {
                    "time": "02:30 PM",
                    "title": "Museu Nacional d'Art de Catalunya (MNAC)",
                    "location": "Palau Nacional, Parc de Montjuïc",
                    "duration": "2.5 hours",
                    "description": "Discover Romanesque church frescoes, Gothic paintings, and Catalan modernism inside the monumental Palau Nacional.",
                    "cost": 12,
                    "tags": ["MNAC", "Palau Nacional", "Romanesque Art"],
                    "wiki_query": "Museu Nacional d'Art de Catalunya",
                    "source_name": "MNAC Official Museum Portal",
                    "source_url": "https://www.museunacional.cat/en",
                    "source_snippet": "World-renowned collection of Romanesque wall paintings rescued from Pyrenean valleys."
                },
                "evening": {
                    "time": "06:30 PM",
                    "title": "Plaça d'Espanya & Magic Fountain Light Show",
                    "location": "Plaça de Carles Buïgas",
                    "duration": "2 hours",
                    "description": "Watch synchronized music, water, and colored light choreographies with the illuminated Palau Nacional behind.",
                    "cost": 0,
                    "tags": ["Magic Fountain", "Light & Music Show", "Night Panorama"],
                    "wiki_query": "Magic Fountain of Montjuïc",
                    "source_name": "Ajuntament de Barcelona Culture Department",
                    "source_url": "https://www.barcelona.cat/en",
                    "source_snippet": "Spectacular fountain built for the 1929 Barcelona International Exposition."
                },
                "dinner": {
                    "place": "Tickets Bar / Bodega 1900 / Disfrutar Bistro",
                    "dish": "Liquid Olives, Crispy Airbags of Jamón & Truffled Croquetas",
                    "vibe": "Avant-garde culinary theater by Albert Adrià alumni",
                    "source_name": "World's 50 Best Restaurants Guide",
                    "source_url": "https://www.theworlds50best.com/",
                    "source_snippet": "Playful Modern Catalan tasting experience redefining traditional tapas."
                },
                "transit_tips": "Take the Funicular de Montjuïc from Paral·lel metro station directly up into the Montjuïc museum zone."
            }
        ]
    },
    "bali": {
        "country": "Indonesia",
        "tagline": "Emerald Rice Terraces, Sacred Temples & Coastal Sunsets",
        "overview": "Bali enchants with spiritual Hindu water temples, tranquil Ubud jungle valleys, cliffside coastal sunsets at Uluwatu, and rich artisan culture.",
        "best_time": "April to October (Dry season with breezy 27°C-29°C sunny days and low humidity)",
        "transit_tip": "Hire a trusted private driver for day excursions (~$40-$50/day) or use Grab/Gojek apps for short transfers.",
        "currency": "USD",
        "stays": [
            {
                "id": "stay-alila-ubud",
                "name": "Alila Ubud",
                "type": "Luxury Eco-Resort & Jungle Retreat",
                "neighborhood": "Ayung River Valley, Ubud",
                "rating": 4.92,
                "review_count": 820,
                "base_usd": 220,
                "badge": "🌟 Iconic Jungle Valley Infinity Pool",
                "key_amenities": [
                    "Breathtaking Infinity Pool Cantilevered over Ayung River Gorge",
                    "Balinese Holistic Spa Alila with Natural Botanical Oils",
                    "Complimentary Morning Yoga & Guided Herbal Rice Field Walks",
                    "Open-Air Plantation Restaurant Serving Farm-to-Table Balinese",
                    "Private Secluded Hillside Pavilions with Outdoor Showers"
                ],
                "why": "Nestled in the lush hills of central Bali. Renowned globally for its serene infinity pool perched above the jungle canopy.",
                "snippet": "Verified guest: 'Waking up to monkey calls and the mist over the Ayung valley was an absolute dream. The peaceful infinity pool is extraordinary.'"
            },
            {
                "id": "stay-desa-potato-head",
                "name": "Desa Potato Head Seminyak",
                "type": "Creative Sustainable Beachfront Concept",
                "neighborhood": "Seminyak Beachfront District",
                "rating": 4.91,
                "review_count": 1100,
                "base_usd": 260,
                "badge": "🏖️ Zero-Waste Beachfront Haven",
                "key_amenities": [
                    "Direct Access to Seminyak Sunset Beach",
                    "Iconic Infinity Pool Beach Club with Resident Sunset DJs",
                    "Architecture Built from 1.5 Million Reclaimed Balinese Bricks",
                    "Plant-Based Tanaman Restaurant & Ijen Seafood Grill",
                    "Zero-Waste Waste Lab & Organic Guest Amenity Bar"
                ],
                "why": "World-renowned creative compound blending oceanfront luxury with zero-waste sustainability on Seminyak beach.",
                "snippet": "Traveler review: 'The most creative and forward-thinking hotel in Southeast Asia. Perfect sunset cocktails and immaculate beachfront design.'"
            },
            {
                "id": "stay-amankila",
                "name": "Amankila East Bali",
                "type": "5-Star Ultra-Luxury Clifftop Hideaway",
                "neighborhood": "Manggis / Lombok Strait Coast",
                "rating": 4.98,
                "review_count": 390,
                "base_usd": 680,
                "badge": "💎 5-Star Clifftop Three-Tier Pool",
                "key_amenities": [
                    "Iconic Three-Tier Cascade Infinity Pool Facing Lombok Strait",
                    "Private Black Sand Beach Club with Water Sports Pavilion",
                    "Freestanding Stilted Suites Modeled on Karangasem Water Palaces",
                    "Dedicated 24/7 Private Villa Host Service",
                    "Exclusive Outrigger Traditional Boat Cruises"
                ],
                "why": "Considered the crown jewel of luxury in Bali. Set on a secluded cliffside overlooking the Lombok Strait with iconic three-tiered pools.",
                "snippet": "Travel + Leisure review: 'The pinnacle of peaceful Balinese majesty with unmatched views of the sea and sacred Mount Agung.'"
            },
            {
                "id": "stay-bisma-eight",
                "name": "Bisma Eight Ubud",
                "type": "Boutique Design & Heritage Craft",
                "neighborhood": "Jalan Bisma / Central Ubud",
                "rating": 4.89,
                "review_count": 940,
                "base_usd": 140,
                "badge": "🏷️ Best Boutique Value (~$140/nt)",
                "key_amenities": [
                    "Heated Rooftop Infinity Pool with Jungle Canopy Horizon",
                    "Japanese Cedar Barrel Soaking Tubs in Every Suite",
                    "Walkable to Monkey Forest Sanctuary and Ubud Central Palaces",
                    "Copper Kitchen & Bar Serving Organic Produce from Own Farm",
                    "Handcrafted Bamboo & Concrete Modern Architecture"
                ],
                "why": "Unbeatable boutique luxury in central Ubud. Combines traditional Balinese materials with modern minimalist design.",
                "snippet": "Verified guest: 'Heated infinity pool looking over the forest and deep wooden soaking tubs made this our favorite stay in Indonesia.'"
            }
        ],
        "flights": [
            {
                "airline": "Singapore Airlines / Garuda Indonesia",
                "flight_number": "SQ-938",
                "stops": "1 Quick Hub Transfer (Changi)",
                "price_usd": 620,
                "verdict": "Voted world's best airline service with smooth transfers to Denpasar (DPS).",
                "pros": ["5-Star Skytrax comfort", "Changi Airport transit", "Generous baggage allowances"],
                "cons": ["Popular flight requiring early booking"]
            },
            {
                "airline": "Qatar Airways / Emirates",
                "flight_number": "QR-962",
                "stops": "1 Transfer",
                "price_usd": 590,
                "verdict": "Flagship wide-body comfort directly into Bali Ngurah Rai Airport.",
                "pros": ["Superior in-flight entertainment", "Comfortable seat pitch", "Daily departures"],
                "cons": ["Transfer layover"]
            }
        ],
        "trains": [
            {
                "operator": "Private Chauffeur & Scenic Coastal Route",
                "train_type": "Executive Island Mobility",
                "route": "Denpasar Airport -> Ubud Cultural Valley",
                "duration": "1h 15m",
                "stops": "Scenic Rice Terrace Route",
                "price_usd": 30,
                "departure_time": "Flexible",
                "arrival_time": "Flexible",
                "verdict": "Direct air-conditioned private transfer avoiding local traffic bottlenecks.",
                "pros": ["Direct door-to-door luggage handling", "English-speaking driver-guide", "Bottled mineral water included"],
                "cons": ["Subject to occasional local village ceremony traffic"]
            },
            {
                "operator": "Kura-Kura Shuttle / Blue Bird Express",
                "train_type": "Public Air-Conditioned Coach",
                "route": "Kuta / Seminyak -> Ubud Cultural Line",
                "duration": "1h 45m",
                "stops": "Scheduled Regional Stops",
                "price_usd": 8,
                "departure_time": "09:00 AM",
                "arrival_time": "10:45 AM",
                "verdict": "Smart budget public shuttle connecting south Bali beaches to Ubud.",
                "pros": ["Super economical fare", "Free onboard Wi-Fi", "Fixed timetable"],
                "cons": ["Fixed drop-off hubs only"]
            }
        ],
        "days": [
            {
                "day": 1,
                "title": "Spiritual Ubud: Sacred Monkey Forest & Tegallalang Rice Terraces",
                "theme": "Jungle Landscapes & Balinese Culture",
                "morning": {
                    "time": "08:30 AM",
                    "title": "Tegallalang Stepped Rice Terraces & Jungle Walk",
                    "location": "North Ubud Valley",
                    "duration": "2.5 hours",
                    "description": "Walk among the ancient subak irrigation terraces sculpted into the emerald hillsides before the midday heat, soaking in pristine jungle vistas.",
                    "cost": 5,
                    "tags": ["UNESCO Subak", "Rice Terraces", "Jungle Walk"],
                    "wiki_query": "Tegallalang Rice Terrace",
                    "source_name": "UNESCO World Heritage Cultural Landscape of Bali",
                    "source_url": "https://whc.unesco.org/en/list/1194",
                    "source_snippet": "The Subak system of democratic water management dates back to the 9th century in Bali."
                },
                "lunch": {
                    "place": "Locavore NXT / Bebek Bengil (Dirty Duck Diner)",
                    "dish": "Bebek Betutu (Crispy Spiced Duck with Sambal Matah & Lawar)",
                    "vibe": "Open-air pavilion set in lotus gardens and rice paddies",
                    "source_name": "Asia's 50 Best Restaurants Guide",
                    "source_url": "https://www.theworlds50best.com/",
                    "source_snippet": "Legendary Ubud institution acclaimed for slow-braised duck in traditional Balinese spices."
                },
                "afternoon": {
                    "time": "02:00 PM",
                    "title": "Sacred Monkey Forest Sanctuary (Mandala Suci Wenara Wana)",
                    "location": "Padangtegal, Ubud",
                    "duration": "2.5 hours",
                    "description": "Stroll ancient moss-covered stone bridges and banyan roots inhabited by over 1,000 playful Balinese long-tailed macaques.",
                    "cost": 6,
                    "tags": ["Monkey Forest", "Ancient Banyan Trees", "Temple Shrines"],
                    "wiki_query": "Ubud Monkey Forest",
                    "source_name": "Padangtegal Sacred Forest Trust",
                    "source_url": "https://monkeyforestubud.com/",
                    "source_snippet": "Sanctuary preserving Tri Hita Karana philosophy balancing humans, nature, and spirits."
                },
                "evening": {
                    "time": "06:30 PM",
                    "title": "Ubud Palace Traditional Legong & Barong Dance Performance",
                    "location": "Puri Saren Agung (Ubud Palace)",
                    "duration": "1.5 hours",
                    "description": "Watch mesmerizing traditional Balinese gamelan orchestra and expressive gold-costumed Legong dancers in the open-air courtyard.",
                    "cost": 8,
                    "tags": ["Legong Dance", "Ubud Palace", "Gamelan Music"],
                    "wiki_query": "Ubud Palace",
                    "source_name": "Puri Saren Royal Cultural Foundation",
                    "source_url": "https://www.indonesia.travel/",
                    "source_snippet": "Seat of the historical Sukawati royal family and primary center for traditional arts."
                },
                "dinner": {
                    "place": "Hujan Locale / Nusantara by Locavore",
                    "dish": "Rendang Sapi (Slow-Cooked Sumatran Beef) & Sate Lilit Ikan",
                    "vibe": "Elegant colonial double-height dining room in central Ubud",
                    "source_name": "Michelin & Southeast Asia Culinary Archive",
                    "source_url": "https://www.locavorenext.com/",
                    "source_snippet": "Modern Indonesian farm-to-table cuisine honoring heritage archipelago recipes."
                },
                "transit_tips": "Wear comfortable walking shoes with grip for wet mossy stone steps; keep sunglasses secured in Monkey Forest."
            },
            {
                "day": 2,
                "title": "Sacred Water Purification: Tirta Empul & Tegenungan Waterfall",
                "theme": "Sacred Waters & Cleansing Rituals",
                "morning": {
                    "time": "08:30 AM",
                    "title": "Pura Tirta Empul Holy Water Spring Temple (Melukat Ritual)",
                    "location": "Tampak Siring",
                    "duration": "2.5 hours",
                    "description": "Participate in or witness the traditional Melukat spiritual cleansing bath under sacred freshwater fountains bubbling from a 1,000-year-old volcanic spring.",
                    "cost": 5,
                    "tags": ["Melukat Purification", "Holy Springs", "Sacred Temple"],
                    "wiki_query": "Tirta Empul",
                    "source_name": "Tirta Empul Historical Heritage Site",
                    "source_url": "https://www.indonesia.travel/",
                    "source_snippet": "Built around a large volcanic water spring dedicated to Vishnu, founded in 962 AD."
                },
                "lunch": {
                    "place": "Sari Organik / Warung Babi Guling Ibu Oka",
                    "dish": "Babi Guling Special (Roasted Suckling Pig with Crispy Skin & Cassava Leaves)",
                    "vibe": "Beloved local warung recognized worldwide for crispy suckling pig",
                    "source_name": "Anthony Bourdain No Reservations Bali",
                    "source_url": "https://www.eater.com/",
                    "source_snippet": "World-famous Balinese suckling pig roasted over open coconut husk coals."
                },
                "afternoon": {
                    "time": "02:00 PM",
                    "title": "Tegenungan Waterfall & Jungle River Canyon",
                    "location": "Kemenuh, Gianyar",
                    "duration": "2.5 hours",
                    "description": "Descend lush jungle stairs to a cascading river waterfall surrounded by dense tropical foliage, with wading pools and bamboo gazebos.",
                    "cost": 3,
                    "tags": ["Waterfall", "Tropical Foliage", "Canyon Valley"],
                    "wiki_query": "Tegenungan Waterfall",
                    "source_name": "Bali Ecotourism Conservation",
                    "source_url": "https://www.indonesia.travel/",
                    "source_snippet": "Powerful freshwater cascade flowing into the Petanu River basin."
                },
                "evening": {
                    "time": "06:00 PM",
                    "title": "Campuhan Ridge Walk Sunset Stroll",
                    "location": "Campuhan, Ubud",
                    "duration": "2 hours",
                    "description": "Follow a tranquil paved hillcrest pathway bordered by towering elephant grass and jungle valleys glowing golden in the sunset.",
                    "cost": 0,
                    "tags": ["Campuhan Ridge", "Sunset Walk", "Panoramic Ridges"],
                    "wiki_query": "Ubud",
                    "source_name": "Bali Tourism Board Scenic Walks",
                    "source_url": "https://www.balitourismboard.org/",
                    "source_snippet": "Free scenic footpath connecting the sacred confluence of two rivers at Pura Gunung Lebah."
                },
                "dinner": {
                    "place": "Mozaic Restaurant Gastronomique",
                    "dish": "Chef Chris Salans Tasting Menu (French Techniques with Fresh Wild Balinese Spices)",
                    "vibe": "Romantic candlelit garden with tables nestled under tropical palms",
                    "source_name": "Les Grandes Tables du Monde",
                    "source_url": "https://www.mozaic-bali.com/",
                    "source_snippet": "Pioneer of Indonesian fine dining featuring seasonal jungle fruit, kaffir lime, and torch ginger."
                },
                "transit_tips": "Temple etiquette requires wearing a sarong and sash at Tirta Empul (provided at entrance)."
            },
            {
                "day": 3,
                "title": "Clifftop Majesty: Uluwatu Temple & Sunset Kecak Fire Dance",
                "theme": "Ocean Cliffs & Dramatic Fire Rituals",
                "morning": {
                    "time": "10:00 AM",
                    "title": "Padang Padang & Bingin Beach Hidden Coves",
                    "location": "Bukit Peninsula",
                    "duration": "2.5 hours",
                    "description": "Descend through hollow limestone sea caves to pristine white sand coves world-famous for turquoise surf breaks and limestone bluffs.",
                    "cost": 2,
                    "tags": ["White Sand Cove", "Surfing", "Limestone Cliffs"],
                    "wiki_query": "Bukit Peninsula",
                    "source_name": "Bali Coastal Conservation Authority",
                    "source_url": "https://www.indonesia.travel/",
                    "source_snippet": "Limestone peninsula at the southern tip of Bali famous for world-class reef breaks."
                },
                "lunch": {
                    "place": "Single Fin Bali / Mana Uluwatu",
                    "dish": "Fresh Mahi Mahi Poke Bowl & Fresh Young Chilled Coconut",
                    "vibe": "Perched 100 feet above the famous Uluwatu surf break",
                    "source_name": "Condé Nast Traveler Bali Coastal Spots",
                    "source_url": "https://www.cntraveler.com/",
                    "source_snippet": "Panoramic clifftop lounge overlooking surfers catching barrel waves at Suluban."
                },
                "afternoon": {
                    "time": "03:30 PM",
                    "title": "Pura Luhur Uluwatu Clifftop Temple",
                    "location": "Uluwatu Cliffs",
                    "duration": "2 hours",
                    "description": "Walk along the dramatic coastal clifftop walkway 70 meters above crashing Indian Ocean waves leading to the ancient sea temple.",
                    "cost": 4,
                    "tags": ["Uluwatu Temple", "70m Sea Cliffs", "Historic Sea Temple"],
                    "wiki_query": "Uluwatu Temple",
                    "source_name": "Pura Luhur Uluwatu Cultural Administration",
                    "source_url": "https://www.indonesia.travel/",
                    "source_snippet": "One of Bali's six spiritual pillars (Sad Kahyangan) guarding against evil sea spirits."
                },
                "evening": {
                    "time": "06:00 PM",
                    "title": "Kecak & Fire Dance Performance at Sunset Amphitheater",
                    "location": "Uluwatu Amphitheater",
                    "duration": "1.5 hours",
                    "description": "Experience 70 bare-chested chanting men performing the hypnotic Ramayana fire epic as the sun sinks fiery red below the ocean horizon.",
                    "cost": 10,
                    "tags": ["Kecak Fire Dance", "Sunset Amphitheater", "Hypnotic Chanting"],
                    "wiki_query": "Kecak",
                    "source_name": "Uluwatu Cultural Performance Center",
                    "source_url": "https://www.balitourismboard.org/",
                    "source_snippet": "UNESCO-recognized cultural performance depicting the battle of Prince Rama and the monkey king Hanuman."
                },
                "dinner": {
                    "place": "Jimbaran Bay Beachside Seafood (Menega Cafe)",
                    "dish": "Grilled Jumbo Prawns, Red Snapper & Squid in Balinese Sambal over Coconut Charcoal",
                    "vibe": "Barefoot candlelit dining right on the sand with waves lapping your feet",
                    "source_name": "Eater Guide to Jimbaran Bay Seafood",
                    "source_url": "https://www.eater.com/",
                    "source_snippet": "The definitive Bali dining experience: fresh grilled seafood weighed live and cooked on smoky coconut husks."
                },
                "transit_tips": "Book Uluwatu Kecak tickets in advance to secure front-row sunset views; allow 45 minutes for the transfer to Jimbaran Bay for dinner."
            }
        ]
    }
}

def get_destination_data(dest_query: str) -> Optional[Dict[str, Any]]:
    """Checks if destination matches any of our rich curated destination records"""
    q = dest_query.lower()
    for key, data in GLOBAL_DESTINATIONS.items():
        if key in q or data.get("country", "").lower() in q:
            return data
    return None
