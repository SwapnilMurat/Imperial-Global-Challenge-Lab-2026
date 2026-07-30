export type Role = "patient" | "care-team";

export interface Patient {
  id: string;
  name: string;
  procedure: "hip" | "knee";
  postOpDay: number;
  mission: string;
}

export interface ExerciseTask {
  id: string;
  title: string;
  target: string;
  completed: boolean;
  metric: {
    romDeg: number;
    reps: number;
  };
}

export interface CheckIn {
  painScore: number;
  swellingScore: number;
  woundStatus: "good" | "watch" | "urgent";
  confidence: "low" | "medium" | "high";
  notes?: string;
  submittedAt?: string;
}

export interface ProgressPoint {
  day: number;
  romDeg: number;
  sitToStandReps: number;
  gaitSymmetry: number;
}

export interface Device {
  id: string;
  label: string;
  placement: "thigh" | "shank" | "hub";
  batteryPct: number;
  signalQuality: "excellent" | "good" | "fair" | "poor";
  connected: boolean;
}

export interface CareTeamSummary {
  activePatients: number;
  adherenceRate: number;
  flaggedPatients: number;
  avgRomDelta: number;
}

export interface RecoveryState {
  patient: Patient;
  exercises: ExerciseTask[];
  checkIn: CheckIn | null;
  progress: ProgressPoint[];
  devices: Device[];
  careTeam: CareTeamSummary;
}

export interface SensorFrame {
  timestampMs: number;
  thighAx: number;
  thighAy: number;
  thighAz: number;
  shankAx: number;
  shankAy: number;
  shankAz: number;
  thighGx: number;
  thighGy: number;
  thighGz: number;
  shankGx: number;
  shankGy: number;
  shankGz: number;
}

export interface MLInferenceRequest {
  patientId: string;
  frames: SensorFrame[];
  painScore: number;
  swellingScore: number;
  activityMinutes: number;
  age: number;
  postOpDay: number;
}

export interface MLSignals {
  recoveryScore: number;
  exerciseQuality: "poor" | "fair" | "good" | "excellent";
  repetitionCount: number;
  romProgression: number;
  deteriorationRisk: "low" | "medium" | "high";
  confidence: number;
}

export interface MLInferenceResponse {
  patientId: string;
  modelVersion: string;
  pipeline: string[];
  signals: MLSignals;
  notes?: string;
}

export const kneeAngleFormula = "theta_knee = theta_shank - theta_thigh - theta_cal";
