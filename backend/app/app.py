from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models.db_models  # ensure models are registered
from app.routes.chat import router as chat_router
from app.routes.planner import router as planner_router
from app.routes.search import router as search_router
from app.routes.config import router as config_router
from app.routes.auth import router as auth_router
from app.routes.trips import router as trips_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("Neon PostgreSQL tables verified and online.", flush=True)
    except Exception as e:
        print("Database initialization error:", e, flush=True)
    yield

app = FastAPI(
    title="TripMax API",
    description="Multi-Agent AI Travel Architect & Real-Time Booking Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trips_router)
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
