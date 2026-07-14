# StadiumOS AI — FIFA World Cup 2026 Smart Operating Platform

StadiumOS AI is a next-generation unified stadium operations command console and fan experience platform designed for the FIFA World Cup 2026. It leverages real-time telemetry, predictive analytics, computer vision simulations, and generative AI agent routing to streamline venue operations, crowd bottlenecks, medical responses, transport dispatch, and accessibility assistance.

---

## 📖 Table of Contents
- [Vision & Problem Statement Alignment](#-vision--problem-statement-alignment)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [Product Portals](#-product-portals)
  - [1. Spectator / Fan Portal](#1-spectator--fan-portal)
  - [2. Operations & Workforce Portal](#2-operations--workforce-portal)
  - [3. FIFA Board & Executive Console](#3-fifa-board--executive-console)
- [Core AI & Telemetry Engines](#-core-ai--telemetry-engines)
  - [Operations Copilot](#operations-copilot)
  - [Digital Twin Simulation](#digital-twin-simulation)
- [Verification & Production Hardening](#-verification--production-hardening)
- [Setup & Installation](#-setup--installation)

---

## 🎯 Vision & Problem Statement Alignment
Large-scale tournament venues (like the 8 host stadiums of the FIFA World Cup 2026) suffer from fragmented management utilities. Security, queueing flow, transport dispatch, and sustainability metrics are typically handled in siloed offline tools. 

**StadiumOS AI** solves this by consolidating three separate operating domains into a unified web application:
1. **Fan Comfort & Direction**: Real-time accessible navigation, transit indicators, and an AI Operations Assistant.
2. **Operational Workforce Control**: Real-time crowd bottleneck telemetry, volunteer task assignments, and instant emergency squad dispatching.
3. **FIFA Executive Intelligence**: High-level tournament analytics, multi-stadium carbon ledgers, and automated incident resolution history records.

---

## 🕹️ System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Unified Client Portal                  │
                  │              (React 19, Next.js Dashboard)             │
                  └───────────┬────────────────────────────────┬───────────┘
                              │                                │
      (Secure Whitelists)     ▼                                ▼     (AI Action Stream)
   ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
   │        Role Router Guard            │         │        AI Operations Copilot        │
   │   (/visitor, /staff, /fifa)         │         │        (Google Gemini API)          │
   └──────────────────┬──────────────────┘         └──────────────────┬──────────────────┘
                      │                                               │
                      ▼                                               ▼
   ┌─────────────────────────────────────────────────────────────────────────────────────┐
   │                                  StadiumContext                                     │
   │               (Central State, Global Telemetry & Notification Engine)               │
   └──────────────────┬───────────────────────────────────────────────┬──────────────────┘
                      │                                               │
                      ▼                                               ▼
   ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
   │         Supabase Database           │         │      AI Digital Twin Simulator      │
   │     (Postgres, Auth & Profiles)     │         │       (18s Telemetry Interval)      │
   └─────────────────────────────────────┘         └─────────────────────────────────────┘
```

### Stack Highlights
- **Core Framework**: Next.js 15+ & React 19 (fully optimized for Next.js Turbopack)
- **Styling**: Vanilla CSS custom themes configured with glassmorphic cards and HSL-tailored dark modes
- **State Ingestion**: Unified React Context (`StadiumContext`) driving real-time mock telemetry and notification sound synths
- **Data & Auth**: Supabase Postgres Auth + custom profile mappings, with a fully offline Local Demo Mode fallback

---

## 🌐 Product Portals

### 1. Spectator / Fan Portal
Designed to assist football fans with matchday navigation and services:
- **Smart Navigation**: Highlight seats, restrooms, concessions, and medical bays.
- **Logistics Guidance**: Live shuttle frequencies, metro status, and parking congestion scales.
- **Accessibility Desk**: Request companion escorts, assistive wheelchairs, or book sensory suite seating.
- **Sustainability Hub**: Track individual eco-points accumulated from recycling bottles or using public transit.

### 2. Operations & Workforce Portal
The operational cockpit for stadium volunteers, logistics crews, and safety supervisors:
- **Crowd Intelligence**: Real-time computer vision simulation representing entry gates, seating bowls, and concourses.
- **Emergency Dispatch**: Activate sirens and coordinate response squads (Medical, Security, Logistics) to target corridors.
- **Workforce Tasks**: View volunteer checklists, task completion history, and dispatch new chores in real time.
- **Action Search**: Instantly look up telemetry logs, task items, or user names using the unified filters.

### 3. FIFA Board & Executive Console
High-level overview for tournament directors managing multiple host cities:
- **Global Command Center**: Toggle between 8 major World Cup stadiums (e.g. MetLife, BC Place, Azteca) to instantly load regional telemetry.
- **Digital Twin Simulation**: View real-time adjustments to crowd densities, weather sensors, and solar grid outputs.
- **AI Playbook Approvals**: Review automated AI response playbooks to mitigate incoming incidents (e.g. routing overflow from Gate 3 to Gate 4).
- **Incident History & PDF Reports**: Generate comprehensive After-Action Reports (AAR) summarizing incident causes, lessons learned, and future venue guidelines.

---

## 🧠 Core AI & Telemetry Engines

### Operations Copilot
Powered by **Google Gemini API**, the Operations Copilot acts as a context-aware operational assistant.
- **Command Palette (Ctrl + K)**: Execute administrative tasks instantly, such as dispatching medical units, dimming advertising screens to stabilize the solar grid, or rerouting transport fleets.
- **Interactive Chat**: Consult the copilot on live crowd densities, transport ETAs, or emergency playbooks.

### Digital Twin Simulation
The platform runs a background telemetry simulation loop every 18 seconds:
- Fluctuate weather and wind patterns dynamically.
- Simulate random incident escalations (e.g. grid power drops or entry bottlenecks).
- Propagate incident states automatically through their lifecycle: `Detected ➔ Assigned ➔ Responding ➔ Contained ➔ Resolved ➔ Archived`.
- Auto-generate incident history reviews on resolution.

---

## 🔒 Verification & Production Hardening
StadiumOS AI is designed and validated to meet strict enterprise guidelines:
- **Zero Errors / Warnings**: The build console is 100% clean, compiling with `0 errors` and `0 warnings` under Next.js production checks.
- **React 19 Compliance**: Avoids synchronous state setters inside effects, isolates impure math (timestamps/random loops) outside JSX, and utilizes memoized handlers (`useCallback` / `useMemo`) to prevent cascading render sweeps.
- **Auth Guard whitelists**: Restricts page access strictly based on user profiles (`visitor`, `staff`, `fifa`) via React layouts. Unauthorized navigation is immediately rerouted to `/access-denied`.
- **Validation Tests**: Backed by a custom telemetry assertion suite.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js v18.x or later installed.
- (Optional) A Supabase project and a Gemini API key.

### 2. Clone and Install
```bash
# Clone the repository
git clone https://github.com/SVG700/StadiumOS-AI.git
cd StadiumOS-AI

# Install dependencies
npm install
```

### 3. Configure Variables
Copy `.env.example` to `.env.local` and add your keys:
```bash
cp .env.example .env.local
```
*Note: If `.env.local` is empty or missing, StadiumOS AI automatically runs in **Local Demo Mode** using secure local-storage accounts.*

### 4. Run Verification Checks
```bash
# Run unit tests
npm run test

# Run ESLint validation
npm run lint

# Compile and check TypeScript types
npx tsc --noEmit
```

### 5. Start Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
