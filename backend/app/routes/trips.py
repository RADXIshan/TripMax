import json
from datetime import datetime
from typing import List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import User, TripRecord
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/trips", tags=["Trips"])

class SaveTripRequest(BaseModel):
    plan: Dict[str, Any]

def format_trip_record(record: TripRecord) -> Dict[str, Any]:
    try:
        plan_data = json.loads(record.plan_json)
    except Exception:
        plan_data = {}

    saved_at_formatted = record.created_at.strftime("%b %d, %I:%M %p") if record.created_at else "Recently"

    return {
        "id": record.id,
        "destination": record.destination,
        "origin": record.origin or "",
        "duration_days": record.duration_days or 1,
        "dates": record.dates or "",
        "total_budget": record.total_budget or 0.0,
        "currency": record.currency or "INR",
        "tagline": record.tagline or "",
        "savedAt": saved_at_formatted,
        "plan": plan_data
    }

@router.get("", response_model=List[Dict[str, Any]])
def get_user_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = (
        db.query(TripRecord)
        .filter(TripRecord.user_id == current_user.id)
        .order_by(TripRecord.created_at.desc())
        .all()
    )
    return [format_trip_record(r) for r in records]

@router.post("", response_model=Dict[str, Any])
def save_trip(
    payload: SaveTripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = payload.plan
    plan_id = str(plan.get("id") or "")
    if not plan_id:
        import uuid
        plan_id = f"plan-{uuid.uuid4().hex[:12]}"
        plan["id"] = plan_id

    destination = plan.get("destination", "New Journey")
    origin = plan.get("origin", "")
    duration_days = plan.get("duration_days", 1)
    dates = plan.get("dates", "")
    tagline = plan.get("tagline", "")
    budget_obj = plan.get("budget", {}) if isinstance(plan.get("budget"), dict) else {}
    total_budget = float(budget_obj.get("total_estimated", 0.0))
    currency = str(budget_obj.get("currency", "INR"))

    plan_json_str = json.dumps(plan)

    # Check if this trip already exists for the user
    existing = (
        db.query(TripRecord)
        .filter(TripRecord.id == plan_id, TripRecord.user_id == current_user.id)
        .first()
    )

    if existing:
        existing.destination = destination
        existing.origin = origin
        existing.duration_days = duration_days
        existing.dates = dates
        existing.tagline = tagline
        existing.total_budget = total_budget
        existing.currency = currency
        existing.plan_json = plan_json_str
        db.commit()
        db.refresh(existing)
        return format_trip_record(existing)
    else:
        new_record = TripRecord(
            id=plan_id,
            user_id=current_user.id,
            destination=destination,
            origin=origin,
            duration_days=duration_days,
            dates=dates,
            tagline=tagline,
            total_budget=total_budget,
            currency=currency,
            plan_json=plan_json_str
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return format_trip_record(new_record)

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = (
        db.query(TripRecord)
        .filter(TripRecord.id == trip_id, TripRecord.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found in your account."
        )

    db.delete(record)
    db.commit()
    return {"success": True, "id": trip_id}
