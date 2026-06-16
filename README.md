# AI Content Studio — Phase 1: Authentication

## Quick Start

### 1. Copy environment variables
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and a strong JWT_SECRET_KEY
```

### 2. Create the MySQL database
```sql
CREATE DATABASE ai_content_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Install dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run Alembic migrations
```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

### 5. Start the server
```bash
uvicorn app.main:app --reload
```

API is live at: http://localhost:8000
Interactive docs: http://localhost:8000/docs

### 6. Run Phase 1 tests
```bash
pytest app/tests/test_auth.py -v
```

---

## Phase 1 endpoints

| Method | Path | Auth required | Description |
|--------|------|---------------|-------------|
| POST | /auth/register | No | Create an account |
| POST | /auth/login | No | Get a JWT token |
| GET | /auth/me | Yes (Bearer) | Get current user profile |
| GET | / | No | Health check |

---

## Definition of Done checklist

- [ ] Users can register with name, email, password
- [ ] Passwords are hashed with bcrypt (never stored plain)
- [ ] Login returns a JWT access token
- [ ] GET /auth/me returns user profile when token is valid
- [ ] GET /auth/me returns 401 when token is missing or invalid
- [ ] All 13 pytest tests pass
