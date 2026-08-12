# FIRST Assist

**FIRST Assist** is a Progressive Web Application (PWA) designed to centralize technical incident reporting and knowledge sharing during FIRST Robotics Competition (FRC) events. It empowers FIRST Technical Advisors (FTAs) and Control System Advisors (CSAs) with real-time incident tracking and AI-powered troubleshooting suggestions.

## 🏗️ Architecture

The project follows a monorepo structure with two independent applications:

```
first-assist/
├── backend/          # Node.js REST API (Express + MongoDB)
├── frontend/         # Vue.js 3 PWA (Vite + TailwindCSS)
└── sdd/              # SDD Specification Documents
```

### Backend Pattern
The backend follows the **Controller → Service → Repository** pattern organized by domain:

```
backend/
├── server.js                          # Entry point
├── package.json
└── src/
    ├── app.js                         # Express app setup
    ├── config/
    │   └── database.js                # MongoDB connection
    ├── models/
    │   ├── Incident.js                # Mongoose schema
    │   └── AISuggestion.js            # Mongoose schema
    ├── repositories/
    │   ├── incidentRepository.js      # Data access layer
    │   └── aiSuggestionRepository.js
    ├── services/
    │   └── incidentService.js         # Business logic
    ├── controllers/
    │   └── incidentController.js      # HTTP request handling
    └── routes/
        └── incidentRoutes.js          # Route definitions
```

### Frontend Pattern
The frontend follows the **play-first** Vue pattern with barrel exports and separated route definitions:

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── public/
│   ├── manifest.json                  # PWA manifest
│   └── sw.js                          # Service Worker
└── src/
    ├── main.js                        # App entry + SW registration
    ├── index.css                      # TailwindCSS directives
    ├── App.vue                        # Root component
    ├── components/
    │   ├── IncidentCard.vue
    │   └── index.js                   # Barrel export
    ├── views/
    │   ├── DashboardView.vue
    │   ├── IncidentCreateView.vue
    │   └── index.js                   # Barrel export
    ├── router/
    │   ├── index.js                   # Router initialization
    │   └── routes.js                  # Route definitions
    └── mock/
        └── index.js                   # Centralized mock data
```

---

## ⚙️ Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A MongoDB instance (local or cloud via [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gabrielatomaz/first-assist.git
cd first-assist
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server (runs on http://localhost:3000)
npm start
```

The backend API will be available at `http://localhost:3000`.

#### Available API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/incidents` | List all incidents |
| `POST` | `/api/incidents` | Create a new incident |
| `PATCH` | `/api/incidents/:id/status` | Update incident status |
| `GET` | `/api/incidents/:id/ai-suggestions` | Get AI diagnostic suggestions |

### 3. Frontend Setup

```bash
# Navigate to the frontend directory (from the project root)
cd frontend

# Install dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

The frontend app will be available at `http://localhost:5173`.

> **Note:** Make sure the backend is running on port 3000 before starting the frontend so that the API calls work correctly.

---

## 📱 PWA Support

FIRST Assist is a Progressive Web App. On supported browsers:

- You can **install** it to your home screen or desktop.
- It works **offline** with cached assets via the Service Worker.
- It uses a **standalone display mode**, giving it a native app feel.

---

## 🎨 Design System

The color palette is derived from the visual identity presented in the academic paper's diagrams (DSR Stages, Timelines):

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Navy | `#1F3A52` | Navigation, headings, primary text |
| Teal | `#3A8B8C` | Primary buttons, active links |
| Coral | `#E66A4E` | OPEN status badges, alerts |
| Yellow | `#DCA951` | INVESTIGATING status badges |
| Purple | `#7A5B73` | AI-related UI elements |
| Light Blue | `#D0E8EA` | Tags, subtle highlights |
| Cream | `#F7F6F0` | Main app background |

---

## 📄 SDD Specifications

All Spec-Driven Development (SDD) documents are located in the `sdd/` directory:

- `user_stories.md` — Epics and user stories
- `sdd_specifications.md` — Consolidated technical specifications
- `spec_authentication.md` — Authentication & role management
- `spec_incident_creation.md` — Incident reporting (text & voice)
- `spec_dashboard_tracking.md` — Real-time dashboard & tracking
- `spec_ai_troubleshooting.md` — AI-powered troubleshooting
- `spec_knowledge_base.md` — Knowledge base & history
- `frontend_design_system.md` — Frontend design system & colors

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue.js 3, Vite, TailwindCSS, Vue Router, Pinia |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| PWA | Service Worker, Web App Manifest |

---

## 📝 License

This project is developed as part of a university final paper.
