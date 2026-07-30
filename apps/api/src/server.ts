import cors from "cors";
import express from "express";
import { z } from "zod";
import { kneeAngleFormula } from "@recoverai/shared";
import { recoveryState } from "./mockData.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

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

app.listen(port, () => {
  console.log(`RecoverAI Joint API listening on http://localhost:${port}`);
});
