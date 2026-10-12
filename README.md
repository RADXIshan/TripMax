# ✈️ TripMax — Autonomous Multi-Agent AI Travel Architect

[![FastAPI](https://img.shields.io/badge/FastAPI-0.142+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React 19](https://img.shields.io/badge/React-19.1+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7.1+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green.style=flat-square)](#license)

> **TripMax** is an autonomous, multi-agent AI travel operating system that eliminates the chaos of juggling 20+ browser tabs when planning travel. Unlike standard AI chatbots that generate generic, hallucinated lists of attractions, TripMax orchestrates a team of specialized AI agents that dynamically research, verify, price, schedule, audit, and package complete end-to-end journeys with real flight and scenic rail routes, vetted boutique accommodations (>= 9.0/10 rating standard), geocoded itineraries, multi-currency budget calculators, milestone checklists, and one-click Word/PDF export.

---

## 📑 Table of Contents

1. [Why TripMax? (The Problem vs Solution)](#-why-tripmax-the-problem-vs-solution)
2. [Core Features & Highlights](#-core-features--highlights)
3. [Autonomous Multi-Agent Architecture](#-autonomous-multi-agent-architecture)
4. [Agent Hierarchy & Responsibilities](#-agent-hierarchy--responsibilities)
5. [User Interface & Interactive Tabs](#-user-interface--interactive-tabs)
6. [Tech Stack & Tooling](#-tech-stack--tooling)
7. [System Architecture Diagram](#-system-architecture-diagram)
8. [Project File Structure](#-project-file-structure)
9. [REST API Documentation](#-rest-api-documentation)
10. [Local Development & Setup](#-local-development--setup)
11. [Environment Variables Reference](#-environment-variables-reference)
12. [Export Engine (Word & PDF)](#-export-engine-word--pdf)
13. [Authentication & Persistence](#-authentication--persistence)
14. [Deployment Guide](#-deployment-guide)
15. [Troubleshooting & FAQ](#-troubleshooting--faq)
16. [License](#-license)

---

## 💡 Why TripMax? (The Problem vs Solution)

### The Pain of Modern Travel Planning
1. **Tab Overload**: Planning a trip usually demands cross-referencing flights (Google Flights, Skyscanner), trains (Trainline, national operators), accommodations (Booking.com, Airbnb), guides (TripAdvisor, Wikitravel), maps, spreadsheets, and packing lists.
2. **AI Hallucinations**: Standard LLMs routinely recommend closed venues, make up nonexistent train lines, quote unrealistic costs, or hallucinate direct bullet trains across oceans.
3. **Disconnected Logistics**: Itineraries rarely balance transit times, local mobility (metro passes, taxi apps), or meal timing with nearby sightseeing.

### The TripMax Solution
TripMax introduces a **multi-agent orchestration pipeline** backed by real-time web search, geographical awareness, pricing heuristics, and self-evaluating quality auditing:
- **No Hallucinated Logistics**: Automatically differentiates between domestic high-speed rail lines and international flight corridors.
- **Deep Direct Booking Links**: Every flight, train, hotel, and activity has direct, pre-populated booking links with the traveler's exact dates and destinations.
- **Audited Quality Bar (>= 9.0/10)**: Every stay is evaluated for guest ratings, location convenience, and price-to-value ratio.
- **Dynamic Pacing Engine**: Crafts realistic Morning, Afternoon, and Evening slots with lunch and dinner gastronomic recommendations showcasing authentic regional cuisine.

---

## ✨ Core Features & Highlights

### 🤖 1. Conversational Discovery Studio
- Step-by-step preference profiling via interactive multiple-choice suggestions with custom write-in options.
- Dynamic question sequencing tailored to destination and origin (destination, origin, dates & duration, party type, travel pace, budget, transit mode, interests, lodging style, and dietary requirements).
- Natural language refinement: say *"make it more budget-friendly"* or *"prioritize scenic trains over flights"* to dynamically adjust the trip.

### 🌐 2. Real-Time Web Intelligence & Search Synthesis
- Dual-engine web search: **DuckDuckGo Search** (built-in, zero-setup, free) and **Tavily AI** (deep travel-tailored query extraction).
- Wikipedia REST API integration for authoritative cultural and architectural background.
- Synthesizes real destination architecture even for off-the-beaten-path locations worldwide.

### 🚆✈️ 3. Transit Intelligence (Flights vs. Scenic Rail)
- Evaluates real airline carriers, baggage tiers, flight numbers, and estimated round-trip costs.
- Compares flights with high-speed passenger rail (e.g., Shinkansen, TGV, Eurostar, Frecciarossa, Vande Bharat, Rajdhani).
- Generates pre-populated booking deep links to **Google Flights, Skyscanner, Kayak, Trainline, IRCTC, and Rail Europe**.
- Full local mobility guide with metro pass recommendations, regional day excursions, and rideshare/taxi apps.

### 🏨 4. Lodging & Stays Architecture
- Strict hospitality standard: recommends properties with guest ratings of **>= 9.0/10** (or 4.5/5 stars).
- Covers diverse stay personas: Heritage Boutiques, Grand Luxury, Historic Villas, Modern City Apartments, and High-Value Stays.
- Provides night-by-night and total stay costs with pre-configured booking URLs to **Booking.com, Airbnb, Agoda, and Expedia**.

### 📅 5. Day-by-Day Precision Itinerary
- Structured daily pacing: **Morning Exploration**, **Afternoon Immersion**, and **Evening Leisure**.
- Signature dining pairings for every single day: local lunch bistro + evening dining recommendations with signature dishes and ambiance description.
- Daily mobility and transit tips to avoid traffic bottlenecks and optimize walking routes.
- High-resolution verified photography for landmarks, neighborhoods, and culinary tastings.

### 💳 6. Financial Budget Breakdown & Multi-Currency Engine
- Transparent categorical breakdown: **Transit**, **Stays**, **Activities & Tickets**, **Food & Dining**, and **Local Buffer/Transit**.
- Compares total estimated expenditure against the user's target budget, categorizing it as *Within Budget*, *Controlled Stretch*, or *Luxury Splurge*.
- Real-time conversion across **10 global currencies**:
  - `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `JPY (¥)`, `AUD (A$)`, `CAD (C$)`, `CHF (CHF)`, `SGD (S$)`, `AED (AED)`.

### 📋 7. Booking Milestones & Intelligent Packing Assistant
- Milestone-based checklist divided into actionable phases:
  - **4 Weeks Before**: Passports, visas, primary flights, and iconic train seats.
  - **2 Weeks Before**: Lodging reservations, museum priority tickets, and travel insurance.
  - **3 Days Before**: Smartcard passes, currency exchange, offline maps, and power adapters.
- Climate-aware, destination-tailored packing lists categorized into **Documents & Finance**, **Clothing & Weather Gear**, **Tech & Adapters**, and **Toiletries & Health**.

### 📄 8. Professional Multi-Format Export
- **Microsoft Word (`.docx`) Export**: Clean typography, colored tables, callout blocks, and hyperlinked booking URLs ready for sharing with travel companions or clients.
- **Multi-Page PDF Export**: Formatted with `jspdf` and `jspdf-autotable`, including header branding, category tables, daily timelines, and page numbering.

### 🔐 9. User Authentication & Cloud Synchronization
- Modern JWT authentication with Bcrypt password hashing.
- Cloud database persistence powered by **Neon Serverless PostgreSQL**.
- Automatically saves generated trips to the authenticated traveler's personal dashboard.
- Seamless guest mode with immediate local storage fallback.

### 🧐 10. Self-Evaluating Critic Agent
- Runs an automated **5-Pillar Quality Audit** before presenting the plan:
  1. *Budget Calibration & Spend Efficiency (20 pts)*
  2. *Hospitality Rating Rigor (>= 9.0/10 bar) & Carrier Sanity (20 pts)*
  3. *Exact Date, Month & Seasonal Travel Feasibility (20 pts)*
  4. *Multi-Platform Booking Link Integrity (20 pts)*
  5. *Daily Mobility Flow & Pacing Balance (20 pts)*
- Certifies the plan with a verified Quality Score (typically **98/100**) and audit certificate stamp.

---

## 🏛️ Autonomous Multi-Agent Architecture

TripMax operates on a pipeline of specialized agents coordinated by the `AgentOrchestrator`:

```
                           ┌──────────────────────────┐
                           │      User Traveler       │
                           │  (Chat Studio / Inputs)  │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │     Discovery Agent      │
                           │ (Clarification & Prefs)  │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │   Agent Orchestrator     │
                           │  (Workflow Dispatcher)   │
                           └──────┬──────┬──────┬─────┘
                                  │      │      │
            ┌─────────────────────┘      │      └──────────────────────┐
            ▼                            ▼                             ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Live Research Agent │    │    Transit Agent     │    │      Stay Agent      │
│ (DDG/Tavily/Wiki)    │    │ (Flight vs Rail)     │    │ (Curated Stays >=9.0)│
└───────────┬──────────┘    └──────────┬───────────┘    └──────────┬───────────┘
            │                          │                           │
            └───────────────────┐      │      ┌────────────────────┘
                                ▼      ▼      ▼
                           ┌──────────────────────────┐
                           │     Itinerary Agent      │
                           │  (Day-by-Day Logistics)  │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │       Budget Agent       │
                           │  (Cost Model & Packing)  │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │  Critic / QA Audit Agent │
                           │ (5-Pillar Certification) │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │    Final Verified Plan   │
                           │ (UI Tabs, PDF, Word Doc) │
                           └──────────────────────────┘
```

---

## 👥 Agent Hierarchy & Responsibilities

| Agent Name | Primary Responsibility | Key Inputs / Algorithms | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Discovery Agent** | Guides the traveler through interactive preference gathering. | Regex date/duration extractors, contextual question state machine. | Updated `TripPreferences`, structured suggested replies. |
| **Research Agent** | Executes live queries for sights, food, and neighborhood guides. | DuckDuckGo Search API, Tavily AI, Wikipedia REST API. | List of `ResearchSource` objects with snippets and verified URLs. |
| **Transit Agent** | Compares flights and scenic trains with direct deep booking URLs. | Geo-intelligence distance engine, IATA code resolver. | `FlightOption[]`, `TrainOption[]`, and `LocalMobilityInfo`. |
| **Stay Agent** | Curates hotels, apartments, and boutique stays meeting quality bars. | Curated knowledge base, rating threshold filter (>= 9.0). | `StayOption[]` with nightly rates, amenities, and booking links. |
| **Itinerary Agent** | Engineers daily morning, afternoon, and evening schedules with meals. | Pacing heuristics, culinary pairings, photo matching service. | `ItineraryDay[]` with cultural context and transit tips. |
| **Budget Agent** | Computes categorical financials and prepares checklists. | Pricing intelligence models, seasonal multipliers. | `BudgetBreakdown`, `ChecklistItem[]`, and `PackingItem[]`. |
| **Critic Agent** | Conducts a 5-pillar self-audit on data integrity and realistic pacing. | 100-point scoring algorithm, date synchronization check. | Verified `Quality Score`, audit badge, and audit findings. |

---

## 🖥️ User Interface & Interactive Tabs

The TripMax frontend is built with a responsive navigation sidebar and glassmorphic aesthetic:

1. **💬 Chat Studio**: The interactive conversational concierge with live reasoning bar (`AgentReasoningBar`), suggested quick reply pills, and manual input field.
2. **📅 Itinerary Tab**: Day-by-day interactive timeline with morning, afternoon, and evening activity cards, high-resolution imagery, direct ticket links, and lunch/dinner recommendations.
3. **🚆 Transit Hub**: Side-by-side flight vs. high-speed rail cards, carrier comparisons, pros and cons, deep search links, plus a local mobility section (metro passes, cabs, day excursions).
4. **🏨 Stays Tab**: Hotel showcase with neighborhood tags, guest review ratings, detailed amenity badges, pricing breakdowns, and multi-platform booking options (Booking.com, Airbnb, Agoda).
5. **💳 Budget Breakdown**: Interactive expense ring chart and category cards (Transit, Lodging, Activities, Food, Buffer) with one-click conversion across 10 currencies.
6. **📋 Booking Checklist & Packing**: Interactive task list organized by countdown milestones (4 weeks, 2 weeks, 3 days out) and itemized packing checklists.
7. **📂 Saved Trips**: Cloud-synced trip archive showing saved plans with destination photos, duration, dates, and budget details.
8. **🔍 Live Search Modal**: Fast modal for querying real-time travel information with instant citation extraction.
9. **⚙️ Settings & API Configuration**: Runtime API key management allowing users to supply their own Gemini or Tavily keys.

---

## 🛠️ Tech Stack & Tooling

### Frontend
- **Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org)
- **Build Tool**: [Vite 7](https://vitejs.dev) (Fast HMR & lightweight bundles)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with `@tailwindcss/vite`
- **Icons**: [Lucide React](https://lucide.dev)
- **Document Export**:
  - [docx](https://github.com/dolanmihar/docx) (Dynamic Microsoft Word document generation)
  - [jspdf](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) (Vector-clean PDF generation)
- **Micro-Interactions**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) for celebratory plan completion

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com) (Modern asynchronous Python framework)
- **Web Server**: [Uvicorn](https://www.uvicorn.org)
- **Package Manager**: [uv](https://github.com/astral-sh/uv) (Ultra-fast Python package resolver)
- **Data Validation & Settings**: [Pydantic v2](https://docs.pydantic.dev) & [pydantic-settings](https://pydantic-docs.helpmanual.io/usage/settings/)
- **Database & ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org) with `psycopg[binary]` (PostgreSQL driver)
- **Security & Auth**: [PyJWT](https://pyjwt.readthedocs.io) & `bcrypt` password hashing
- **HTTP Client**: [HTTPX](https://www.python-httpx.org) (Async HTTP requests for web scraping and API calls)
- **Web Search**: `duckduckgo-search` (`ddgs`) & Tavily API client
- **AI Engine**: `google-genai` SDK ([Google Gemini 3.8 Flash](https://ai.google.dev))

### Database & Cloud
- **Database**: [Neon](https://neon.tech) Serverless PostgreSQL with SSL connection pooling
- **Deployment**: [Vercel](https://vercel.com) (Frontend static build + Serverless Python API)

---

## 📐 System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Vite + React 19 UI                   │
│                                                        │
│  [Chat Studio]   [Itinerary]   [Transit]   [Stays]     │
│  [Budget Tab]    [Checklist]   [Exports]   [Auth]      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Port 5173 -> Proxy /api)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Application                  │
│                                                        │
│  • CORS Middleware       • JWT Bearer Auth Guard       │
│  • Pydantic Validators   • Lifespan DB Auto-Migrate    │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│     Agent Pipelines      │ │      Database Layer       │
│                          │ │                           │
│ • Discovery Agent        │ │ • SQLAlchemy 2.0 ORM      │
│ • Web Research Agent     │ │ • psycopg3 DB Driver      │
│ • Transit Engine         │ │ • Neon Serverless Postgres│
│ • Stay Curator           │ │   - users table           │
│ • Itinerary Architect    │ │   - trip_records table    │
│ • Budget & Prep Agent    │ └───────────────────────────┘
│ • Critic & QA Auditor    │
└─────────────┬────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│                   External Services                    │
│                                                        │
│  • Google Gemini 3.8 Flash (Generative Enhancement)   │
│  • DuckDuckGo Search / Tavily AI (Live Queries)        │
│  • Wikipedia REST API (Cultural Archives)              │
│  • Unsplash & Wikimedia Commons (Curated Imagery)      │
│  • Deep Links: Google Flights, Skyscanner, Trainline,  │
│    Booking.com, Airbnb, Agoda, Viator                  │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project File Structure

```text
TripMax/
├── .gitignore
├── README.md                      # Master project documentation
│
├── backend/                       # FastAPI asynchronous backend service
│   ├── .env                       # Backend environment variables
│   ├── .python-version            # Python runtime version lock (3.12)
│   ├── pyproject.toml             # Project dependencies and configuration
│   ├── uv.lock                    # Locked dependency versions
│   ├── vercel.json                # Vercel serverless deployment config
│   ├── main.py                    # Server startup script
│   │
│   └── app/                       # Core backend package
│       ├── app.py                 # FastAPI initialization and middleware
│       ├── config.py              # Settings, runtime API key store
│       ├── database.py            # SQLAlchemy engine, session maker, base
│       │
│       ├── agents/                # Autonomous AI agent implementations
│       │   ├── discovery_agent.py # Interactive question-and-answer elicitation
│       │   ├── research_agent.py  # Live web intelligence collector
│       │   ├── transit_agent.py   # Flights vs. scenic trains evaluator
│       │   ├── stay_agent.py      # Vetted accommodations recommender
│       │   ├── itinerary_agent.py # Day-by-day scheduler with food pairings
│       │   ├── budget_agent.py    # Cost model, checklist, and packing list
│       │   ├── critic_agent.py    # 5-Pillar quality evaluation and scoring
│       │   └── orchestrator.py    # Master workflow conductor
│       │
│       ├── models/                # Pydantic and SQLAlchemy models
│       │   ├── trip.py            # Pydantic schemas (TripPlan, Preferences, etc.)
│       │   ├── db_models.py       # SQLAlchemy ORM models (User, TripRecord)
│       │   └── auth.py            # Auth payload schemas
│       │
│       ├── routes/                # FastAPI endpoint controllers
│       │   ├── auth.py            # /api/auth (signup, login, me)
│       │   ├── chat.py            # /api/chat (conversational turns)
│       │   ├── config.py          # /api/config (key management)
│       │   ├── planner.py         # /api/plan (generate, refine, sample)
│       │   ├── search.py          # /api/search (live web search)
│       │   └── trips.py           # /api/trips (save, list, delete trips)
│       │
│       └── services/              # Domain logic & integration services
│           ├── auth.py            # Password hashing and JWT generation
│           ├── deep_links.py      # Direct booking URL generation
│           ├── destination_knowledge.py # Built-in curated destinations knowledge
│           ├── geo_intelligence.py# Geospatial distance and country checks
│           ├── image_service.py   # High-resolution image curation
│           ├── link_crawler.py    # IATA code resolution and link verification
│           ├── pricing_intelligence.py # Currency rates and price estimations
│           ├── search_service.py  # DuckDuckGo and Tavily search wrapper
│           └── web_search_synthesizer.py # Dynamic destination synthesis
│
└── frontend/                      # React 19 + TypeScript + Vite frontend
    ├── .env                       # Frontend environment variables
    ├── index.html                 # HTML application entry point
    ├── package.json               # Frontend dependencies and scripts
    ├── tsconfig.json              # TypeScript root configuration
    ├── vite.config.ts             # Vite configuration with API reverse proxy
    ├── vercel.json                # Vercel frontend routing configuration
    │
    └── src/                       # Application source code
        ├── main.tsx               # React application bootstrapping
        ├── App.tsx                # Main view router, global state, tab controller
        ├── index.css              # Tailwind CSS styles and glassmorphic utilities
        │
        ├── components/            # UI components
        │   ├── AgentReasoningBar.tsx # Animated agent status indicator
        │   ├── AuthPage.tsx       # Login and signup modal/card
        │   ├── BookingChecklistTab.tsx # Timeline tasks and packing list
        │   ├── BudgetTab.tsx      # Categorical budget ring and cards
        │   ├── ChatStudio.tsx     # Conversational discovery and prompt chat
        │   ├── CurrencyDropdown.tsx # Multi-currency selector (10 currencies)
        │   ├── ExportModal.tsx    # Word (.docx) and PDF export triggers
        │   ├── Header.tsx         # Top bar with user status, currency, buttons
        │   ├── ItineraryTab.tsx   # Day-by-day activity and culinary schedule
        │   ├── LiveSearchModal.tsx # Rapid real-time search interface
        │   ├── MinimalNavbar.tsx  # Sleek top navigation
        │   ├── ResetTripModal.tsx # Confirmation modal to clear trip
        │   ├── SavedTripsTab.tsx  # Saved trips gallery and loader
        │   ├── SettingsModal.tsx  # Runtime API key modal
        │   ├── Sidebar.tsx        # Collapsible primary navigation sidebar
        │   ├── StaysTab.tsx       # Hotel and apartment cards with reviews
        │   └── TransitTab.tsx     # Flight vs. train options and mobility guide
        │
        ├── types/                 # TypeScript interfaces and types
        │   └── trip.ts            # Complete type definitions matching backend
        │
        └── utils/                 # Utility functions
            ├── exportTrip.ts      # Word (.docx) and PDF export engines
            └── formatText.tsx     # Markdown and typographic formatting helper
```

---

## 📡 REST API Documentation

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new traveler account with username, email, and password. | No |
| `POST` | `/api/auth/login` | Authenticate traveler credentials and receive a JWT Bearer token. | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile details for the current user. | Yes (Bearer) |

### 2. Conversational Discovery (`/api/chat`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Send a chat message with current preferences and history. Returns next questions, updated preferences, and suggested reply pills. |

### 3. Trip Planner Engine (`/api/plan`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/plan/generate` | Triggers the full multi-agent pipeline to generate an end-to-end `TripPlan`. Automatically links to the authenticated user's account. |
| `POST` | `/api/plan/refine` | Refines an existing plan based on a natural language instruction (e.g., *"Make it cheaper"* or *"Add more food spots"*). |
| `GET` | `/api/plan/sample` | Returns a pre-built sample plan (Tokyo & Kyoto) for instant testing. |

### 4. Cloud Trips Persistence (`/api/trips`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | Retrieves all saved trips for the authenticated user. | Yes (Bearer) |
| `POST` | `/api/trips` | Saves or updates a complete trip plan to the database. | Yes (Bearer) |
| `DELETE`| `/api/trips/{id}` | Deletes a saved trip by ID. | Yes (Bearer) |

### 5. Live Search & Runtime Configuration
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/search/live?q={query}` | Executes live search queries and returns snippets with verified URLs. |
| `GET` | `/api/config` | Returns the current configuration status of Gemini and Tavily keys. |
| `POST` | `/api/config` | Updates in-memory runtime API keys on the backend. |
| `GET` | `/health` | Healthcheck endpoint returning server status (`healthy`). |

---

## 🚀 Local Development & Setup

### Prerequisites
Make sure you have the following installed:
- **Node.js**: v18.0.0 or higher
- **Python**: v3.12 or higher
- **Package Managers**:
  - `npm` (bundled with Node)
  - `uv` (recommended for ultra-fast Python dependency management) or standard `pip`
- A free **PostgreSQL Database** (e.g., from [Neon.tech](https://neon.tech)) or a local PostgreSQL instance.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/RADXIshan/TripMax.git
cd TripMax
```

---

### Step 2: Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Using uv (fastest)
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate

   # Or using standard python
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   # Using uv
   uv pip install -e .

   # Or using standard pip
   pip install -r <(python -c "import tomllib; print('\n'.join(tomllib.load(open('pyproject.toml','rb'))['project']['dependencies']))")
   ```

4. **Configure backend environment variables**:
   Create a `.env` file in `backend/.env`:
   ```ini
   PORT=8000
   CLIENT_URL=http://localhost:5173
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   GEMINI_API_KEY="your-google-gemini-api-key"
   TAVILY_API_KEY="your-tavily-api-key-optional"
   ```

5. **Start the backend server**:
   ```bash
   uv run main.py
   # Or using uvicorn directly:
   # uvicorn app.app:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend will be running at **`http://127.0.0.1:8000`** with interactive Swagger documentation available at **`http://127.0.0.1:8000/docs`**.

---

### Step 3: Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure frontend environment variables**:
   Create a `.env` file in `frontend/.env`:
   ```ini
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at **`http://localhost:5173`**. Requests to `/api/*` are automatically proxied to `http://127.0.0.1:8000`.

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `8000` | The port on which the FastAPI Uvicorn server runs. |
| `CLIENT_URL` | Optional | `http://localhost:5173` | Allowed origin for CORS headers. |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI (e.g. Neon connection string with `sslmode=require`). |
| `GEMINI_API_KEY`| Optional | `""` | Google Gemini API key used for editorial enhancement and synthesis. Can also be set via the UI Settings modal. |
| `TAVILY_API_KEY`| Optional | `""` | Tavily AI search key. If omitted, the engine automatically falls back to DuckDuckGo. |
| `DEFAULT_CURRENCY` | Optional | `INR` | Default currency code for pricing models. |

### Frontend (`frontend/.env`)

| Variable | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Optional | `http://127.0.0.1:8000` | Base URL of the backend API service. In development, Vite proxy routes `/api` locally. |

---

## 📑 Export Engine (Word & PDF)

TripMax includes client-side document generators that produce executive-ready travel documents directly from the structured plan:

### 1. Microsoft Word Export (`.docx`)
- Utilizes the `docx` library.
- Formats trip overview, destination metadata, and certified Quality Score.
- Builds multi-column transit comparison tables (Flights vs. Rail) with clickable booking URLs.
- Generates accommodation dossiers featuring verified ratings, amenities, and nightly costs.
- Constructs day-by-day schedules with highlighted morning, afternoon, evening slots, and dining pairings.
- Embeds the full financial budget breakdown and timeline booking checklist.

### 2. Vector PDF Export (`.pdf`)
- Utilizes `jspdf` and `jspdf-autotable`.
- Implements dynamic page breaks, custom headers, footers with page numbering (*"Page X of Y"*), and clean typography.
- Uses distinct accent palettes for easy scanning during transit.

---

## 🔒 Authentication & Persistence

- **Security**: Passwords are encrypted using salted `bcrypt` hashes before storage.
- **Sessions**: Uses stateless `HS256` signed JSON Web Tokens (JWT) with a 7-day expiration window.
- **Database Tables**:
  - `users`: Stores user identity (`id`, `username`, `email`, `hashed_password`, `created_at`, `updated_at`).
  - `trip_records`: Stores generated plans (`id`, `user_id`, `destination`, `origin`, `duration_days`, `dates`, `tagline`, `total_budget`, `currency`, `plan_json`, `created_at`).
- **Automatic Sync**: Any trip generated while logged in is automatically persisted to the user's account.

---

## 🚢 Deployment Guide

### Deploying to Vercel

TripMax is configured for deployment on [Vercel](https://vercel.com):

1. **Frontend Deployment**:
   - Set Root Directory to `frontend`.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set environment variable `VITE_API_URL` to your production backend URL.

2. **Backend Deployment**:
   - The `backend/vercel.json` file configures the Python serverless runtime:
     ```json
     {
       "version": 2,
       "builds": [{ "src": "app/app.py", "use": "@vercel/python" }],
       "routes": [{ "src": "/(.*)", "dest": "app/app.py" }]
     }
     ```
   - In your Vercel Project Settings, add the environment variables:
     - `DATABASE_URL`
     - `GEMINI_API_KEY`
     - `TAVILY_API_KEY`

---

## ❓ Troubleshooting & FAQ

### Q1: Do I need a paid API key to use TripMax?
**No.** TripMax is fully functional out of the box without paid API keys:
- Web search runs automatically via the free, built-in **DuckDuckGo Search** engine.
- If no Gemini key is provided, the system uses high-fidelity base synthesis algorithms and curated knowledge bases to engineer authentic itineraries.
- Adding a Gemini key or Tavily key simply provides enhanced editorial prose and additional query depth.

### Q2: What happens if I search for an unusual or small destination?
The `WebSearchSynthesizer` dynamically queries live travel databases, Wikipedia, and search APIs, extracting authentic local landmarks, verified hotels, regional dishes, and real transit hubs to construct an accurate plan.

### Q3: How does the system prevent hallucinated trains?
The `geo_intelligence` service evaluates whether the trip is domestic, cross-country, or trans-oceanic:
- If a route cannot support direct train connectivity (e.g., New Delhi to New York, or London to Sydney), the engine automatically avoids suggesting direct trains and instead provides regional rail options for internal travel at the destination.

### Q4: Database connection error on startup?
Ensure your `DATABASE_URL` string in `backend/.env` is valid and includes SSL parameters if required (e.g., `?sslmode=require` for Neon). On startup, FastAPI automatically runs `Base.metadata.create_all()` to create any missing tables.

---

## 📄 License

This project is licensed under the **MIT License**. You are free to modify, distribute, and build upon TripMax for personal and commercial use.

---

<p align="center">
  Crafted with care by <b>TripMax Engineering</b> • Powered by Multi-Agent AI
</p>
