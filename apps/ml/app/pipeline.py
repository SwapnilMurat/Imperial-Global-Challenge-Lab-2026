from __future__ import annotations

import numpy as np
from scipy.signal import butter, filtfilt

from .schemas import MLInferenceRequest


def _lowpass(data: np.ndarray, fs: float = 50.0, cutoff: float = 4.0) -> np.ndarray:
    b, a = butter(N=2, Wn=cutoff / (0.5 * fs), btype="low")
    return filtfilt(b, a, data, axis=0)


def _sync_and_sort(raw: MLInferenceRequest) -> np.ndarray:
    # Time synchronization step in the architecture: enforce timestamp ordering.
    sorted_frames = sorted(raw.frames, key=lambda f: f.timestamp_ms)
    matrix = np.array(
        [
            [
                f.thigh_ax,
                f.thigh_ay,
                f.thigh_az,
                f.shank_ax,
                f.shank_ay,
                f.shank_az,
                f.thigh_gx,
                f.thigh_gy,
                f.thigh_gz,
                f.shank_gx,
                f.shank_gy,
                f.shank_gz,
            ]
            for f in sorted_frames
        ],
        dtype=np.float32,
    )
    return matrix


def _segment_windows(data: np.ndarray, window: int = 64, stride: int = 16) -> np.ndarray:
    if len(data) < window:
        pad = np.repeat(data[-1:, :], window - len(data), axis=0)
        data = np.concatenate([data, pad], axis=0)

    windows = []
    for start in range(0, len(data) - window + 1, stride):
        windows.append(data[start : start + window])

    return np.stack(windows, axis=0)


def build_input_features(raw: MLInferenceRequest) -> tuple[np.ndarray, np.ndarray]:
    synced = _sync_and_sort(raw)
    filtered = _lowpass(synced)
    windows = _segment_windows(filtered)

    # Time-domain + frequency-domain aggregate features.
    td_mean = windows.mean(axis=1)
    td_std = windows.std(axis=1)
    fft_energy = np.square(np.abs(np.fft.rfft(windows, axis=1))).mean(axis=1)
    engineered = np.concatenate([td_mean, td_std, fft_energy], axis=1)

    static = np.array(
        [
            raw.pain_score,
            raw.swelling_score,
            raw.activity_minutes,
            raw.age,
            raw.post_op_day,
        ],
        dtype=np.float32,
    )

    return windows.astype(np.float32), np.concatenate([engineered.mean(axis=0), static], axis=0)
