import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import User, TripRecord
from app.services.auth import get_optional_current_user
from app.models.trip import PlanGenerationRequest, PlanRefineRequest, TripPreferences
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/plan", tags=["Planner"])

@router.post("/generate")
async def generate_trip(
    payload: PlanGenerationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        plan = await orchestrator.generate_trip_plan(
            preferences=payload.preferences,
            user_prompt=payload.user_prompt
        )
        if current_user and plan:
            try:
                plan_dict = plan.model_dump() if hasattr(plan, "model_dump") else plan.dict()
                record = TripRecord(
                    id=str(plan.id),
                    user_id=current_user.id,
                    destination=plan.destination,
                    origin=plan.origin,
                    duration_days=plan.duration_days,
                    dates=plan.dates,
                    tagline=plan.tagline,
                    total_budget=plan.budget.total_estimated if plan.budget else 0.0,
                    currency=plan.budget.currency if plan.budget else "INR",
                    plan_json=json.dumps(plan_dict)
                )
                db.merge(record)
                db.commit()
            except Exception as save_err:
                print("Auto-save generated plan warning:", save_err)
        return plan
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine")
async def refine_trip(
    payload: PlanRefineRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    try:
        updated_plan = await orchestrator.refine_plan(
            current_plan=payload.current_plan,
            instruction=payload.refinement_instruction,
            preferences=payload.preferences
        )
        if current_user and updated_plan:
            try:
                plan_dict = updated_plan.model_dump() if hasattr(updated_plan, "model_dump") else updated_plan.dict()
                record = TripRecord(
                    id=str(updated_plan.id),
                    user_id=current_user.id,
                    destination=updated_plan.destination,
                    origin=updated_plan.origin,
                    duration_days=updated_plan.duration_days,
                    dates=updated_plan.dates,
                    tagline=updated_plan.tagline,
                    total_budget=updated_plan.budget.total_estimated if updated_plan.budget else 0.0,
                    currency=updated_plan.budget.currency if updated_plan.budget else "INR",
                    plan_json=json.dumps(plan_dict)
                )
                db.merge(record)
                db.commit()
            except Exception as save_err:
                print("Auto-save refined plan warning:", save_err)
        return updated_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sample")
async def get_sample_plan():
    """Generates a sample curated trip plan for instant preview"""
    sample_prefs = TripPreferences(
        destination="Tokyo & Kyoto, Japan",
        origin="New Delhi (DEL)",
        dates="Nov 10 – Nov 17, 2026",
        start_date="2026-11-10",
        end_date="2026-11-17",
        travel_month="November 2026",
        season="Autumn",
        duration_days=7,
        budget_amount=220000.0,
        budget_currency="INR",
        party_type="Couple / Romantic",
        travel_pace="balanced",
        transport_preference="both",
        stay_preference="Boutique & Authentic Stays",
        dining_preference="Local Culinary Tastings & Street Food",
        interests=["culture & history", "food", "photography & viewpoints"]
    )
    plan = await orchestrator.generate_trip_plan(sample_prefs)
    return plan
