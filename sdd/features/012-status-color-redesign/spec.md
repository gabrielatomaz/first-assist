# Feature Specification: Incident Status Badge Color Scheme Redesign (FEAT-012)

## Feature Overview
- **Feature ID**: FEAT-012
- **Feature Name**: System-wide Incident Status & Priority Color Palette Specification
- **Status**: Specified (Pending Implementation)
- **Target Role**: All Users (FTA, CSA, Admin)

## Purpose & Goal
Redesign status badge colors across `IncidentCard.vue`, `IncidentDetailView.vue`, `DashboardView.vue`, and `TeamProfileView.vue` to strictly adhere to domain semantic meaning:
- `OPEN`: **Teal / Support Blue** (`#4F7F82` / `bg-primaryTeal/10 text-primaryTeal border border-primaryTeal/25`) -> Signifies a clean new ticket waiting for assignment.
- `ASSIGNED`: **Mustard / Gold** (`#DAAB52` / `bg-accentYellow/10 text-accentYellow border border-accentYellow/25`) -> Signifies active volunteer assignment & focus.
- `IN_PROGRESS`: **Purple** (`#6E5F70` / `bg-accentPurple/10 text-accentPurple border border-accentPurple/25`) -> Signifies knowledge, active investigation, and diagnostic work.
- `WAITING`: **Dark Neutral Gray** (`bg-gray-800 text-gray-400 border border-gray-700`) -> Signifies paused state awaiting team response or field queue.
- `RESOLVED`: **Emerald Green** (`bg-green-950/40 text-green-400 border border-green-900/30`) -> Signifies successful resolution and applied fix.
- `CLOSED`: **Soft Slate Gray** (`bg-gray-800/80 text-gray-500 border border-gray-700/50`) -> Archived state.

## Rules & Semantic Standards
- **Coral / Red (`#E85B2F`)**: Strictly reserved for **Critical Priority Alerts** (`priority === 'CRITICAL'` or `'HIGH'`), system error alerts, and connection loss notifications. Never used for non-critical status badges like `OPEN` or `ASSIGNED`.

## User Stories
- **US-CLR-001 (Clear Visual Hierarchy)**: As a volunteer, I want `ASSIGNED` tickets to be highlighted in Gold/Mustard and `OPEN` tickets in Teal, so I can instantly distinguish assigned work from unassigned tickets at a glance.
