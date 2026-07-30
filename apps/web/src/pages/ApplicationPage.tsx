import { useEffect, useMemo, useState } from "react";
import type { CheckIn, ExerciseTask } from "@recoverai/shared";
import {
  completeExercise,
  getCareTeam,
  getDevices,
  getLatestCheckIn,
  getPatient,
  getProgress,
  getTodayTasks,
  submitCheckIn
} from "../lib/api";

type Tab = "today" | "exercise" | "check-in" | "progress";
type Role = "patient" | "care-team";
type CheckInDraft = {
  painScore: number;
  swellingScore: number;
  woundStatus: "good" | "watch" | "urgent";
  confidence: "low" | "medium" | "high";
  notes: string;
};

export function ApplicationPage() {
  const [tab, setTab] = useState<Tab>("today");
  const [role, setRole] = useState<Role>("patient");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patient, setPatient] = useState<any>(null);
  const [tasks, setTasks] = useState<ExerciseTask[]>([]);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [devices, setDevices] = useState<any>(null);
  const [care, setCare] = useState<any>(null);

  const [draftCheckIn, setDraftCheckIn] = useState<CheckInDraft>({
    painScore: 3,
    swellingScore: 2,
    woundStatus: "good",
    confidence: "medium",
    notes: ""
  });

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        const [patientData, tasksData, checkInData, progressData, deviceData, careData] = await Promise.all([
          getPatient(),
          getTodayTasks(),
          getLatestCheckIn(),
          getProgress(),
          getDevices(),
          getCareTeam()
        ]);

        if (!mounted) return;

        setPatient(patientData);
        setTasks(tasksData);
        setCheckIn(checkInData);
        setProgress(progressData);
        setDevices(deviceData);
        setCare(careData);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load application data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  async function onCompleteExercise(exerciseId: string) {
    const updated = await completeExercise(exerciseId);
    setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
  }

  async function onSubmitCheckIn() {
    const saved = await submitCheckIn(draftCheckIn);
    setCheckIn(saved);
    setTab("today");
  }

  if (loading) {
    return <main className="app-shell">Loading application...</main>;
  }

  if (error) {
    return <main className="app-shell">Application error: {error}</main>;
  }

  return (
    <main className="app-shell">
      <header className="app-header" aria-label="Patient application navigation">
        <div>
          <h1>RecoverAI Joint</h1>
          <p>What patients and clinicians see</p>
        </div>
        <div className="role-switch">
          <button className={role === "patient" ? "active" : ""} onClick={() => setRole("patient")}>Patient application</button>
          <button className={role === "care-team" ? "active" : ""} onClick={() => setRole("care-team")}>Care-team dashboard</button>
        </div>
      </header>

      <nav className="tab-row">
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>Today</button>
        <button className={tab === "exercise" ? "active" : ""} onClick={() => setTab("exercise")}>Exercise</button>
        <button className={tab === "check-in" ? "active" : ""} onClick={() => setTab("check-in")}>Check-in</button>
        <button className={tab === "progress" ? "active" : ""} onClick={() => setTab("progress")}>Progress</button>
      </nav>

      {role === "patient" && tab === "today" && (
        <section className="card-grid">
          <article className="card">
            <h2>Hello {patient.name}</h2>
            <p>
              Post-op day {patient.postOpDay}. {patient.mission}
            </p>
          </article>
          <article className="card">
            <h2>Daily completion</h2>
            <p>
              {completedCount}/{tasks.length} exercises completed
            </p>
            <p>{checkIn ? "Check-in submitted" : "Check-in pending"}</p>
          </article>
          <article className="card">
            <h2>Model transparency</h2>
            <p>{patient.model.style}</p>
            <p>{patient.model.formula}</p>
          </article>
        </section>
      )}

      {role === "patient" && tab === "exercise" && (
        <section className="card-grid">
          {tasks.map((task) => (
            <article className="card" key={task.id}>
              <h2>{task.title}</h2>
              <p>{task.target}</p>
              <p>ROM: {task.metric.romDeg} deg | Reps: {task.metric.reps}</p>
              <button disabled={task.completed} onClick={() => onCompleteExercise(task.id)}>
                {task.completed ? "Completed" : "Mark complete"}
              </button>
            </article>
          ))}
        </section>
      )}

      {role === "patient" && tab === "check-in" && (
        <section className="card-grid">
          <article className="card form-card">
            <h2>Complete today's check-in</h2>
            <label>
              Pain score (0-10)
              <input
                type="number"
                min={0}
                max={10}
                value={draftCheckIn.painScore}
                onChange={(e) => setDraftCheckIn((prev) => ({ ...prev, painScore: Number(e.target.value) }))}
              />
            </label>
            <label>
              Swelling score (0-10)
              <input
                type="number"
                min={0}
                max={10}
                value={draftCheckIn.swellingScore}
                onChange={(e) => setDraftCheckIn((prev) => ({ ...prev, swellingScore: Number(e.target.value) }))}
              />
            </label>
            <label>
              Wound status
              <select
                value={draftCheckIn.woundStatus}
                onChange={(e) =>
                  setDraftCheckIn((prev) => ({ ...prev, woundStatus: e.target.value as "good" | "watch" | "urgent" }))
                }
              >
                <option value="good">Good</option>
                <option value="watch">Watch</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label>
              Confidence
              <select
                value={draftCheckIn.confidence}
                onChange={(e) =>
                  setDraftCheckIn((prev) => ({ ...prev, confidence: e.target.value as "low" | "medium" | "high" }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Notes
              <textarea
                rows={4}
                value={draftCheckIn.notes}
                onChange={(e) => setDraftCheckIn((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </label>
            <button onClick={onSubmitCheckIn}>Submit check-in</button>
          </article>
        </section>
      )}

      {role === "patient" && tab === "progress" && (
        <section className="card-grid">
          <article className="card">
            <h2>Recovery trend</h2>
            {progress.points.map((point: any) => (
              <p key={point.day}>
                Day {point.day}: ROM {point.romDeg} deg, Sit-to-stand {point.sitToStandReps}, Symmetry {point.gaitSymmetry}%
              </p>
            ))}
          </article>
          <article className="card">
            <h2>Connected devices</h2>
            <p>{devices.architecture}</p>
            {devices.devices.map((device: any) => (
              <p key={device.id}>
                {device.label}: {device.signalQuality}, battery {device.batteryPct}%
              </p>
            ))}
          </article>
        </section>
      )}

      {role === "care-team" && (
        <section className="card-grid">
          <article className="card">
            <h2>Care-team overview</h2>
            <p>Active patients: {care.activePatients}</p>
            <p>Adherence rate: {care.adherenceRate}%</p>
            <p>Flagged patients: {care.flaggedPatients}</p>
            <p>Average ROM delta: +{care.avgRomDelta} deg</p>
          </article>
          <article className="card">
            <h2>Patient spotlight</h2>
            <p>{patient.name}, day {patient.postOpDay}</p>
            <p>
              Completed {completedCount}/{tasks.length} exercises and latest ROM {progress.metrics.romLatest} deg.
            </p>
            <p>Trajectory trend: {progress.metrics.trend}</p>
          </article>
        </section>
      )}
    </main>
  );
}
