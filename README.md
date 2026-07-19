# 🏟️ StadiumOS AI — FIFA World Cup 2026 Smart Stadium Operating Platform

<p align="center">
  <img src="screenshots/landing-page.png" alt="StadiumOS AI Landing Page" width="100%">
</p>

<p align="center">
  <b>An AI-powered Smart Stadium Operations Platform built for FIFA World Cup 2026.</b><br>
  Enhancing fan experience, workforce coordination, venue operations, sustainability, and executive decision-making through Generative AI.
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![Gemini](https://img.shields.io/badge/Google-Gemini-blue?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

---

## 🌍 Vision

Large sporting events like the **FIFA World Cup** involve millions of spectators, thousands of volunteers, security personnel, transportation teams, accessibility coordinators, and executive staff.

Most current stadium systems operate independently.

**StadiumOS AI** unifies every stakeholder into a single intelligent platform powered by **Google Gemini AI**, **Supabase**, and **Next.js**.

---

## 🎯 Challenge Alignment

Built for: **PromptWars Challenge 4 — Smart Stadiums & Tournament Operations**

The platform uses **Generative AI** to improve:
- 🧭 Stadium Navigation
- 👥 Crowd Intelligence
- 🚑 Emergency Response
- 🚆 Transportation
- ♿ Accessibility
- 🌱 Sustainability
- 🌍 Multilingual Assistance
- 🤖 AI Decision Support
- 📊 Executive Operations

---

## 📖 Table of Contents
- [Vision](#-vision)
- [Challenge Alignment](#-challenge-alignment)
- [Application Screenshots](#-application-screenshots)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [User Portals](#-user-portals)
  - [Visitor Portal](#-visitor-portal)
  - [Staff Operations Portal](#-staff-operations-portal)
  - [FIFA Executive Portal](#-fifa-executive-portal)
- [AI Capabilities](#-ai-capabilities)
- [Authentication](#-authentication)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Validation](#-validation)
- [Live Demo](#-live-demo)
- [Repository](#-repository)
- [Developer](#-developer)

---

## 📸 Application Screenshots

### 🏠 Landing Page
![Landing Page](screenshots/landing-page.png)

### 🔐 Login Portal
![Login Page](screenshots/login-page.png)

### 🎟️ Visitor Dashboard
![Visitor Dashboard](screenshots/visitor-dashboard.png)

### 🗺️ Smart Stadium Navigation
![Navigation](screenshots/ticket-navigation.png)

### 🤖 AI Stadium Assistant
![AI Assistant](screenshots/ai-assistant.png)

### 👷 Staff Operations Dashboard
![Staff Dashboard](screenshots/staff-dashboard.png)

### 🏆 FIFA Executive Dashboard
![FIFA Dashboard](screenshots/fifa-dashboard.png)

### 📊 Crowd Intelligence & Analytics
![Analytics](screenshots/analytics-dashboard.png)

---

## 🕹️ System Architecture

```
                     ┌──────────────────────────────┐
                     │      StadiumOS AI Portal     │
                     │      Next.js + React 19      │
                     └─────────────┬────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
      Visitor Portal        Staff Portal        FIFA Executive
              │                    │                    │
              └──────────────┬─────┴────────────────────┘
                             ▼
                  Google Gemini AI Assistant
                             │
                             ▼
                 Supabase Authentication
                             │
                             ▼
                  PostgreSQL + User Profiles
```

---

## 👥 User Portals

### 🎟️ Visitor Portal
Designed to assist football fans with matchday navigation and services:
- AI Stadium Assistant
- Digital Match Tickets & QR Entry Pass
- Merchandise & Food Pre-ordering
- Accessibility Support & Equipment Requests
- Smart Indoor Navigation
- Live Transport & Logistics Guidance

### 👷 Staff Operations Portal
Designed for stadium volunteers, security staff, and venue managers:
- Matchday Operations Control Console
- Real-time Crowd Flow & Bottleneck Monitoring
- Live Alerts & Emergency Squad Dispatching
- Workforce Task Management & Assignment
- Tactical Stadium Map & Corridor Guidance
- Action Search & Telemetry Logs

### 🏆 FIFA Executive Portal
Tournament-wide command console for executive directors:
- Multi-Stadium Operational Command Overview
- Sustainability Analytics & Carbon Footprint Ledger
- Automated AI Response Playbook Approvals
- After-Action Reports (AAR) & Incident Logs
- Venue Comparison & Global Tournament KPIs

---

## 🤖 AI Capabilities
Powered by **Google Gemini API**:
- Role-Specific Operational Assistants (Visitor, Staff, FIFA)
- Natural Language Command Palette (Ctrl + K) & Querying
- Real-time Crowd Density & Bottleneck Risk Analysis
- Automated Emergency & Dispatch Recommendations
- Digital Twin Telemetry Simulation & Incident Lifecycles

---

## 🔒 Authentication

Supports two operating modes:

### Production Mode
- Supabase Authentication
- Email Verification
- Secure Sessions & Row Level Security (RLS)
- Role-based Protected Navigation Layouts

### Demo Mode
Instant demo access for evaluation:
- Visitor Demo
- Staff Demo
- FIFA Executive Board Demo

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (Turbopack) & React 19
- **Language**: TypeScript
- **Styling**: Vanilla CSS, Glassmorphism design system
- **Components & Animation**: Framer Motion, Lucide Icons

### Backend & Database
- **Auth & Database**: Supabase (PostgreSQL, Auth, RLS)

### AI & Analytics
- **Generative AI**: Google Gemini API
- **Data Visualization**: Recharts

---

## ✨ Key Features

- **🧭 Smart Navigation**: Tactical floorplans for medical pods, gates, emergency exits, and staff corridors.
- **🚦 Crowd Intelligence**: Entry queue monitoring, turnstile wait times, and density metrics.
- **🚑 Emergency Operations**: One-touch responder dispatches and real-time incident tracking.
- **🚆 Transportation Logistics**: Live metro schedules, parking shuttle intervals, and road congestion alerts.
- **♿ Accessibility**: Assistive wheelchair dispatch, audio headsets, and sensory room management.
- **🌱 Sustainability**: Waste diversion rates, solar canopy grid load, and carbon neutral ledgers.

---

## 🚀 Installation

Clone the repository:
```bash
git clone https://github.com/SVG700/StadiumOS-AI.git
cd StadiumOS-AI
```

Install dependencies:
```bash
npm install
```

Create environment variables:
```bash
cp .env.example .env.local
```

Run locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Validation

The project passes all enterprise compliance checks with 0 errors and 0 warnings:

```bash
npm run lint
```
✅ ESLint Passed

```bash
npx tsc --noEmit
```
✅ TypeScript Passed

```bash
npm run build
```
✅ Production Build Passed

---

## 🌐 Live Demo

**Application**: [https://stadium-os-ai-topaz.vercel.app/](https://stadium-os-ai-topaz.vercel.app/)

---

## 📂 Repository

**GitHub**: [https://github.com/SVG700/StadiumOS-AI](https://github.com/SVG700/StadiumOS-AI)

---

## 👨‍💻 Developer

**Samhith V Gupta**  
B.Tech Computer Science Engineering  
Presidency University, Bengaluru

- **GitHub**: [https://github.com/SVG700](https://github.com/SVG700)
- **LinkedIn**: [https://www.linkedin.com/in/samhith-v-gupta-302740392](https://www.linkedin.com/in/samhith-v-gupta-302740392)

---

⭐ If you like this project, give this repository a star on GitHub!
