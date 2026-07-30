import type { RecoveryState } from "@recoverai/shared";

export const recoveryState: RecoveryState = {
  patient: {
    id: "pt-001",
    name: "Alex",
    procedure: "knee",
    postOpDay: 18,
    mission: "Regain confidence and complete stairs without support."
  },
  exercises: [
    {
      id: "ex-heel-slide",
      title: "Heel Slides",
      target: "3 sets x 12 reps",
      completed: false,
      metric: { romDeg: 92, reps: 36 }
    },
    {
      id: "ex-sit-stand",
      title: "Sit-to-Stand",
      target: "2 sets x 15 reps",
      completed: false,
      metric: { romDeg: 0, reps: 30 }
    },
    {
      id: "ex-ham-curl",
      title: "Standing Hamstring Curl",
      target: "3 sets x 10 reps",
      completed: true,
      metric: { romDeg: 48, reps: 30 }
    }
  ],
  checkIn: null,
  progress: [
    { day: 10, romDeg: 74, sitToStandReps: 8, gaitSymmetry: 62 },
    { day: 12, romDeg: 79, sitToStandReps: 10, gaitSymmetry: 67 },
    { day: 14, romDeg: 84, sitToStandReps: 12, gaitSymmetry: 71 },
    { day: 16, romDeg: 89, sitToStandReps: 14, gaitSymmetry: 74 },
    { day: 18, romDeg: 92, sitToStandReps: 16, gaitSymmetry: 78 }
  ],
  devices: [
    {
      id: "dev-thigh-imu",
      label: "Thigh IMU",
      placement: "thigh",
      batteryPct: 81,
      signalQuality: "excellent",
      connected: true
    },
    {
      id: "dev-shank-imu",
      label: "Shank IMU",
      placement: "shank",
      batteryPct: 73,
      signalQuality: "good",
      connected: true
    },
    {
      id: "dev-esp32-hub",
      label: "ESP32 Hub",
      placement: "hub",
      batteryPct: 68,
      signalQuality: "good",
      connected: true
    }
  ],
  careTeam: {
    activePatients: 37,
    adherenceRate: 89,
    flaggedPatients: 3,
    avgRomDelta: 11
  }
};
