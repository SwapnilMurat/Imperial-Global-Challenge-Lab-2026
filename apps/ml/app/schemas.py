from typing import Literal, Optional

from pydantic import BaseModel, Field


class SensorFrame(BaseModel):
    timestamp_ms: int = Field(..., ge=0)
    thigh_ax: float
    thigh_ay: float
    thigh_az: float
    shank_ax: float
    shank_ay: float
    shank_az: float
    thigh_gx: float
    thigh_gy: float
    thigh_gz: float
    shank_gx: float
    shank_gy: float
    shank_gz: float


class MLInferenceRequest(BaseModel):
    patient_id: str
    frames: list[SensorFrame] = Field(..., min_length=32, max_length=4096)
    pain_score: float = Field(..., ge=0, le=10)
    swelling_score: float = Field(..., ge=0, le=10)
    activity_minutes: float = Field(..., ge=0, le=600)
    age: int = Field(..., ge=18, le=110)
    post_op_day: int = Field(..., ge=0, le=365)


class RecoverySignals(BaseModel):
    recovery_score: float = Field(..., ge=0, le=100)
    exercise_quality: Literal["poor", "fair", "good", "excellent"]
    repetition_count: int = Field(..., ge=0)
    rom_progression: float
    deterioration_risk: Literal["low", "medium", "high"]
    confidence: float = Field(..., ge=0, le=1)


class MLInferenceResponse(BaseModel):
    patient_id: str
    model_version: str
    pipeline: list[str]
    signals: RecoverySignals
    notes: Optional[str] = None
