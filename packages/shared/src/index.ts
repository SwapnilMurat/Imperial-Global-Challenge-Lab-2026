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

export const kneeAngleFormula = "theta_knee = theta_shank - theta_thigh - theta_cal";
