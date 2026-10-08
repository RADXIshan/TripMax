from fastapi import APIRouter, HTTPException
from app.models.trip import PlanGenerationRequest, PlanRefineRequest, TripPreferences
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/plan", tags=["Planner"])

@router.post("/generate")
async def generate_trip(payload: PlanGenerationRequest):
    try:
        plan = await orchestrator.generate_trip_plan(
            preferences=payload.preferences,
            user_prompt=payload.user_prompt
        )
        return plan
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine")
async def refine_trip(payload: PlanRefineRequest):
    try:
        updated_plan = await orchestrator.refine_plan(
            current_plan=payload.current_plan,
            instruction=payload.refinement_instruction,
            preferences=payload.preferences
        )
        return updated_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sample")
async def get_sample_plan():
    """Generates a sample 5-day Kyoto trip plan for instant preview"""
    sample_prefs = TripPreferences(
        destination="Kyoto, Japan",
        origin="San Francisco (SFO)",
        dates="Nov 10 – Nov 17, 2026",
        start_date="2026-11-10",
        end_date="2026-11-17",
        travel_month="November 2026",
        season="Autumn",
        duration_days=7,
        budget_amount=2800.0,
        budget_currency="USD",
        party_type="Couple",
        travel_pace="balanced",
        transport_preference="both",
        interests=["culture & history", "food", "photography & viewpoints"]
    )
    plan = await orchestrator.generate_trip_plan(sample_prefs)
    return plan
