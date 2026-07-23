# FinTrack Pro 🚀

> **FinTrack Pro** is a modern, full-stack, AI-powered personal financial management application designed to give you real-time visibility into your income, expenses, budgets, savings goals, and financial health.

![FinTrack Pro](/docs/screenshot-placeholder.png) <!-- Replace with actual screenshot if available -->

---

## ✨ Features

- 📊 **Interactive Financial Analytics**: Visualize cash flow, category breakdowns, income vs. expense trends, and savings progress with dynamic Recharts.
- 🤖 **AI Financial Assistant & Insights**: Smart AI-driven financial insights and conversational guidance for personalized budget recommendations.
- 💳 **Transaction Management**: Filter, search, categorize, and log transactions with custom modal forms and instant updates.
- 🎯 **Budgeting & Savings Tracker**: Set monthly target budgets, track goal milestones, and receive instant progress feedback.
- 📥 **Data Export**: Export transaction histories and financial reports cleanly to CSV/PDF.
- 🌙 **Glassmorphism Dark Mode**: Crafted with rich dark-theme styling, smooth animations, and custom scrollbars for a premium user experience.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + Custom Glassmorphism CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts & Icons**: [Recharts](https://recharts.org/) + [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: SQLite / SQLAlchemy ORM
- **Containerization**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ (for local backend development)
- **Docker** (optional, for containerized setup)

---

### Local Development Setup

#### 1. Clone the repository
```bash
git clone https://github.com/FinCodeLabs/Fintrack-Pro.git
cd Fintrack-Pro
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run at `http://localhost:5173`.*

#### 3. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The backend API will run at `http://localhost:8000` (Docs at `http://localhost:8000/docs`).*

---

## 🐳 Docker Deployment

To launch the complete application stack with Docker Compose:

```bash
docker-compose -f docker/docker-compose.yml up --build
```

---

## 📂 Project Structure

```text
Fintrack-Pro/
├── frontend/               # React + Vite + TypeScript web application
│   ├── src/
│   │   ├── components/    # Reusable UI & Layout components
│   │   ├── features/      # Feature modules (analytics, auth, dashboard, insights, transactions)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand global state stores
│   │   └── index.css      # Core design system & CSS utilities
├── backend/                # FastAPI backend service
│   ├── app/
│   │   ├── api/           # API endpoints (v1)
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic services
├── docker/                 # Dockerfiles & docker-compose configuration
└── README.md
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.
