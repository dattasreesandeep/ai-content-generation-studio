from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ══════════════════════════════════════════════════════════════════════════════
# BLOG GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

class BlogGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=300)
    audience: str = Field(..., min_length=3, max_length=200)
    tone: str = Field(..., min_length=2, max_length=50)
    word_count: int = Field(default=800, ge=200, le=3000)


class BlogSection(BaseModel):
    heading: str
    content: str


class BlogOutput(BaseModel):
    title: str
    introduction: str
    sections: list[BlogSection]
    conclusion: str
    seo_keywords: list[str]


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT DESCRIPTION GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

class ProductGenerateRequest(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=200)
    features: str = Field(..., min_length=5, max_length=1000, description="Comma-separated or paragraph of features")
    target_audience: str = Field(..., min_length=3, max_length=200)
    tone: str = Field(..., min_length=2, max_length=50)


class ProductOutput(BaseModel):
    headline: str
    description: str
    bullet_points: list[str]


# ══════════════════════════════════════════════════════════════════════════════
# SOCIAL MEDIA GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

SUPPORTED_PLATFORMS = Literal["linkedin", "instagram", "x", "facebook"]


class SocialGenerateRequest(BaseModel):
    platform: SUPPORTED_PLATFORMS
    topic: str = Field(..., min_length=3, max_length=300)
    tone: str = Field(..., min_length=2, max_length=50)


class SocialOutput(BaseModel):
    post: str
    hashtags: list[str]


# ══════════════════════════════════════════════════════════════════════════════
# MARKETING CAMPAIGN GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

class CampaignGenerateRequest(BaseModel):
    product_service: str = Field(..., min_length=3, max_length=300)
    audience: str = Field(..., min_length=3, max_length=200)
    campaign_goal: str = Field(..., min_length=5, max_length=300)
    tone: str = Field(..., min_length=2, max_length=50)


class CampaignEmail(BaseModel):
    subject: str
    body: str


class CampaignAd(BaseModel):
    platform: str
    headline: str
    copy: str


class CampaignOutput(BaseModel):
    campaign_name: str
    emails: list[CampaignEmail]
    ads: list[CampaignAd]
    cta: str


# ══════════════════════════════════════════════════════════════════════════════
# SHARED RESPONSE SCHEMA
# ══════════════════════════════════════════════════════════════════════════════

class GeneratedContentResponse(BaseModel):
    id: int
    content_type: str
    input_data: dict
    generated_output: dict
    created_at: datetime

    model_config = {"from_attributes": True}
