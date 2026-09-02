# Feature Specification: Repository Hygiene & Secret Security (FEAT-013)

## Feature Overview
- **Feature ID**: FEAT-013
- **Feature Name**: Git Ignore Policy, Environment Secret Protection & Dependency Untracking
- **Status**: Specified (Pending Implementation)
- **Target Role**: Developer, Maintainer

## Purpose & Goal
Prevent sensitive API keys (e.g. `TBA_API_KEY`, `JWT_SECRET`, `MONGODB_URI`), node dependency folders (`node_modules/`), build distributions (`dist/`), temporary logs, and OS artifacts from being committed to Git version control. Ensure all environment secrets remain strictly local and untracked.

## User Stories
- **US-GIT-001 (Prevent Secret Leakage)**: As a developer, I want `.env` files containing secrets (MongoDB URI, JWT secret, TBA API Key) to be ignored by Git so that credentials are never exposed in public or shared code repositories.
- **US-GIT-002 (Exclude Heavy Dependencies)**: As a developer, I want `node_modules/` and build outputs (`dist/`) ignored by Git so repository size remains lightweight and clean.
- **US-GIT-003 (Purge Tracked Secrets)**: As a developer, I want any previously indexed `.env` or `node_modules` entries removed from Git's index cache (`git rm --cached`) without deleting local files.

## Functional Requirements
- **FR-GIT-001**: A root `.gitignore` file shall be created at `/home/gabriela/Documents/codes/first-assist/.gitignore`.
- **FR-GIT-002**: The `.gitignore` policy shall explicitly exclude:
  ```gitignore
  # Environment Variables & Secrets
  .env
  .env.*
  !.env.example

  # Dependencies
  node_modules/
  backend/node_modules/
  frontend/node_modules/

  # Build Outputs
  dist/
  frontend/dist/
  build/

  # Logs & Diagnostics
  *.log
  npm-debug.log*
  yarn-debug.log*

  # OS & IDE Files
  .DS_Store
  .vscode/
  .idea/
  ```
- **FR-GIT-003**: Provide a clean git cache untrack command set (`git rm -r --cached .env node_modules frontend/dist`) to clean index cache.
- **FR-GIT-004**: Create `.env.example` templates for both backend and frontend containing placeholder variable names without actual secrets.
