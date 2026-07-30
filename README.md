# RecoverAI Joint - GCL 2026 Codebase

This repository contains a complete implementation of the RecoverAI Joint demo described in:

- RecoverAI_Joint_GCL2026.pptx.pdf
- https://recoverai-joint-demo.swapnilsrivastava199.chatgpt.site/
- https://recoverai-joint-demo.swapnilsrivastava199.chatgpt.site/application

It includes:

- Marketing/vision landing page
- Patient application experience
- Care-team dashboard mode
- Mock API for recovery signals, exercises, check-ins, and devices
- Shared schema layer aligned to the architecture

## Architecture

The implemented architecture follows the deck's system narrative:

1. Two wearable IMUs on leg segments (thigh + shank)
2. Sensor stream to an ESP32 hub
3. Shared data schema used by both patient and clinician experiences
4. Explainable trajectory model and clear, non-black-box outputs

Core equation included in the model context:

theta_knee = theta_shank - theta_thigh - theta_cal

## Project Structure

```
.
├── apps
│   ├── api
│   │   └── src
│   │       ├── mockData.ts
│   │       └── server.ts
│   └── web
│       ├── index.html
│       └── src
│           ├── App.tsx
│           ├── lib/api.ts
│           ├── main.tsx
│           ├── pages/ApplicationPage.tsx
│           ├── pages/LandingPage.tsx
│           └── styles.css
├── packages
│   └── shared
│       └── src/index.ts
└── README.md
```

## Pages and Routes

- `/`:
	- Hero and product story
	- Anchors: `#how-it-works`, `#system`, `#opportunity`
	- CTA: Launch application
- `/application`:
	- Patient view tabs: Today, Exercise, Check-in, Progress
	- Role switch: Patient application / Care-team dashboard

## API Endpoints

Base URL: `http://localhost:8787/api`

- `GET /health`
- `GET /patient`
- `GET /tasks/today`
- `POST /exercise/complete`
- `GET /checkin`
- `POST /checkin`
- `GET /progress`
- `GET /devices`
- `GET /care-team`

## Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Run API and web app

Use separate terminals:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Then open:

- Web app: http://localhost:5173
- API: http://localhost:8787/api/health

## Notes on Scope

This implementation is a prototype simulation, consistent with the presentation framing.
It is not a medical device and does not provide diagnosis or treatment instructions.

