import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    trips = relationship("TripRecord", back_populates="user", cascade="all, delete-orphan", order_by="desc(TripRecord.created_at)")

class TripRecord(Base):
    __tablename__ = "trip_records"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination = Column(String(255), nullable=False)
    origin = Column(String(255), nullable=True)
    duration_days = Column(Integer, nullable=True)
    dates = Column(String(100), nullable=True)
    tagline = Column(Text, nullable=True)
    total_budget = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    plan_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="trips")
