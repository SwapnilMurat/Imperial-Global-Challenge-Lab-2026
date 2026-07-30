import type { CareTeamSummary, CheckIn, Device, ExerciseTask, Patient, ProgressPoint } from "@recoverai/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...init
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed for ${path}`);
  }

  return res.json() as Promise<T>;
}

export function getPatient() {
  return request<Patient & { model: { style: string; formula: string } }>("/patient");
}

export function getTodayTasks() {
  return request<ExerciseTask[]>("/tasks/today");
}

export function completeExercise(exerciseId: string) {
  return request<ExerciseTask>("/exercise/complete", {
    method: "POST",
    body: JSON.stringify({ exerciseId })
  });
}

export function submitCheckIn(payload: Omit<CheckIn, "submittedAt">) {
  return request<CheckIn>("/checkin", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getLatestCheckIn() {
  return request<CheckIn | null>("/checkin");
}

export function getProgress() {
  return request<{ points: ProgressPoint[]; metrics: { romLatest: number; adherence: number; trend: string } }>("/progress");
}

export function getDevices() {
  return request<{ architecture: string; devices: Device[] }>("/devices");
}

export function getCareTeam() {
  return request<CareTeamSummary>("/care-team");
}
