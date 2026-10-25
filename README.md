# DeceptiTrace — Cyber Deception & Attack-Path Reconstruction

**Orcathon Track 3: Cybersecurity & Blockchain**  
Team: **Aradhya** (Backend, Detection Engine & Adaption) & **Akash** (Frontend, Visualization & Demo)

---

## Overview

**DeceptiTrace** is a cyber-deception and attack-path reconstruction platform. It deploys high-fidelity decoy assets (canary tokens, decoy payroll archives, honey credentials) across simulated network topology. When an attacker engages with any decoy asset, DeceptiTrace captures telemetry, triggers high-priority alerts, and reconstructs the end-to-end multi-hop intrusion timeline on an interactive telemetry graph.

> **Detection Fidelity Note**: Any interaction with a decoy is treated as high-confidence in this simulation (near-zero false positives by design for dedicated canary assets).

---

## Architecture & Work Division

```
Orcathon/
├── contracts/          # Strict API contract & sample JSON (single source of truth)
├── backend/            # FastAPI detection engine, in-memory store, Adaption integration
└── frontend/           # React + TypeScript cybersecurity dashboard & attack-path graph
```

- **Backend (Aradhya)**: FastAPI, deterministic decoy detection engine, incident reconstruction, Adaption integration.
- **Frontend (Akash)**: React 18, TypeScript, SVG topology visualizer, alert feed, and simulation controls.

---

## Quickstart

### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard: `http://localhost:5173`
