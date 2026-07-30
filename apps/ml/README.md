# RecoverAI Joint ML Service

This service deploys the architecture shown in the RecoverAI Joint ML diagram:

1. Data ingestion and synchronization
2. Signal processing and segmentation
3. Feature engineering
4. Multi-task model (1D CNN + Bi-LSTM + Transformer)
5. Outputs for recovery score, quality, reps, ROM progression, and risk alerts

## Endpoints

- `GET /health`
- `POST /infer`

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Example request

```json
{
  "patient_id": "pt-001",
  "frames": [
    {
      "timestamp_ms": 1,
      "thigh_ax": 0.1,
      "thigh_ay": 0.1,
      "thigh_az": 1.0,
      "shank_ax": 0.2,
      "shank_ay": 0.1,
      "shank_az": 1.0,
      "thigh_gx": 10,
      "thigh_gy": 7,
      "thigh_gz": 5,
      "shank_gx": 14,
      "shank_gy": 8,
      "shank_gz": 6
    }
  ],
  "pain_score": 3,
  "swelling_score": 2,
  "activity_minutes": 36,
  "age": 62,
  "post_op_day": 18
}
```
