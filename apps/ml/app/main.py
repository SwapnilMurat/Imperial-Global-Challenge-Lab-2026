from __future__ import annotations

import numpy as np
import torch
from fastapi import FastAPI

from .model import MultiTaskRecoveryModel
from .pipeline import build_input_features
from .schemas import MLInferenceRequest, MLInferenceResponse, RecoverySignals

app = FastAPI(title="RecoverAI Joint ML Service", version="1.0.0")

MODEL_VERSION = "recoverai-joint-mtl-v1"
PIPELINE = [
    "Data Ingestion (time sync)",
    "Signal Processing (filtering, calibration)",
    "Segmentation (sliding window)",
    "Feature Engineering (time + frequency)",
    "Temporal Extractor (1D CNN + Bi-LSTM + Transformer)",
    "Multi-task heads",
]


def _quality_label(index: int) -> str:
    return ["poor", "fair", "good", "excellent"][index]


def _risk_label(index: int) -> str:
    return ["low", "medium", "high"][index]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "recoverai-joint-ml"}


@app.post("/infer", response_model=MLInferenceResponse)
def infer(payload: MLInferenceRequest) -> MLInferenceResponse:
    windows_np, static_np = build_input_features(payload)

    windows = torch.tensor(windows_np, dtype=torch.float32)
    static = torch.tensor(static_np, dtype=torch.float32)

    windows = windows.unsqueeze(0)
    static = static.unsqueeze(0)

    model = MultiTaskRecoveryModel(static_dim=static.shape[1])
    model.eval()

    with torch.no_grad():
        outputs = model(windows, static)

    knee_angle = float(outputs["knee_angle"].squeeze().item())
    quality_idx = int(torch.argmax(outputs["exercise_quality"], dim=1).item())
    rep_count = max(0, int(np.rint(float(outputs["repetition_count"].squeeze().item()) + 15)))
    rom_progress = float(outputs["rom_progress"].squeeze().item())
    risk_idx = int(torch.argmax(outputs["risk"], dim=1).item())

    # Convert raw heads to user-facing score signal.
    score = np.clip(50 + 0.2 * knee_angle + 0.6 * rom_progress - payload.pain_score * 2.5, 0, 100)
    confidence = float(np.clip(0.6 + (payload.activity_minutes / 600.0) * 0.3, 0.0, 1.0))

    signals = RecoverySignals(
        recovery_score=float(score),
        exercise_quality=_quality_label(quality_idx),
        repetition_count=rep_count,
        rom_progression=rom_progress,
        deterioration_risk=_risk_label(risk_idx),
        confidence=confidence,
    )

    return MLInferenceResponse(
        patient_id=payload.patient_id,
        model_version=MODEL_VERSION,
        pipeline=PIPELINE,
        signals=signals,
        notes="Prototype simulation of the multi-task architecture for demonstration purposes.",
    )
