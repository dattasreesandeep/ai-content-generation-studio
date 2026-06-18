"""
Phase 4 tests — Product, Social Media, and Campaign Generators
Each generator is tested for:
  - Successful generation + saved to history
  - Authentication required
  - Input validation
  - Bad AI output handling

Gemini is mocked at the generate_and_parse level — no real API key needed.
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
SQLITE_URL = "sqlite:///./test_phase4.db"
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

def register_and_login(client) -> str:
    client.post("/auth/register", json={
        "name": "Test User", "email": "test@example.com", "password": "password123"
    })
    res = client.post("/auth/login", json={
        "email": "test@example.com", "password": "password123"
    })
    return res.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class mock_gemini:
    """
    Context manager that patches generate_and_parse in all generator services.
    Works without google-generativeai installed — no real API call is made.
    Patches each service module individually because each imports the function directly.
    """
    def __init__(self, output: dict):
        self.output = output
        self._patches = []

    def _fake(self):
        output = self.output
        def fake_parse(prompt, attempt=1):
            return json.loads(json.dumps(output))
        return fake_parse

    def __enter__(self):
        targets = [
            "app.services.blog_service.generate_and_parse",
            "app.services.product_service.generate_and_parse",
            "app.services.social_service.generate_and_parse",
            "app.services.campaign_service.generate_and_parse",
        ]
        for t in targets:
            p = patch(t, side_effect=self._fake())
            p.start()
            self._patches.append(p)
        return self

    def __exit__(self, *args):
        for p in self._patches:
            p.stop()


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT DESCRIPTION GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

VALID_PRODUCT_OUTPUT = {
    "headline": "The Ultimate Wireless Headphone for Audiophiles",
    "description": "Experience sound like never before. These headphones deliver crystal-clear audio.",
    "bullet_points": [
        "40-hour battery life",
        "Active noise cancellation",
        "Premium leather ear cushions",
        "Multipoint Bluetooth 5.3",
    ],
}

VALID_PRODUCT_REQUEST = {
    "product_name": "SoundMax Pro X",
    "features": "40hr battery, ANC, Bluetooth 5.3, foldable design",
    "target_audience": "audiophiles and remote workers",
    "tone": "premium",
}


class TestProductGenerator:
    def test_generate_product_success(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_PRODUCT_OUTPUT):
            res = client.post("/generate/product", json=VALID_PRODUCT_REQUEST, headers=auth_headers(token))
        assert res.status_code == 201
        data = res.json()
        assert data["content_type"] == "product"
        assert data["generated_output"]["headline"] == VALID_PRODUCT_OUTPUT["headline"]
        assert len(data["generated_output"]["bullet_points"]) == 4

    def test_generate_product_saved_to_history(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_PRODUCT_OUTPUT):
            client.post("/generate/product", json=VALID_PRODUCT_REQUEST, headers=auth_headers(token))
        res = client.get("/history?content_type=product", headers=auth_headers(token))
        assert len(res.json()) == 1

    def test_generate_product_requires_auth(self, client):
        res = client.post("/generate/product", json=VALID_PRODUCT_REQUEST)
        assert res.status_code == 403

    def test_generate_product_missing_product_name(self, client):
        token = register_and_login(client)
        payload = {**VALID_PRODUCT_REQUEST}
        del payload["product_name"]
        res = client.post("/generate/product", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_product_missing_features(self, client):
        token = register_and_login(client)
        payload = {**VALID_PRODUCT_REQUEST}
        del payload["features"]
        res = client.post("/generate/product", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_product_bad_ai_output(self, client):
        token = register_and_login(client)
        # Return a dict missing required fields — Pydantic validation should fail
        bad_output = {"headline": "Only a headline, missing description and bullet_points"}
        with mock_gemini(bad_output):
            res = client.post("/generate/product", json=VALID_PRODUCT_REQUEST, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_product_input_stored(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_PRODUCT_OUTPUT):
            res = client.post("/generate/product", json=VALID_PRODUCT_REQUEST, headers=auth_headers(token))
        record_id = res.json()["id"]
        detail = client.get(f"/history/{record_id}", headers=auth_headers(token))
        assert detail.json()["input_data"]["product_name"] == "SoundMax Pro X"


# ══════════════════════════════════════════════════════════════════════════════
# SOCIAL MEDIA GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

VALID_SOCIAL_OUTPUT = {
    "post": "Excited to share our latest insights on AI in business! The future is here.",
    "hashtags": ["AI", "BusinessInnovation", "FutureOfWork"],
}

VALID_SOCIAL_REQUEST_LINKEDIN = {
    "platform": "linkedin",
    "topic": "AI transforming business operations",
    "tone": "professional",
}

VALID_SOCIAL_REQUEST_INSTAGRAM = {
    "platform": "instagram",
    "topic": "Summer product launch",
    "tone": "fun",
}


class TestSocialGenerator:
    def test_generate_social_linkedin_success(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_SOCIAL_OUTPUT):
            res = client.post("/generate/social", json=VALID_SOCIAL_REQUEST_LINKEDIN, headers=auth_headers(token))
        assert res.status_code == 201
        data = res.json()
        assert data["content_type"] == "social"
        assert "post" in data["generated_output"]
        assert isinstance(data["generated_output"]["hashtags"], list)

    def test_generate_social_instagram_success(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_SOCIAL_OUTPUT):
            res = client.post("/generate/social", json=VALID_SOCIAL_REQUEST_INSTAGRAM, headers=auth_headers(token))
        assert res.status_code == 201
        assert res.json()["input_data"]["platform"] == "instagram"

    def test_generate_social_all_platforms(self, client):
        token = register_and_login(client)
        for platform in ["linkedin", "instagram", "x", "facebook"]:
            payload = {"platform": platform, "topic": "Test topic", "tone": "casual"}
            with mock_gemini(VALID_SOCIAL_OUTPUT):
                res = client.post("/generate/social", json=payload, headers=auth_headers(token))
            assert res.status_code == 201, f"Failed for platform: {platform}"

    def test_generate_social_invalid_platform(self, client):
        token = register_and_login(client)
        payload = {"platform": "tiktok", "topic": "Test", "tone": "casual"}
        res = client.post("/generate/social", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_social_requires_auth(self, client):
        res = client.post("/generate/social", json=VALID_SOCIAL_REQUEST_LINKEDIN)
        assert res.status_code == 403

    def test_generate_social_missing_topic(self, client):
        token = register_and_login(client)
        payload = {"platform": "linkedin", "tone": "professional"}
        res = client.post("/generate/social", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_social_saved_to_history(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_SOCIAL_OUTPUT):
            client.post("/generate/social", json=VALID_SOCIAL_REQUEST_LINKEDIN, headers=auth_headers(token))
        res = client.get("/history?content_type=social", headers=auth_headers(token))
        assert len(res.json()) == 1

    def test_generate_social_bad_ai_output(self, client):
        token = register_and_login(client)
        bad_output = {"post": "Missing hashtags field"}
        with mock_gemini(bad_output):
            res = client.post("/generate/social", json=VALID_SOCIAL_REQUEST_LINKEDIN, headers=auth_headers(token))
        assert res.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# MARKETING CAMPAIGN GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

VALID_CAMPAIGN_OUTPUT = {
    "campaign_name": "AI Forward 2025",
    "emails": [
        {
            "subject": "Discover How AI Can Transform Your Business",
            "body": "Hi there, we would like to introduce you to our AI platform.",
        },
        {
            "subject": "Do Not Miss Out — AI for Business Webinar",
            "body": "Following up on our last email, we have an exclusive webinar.",
        },
    ],
    "ads": [
        {
            "platform": "Google",
            "headline": "AI Solutions for Business",
            "copy": "Boost productivity with our AI platform. Try free for 30 days.",
        },
        {
            "platform": "LinkedIn",
            "headline": "Transform Your Workflow",
            "copy": "Join 10,000+ businesses using AI to get ahead. Start today.",
        },
    ],
    "cta": "Start your free 30-day trial",
}

VALID_CAMPAIGN_REQUEST = {
    "product_service": "AI productivity platform for enterprises",
    "audience": "C-suite executives and IT managers",
    "campaign_goal": "Generate trial sign-ups",
    "tone": "professional",
}


class TestCampaignGenerator:
    def test_generate_campaign_success(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_CAMPAIGN_OUTPUT):
            res = client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))
        assert res.status_code == 201
        data = res.json()
        assert data["content_type"] == "campaign"
        output = data["generated_output"]
        assert output["campaign_name"] == "AI Forward 2025"
        assert len(output["emails"]) == 2
        assert len(output["ads"]) == 2
        assert output["cta"] == "Start your free 30-day trial"

    def test_generate_campaign_saved_to_history(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_CAMPAIGN_OUTPUT):
            client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))
        res = client.get("/history?content_type=campaign", headers=auth_headers(token))
        assert len(res.json()) == 1

    def test_generate_campaign_requires_auth(self, client):
        res = client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST)
        assert res.status_code == 403

    def test_generate_campaign_missing_goal(self, client):
        token = register_and_login(client)
        payload = {**VALID_CAMPAIGN_REQUEST}
        del payload["campaign_goal"]
        res = client.post("/generate/campaign", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_campaign_missing_audience(self, client):
        token = register_and_login(client)
        payload = {**VALID_CAMPAIGN_REQUEST}
        del payload["audience"]
        res = client.post("/generate/campaign", json=payload, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_campaign_bad_ai_output(self, client):
        token = register_and_login(client)
        bad_output = {"campaign_name": "Only name, missing emails ads cta"}
        with mock_gemini(bad_output):
            res = client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))
        assert res.status_code == 422

    def test_generate_campaign_input_stored(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_CAMPAIGN_OUTPUT):
            res = client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))
        record_id = res.json()["id"]
        detail = client.get(f"/history/{record_id}", headers=auth_headers(token))
        assert detail.json()["input_data"]["campaign_goal"] == "Generate trial sign-ups"

    def test_generate_campaign_emails_have_subject_and_body(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_CAMPAIGN_OUTPUT):
            res = client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))
        emails = res.json()["generated_output"]["emails"]
        for email in emails:
            assert "subject" in email
            assert "body" in email

    def test_generate_campaign_ads_have_required_fields(self, client):
        token = register_and_login(client)
        with mock_gemini(VALID_CAMPAIGN_OUTPUT):
            res = client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))
        ads = res.json()["generated_output"]["ads"]
        for ad in ads:
            assert "platform" in ad
            assert "headline" in ad
            assert "copy" in ad


# ══════════════════════════════════════════════════════════════════════════════
# CROSS-GENERATOR HISTORY TESTS
# ══════════════════════════════════════════════════════════════════════════════

VALID_BLOG_OUTPUT = {
    "title": "T",
    "introduction": "I",
    "sections": [{"heading": "H", "content": "C"}],
    "conclusion": "C",
    "seo_keywords": ["k"],
}


class TestMixedHistory:
    """Verify history filtering works correctly across all content types."""

    def _generate_all(self, client, token):
        with mock_gemini(VALID_BLOG_OUTPUT):
            client.post("/generate/blog", json={
                "topic": "AI Tools", "audience": "devs", "tone": "casual", "word_count": 300
            }, headers=auth_headers(token))
        with mock_gemini(VALID_PRODUCT_OUTPUT):
            client.post("/generate/product", json=VALID_PRODUCT_REQUEST, headers=auth_headers(token))
        with mock_gemini(VALID_SOCIAL_OUTPUT):
            client.post("/generate/social", json=VALID_SOCIAL_REQUEST_LINKEDIN, headers=auth_headers(token))
        with mock_gemini(VALID_CAMPAIGN_OUTPUT):
            client.post("/generate/campaign", json=VALID_CAMPAIGN_REQUEST, headers=auth_headers(token))

    def test_history_shows_all_content_types(self, client):
        token = register_and_login(client)
        self._generate_all(client, token)
        res = client.get("/history", headers=auth_headers(token))
        assert res.status_code == 200
        assert len(res.json()) == 4
        types = {item["content_type"] for item in res.json()}
        assert types == {"blog", "product", "social", "campaign"}

    def test_history_filter_isolates_correctly(self, client):
        token = register_and_login(client)
        self._generate_all(client, token)
        for content_type in ["blog", "product", "social", "campaign"]:
            res = client.get(f"/history?content_type={content_type}", headers=auth_headers(token))
            assert len(res.json()) == 1
            assert res.json()[0]["content_type"] == content_type

    def test_history_is_user_isolated(self, client):
        """User A's generations must not appear in User B's history."""
        token_a = register_and_login(client)
        self._generate_all(client, token_a)

        client.post("/auth/register", json={
            "name": "User B", "email": "b@example.com", "password": "password123"
        })
        token_b = client.post("/auth/login", json={
            "email": "b@example.com", "password": "password123"
        }).json()["access_token"]

        res = client.get("/history", headers=auth_headers(token_b))
        assert res.json() == []