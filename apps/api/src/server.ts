import cors from "cors";
import express from "express";
import { z } from "zod";
import type { MLInferenceResponse, SensorFrame } from "@recoverai/shared";
import { kneeAngleFormula } from "@recoverai/shared";
import { recoveryState } from "./mockData.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const mlServiceUrl = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "recoverai-joint-api" });
});

app.get("/api/patient", (_req, res) => {
  res.json({
    ...recoveryState.patient,
    model: {
      style: "explainable trajectory",
      formula: kneeAngleFormula
    }
  });
});

app.get("/api/tasks/today", (_req, res) => {
  res.json(recoveryState.exercises);
});

app.post("/api/exercise/complete", (req, res) => {
  const schema = z.object({ exerciseId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid exercise payload." });
  }

  const task = recoveryState.exercises.find((item) => item.id === parsed.data.exerciseId);

  if (!task) {
    return res.status(404).json({ message: "Exercise not found." });
  }

  task.completed = true;
  return res.json(task);
});

app.post("/api/checkin", (req, res) => {
  const schema = z.object({
    painScore: z.number().min(0).max(10),
    swellingScore: z.number().min(0).max(10),
    woundStatus: z.enum(["good", "watch", "urgent"]),
    confidence: z.enum(["low", "medium", "high"]),
    notes: z.string().max(280).optional()
  });

  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid check-in payload." });
  }

  recoveryState.checkIn = {
    ...parsed.data,
    submittedAt: new Date().toISOString()
  };

  return res.status(201).json(recoveryState.checkIn);
});

app.get("/api/checkin", (_req, res) => {
  res.json(recoveryState.checkIn);
});

app.get("/api/progress", (_req, res) => {
  res.json({
    points: recoveryState.progress,
    metrics: {
      romLatest: recoveryState.progress[recoveryState.progress.length - 1].romDeg,
      adherence: recoveryState.careTeam.adherenceRate,
      trend: "improving"
    }
  });
});

app.get("/api/devices", (_req, res) => {
  res.json({
    architecture: "Two IMUs on leg (thigh + shank) -> ESP32 hub -> shared schema",
    devices: recoveryState.devices
  });
});

app.get("/api/care-team", (_req, res) => {
  res.json(recoveryState.careTeam);
});

function generateDemoFrames(total: number = 160): SensorFrame[] {
  const baseTime = Date.now();
  const frames: SensorFrame[] = [];

  for (let i = 0; i < total; i++) {
    const t = i / 20;
    frames.push({
      timestampMs: baseTime + i * 50,
      thighAx: Math.sin(t) * 0.3,
      thighAy: 0.2 + Math.cos(t * 0.8) * 0.1,
      thighAz: 1 + Math.sin(t * 1.2) * 0.05,
      shankAx: Math.sin(t + 0.4) * 0.35,
      shankAy: 0.2 + Math.cos(t) * 0.1,
      shankAz: 1 + Math.sin(t * 1.1) * 0.05,
      thighGx: Math.sin(t * 1.7) * 18,
      thighGy: Math.cos(t * 1.2) * 12,
      thighGz: Math.sin(t * 1.5) * 10,
      shankGx: Math.sin(t * 2) * 26,
      shankGy: Math.cos(t * 1.3) * 14,
      shankGz: Math.sin(t * 1.4) * 11
    });
  }

  return frames;
}

app.post("/api/ml/infer", async (_req, res) => {
  try {
    const latestCheckIn = recoveryState.checkIn;
    const payload = {
      patient_id: recoveryState.patient.id,
      frames: generateDemoFrames().map((f) => ({
        timestamp_ms: f.timestampMs,
        thigh_ax: f.thighAx,
        thigh_ay: f.thighAy,
        thigh_az: f.thighAz,
        shank_ax: f.shankAx,
        shank_ay: f.shankAy,
        shank_az: f.shankAz,
        thigh_gx: f.thighGx,
        thigh_gy: f.thighGy,
        thigh_gz: f.thighGz,
        shank_gx: f.shankGx,
        shank_gy: f.shankGy,
        shank_gz: f.shankGz
      })),
      pain_score: latestCheckIn?.painScore ?? 3,
      swelling_score: latestCheckIn?.swellingScore ?? 2,
      activity_minutes: 36,
      age: 62,
      post_op_day: recoveryState.patient.postOpDay
    };

    const mlRes = await fetch(`${mlServiceUrl}/infer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!mlRes.ok) {
      throw new Error(`ML service returned ${mlRes.status}`);
    }

    const raw = (await mlRes.json()) as {
      patient_id: string;
      model_version: string;
      pipeline: string[];
      signals: {
        recovery_score: number;
        exercise_quality: "poor" | "fair" | "good" | "excellent";
        repetition_count: number;
        rom_progression: number;
        deterioration_risk: "low" | "medium" | "high";
        confidence: number;
      };
      notes?: string;
    };

    const response: MLInferenceResponse = {
      patientId: raw.patient_id,
      modelVersion: raw.model_version,
      pipeline: raw.pipeline,
      signals: {
        recoveryScore: raw.signals.recovery_score,
        exerciseQuality: raw.signals.exercise_quality,
        repetitionCount: raw.signals.repetition_count,
        romProgression: raw.signals.rom_progression,
        deteriorationRisk: raw.signals.deterioration_risk,
        confidence: raw.signals.confidence
      },
      notes: raw.notes
    };

    return res.json(response);
  } catch {
    return res.json({
      patientId: recoveryState.patient.id,
      modelVersion: "fallback-sim-v1",
      pipeline: ["fallback simulation"],
      signals: {
        recoveryScore: 82,
        exerciseQuality: "good",
        repetitionCount: 16,
        romProgression: 2.4,
        deteriorationRisk: "low",
        confidence: 0.74
      },
      notes: "ML service unavailable, returned API fallback signal."
    } satisfies MLInferenceResponse);
  }
});

app.listen(port, () => {
  console.log(`RecoverAI Joint API listening on http://localhost:${port}`);
});
