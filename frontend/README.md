# EventLead AI

AI-powered event lead management application built as a full-stack project.

## Overview

EventLead AI helps teams capture, manage, search, and follow up with leads collected during business events.

The application allows users to:

- Create event leads
- View existing leads
- Edit lead information
- Delete leads
- Search leads
- Filter leads by follow-up status
- Store interaction notes
- Generate AI summaries of interaction notes
- Generate AI-assisted follow-up messages

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database

- PostgreSQL

### AI

- Large Language Model API

### Development

- Git
- GitHub
- VS Code

## Architecture

The application follows a client-server architecture.

````text
React Frontend
      |
      | REST API / JSON
      |
FastAPI Backend
      |
      +---------- PostgreSQL
      |
      +---------- AI API



**Do not post this as the final README yet.** The final README should document what we actually built, not what we optimistically promised before the first database migration inevitably insults us.

---

# 17. What you should understand from Step 1

Before moving forward, you should be able to answer these five questions:

### 1. What does React do?

It builds the **user interface** and communicates with our backend API.

### 2. What does FastAPI do?

It provides our **backend API**, validation, business logic and AI integration.

### 3. What does PostgreSQL do?

It **persistently stores our lead data**.

### 4. Why don't React and PostgreSQL communicate directly?

Because the backend should control database access, validation, security and business rules.

### 5. Why do we have an AI service separately?

Because AI is a specialized capability. CRUD operations should remain deterministic and controlled by our backend.

---

# Our target architecture

By the end, we'll have:

```text
                         EVENTLEAD AI
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
       React Frontend                    FastAPI Backend
             │                                 │
             │ HTTP/JSON                       │
             └────────────────────────────────►│
                                               │
                            ┌──────────────────┼──────────────────┐
                            │                  │                  │
                            ▼                  ▼                  ▼
                       Validation         PostgreSQL          AI Service
                       Pydantic           SQLAlchemy          LLM API
                            │                  │                  │
                            └──────────────────┴──────────────────┘
````
