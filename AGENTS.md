# Project Rules & Context: Orcathon

## Critical Constraints
- **NEVER push (`git push`) to remote repository without explicit confirmation and informing the user first.**
- **Branch Discipline**: From now on, **never push directly to `main`**. All work must be committed and pushed to dedicated feature branches:
  - Backend: `backend`
  - Frontend (Akash): `frontend` (or `frontend/akash`)
  - Integration: `integration`
- This project is developed for a **hackathon** (Orcathon 2026). Focus on high velocity, polished UI/UX, and robust demo capabilities.


## Team & Collaboration Strategy
- **Team**: Aradhya (Backend, Detection Engine & Adaption) & Akash (Frontend, Visualization & Demo)
- **Work Division ("Contract-First Development")**:
  - Clear separation of responsibilities (Frontend vs. Backend).
  - Strict API contract defined in `contracts/api-contract.md` (shared types, request/response schemas, mock datasets).
  - Keep folder structures clean and decoupled (`backend/` and `frontend/`).

## Branching & Safety Checkpoint Strategy
- **Frequent Branching Policy**: It does not matter how many branches we create. Branches are safety nets so we never lose work if something breaks and we need to rollback.
- **"Clone" Command Workflow**:
  Whenever the user says **"clone"**:
  1. Create a new branch with a clear, descriptive name (e.g. `checkpoint/<descriptive-name>-<date/time>` or feature name).
  2. Stage and commit all existing local changes with an informative commit message.
  3. Push that checkpoint branch to remote so the state is backed up in the cloud.
  4. Bring/clone/pull the remote files into the workspace as requested.

## Repository Details
- **Remote URL**: `https://github.com/aradhyags7/Orcathon.git`
- **Owner**: `aradhyags7`
- **Repository**: `Orcathon`
