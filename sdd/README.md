# FIRST Assist — Spec-Driven Development (SDD) Documentation

Welcome to the Spec-Driven Development (SDD) documentation for **FIRST Assist**, a Progressive Web Application (PWA) designed to centralize technical incident reporting and knowledge sharing during FIRST Robotics Competition (FRC) events.

This directory serves as the **single source of truth** for all requirements, architectural decisions, and feature behaviors. 

## SDD Principles
We follow the strict relationship:
`Requirements → Feature Specification → Design → Tasks → Implementation → Tests`

All development tasks should map back to specific functional requirements and features defined in this system.

## Directory Structure
* **[project/](file:///home/gabriela/Documents/codes/first-assist/sdd/project/)** — High-level requirements and alignment:
  * [vision.md](file:///home/gabriela/Documents/codes/first-assist/sdd/project/vision.md): Project vision and academic context.
  * [scope.md](file:///home/gabriela/Documents/codes/first-assist/sdd/project/scope.md): In-scope vs. out-of-scope boundaries.
  * [functional-requirements.md](file:///home/gabriela/Documents/codes/first-assist/sdd/project/functional-requirements.md): Inventory of system functional requirements.
  * [non-functional-requirements.md](file:///home/gabriela/Documents/codes/first-assist/sdd/project/non-functional-requirements.md): System performance, security, and PWA expectations.
  * [constraints.md](file:///home/gabriela/Documents/codes/first-assist/sdd/project/constraints.md): System limitations and academic paper constraints.
  * [traceability.md](file:///home/gabriela/Documents/codes/first-assist/sdd/project/traceability.md): The Requirements Traceability Matrix.
* **[architecture/](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/)** — Overall system architecture:
  * [frontend.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/frontend.md): Vue.js structure, router, state, and visual assets.
  * [backend.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/backend.md): Express controller-service-repository layered patterns.
  * [database.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/database.md): Mongoose schemas and relationships.
  * [api.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/api.md): REST API contracts.
  * [authentication.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/authentication.md): Authentication and authorization flow.
  * [pwa.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/pwa.md): Service worker, cache patterns, offline strategies.
  * [testing.md](file:///home/gabriela/Documents/codes/first-assist/sdd/architecture/testing.md): Unit, integration, and UI testing strategy.
* **[features/](file:///home/gabriela/Documents/codes/first-assist/sdd/features/)** — Feature-specific details. Each feature directory contains:
  * `spec.md`: High-level feature definitions and user stories.
  * `requirements.md`: Mapped functional requirements.
  * `design.md`: Components, workflows, and frontend/backend interactions.
  * `api.md`: Specific API contracts.
  * `scenarios.md`: BDD (Given/When/Then) scenarios.
  * `tasks.md`: Detailed implementation task backlog.
  * `tests.md`: Test plan and scope.
* **[glossary.md](file:///home/gabriela/Documents/codes/first-assist/sdd/glossary.md)** — Project and domain glossary.
