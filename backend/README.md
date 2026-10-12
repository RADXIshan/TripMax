# 🛠️ TripMax Backend Service

FastAPI-powered asynchronous backend and Multi-Agent Orchestration Engine for TripMax.

For full project documentation, architecture diagrams, and user guides, please refer to the [Root README](../README.md).

---

## ⚡ Quick Start

### 1. Requirements
- Python 3.12+
- `uv` (recommended) or `pip`

### 2. Setup Environment
```bash
# Using uv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

### 3. Environment Variables
Create a `.env` file in this directory:
```ini
PORT=8000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
GEMINI_API_KEY="your-google-gemini-api-key"
TAVILY_API_KEY="your-tavily-api-key"
```

### 4. Run Server
```bash
uv run main.py
```
Server runs at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

---

## 🤖 Agents Directory (`app/agents/`)
- `discovery_agent.py`: Conversational preference elicitation and smart MCQ questions.
- `research_agent.py`: DuckDuckGo / Tavily live web queries.
- `transit_agent.py`: Flights vs high-speed trains comparisons with deep booking URLs.
- `stay_agent.py`: Vetted accommodations (>= 9.0/10 rating threshold).
- `itinerary_agent.py`: Day-by-day morning/afternoon/evening schedule + gastronomic dining.
- `budget_agent.py`: Categorical financial analysis, booking milestones, and packing list.
- `critic_agent.py`: 5-Pillar self-evaluation audit resulting in a certified Quality Score (out of 100).
- `orchestrator.py`: Master multi-agent workflow conductor.
