"""
Phase 1 tests — Authentication
Covers:
  - User registration (happy path + duplicate email)
  - User login (happy path + wrong password)
  - GET /auth/me with valid and invalid tokens
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base, get_db
from app.main import app

# ── In-memory SQLite for tests (no MySQL needed) ───────────────────────────────
SQLITE_URL = "sqlite:///./test.db"

test_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test, drop them after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────────

def register_user(client, name="Test User", email="test@example.com", password="password123"):
    return client.post("/auth/register", json={"name": name, "email": email, "password": password})


def login_user(client, email="test@example.com", password="password123"):
    return client.post("/auth/login", json={"email": email, "password": password})


# ── Registration tests ─────────────────────────────────────────────────────────

class TestRegister:
    def test_register_success(self, client):
        res = register_user(client)
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["role"] == "user"
        assert "password_hash" not in data["user"]

    def test_register_duplicate_email(self, client):
        register_user(client)
        res = register_user(client)  # same email again
        assert res.status_code == 409
        assert "already exists" in res.json()["detail"]

    def test_register_invalid_email(self, client):
        res = client.post("/auth/register", json={
            "name": "Bad Email", "email": "not-an-email", "password": "password123"
        })
        assert res.status_code == 422

    def test_register_short_password(self, client):
        res = client.post("/auth/register", json={
            "name": "Short Pass", "email": "short@example.com", "password": "abc"
        })
        assert res.status_code == 422

    def test_register_missing_fields(self, client):
        res = client.post("/auth/register", json={"email": "missing@example.com"})
        assert res.status_code == 422


# ── Login tests ────────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_success(self, client):
        register_user(client)
        res = login_user(client)
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"

    def test_login_wrong_password(self, client):
        register_user(client)
        res = client.post("/auth/login", json={
            "email": "test@example.com", "password": "wrongpassword"
        })
        assert res.status_code == 401

    def test_login_unregistered_email(self, client):
        res = client.post("/auth/login", json={
            "email": "nobody@example.com", "password": "password123"
        })
        assert res.status_code == 401

    def test_login_missing_password(self, client):
        res = client.post("/auth/login", json={"email": "test@example.com"})
        assert res.status_code == 422


# ── Protected route tests ──────────────────────────────────────────────────────

class TestGetMe:
    def test_get_me_authenticated(self, client):
        register_user(client)
        token = login_user(client).json()["access_token"]
        res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"

    def test_get_me_no_token(self, client):
        res = client.get("/auth/me")
        assert res.status_code == 403  # HTTPBearer returns 403 when header is missing

    def test_get_me_invalid_token(self, client):
        res = client.get("/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
        assert res.status_code == 401

    def test_get_me_malformed_header(self, client):
        res = client.get("/auth/me", headers={"Authorization": "NotBearer sometoken"})
        assert res.status_code == 403
