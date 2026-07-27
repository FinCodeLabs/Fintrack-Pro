<div align="center">

# 💎 FinTrack Pro

**Modern, AI-Powered Personal Financial Management & Analytics Web Application**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Website-007ACC?style=for-the-badge&logo=googlechrome&logoColor=white)](https://fincodelabs.github.io/Fintrack-Pro/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

</div>

---

## 📌 Overview

**FinTrack Pro** is a full-stack, AI-powered personal financial intelligence web application. It gives users real-time visibility into income, expenses, monthly budgets, savings goals, and overall financial health through an elegant dark-theme glassmorphism interface.

Whether hosted locally or running statically on GitHub Pages, FinTrack Pro offers seamless user authentication, full client-side data persistence, interactive financial charts, AI insights, and customizable currency options.

---

## ✨ Features

- 🔐 **User Authentication & Accounts**: Register custom user profiles or sign in with credentials. Supports multi-user profiles, custom currencies (USD `$`, EUR `€`, GBP `£`, INR `₹`, CAD `$`, AUD `$`), and 1-click instant demo mode.
- 📊 **Interactive Analytics & Charts**: Real-time cash flow breakdown, category distributions, income vs. expense trends using dynamic Recharts.
- 🤖 **AI Assistant & Automated Insights**: Automated budget threshold warnings, spending habits analysis, and intelligent savings recommendations.
- 💳 **Transaction Management**: Search, filter, categorize, and log transactions with custom modal forms and instant updates.
- 🎯 **Budgeting & Savings Tracker**: Set monthly target budgets per category, track goal progress milestones, and calculate deposit projections.
- 💾 **Offline & Web Persistence**: Full client-side `localStorage` data persistence so visitors on the live website can use all features seamlessly without needing a backend server running locally.
- 🌙 **Glassmorphism Dark UI**: Rich dark mode styling, smooth micro-interactions, responsive sidebars, and clean modal dialogs.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 + Custom Glassmorphism Styling
- **State Management**: Zustand
- **Charts & Icons**: Recharts + Lucide React

### Backend (Local API Service)
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite / SQLAlchemy ORM
- **Containerization**: Docker & Docker Compose

---

## 🚀 Live Demo & Getting Started

### 🌐 Live Website (GitHub Pages)
Access the live interactive application immediately in your browser:  
👉 **[https://fincodelabs.github.io/Fintrack-Pro/](https://fincodelabs.github.io/Fintrack-Pro/)**

---

### 💻 Local Development Setup

#### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ (for local backend development)

#### 1. Clone the repository
```bash
git clone https://github.com/FinCodeLabs/Fintrack-Pro.git
cd Fintrack-Pro
```

#### 2. Start Frontend
```bash
cd fintrack-pro/frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

#### 3. Start Backend (Optional API Server)
```bash
cd fintrack-pro/backend
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
*Backend API runs at `http://localhost:8000` (Swagger Docs at `http://localhost:8000/docs`).*

---

## 🐳 Docker Setup

Launch the frontend and backend together using Docker Compose:

```bash
docker-compose -f fintrack-pro/docker/docker-compose.yml up --build
```

---

## 📂 Project Structure

```text
Fintrack-Pro/
├── .github/
│   └── workflows/          # GitHub Actions automated deployment workflow
├── docs/                   # Compiled GitHub Pages static web application
├── fintrack-pro/           # Primary application source folder
│   ├── backend/           # FastAPI backend service & endpoints
│   ├── docker/            # Dockerfiles & docker-compose config
│   └── frontend/          # React + Vite + TypeScript web application
│       ├── src/
│       │   ├── components/# Reusable UI & Layout components
│       │   ├── pages/     # Dashboard, Transactions, Budgets, Savings, Login
│       │   ├── store/     # Zustand state stores & auth management
│       │   └── types/     # TypeScript interfaces & models
├── .gitignore
├── LICENSE                 # License terms
└── README.md
```

---

## 📄 License

Copyright © 2026 **FinCodeLabs**. All Rights Reserved. Proprietary and Confidential.  
See [LICENSE](./LICENSE) for details.
