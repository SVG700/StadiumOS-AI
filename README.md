# ⚽ StadiumOS AI
### AI-Powered Smart Stadium Operations Platform for FIFA World Cup 2026

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-success)

</p>

---

# 🌍 Overview

**StadiumOS AI** is an AI-powered Smart Stadium Management Platform built for the **FIFA World Cup 2026**.

It unifies:

- 👥 Spectator Experience
- 🏟 Stadium Operations
- 🌎 FIFA Executive Monitoring

into a single intelligent platform powered by **Google Gemini AI**, **Supabase**, **Next.js**, and real-time operational simulations.

The platform helps reduce crowd congestion, improve accessibility, streamline transportation, assist stadium staff, and provide executives with live operational intelligence.

---

# 🎯 Challenge Alignment

Built for:

> **PromptWars Challenge 4 — Smart Stadiums & Tournament Operations**

The solution addresses:

- ✅ Crowd Management
- ✅ Indoor Navigation
- ✅ Accessibility Assistance
- ✅ Sustainability
- ✅ Transportation
- ✅ Emergency Operations
- ✅ AI Decision Support
- ✅ Multilingual Fan Assistance
- ✅ Stadium Intelligence

---

# ✨ Key Features

## 👤 Visitor Portal

Designed for football fans attending matches.

### Features

- 🎫 Digital Match Tickets
- 🤖 FIFA Fan AI Assistant (Gemini)
- 🗺 Indoor Smart Navigation
- 🚇 Public Transport Guidance
- 🍔 Food Pre-ordering
- 🛍 Merchandise Reservations
- ♿ Accessibility Requests
- 🔔 Personalized Notifications
- 🌱 Sustainability Dashboard
- 👤 Profile Management

---

## 🏟 Staff Operations Portal

Built for stadium volunteers and operations teams.

### Features

- 📊 Live Crowd Monitoring
- 🚨 Emergency Dispatch
- 🚇 Transport Operations
- ♿ Accessibility Desk
- 🤖 AI Operations Assistant
- 📍 Staff Navigation Console
- 📈 Operational Analytics
- 🔔 Live Alerts

---

## 🌎 FIFA Executive Portal

Designed for tournament organizers.

### Features

- 🌍 Multi-Stadium Monitoring
- 📈 Tournament Analytics
- ⚡ Digital Twin Simulation
- 🌱 Sustainability Reports
- 📊 Executive Dashboards
- 🤖 AI Insights
- 📄 Incident Reports

---

# 🤖 AI Features

Powered by **Google Gemini AI**

The AI assistant provides:

- Stadium Navigation
- Operational Recommendations
- Emergency Guidance
- Accessibility Support
- Fan Assistance
- Match Information
- Context-Aware Conversations

---

# 🏗 Architecture

```
                         StadiumOS AI

           ┌──────────────────────────────────┐
           │        Next.js Frontend          │
           └──────────────┬───────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼

 Visitor Portal     Staff Portal      FIFA Portal

        │                 │                 │
        └──────────────┬────────────────────┘
                       ▼

              Stadium Context Engine

                       ▼

          Google Gemini AI Assistant

                       ▼

               Supabase Backend

          Authentication • Database

```

---

# 🛠 Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Framer Motion
- Lucide Icons

### Backend

- Supabase Authentication
- Supabase Database

### AI

- Google Gemini API

### Deployment

- Vercel

---

# 🔒 Authentication

Supports two modes:

## Production Mode

- Email Authentication
- Email Verification
- Secure Sessions
- User Isolation

## Demo Mode

Includes dedicated demo portals:

- Visitor Demo
- Staff Demo
- FIFA Executive Demo

No production data is exposed.

---

# 🔐 User Data Isolation

Every authenticated user receives isolated data storage.

Stored separately per user:

- Tickets
- AI Chat History
- Notifications
- Merchandise Orders
- Food Orders
- Accessibility Requests
- User Preferences

No demo data leaks into production accounts.

---

# 📊 Smart Stadium Modules

- Crowd Intelligence
- Emergency Dispatch
- Logistics Management
- Sustainability Monitoring
- Accessibility Services
- Indoor Navigation
- Operations AI
- Executive Analytics

---

# 🌱 Sustainability Features

- Recycling Tracking
- Water Usage Monitoring
- Carbon Footprint
- Energy Grid Insights
- Eco Rewards

---

# 📂 Project Structure

```
app/
components/
contexts/
hooks/
lib/
public/
styles/

```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/SVG700/StadiumOS-AI.git

cd StadiumOS-AI
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create

```
.env.local
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

GEMINI_API_KEY=
```

If no environment variables are configured, the application automatically switches to **Demo Mode**.

---

## Run Development Server

```bash
npm run dev
```

---

## Production Validation

Run:

```bash
npm run lint

npx tsc --noEmit

npm run build
```

The project is validated with:

- ✅ 0 TypeScript Errors
- ✅ 0 ESLint Errors
- ✅ Successful Production Build

---

# 📸 Screenshots

> Add screenshots here

- Landing Page

- Visitor Portal

- Staff Dashboard

- FIFA Executive Console

---

# 🌐 Live Demo

**Application**

https://stadium-os-ai-topaz.vercel.app/

---

# 📂 GitHub Repository

https://github.com/SVG700/StadiumOS-AI

---

# 🎥 Demo Video

> Add YouTube / Drive Link here

---

# 👨‍💻 Developed By

**Samhith V Gupta**

B.Tech Computer Science Engineering

Presidency University, Bengaluru

GitHub

https://github.com/SVG700

LinkedIn

https://www.linkedin.com/in/samhith-8344272a3/

---

# 🚀 Future Roadmap

- Computer Vision Crowd Detection
- IoT Sensor Integration
- Live CCTV Analytics
- Predictive Crowd AI
- Digital Twin Expansion
- Volunteer Mobile App
- Wearable Device Support
- AI Incident Forecasting

---

# 📄 License

This project is released under the **MIT License**.

---

## ⭐ If you like this project, consider giving it a Star!
