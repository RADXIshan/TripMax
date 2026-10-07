from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.routes.planner import router as planner_router
from app.routes.search import router as search_router
from app.routes.config import router as config_router

app = FastAPI(
    title="TripMax API",
    description="Multi-Agent AI Travel Architect & Real-Time Booking Assistant",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(planner_router)
app.include_router(search_router)
app.include_router(config_router)

@app.get("/")
def read_root():
    return {
        "app": "TripMax AI Travel Agent",
        "version": "1.0.0",
        "status": "online",
        "agents": [
            "Discovery & Clarification Agent",
            "Live Web Research Agent",
            "Transit Logistics Agent (Flights vs Trains)",
            "Stay & Lodging Agent",
            "Day-by-Day Itinerary Architect",
            "Budget & Booking Assistant Agent"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
