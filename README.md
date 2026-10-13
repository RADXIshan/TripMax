# ✈️ TripMax — Autonomous Multi-Agent AI Travel Operating System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.142+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React 19](https://img.shields.io/badge/React-19.1+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Playwright](https://img.shields.io/badge/Playwright-Headed_Agent-45BA4B?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7.1+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green.style=flat-square)](#license)

> **TripMax** is an autonomous, multi-agent AI travel operating system that eliminates the chaos of juggling 20+ browser tabs when planning and booking travel. Unlike standard AI chatbots that generate hallucinated text lists, TripMax orchestrates a collaborative network of specialized AI subagents backed by **real-time visual browser automation (Playwright)**, **Firecrawl MCP**, **deep-web pricing models**, and **autonomous 1-click cart auto-booking**. It visually researches, verifies, prices, schedules, audits, and reserves complete end-to-end journeys with real flight corridors, scenic rail routes, vetted boutique accommodations, geocoded itineraries, multi-currency budget calculators, and one-click Word/PDF export.

---

## 📑 Table of Contents

1. [Why TripMax? (The Problem vs Solution)](#-why-tripmax-the-problem-vs-solution)
2. [Core Features & Highlights](#-core-features--highlights)
3. [Autonomous Multi-Agent Architecture](#-autonomous-multi-agent-architecture)
4. [Playwright Visual Browser Subagent & Auto-Booking](#-playwright-visual-browser-subagent--auto-booking)
5. [Agent Hierarchy & Responsibilities](#-agent-hierarchy--responsibilities)
6. [User Interface & Interactive Tabs](#-user-interface--interactive-tabs)
7. [Tech Stack & Tooling](#-tech-stack--tooling)
8. [System Architecture Diagram](#-system-architecture-diagram)
9. [Project File Structure](#-project-file-structure)
10. [REST API Documentation](#-rest-api-documentation)
11. [Local Development & Setup](#-local-development--setup)
12. [Environment Variables Reference](#-environment-variables-reference)
13. [Export Engine (Word & PDF)](#-export-engine-word--pdf)
14. [Authentication & Persistence](#-authentication--persistence)
15. [Deployment Guide](#-deployment-guide)
16. [Troubleshooting & FAQ](#-troubleshooting--faq)
17. [License](#-license)

---

## 💡 Why TripMax? (The Problem vs Solution)

### The Pain of Modern Travel Planning
1. **Tab Overload**: Planning a trip demands cross-referencing flights (Google Flights, Skyscanner), trains (ConfirmTkt, Trainline), hotels (Booking.com, MakeMyTrip, Agoda), sightseeing guides (Holidify, Thrillophilia), maps, and budgets across dozens of open tabs.
2. **AI Hallucinations**: Standard LLMs routinely recommend closed venues, fabricate nonexistent rail lines, quote unrealistic costs, or hallucinate bullet trains across oceans.
3. **Disconnected Logistics & Friction**: AI itineraries never check real live availability or place items in your booking carts, leaving you to manually re-type dates, destinations, and traveler counts everywhere.

### The TripMax Solution
TripMax introduces a **multi-agent orchestration pipeline** backed by real-time visual browser automation, geographical intelligence, and self-evaluating quality auditing:
- **Headed Browser Automation**: Watch the AI open a real browser window on your screen to extract live flights, stays, and attractions.
- **Autonomous Auto-Booking**: 1-click **Auto-Book** buttons on Stays, Flights, and Trains that navigate portals, select matching room/fare tiers, place reservations in your session cart, and capture verified screenshot proof.
- **No Hallucinated Logistics**: Geo-intelligence automatically differentiates between domestic high-speed rail corridors and flight routes.
- **Multi-Platform Deep Links**: Every flight, train, hotel, and activity features pre-populated deep booking links across Booking.com, MakeMyTrip, Agoda, Skyscanner, Google Flights, and ConfirmTkt.
- **Audited Quality Bar (>= 9.0/10)**: Every stay is evaluated for verified guest ratings, neighborhood safety, and value-to-price ratio.
- **Dynamic Gastronomic Pacing**: Crafts realistic Morning, Afternoon, and Evening slots paired with authentic lunch and dinner recommendations.

---

## ✨ Core Features & Highlights

### 🚀 1. Visual Playwright Browser Agent with Live HUD
- **Headed Execution (`headless=False`)**: When researching or booking, TripMax pops up a live Chromium browser window on your desktop.
- **In-Page Glassmorphic HUD Overlay**: A floating badge injected into target websites displaying real-time cognitive reasoning:
  - `LIVE AGENT THINKING`: Displays current route, travel dates, party size, and target budget constraints.
  - `VERIFIED DECISION`: Highlights chosen flight cards, hotel rooms, and rail berths with glowing boundaries.
- **Anti-Detection Engine**: Operates with randomized viewport scaling, automated cookie/modal dismissal, and anti-bot stealth scripts.

### 💳 2. Autonomous Auto-Booking Engine (`/api/booking/auto-book`)
- Click **Auto-Book** on any Stay, Flight, or Train option.
- The Playwright agent launches, navigates to the verified provider (Booking.com, Google Flights, Skyscanner, MakeMyTrip, Agoda, ConfirmTkt), selects the matching room or fare tier, and locks the reservation into your session cart.
- **Instant Proof Capture**: Returns a full-resolution live screenshot of the reserved cart stage along with the direct checkout session URL.
- **Interactive Modal**: Features a step ticker, live execution audit logs, an expandable screenshot lightbox, and a "Proceed to Checkout" button.

### 🌐 3. Research Sources & Visited Sites Registry
- Dedicated **Sources** tab displaying every web portal accessed during research and booking.
- Interactive filtering: `All`, `Playwright (Live Browsers)`, `Firecrawl (Deep Web MCP)`, and `Partner Passes & Attractions`.
- Live status badges (`Verified Live`), verification timestamps, and direct deep-links.

### 🏛️ 4. Premier Sightseeing & Discovery Portals
- Scans premier travel authorities: **Holidify** (ranked tourist attractions, operational hours, entry tickets, and guest scores) and **Thrillophilia** (curated experiences and photography viewpoints).
- Filters out generic marketing taglines to extract only authoritative, visitable landmarks.
- Supplementary fallback to **Wikipedia Cultural Archives** and **UNESCO World Heritage**.

### 🚆✈️ 5. Transit Intelligence (Flights vs. Scenic Rail)
- Evaluates real airline carriers, flight numbers, baggage rules, and round-trip rates on **Google Flights**, **Skyscanner**, and **MakeMyTrip**.
- Evaluates domestic and intercity rail lines (e.g., Shinkansen, TGV, Eurostar, Vande Bharat, Rajdhani, Shatabdi) with live seat prediction on **ConfirmTkt**.
- Comprehensive local mobility guide with metro passes, airport express lines, and regional taxi apps.

### 🏨 6. Lodging & Stays Architecture
- Strict hospitality standard: recommends properties with verified guest ratings of **>= 9.0/10** (or 4.5/5 stars).
- Covers diverse stay personas: Heritage Boutiques, Grand Luxury, Historic Villas, Modern City Apartments, and High-Value Stays.
- Provides night-by-night and total stay costs with multi-platform deep links to **Booking.com**, **Airbnb**, **Agoda**, and **MakeMyTrip**.

### 📅 7. Day-by-Day Precision Itinerary
- Structured daily pacing: **Morning Exploration**, **Afternoon Immersion**, and **Evening Leisure**.
- Signature dining pairings for every single day: local lunch bistros + authentic evening dinners with regional specialties.
- Daily walking routes and transit tips to avoid traffic bottlenecks.

### 💰 8. Financial Budget Breakdown & 10-Currency Engine
- Categorical breakdown: **Transit**, **Stays**, **Activities & Tickets**, **Food & Dining**, and **Local Buffer**.
- Compares total estimated expenditure against user budget, categorizing it as *Within Budget*, *Controlled Stretch*, or *Luxury Splurge*.
- Real-time conversion across **10 global currencies**:
  `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `JPY (¥)`, `AUD (A$)`, `CAD (C$)`, `CHF (CHF)`, `SGD (S$)`, `AED (AED)`.

### 📋 9. Booking Milestones & Intelligent Packing Assistant
- Milestone-based checklist divided into actionable countdown phases (4 weeks, 2 weeks, 3 days out).
- Climate-aware, destination-tailored packing lists categorized into **Documents & Finance**, **Clothing & Weather Gear**, **Tech & Adapters**, and **Toiletries & Health**.

### 📄 10. Professional Multi-Format Export
- **Microsoft Word (`.docx`) Export**: Clean typography, colored tables, callout blocks, and hyperlinked booking URLs.
- **Multi-Page PDF Export**: Formatted with `jspdf` and `jspdf-autotable`, including header branding, category tables, daily timelines, and page numbering.

### 🔐 11. User Authentication & Cloud Synchronization
- Modern JWT authentication with Bcrypt password hashing.
- Cloud database persistence powered by **Neon Serverless PostgreSQL**.
- Automatically saves generated trips to the authenticated traveler's personal dashboard.
- Seamless guest mode with immediate local storage fallback.

### 🧐 12. Self-Evaluating Critic Agent
- Runs an automated **5-Pillar Quality Audit** before presenting the plan:
  1. *Budget Calibration & Spend Efficiency (20 pts)*
  2. *Hospitality Rating Rigor (>= 9.0/10 bar) & Carrier Sanity (20 pts)*
  3. *Exact Date, Month & Seasonal Travel Feasibility (20 pts)*
  4. *Multi-Platform Booking Link Integrity (20 pts)*
  5. *Daily Mobility Flow & Pacing Balance (20 pts)*
- Certifies the plan with a verified Quality Score (typically **98/100**) and audit certificate stamp.

---

## 🏛️ Autonomous Multi-Agent Architecture

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
│ (Holidify/Firecrawl) │    │ (Flight vs Rail)     │    │ (Booking.com/Agoda)  │
└───────────┬──────────┘    └──────────┬───────────┘    └──────────┬───────────┘
            │                          │                           │
            └───────────┐              │              ┌────────────┘
                        ▼              ▼              ▼
                   ┌───────────────────────────────────────┐
                   │   Playwright Visual Browser Subagent  │
                   │ (Headed Chromium with Live Agent HUD) │
                   └───────────────────┬───────────────────┘
                                       │
                                       ▼
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
                           │(Interactive Tabs/Exports)│
                           └─────────────┬────────────┘
                                         │
                                         ▼ (On "Auto-Book" click)
                           ┌──────────────────────────┐
                           │ Autonomous Booking Agent │
                           │ (Picks Room/Fare & Cart) │
                           └──────────────────────────┘
```

---

## 🎭 Playwright Visual Browser Subagent & Auto-Booking

TripMax bridges the gap between passive AI planning and active autonomous execution:

| Operation | Target Portals | In-Browser Action | Output Artifact |
| :--- | :--- | :--- | :--- |
| **Places to Visit** | Holidify, Thrillophilia, UNESCO | Scans ranked attractions, skips taglines, highlights cards with glowing borders | Verified `ResearchSource[]` citations |
| **Flight Search** | Google Flights, Skyscanner, MakeMyTrip | Inputs Origin, Destination, travel dates; checks direct carriers, fare tiers | Verified `FlightOption[]` with deep links |
| **Stay Search** | Booking.com, Agoda, MakeMyTrip | Inputs Destination, check-in, check-out dates; enforces guest rating >= 4.5★ | Verified `StayOption[]` with live links |
| **Train Search** | ConfirmTkt, IRCTC | Queries intercity routes, evaluates seat prediction algorithms | Verified `TrainOption[]` with booking links |
| **Auto-Booking** | Booking.com, Google Flights, ConfirmTkt | Navigates to listing, dismisses overlays, clicks Reserve/Book, holds room/fare in cart | Verified live screenshot proof + cart URL |

---

## 👥 Agent Hierarchy & Responsibilities

| Agent Name | Primary Responsibility | Key Inputs / Tools | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Discovery Agent** | Guides traveler through interactive preference gathering. | Regex extractors, contextual question state machine. | Updated `TripPreferences`, suggested reply pills. |
| **Research Agent** | Gathers live attractions and sightseeing spots. | Playwright Headed Browser, Holidify, Firecrawl MCP. | List of `ResearchSource` objects with verified URLs. |
| **Transit Agent** | Compares flights and scenic rail routes with live rates. | Playwright Google Flights scraper, ConfirmTkt scraper. | `FlightOption[]`, `TrainOption[]`, and `LocalMobilityInfo`. |
| **Stay Agent** | Curates accommodations meeting the >= 9.0/10 quality bar. | Playwright Booking.com scraper, pricing intelligence. | `StayOption[]` with nightly rates and deep booking links. |
| **Itinerary Agent** | Engineers daily morning, afternoon, evening schedules. | Pacing heuristics, culinary pairings, photo service. | `ItineraryDay[]` with cultural tips and food pairings. |
| **Budget Agent** | Computes categorical financials and prepares checklists. | Multi-currency pricing models, seasonal multipliers. | `BudgetBreakdown`, `ChecklistItem[]`, and `PackingItem[]`. |
| **Critic Agent** | Conducts a 5-pillar self-audit on data integrity and dates. | 100-point scoring algorithm, date synchronization check. | Verified `Quality Score`, audit badge, and audit findings. |
| **Auto-Booking Agent** | Autonomously navigates booking portals and reserves items. | Playwright Headed Browser, stealth bypass scripts, DOM clicker. | Live session screenshot proof, cart URL, execution logs. |

---

## 🖥️ User Interface & Interactive Tabs

1. **💬 Chat Studio**: Conversational concierge with animated agent reasoning bar (`AgentReasoningBar`), quick reply pills, and prompt input.
2. **📅 Itinerary Tab**: Day-by-day interactive timeline with morning, afternoon, and evening activity cards, high-res photography, direct ticket links, and culinary pairings.
3. **🚆 Transit Hub**: Side-by-side flight vs. high-speed rail cards with carrier pros/cons, **Auto-Book** triggers, and local mobility guides.
4. **🏨 Stays Tab**: Hotel showcase with neighborhood tags, verified guest ratings, amenity badges, price breakdowns, and **Auto-Book** triggers.
5. **🌐 Sources Tab**: Dedicated registry of all live web portals crawled by Playwright and Firecrawl with live status badges and deep links.
6. **💳 Budget Breakdown**: Interactive expense ring chart and category cards with one-click conversion across 10 currencies.
7. **📋 Booking Checklist & Packing**: Interactive task list organized by countdown milestones (4 weeks, 2 weeks, 3 days out) and climate-aware packing checklists.
8. **📂 Saved Trips**: Cloud-synced trip archive showing saved plans with destination photos, duration, dates, and budget details.
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
- **Browser Automation**: [Playwright](https://playwright.dev) (Async Python API with Chromium engine)
- **Deep Web MCP**: Firecrawl MCP API Integration
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
│  [Sources Tab]   [Budget Tab]  [Checklist] [Exports]   │
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
│ • Research Agent         │ │ • psycopg3 DB Driver      │
│ • Transit Engine         │ │ • Neon Serverless Postgres│
│ • Stay Curator           │ │   - users table           │
│ • Itinerary Architect    │ │   - trip_records table    │
│ • Budget & Prep Agent    │ └───────────────────────────┘
│ • Critic & QA Auditor    │
│ • Auto-Booking Agent     │
└─────────────┬────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│             External Engine & Web Services             │
│                                                        │
│  • Playwright Headed Chromium Browser (Visual Session) │
│  • Google Gemini 3.8 Flash (Generative Enhancement)   │
│  • Holidify & Thrillophilia (Sightseeing Extraction)   │
│  • Google Flights, Booking.com, ConfirmTkt (Portals)   │
│  • Firecrawl MCP & DuckDuckGo (Deep Intelligence)      │
│  • Wikipedia REST API (Cultural Archives)              │
│  • Unsplash & Wikimedia Commons (Curated Imagery)      │
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
│       │   ├── trip.py            # Pydantic schemas (TripPlan, Preferences, VisitedSite)
│       │   ├── db_models.py       # SQLAlchemy ORM models (User, TripRecord)
│       │   └── auth.py            # Auth payload schemas
│       │
│       ├── routes/                # FastAPI endpoint controllers
│       │   ├── auth.py            # /api/auth (signup, login, me)
│       │   ├── booking.py         # /api/booking/auto-book (Autonomous Playwright Booking)
│       │   ├── chat.py            # /api/chat (conversational turns)
│       │   ├── config.py          # /api/config (key management)
│       │   ├── planner.py         # /api/plan (generate, refine, sample)
│       │   ├── search.py          # /api/search (live web search)
│       │   └── trips.py           # /api/trips (save, list, delete trips)
│       │
│       └── services/              # Domain logic & integration services
│           ├── auth.py            # Password hashing and JWT generation
│           ├── booking_playwright_agent.py # Autonomous Playwright booking agent
│           ├── deep_links.py      # Direct multi-platform booking URL generator
│           ├── destination_knowledge.py # Curated destination intelligence
│           ├── firecrawl_service.py # Firecrawl MCP deep web scraper
│           ├── geo_intelligence.py# Geospatial distance and country checks
│           ├── image_service.py   # High-resolution image curation
│           ├── link_crawler.py    # IATA code resolution and link verification
│           ├── playwright_scraper.py # Visual browser scraper with HUD overlay
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
        │   ├── AutoBookingModal.tsx # Autonomous Playwright booking modal with live proof
        │   ├── BookingChecklistTab.tsx # Timeline tasks and packing list
        │   ├── BudgetTab.tsx      # Categorical budget ring and cards
        │   ├── ChatStudio.tsx     # Conversational discovery and prompt chat
        │   ├── CurrencyDropdown.tsx # Multi-currency selector (10 currencies)
        │   ├── ExportModal.tsx    # Word (.docx) and PDF export triggers
        │   ├── Header.tsx         # Top bar with user status, currency, buttons
        │   ├── ItineraryTab.tsx   # Day-by-day activity and culinary schedule
        │   ├── LiveSearchModal.tsx # Rapid real-time search interface
        │   ├── MinimalNavbar.tsx  # Sleek top navigation
        │   ├── ResearchSourcesTab.tsx # Visited sites & live Playwright citations registry
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

### 1. Autonomous Booking Engine (`/api/booking`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/booking/auto-book` | Launches the headed Playwright booking agent, navigates to the provider (Booking.com, Google Flights, ConfirmTkt, MakeMyTrip, Agoda), selects room/fare tier, adds to cart, and returns live status, cart URL, and proof screenshot. |

### 2. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new traveler account with username, email, and password. | No |
| `POST` | `/api/auth/login` | Authenticate traveler credentials and receive a JWT Bearer token. | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile details for the current user. | Yes (Bearer) |

### 3. Conversational Discovery (`/api/chat`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Send a chat message with current preferences and history. Returns next questions, updated preferences, and suggested reply pills. |

### 4. Trip Planner Engine (`/api/plan`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/plan/generate` | Triggers the multi-agent pipeline with visual browser searches to generate an end-to-end `TripPlan`. Automatically links to the authenticated user. |
| `POST` | `/api/plan/refine` | Refines an existing plan based on natural language instructions (e.g., *"Make it cheaper"*). |

### 5. Cloud Trips Persistence (`/api/trips`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | Retrieves all saved trips for the authenticated user. | Yes (Bearer) |
| `POST` | `/api/trips` | Saves or updates a complete trip plan to the database. | Yes (Bearer) |
| `DELETE`| `/api/trips/{id}` | Deletes a saved trip by ID. | Yes (Bearer) |

### 6. Live Search & Runtime Configuration
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/search/live?q={query}` | Executes live search queries and returns snippets with verified URLs. |
| `GET` | `/api/config` | Returns configuration status of Gemini, Tavily, and Firecrawl keys. |
| `POST` | `/api/config` | Updates in-memory runtime API keys on the backend. |
| `GET` | `/health` | Healthcheck endpoint returning server status (`healthy`). |

---

## 🚀 Local Development & Setup

### Prerequisites
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

3. **Install dependencies and Playwright browser binaries**:
   ```bash
   # Using uv
   uv pip install -e .
   uv run playwright install chromium

   # Or using standard pip
   pip install -e .
   playwright install chromium
   ```

4. **Configure backend environment variables**:
   Create a `.env` file in `backend/.env`:
   ```ini
   PORT=8000
   CLIENT_URL=http://localhost:5173
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   GEMINI_API_KEY="your-google-gemini-api-key"
   TAVILY_API_KEY="your-tavily-api-key-optional"
   FIRECRAWL_API_KEY="your-firecrawl-key-optional"
   PLAYWRIGHT_HEADLESS=false
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
| `PORT` | Optional | `8000` | Port for the FastAPI Uvicorn server. |
| `CLIENT_URL` | Optional | `http://localhost:5173` | Allowed origin for CORS headers. |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI (e.g., Neon connection string with `sslmode=require`). |
| `GEMINI_API_KEY`| Optional | `""` | Google Gemini API key used for editorial enhancement and synthesis. Can also be set in UI Settings. |
| `TAVILY_API_KEY`| Optional | `""` | Tavily AI search key. Falls back to DuckDuckGo if omitted. |
| `FIRECRAWL_API_KEY`| Optional | `""` | Firecrawl MCP API key for deep web document crawling. |
| `PLAYWRIGHT_HEADLESS`| Optional | `false` | When `false`, opens a real browser window on your desktop so you can watch research and auto-booking live. |
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
     - `FIRECRAWL_API_KEY`
     - `PLAYWRIGHT_HEADLESS=true` (for headless serverless environments)

---

## ❓ Troubleshooting & FAQ

### Q1: Do I need a paid API key to use TripMax?
**No.** TripMax is fully functional out of the box without paid API keys:
- Visual browser automation runs directly on your machine via Playwright Chromium.
- Web search runs automatically via the free, built-in **DuckDuckGo Search** engine.
- If no Gemini key is provided, the system uses high-fidelity base synthesis algorithms and curated knowledge bases to engineer authentic itineraries.
- Adding a Gemini key, Tavily key, or Firecrawl key simply provides enhanced editorial prose and extra query depth.

### Q2: Why does a browser window pop up when I search or click Auto-Book?
This is by design! TripMax defaults to **Headed Browser Mode** (`PLAYWRIGHT_HEADLESS=false`) so you can visually inspect the AI agent navigating websites, selecting flight fares, and reserving hotel rooms with the live in-browser HUD overlay. If you prefer background execution, set `PLAYWRIGHT_HEADLESS=true` in `backend/.env`.

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
  Crafted with care by <b>TripMax Engineering</b> • Powered by Multi-Agent AI & Playwright
</p>
