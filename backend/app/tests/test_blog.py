"""
Phase 3 tests — Blog Generation & History
Covers:
  - POST /generate/blog (success, auth required, bad AI output)
  - GET /history (list, filter by content_type)
  - GET /history/{id} (found, not found, another user's record)
  - DELETE /history/{id} (success, not found)

Gemini is mocked so tests run without a real API key.
"""
import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base, get_db
from app.main import app

# ── SQLite test DB ─────────────────────────────────────────────────────────────
SQLITE_URL = "sqlite:///./test_phase3.db"
test_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def override_db():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


# ── Shared helpers ─────────────────────────────────────────────────────────────

VALID_BLOG_OUTPUT = {
    "title": "Test Blog Title",
    "introduction": "This is the introduction paragraph.",
    "sections": [
        {"heading": "Section One", "content": "Content for section one."},
        {"heading": "Section Two", "content": "Content for section two."},
        {"heading": "Section Three", "content": "Content for section three."},
    ],
    "conclusion": "This is the conclusion.",
    "seo_keywords": ["keyword1", "keyword2", "keyword3"],
}

VALID_BLOG_REQUEST = {
    "topic": "The Future of AI in Business",
    "audience": "Business professionals",
    "tone": "professional",
    "word_count": 800,
}


def register_and_login(client) -> str:
    """Register a user and return the Bearer token."""
    client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    })
    res = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123",
    })
    return res.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def mock_gemini(output: dict = None):
    """
    Context manager that patches the Gemini call to return a fixed JSON string.
    """
    payload = output or VALID_BLOG_OUTPUT
    mock_response = MagicMock()
    mock_response.text = json.dumps(payload)
    return patch(
        "app.services.ai_service.genai.GenerativeModel",
        return_value=MagicMock(generate_content=MagicMock(return_value=mock_response)),
    )


# ── Blog generation tests ──────────────────────────────────────────────────────

class TestBlogGeneration:
    def test_generate_blog_success(self, client):
        token = register_and_login(client)
        with mock_gemini():
            res = client.post("/generate/blog", json=VALID_BLOG_REQUEST, headers=auth_headers(token))
        assert res.status_code == 201
        data = res.json()
        assert data["content_type"] == "blog"
        assert data["generated_output"]["title"] == "Test Blog Title"
        assert len(data["generated_output"]["sections"]) == 3
        assert "id" in data
        assert "created_at" in data

    def test_generate_blog_saves_to_history(self, client):
        token = register_and_login(client)
        with mock_gemini():
            client.post("/generate/blog", json=VALID_BLOG_REQUEST, headers=auth_headers(token))
        res = client.get("/history", headers=auth_headers(token))
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["content_type"] == "blog"

    def test_generate_blog_requires_auth(self, client):
        res = client.post("/generate/blog", json=VALID_BLOG_REQUEST)
        assert res.status_code == 403

    def test_generate_blog_missing_topic(self, client):
        token = register_and_login(client)
        payload = {**VALID_BLOG_REQUEST}
        del payload["topic"]
        res = client.post("/generate/blog", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_blog_word_count_too_low(self, client):
        token = register_and_login(client)
        payload = {**VALID_BLOG_REQUEST, "word_count": 50}
        res = client.post("/generate/blog", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_blog_ai_returns_bad_json(self, client):
        token = register_and_login(client)
        bad_response = MagicMock()
        bad_response.text = "This is not valid JSON at all"
        with patch(
            "app.services.ai_service.genai.GenerativeModel",
            return_value=MagicMock(generate_content=MagicMock(return_value=bad_response)),
        ):
            res = client.post("/generate/blog", json=VALID_BLOG_REQUEST, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_blog_ai_missing_required_field(self, client):
        token = register_and_login(client)
        # Output missing 'title' field — Pydantic validation should fail
        bad_output = {**VALID_BLOG_OUTPUT}
        del bad_output["title"]
        with mock_gemini(output=bad_output):
            res = client.post("/generate/blog", json=VALID_BLOG_REQUEST, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_blog_input_stored_correctly(self, client):
        token = register_and_login(client)
        with mock_gemini():
            res = client.post("/generate/blog", json=VALID_BLOG_REQUEST, headers=auth_headers(token))
        record_id = res.json()["id"]
        detail = client.get(f"/history/{record_id}", headers=auth_headers(token))
        input_data = detail.json()["input_data"]
        assert input_data["topic"] == VALID_BLOG_REQUEST["topic"]
        assert input_data["tone"] == VALID_BLOG_REQUEST["tone"]


# ── History tests ──────────────────────────────────────────────────────────────

class TestHistory:
    def _create_blog(self, client, token):
        with mock_gemini():
            return client.post("/generate/blog", json=VALID_BLOG_REQUEST, headers=auth_headers(token))

    def test_get_history_empty(self, client):
        token = register_and_login(client)
        res = client.get("/history", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json() == []

    def test_get_history_multiple_records(self, client):
        token = register_and_login(client)
        self._create_blog(client, token)
        self._create_blog(client, token)
        res = client.get("/history", headers=auth_headers(token))
        assert res.status_code == 200
        assert len(res.json()) == 2

    def test_get_history_filter_by_content_type(self, client):
        token = register_and_login(client)
        self._create_blog(client, token)
        res = client.get("/history?content_type=blog", headers=auth_headers(token))
        assert res.status_code == 200
        assert len(res.json()) == 1
        assert res.json()[0]["content_type"] == "blog"

    def test_get_history_filter_no_match(self, client):
        token = register_and_login(client)
        self._create_blog(client, token)
        res = client.get("/history?content_type=social", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json() == []

    def test_get_history_requires_auth(self, client):
        res = client.get("/history")
        assert res.status_code == 403

    def test_get_history_item_found(self, client):
        token = register_and_login(client)
        record_id = self._create_blog(client, token).json()["id"]
        res = client.get(f"/history/{record_id}", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json()["id"] == record_id

    def test_get_history_item_not_found(self, client):
        token = register_and_login(client)
        res = client.get("/history/9999", headers=auth_headers(token))
        assert res.status_code == 404

    def test_get_history_item_another_users_record(self, client):
        """User A cannot see User B's history records."""
        token_a = register_and_login(client)
        record_id = self._create_blog(client, token_a).json()["id"]

        # Register user B
        client.post("/auth/register", json={
            "name": "User B", "email": "b@example.com", "password": "password123"
        })
        res_b = client.post("/auth/login", json={"email": "b@example.com", "password": "password123"})
        token_b = res_b.json()["access_token"]

        res = client.get(f"/history/{record_id}", headers=auth_headers(token_b))
        assert res.status_code == 404

    def test_delete_history_item(self, client):
        token = register_and_login(client)
        record_id = self._create_blog(client, token).json()["id"]
        res = client.delete(f"/history/{record_id}", headers=auth_headers(token))
        assert res.status_code == 204
        # Confirm it's gone
        res2 = client.get(f"/history/{record_id}", headers=auth_headers(token))
        assert res2.status_code == 404

    def test_delete_history_item_not_found(self, client):
        token = register_and_login(client)
        res = client.delete("/history/9999", headers=auth_headers(token))
        assert res.status_code == 404

    def test_delete_requires_auth(self, client):
        res = client.delete("/history/1")
        assert res.status_code == 403
