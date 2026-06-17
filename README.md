# AI Content Studio

AI-powered content generation platform built with React, FastAPI, MySQL, JWT Authentication, and Google Gemini AI.

---

# Features

## Phase 1: Authentication System

* User Registration
* User Login
* JWT Authentication
* Password Hashing with bcrypt
* Protected API Endpoints
* User Profile Endpoint
* MySQL Database Integration
* Alembic Database Migrations

## Phase 2: Frontend Foundation

* React + Vite Frontend
* Tailwind CSS Styling
* Authentication Screens
* Context API State Management
* Protected Routes
* Persistent Login Sessions
* Dashboard UI

## Phase 3: AI Blog Generation

* Google Gemini AI Integration
* Blog Content Generation
* Prompt-based Content Creation
* Generated Content Storage
* Content History Tracking
* Authenticated Generation Endpoints

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Context API
* React Router

## Backend

* FastAPI
* SQLAlchemy
* Alembic
* MySQL
* JWT Authentication
* Google Gemini AI

---

# Project Structure

```text
ai-content-generation/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── utils/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tests/
│   │
│   ├── alembic/
│   └── requirements.txt
│
└── README.md
```

---

# Backend Setup

## 1. Create Environment File

```bash
cd backend
cp .env.example .env
```

Configure:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/ai_content_generation

JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=your_gemini_api_key
```

---

## 2. Create Database

```sql
CREATE DATABASE ai_content_generation
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

## 3. Create Virtual Environment

```bash
python3.12 -m venv venv
source venv/bin/activate
```

---

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 5. Run Database Migrations

```bash
alembic upgrade head
```

---

## 6. Start Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# API Endpoints

## Authentication

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| POST   | /auth/register | Register user        |
| POST   | /auth/login    | Login user           |
| GET    | /auth/me       | Current user profile |

---

## AI Content Generation

| Method | Endpoint       | Description                    |
| ------ | -------------- | ------------------------------ |
| POST   | /generate/blog | Generate AI blog               |
| GET    | /history       | View generated content history |

---

# Testing

## Authentication Tests

```bash
pytest app/tests/test_auth.py -v
```

Expected:

```text
13 passed
```

## Blog Generation Tests

```bash
pytest app/tests/test_blog.py -v
```

Expected:

```text
19 passed
```

---



# How to Run the Application

## Prerequisites

Install the following:

* Python 3.12
* MySQL Server
* Node.js (v18+ recommended)
* npm
* Git

---

# 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai-content-generation
```

---

# 2. Configure MySQL

Login to MySQL:

```bash
mysql -u root -p
```

Create database:

```sql
CREATE DATABASE ai_content_generation
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Verify:

```sql
SHOW DATABASES;
```

---

# 3. Backend Setup

Move to backend:

```bash
cd backend
```

Create virtual environment:

```bash
python3.12 -m venv venv
```

Activate virtual environment:

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 4. Configure Environment Variables

Create .env file:

```bash
cp .env.example .env
```

Update values:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost/ai_content_generation

JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=your_gemini_api_key
```

---

# 5. Run Database Migrations

Generate migration (first time only):

```bash
alembic revision --autogenerate -m "initial migration"
```

Apply migrations:

```bash
alembic upgrade head
```

---

# 6. Start Backend Server

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

# 7. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start React application:

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:5173
```

---

# 8. Verify Application

### Register User

Navigate to:

```text
http://localhost:5173/register
```

Create an account.

---

### Login

Navigate to:

```text
http://localhost:5173/login
```

Login using registered credentials.

---

### Generate Blog Content

Navigate to Dashboard.

Fill:

* Topic
* Audience
* Tone
* Word Count

Click:

```text
Generate Blog
```

Generated content will be displayed on the page and stored in the database.

---

# Running Tests

## Authentication Tests

```bash
pytest app/tests/test_auth.py -v
```

Expected:

```text
13 passed
```

---

## Blog Generation Tests

```bash
pytest app/tests/test_blog.py -v
```

Expected:

```text
19 passed
```

---

# Stopping the Application

Stop Backend:

```bash
CTRL + C
```

Stop Frontend:

```bash
CTRL + C
```

---

# Application URLs

| Service        | URL                        |
| -------------- | -------------------------- |
| Frontend       | http://localhost:5173      |
| Backend API    | http://localhost:8000      |
| Swagger Docs   | http://localhost:8000/docs |
| MySQL Database | ai_content_generation      |

```
```
