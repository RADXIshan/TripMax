# 🛠️ TripMax Backend Service

FastAPI-powered asynchronous backend and Multi-Agent Orchestration Engine with Playwright Headed Browser Automation for TripMax.

For full project documentation, architecture diagrams, and system overview, please refer to the [Root README](../README.md).

---

## ⚡ Quick Start

### 1. Requirements
- Python 3.12+
- `uv` (recommended) or `pip`

### 2. Setup Environment
```bash
# Using uv (fastest)
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
uv run playwright install chromium
```

### 3. Environment Variables
Create a `.env` file in this directory:
```ini
PORT=8000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
GEMINI_API_KEY="your-google-gemini-api-key"
TAVILY_API_KEY="your-tavily-api-key"
FIRECRAWL_API_KEY="your-firecrawl-api-key"
PLAYWRIGHT_HEADLESS=false
```

### 4. Run Server
```bash
uv run main.py
```
Server runs at `http://127.0.0.1:8000`. Interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

---

## 🤖 Agents Directory (`app/agents/`)
- `discovery_agent.py`: Conversational preference elicitation and smart MCQ questions.
- `research_agent.py`: Live sightseeing queries via Holidify, Thrillophilia, and Firecrawl MCP.
- `transit_agent.py`: Flights vs high-speed trains comparisons with live Google Flights & ConfirmTkt scraping.
- `stay_agent.py`: Vetted accommodations with Booking.com live visual scraping (>= 9.0/10 rating threshold).
- `itinerary_agent.py`: Day-by-day morning/afternoon/evening schedule + gastronomic dining pairings.
- `budget_agent.py`: Categorical financial analysis, booking milestones, and packing list.
- `critic_agent.py`: 5-Pillar self-evaluation audit resulting in a certified Quality Score (out of 100).
- `orchestrator.py`: Master multi-agent workflow conductor and visited sites compiler.

---

## 🎭 Browser Automation Services (`app/services/`)
- `playwright_scraper.py`: Headed browser engine with real-time in-page floating glassmorphic **Agent HUD** overlay (`Live Agent Thinking` / `Verified Decision`).
- `booking_playwright_agent.py`: Autonomous 1-click booking agent for Booking.com, Google Flights, ConfirmTkt, and MakeMyTrip that selects room/fare tiers, locks reservations in cart, and captures screenshot proof.
- `firecrawl_service.py`: Deep web document scraping and structured data extraction.
