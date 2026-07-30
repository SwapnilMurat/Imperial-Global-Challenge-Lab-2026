from __future__ import annotations

import torch
from torch import nn


class TemporalExtractor(nn.Module):
    def __init__(self, input_channels: int = 12, hidden: int = 64) -> None:
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(input_channels, hidden, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv1d(hidden, hidden, kernel_size=3, padding=1),
            nn.ReLU(),
        )
        self.bilstm = nn.LSTM(hidden, hidden // 2, batch_first=True, bidirectional=True)
        layer = nn.TransformerEncoderLayer(d_model=hidden, nhead=4, batch_first=True)
        self.transformer = nn.TransformerEncoder(layer, num_layers=2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [batch, time, features]
        x = x.transpose(1, 2)
        x = self.conv(x)
        x = x.transpose(1, 2)
        x, _ = self.bilstm(x)
        x = self.transformer(x)
        return x.mean(dim=1)


class MultiTaskRecoveryModel(nn.Module):
    def __init__(self, static_dim: int, trunk_dim: int = 64) -> None:
        super().__init__()
        self.temporal = TemporalExtractor()
        fusion_in = trunk_dim + static_dim
        self.fusion = nn.Sequential(nn.Linear(fusion_in, 128), nn.ReLU(), nn.Dropout(0.1))

        # Multi-task heads from the architecture.
        self.knee_angle_head = nn.Linear(128, 1)
        self.exercise_quality_head = nn.Linear(128, 4)
        self.repetition_count_head = nn.Linear(128, 1)
        self.rom_progress_head = nn.Linear(128, 1)
        self.risk_head = nn.Linear(128, 3)

    def forward(self, windows: torch.Tensor, static_features: torch.Tensor) -> dict[str, torch.Tensor]:
        trunk = self.temporal(windows)
        fused = torch.cat([trunk, static_features], dim=1)
        latent = self.fusion(fused)
        return {
            "knee_angle": self.knee_angle_head(latent),
            "exercise_quality": self.exercise_quality_head(latent),
            "repetition_count": self.repetition_count_head(latent),
            "rom_progress": self.rom_progress_head(latent),
            "risk": self.risk_head(latent),
        }
