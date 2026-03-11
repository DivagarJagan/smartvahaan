# 🏗 System Architecture – AI Predictive Vehicle Maintenance

## Overview

This application is a full-stack AI-powered predictive vehicle maintenance system designed specifically for Indian road and driving conditions.

It follows a **modular, scalable, and secure architecture**.

---

## High-Level Architecture

Frontend (React)
↓
FastAPI Backend (JWT-secured APIs)
↓
Rule Engine (Indian Conditions)
↓
AI Layer (Gemini 2.5 – Explainable Insights)

---

## Components

### Frontend (React)

- User login & role-based access
- Vehicle data input
- Maintenance predictions
- Admin dashboard

### Backend (FastAPI)

- Authentication (JWT)
- Vehicle APIs
- AI prediction APIs
- Admin-only APIs

### AI Layer

- Rule-based scoring (roads, usage)
- Generative AI explanations (Gemini 2.5)

---

## Data Flow

1. User logs in
2. Vehicle data submitted
3. Backend applies Indian condition rules
4. Risk score calculated
5. Gemini generates explainable recommendation
6. Response sent to frontend

---

## Design Principles

- Separation of concerns
- Security-first design
- Explainable AI
- India-localized logic
